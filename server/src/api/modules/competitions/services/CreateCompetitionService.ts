import { isErrored } from '@attio/fetchable';
import prisma from '../../../../prisma';
import * as cryptService from '../../../../services/crypt.service';
import { CompetitionType, Metric, PlayerAnnotationType } from '../../../../utils';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../../errors';
import { eventEmitter, EventType } from '../../../events';
import { omit } from '../../../util/objects';
import { findOrCreatePlayers } from '../../players/services/FindOrCreatePlayersService';
import { CompetitionWithParticipations, Team } from '../competition.types';
import {
  sanitizeTeams,
  sanitizeTitle,
  validateInvalidParticipants,
  validateParticipantDuplicates,
  validateTeamDuplicates
} from '../competition.utils';

interface CreateCompetitionPayload {
  title: string;
  metric: Metric;
  startsAt: Date;
  endsAt: Date;
  groupId?: number;
  groupVerificationCode?: string;
  participants?: string[];
  teams?: Team[];
}

type CreateCompetitionResult = { competition: CompetitionWithParticipations; verificationCode: string };

async function createCompetition(
  payload: CreateCompetitionPayload,
  creatorIpHash: string | null
): Promise<CreateCompetitionResult> {
  const { title, metric, startsAt, endsAt, participants, teams, groupId, groupVerificationCode } = payload;

  if (startsAt.getTime() > endsAt.getTime()) {
    throw new BadRequestError('Start date must be before the end date.');
  }

  if (startsAt.getTime() < Date.now() || endsAt.getTime() < Date.now()) {
    throw new BadRequestError('Invalid dates: All start and end dates must be in the future.');
  }

  if (participants && participants.length > 0 && !!groupId) {
    throw new BadRequestError(
      `Cannot include both "participants" and "groupId", they are mutually exclusive. All group members will be registered as participants instead.`
    );
  }

  if (participants && participants.length > 0 && teams && teams.length > 0) {
    throw new BadRequestError('Cannot include both "participants" and "teams", they are mutually exclusive.');
  }

  const isGroupCompetition = !!groupId;
  const isTeamCompetition = teams && teams.length > 0;
  const hasParticipants = participants && participants.length > 0;

  let participations: { playerId: number; teamName: string | null }[] = [];

  if (hasParticipants) {
    // throws an error if any participant is invalid
    validateInvalidParticipants(participants);
    // throws an error if any participant is duplicated
    validateParticipantDuplicates(participants);

    participations = await getParticipations(participants);
  }

  if (isTeamCompetition) {
    // ensures every team name is sanitized, and every username is standardized
    const sanitizedTeams = sanitizeTeams(teams);
    // throws an error if any team name is duplicated
    validateTeamDuplicates(sanitizedTeams);
    // throws an error if any team participant is invalid
    validateInvalidParticipants(sanitizedTeams.map(t => t.participants).flat());
    // throws an error if any team participant is duplicated
    validateParticipantDuplicates(sanitizedTeams.map(t => t.participants).flat());

    participations = await getTeamsParticipations(sanitizedTeams);
  }

  if (participations.length > 0) {
    const optOuts = await prisma.playerAnnotation.findMany({
      where: {
        playerId: {
          in: participations.map(p => p.playerId)
        },
        type: {
          in: [PlayerAnnotationType.OPT_OUT, PlayerAnnotationType.OPT_OUT_GROUPS]
        }
      },
      include: {
        player: {
          select: { displayName: true }
        }
      }
    });

    if (optOuts.length > 0) {
      throw new ForbiddenError(
        'One or more players have opted out of joining competitions, so they cannot be added as participants.',
        optOuts.map(o => o.player.displayName)
      );
    }
  }

  if (isGroupCompetition) {
    // throws errors if the verification code doesn't match the group's hash
    await validateGroupVerification(groupId, groupVerificationCode);

    if (!isTeamCompetition) {
      participations = await getGroupParticipations(groupId);
    }
  }

  const generateVerificationResult = await cryptService.generateVerification();

  if (isErrored(generateVerificationResult)) {
    // TODO: When this file returns a fetchable, stop throwing here and just return the error
    throw generateVerificationResult.error.subError;
  }

  const { code, hash } = generateVerificationResult.value;

  const createdCompetition = await prisma.competition.create({
    data: {
      title: sanitizeTitle(title),
      metric,
      type: isTeamCompetition ? CompetitionType.TEAM : CompetitionType.CLASSIC,
      startsAt,
      endsAt,
      groupId,
      verificationHash: hash,
      creatorIpHash,

      participations: {
        createMany: {
          data: participations
        }
      }
    },
    include: {
      group: {
        include: {
          _count: {
            select: {
              memberships: true
            }
          }
        }
      },
      participations: {
        include: {
          player: true
        }
      }
    }
  });

  const formattedCompetition: CompetitionWithParticipations = {
    ...omit(createdCompetition, 'verificationHash'),
    group: createdCompetition.group
      ? {
          ...omit(createdCompetition.group, '_count', 'verificationHash'),
          memberCount: createdCompetition.group._count.memberships
        }
      : undefined,
    participantCount: createdCompetition.participations.length,
    participations: createdCompetition.participations.map(p => ({
      ...omit(p, 'startSnapshotId', 'endSnapshotId')
    }))
  };

  eventEmitter.emit(EventType.COMPETITION_CREATED, {
    competitionId: createdCompetition.id
  });

  if (createdCompetition.participations.length > 0) {
    eventEmitter.emit(EventType.COMPETITION_PARTICIPANTS_JOINED, {
      competitionId: createdCompetition.id,
      participants: createdCompetition.participations.map(p => ({
        playerId: p.playerId
      }))
    });
  }

  return {
    competition: formattedCompetition,
    verificationCode: code
  };
}

async function getParticipations(participants: string[]) {
  // Find or create all players with the given usernames
  const players = await findOrCreatePlayers(participants);

  return players.map(p => ({ playerId: p.id, teamName: null }));
}

async function getTeamsParticipations(teams: Team[]) {
  // Find or create all players with the given usernames
  const players = await findOrCreatePlayers(teams.map(t => t.participants).flat());

  // Map player usernames into IDs, for O(1) checks below
  const playerMap = Object.fromEntries(players.map(p => [p.username, p.id]));

  return teams.map(t => t.participants.map(u => ({ teamName: t.name, playerId: playerMap[u] }))).flat();
}

async function getGroupParticipations(groupId: number) {
  const memberships = await prisma.membership.findMany({
    where: { groupId },
    select: { playerId: true }
  });

  return memberships.map(m => ({ playerId: m.playerId, teamName: null }));
}

async function validateGroupVerification(groupId: number, groupVerificationCode: string | undefined) {
  if (!groupVerificationCode) {
    throw new BadRequestError('Invalid group verification code.');
  }

  const group = await prisma.group.findFirst({
    where: { id: groupId },
    select: { verificationHash: true }
  });

  if (!group) {
    throw new NotFoundError('Group not found.');
  }

  const verificationResult = await cryptService.verifyCode(group.verificationHash, groupVerificationCode);

  if (isErrored(verificationResult)) {
    throw new ForbiddenError('Incorrect group verification code.');
  }
}

export { createCompetition };
