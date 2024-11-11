import prisma from '../../../../prisma';
import { CompetitionType, Metric } from '../../../../utils';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../../errors';
import * as cryptService from '../../../services/external/crypt.service';
import { omit } from '../../../util/objects';
import { findOrCreatePlayers } from '../../players/services/FindOrCreatePlayersService';
import * as competitionEvents from '../competition.events';
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

const MAINTENANCE_START = new Date('2024-11-14T17:00:00Z');
const MAINTENANCE_END = new Date('2024-11-14T23:00:00Z');

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

  if (startsAt.getTime() >= MAINTENANCE_START.getTime() && startsAt.getTime() <= MAINTENANCE_END.getTime()) {
    throw new BadRequestError(
      'Invalid start date: Planned maintenance period on November 14th (17:00 - 23:00 UTC).'
    );
  }

  if (endsAt.getTime() >= MAINTENANCE_START.getTime() && endsAt.getTime() <= MAINTENANCE_END.getTime()) {
    throw new BadRequestError(
      'Invalid end date: Planned maintenance period on November 14th (17:00 - 23:00 UTC).'
    );
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

  if (isGroupCompetition) {
    // throws errors if the verification code doesn't match the group's hash
    await validateGroupVerification(groupId, groupVerificationCode);

    if (!isTeamCompetition) {
      participations = await getGroupParticipations(groupId);
    }
  }

  const [code, hash] = await cryptService.generateVerification();

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

  competitionEvents.onCompetitionCreated(formattedCompetition);

  if (createdCompetition.participations.length > 0) {
    competitionEvents.onParticipantsJoined(createdCompetition.participations);
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

  const verified = await cryptService.verifyCode(group.verificationHash, groupVerificationCode);

  if (!verified) {
    throw new ForbiddenError('Incorrect group verification code.');
  }
}

export { createCompetition };
