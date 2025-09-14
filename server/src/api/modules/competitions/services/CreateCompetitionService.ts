import { AsyncResult, combine, complete, errored, fromPromise, isErrored } from '@attio/fetchable';
import prisma from '../../../../prisma';
import * as cryptService from '../../../../services/crypt.service';
import logger from '../../../../services/logging.service';
import {
  Competition,
  CompetitionTeam,
  CompetitionType,
  Metric,
  Participation,
  PlayerAnnotationType
} from '../../../../types';
import { sanitizeWhitespace } from '../../../../utils/sanitize-whitespace.util';
import { MetricProps } from '../../../../utils/shared';
import { eventEmitter, EventType } from '../../../events';
import { findOrCreatePlayers } from '../../players/services/FindOrCreatePlayersService';
import {
  sanitizeTeams,
  validateInvalidParticipants,
  validateParticipantDuplicates,
  validateTeamDuplicates
} from '../competition.utils';

interface CreateCompetitionPayload {
  title: string;
  metrics: Metric[];
  startsAt: Date;
  endsAt: Date;
  groupId?: number;
  groupVerificationCode?: string;
  participants?: string[];
  teams?: CompetitionTeam[];
}

export async function createCompetition(
  payload: CreateCompetitionPayload,
  creatorIpHash: string | null
): AsyncResult<
  {
    competition: Competition;
    verificationCode: string;
  },
  | { code: 'COMPETITION_START_DATE_AFTER_END_DATE' }
  | { code: 'COMPETITION_DATES_IN_THE_PAST' }
  | { code: 'METRICS_MUST_BE_OF_SAME_TYPE' }
  | { code: 'PARTICIPANTS_AND_GROUP_MUTUALLY_EXCLUSIVE' }
  | { code: 'PARTICIPANTS_AND_TEAMS_MUTUALLY_EXCLUSIVE' }
  | { code: 'OPTED_OUT_PLAYERS_FOUND'; displayNames: string[] }
  | { code: 'FAILED_TO_GENERATE_VERIFICATION_CODE' }
  | { code: 'FAILED_TO_CREATE_COMPETITION' }
  | {
      code: 'FAILED_TO_VALIDATE_PARTICIPANTS';
      subError:
        | { code: 'INVALID_USERNAMES_FOUND'; usernames: string[] }
        | { code: 'DUPLICATE_USERNAMES_FOUND'; usernames: string[] };
    }
  | {
      code: 'FAILED_TO_VALIDATE_TEAMS';
      subError:
        | { code: 'INVALID_USERNAMES_FOUND'; usernames: string[] }
        | { code: 'DUPLICATE_USERNAMES_FOUND'; usernames: string[] }
        | { code: 'DUPLICATE_TEAM_NAMES_FOUND'; teamNames: string[] };
    }
  | {
      code: 'FAILED_TO_VERIFY_GROUP_VERIFICATION_CODE';
      subError:
        | { code: 'GROUP_NOT_FOUND' }
        | { code: 'INVALID_GROUP_VERIFICATION_CODE' }
        | { code: 'INCORRECT_GROUP_VERIFICATION_CODE' };
    }
> {
  const { title, metrics, startsAt, endsAt, groupId } = payload;

  if (startsAt.getTime() > endsAt.getTime()) {
    return errored({ code: 'COMPETITION_START_DATE_AFTER_END_DATE' });
  }

  if (startsAt.getTime() < Date.now() || endsAt.getTime() < Date.now()) {
    return errored({ code: 'COMPETITION_DATES_IN_THE_PAST' });
  }

  if (new Set(metrics.map(m => MetricProps[m].type)).size > 1) {
    return errored({ code: 'METRICS_MUST_BE_OF_SAME_TYPE' });
  }

  const participationsResult = await getValidatedParticipations(payload);

  if (isErrored(participationsResult)) {
    return participationsResult;
  }

  const generateVerificationResult = await cryptService.generateVerification();

  if (isErrored(generateVerificationResult)) {
    logger.error('Failed to generate competition verification code', {
      error: generateVerificationResult.error
    });

    return errored({ code: 'FAILED_TO_GENERATE_VERIFICATION_CODE' });
  }

  const { code, hash } = generateVerificationResult.value;

  const createResult = await fromPromise(
    prisma.competition.create({
      data: {
        title: sanitizeWhitespace(title),
        type: participationsResult.value.competitionType,
        startsAt,
        endsAt,
        groupId,
        verificationHash: hash,
        creatorIpHash,
        metrics: {
          createMany: {
            data: metrics.map(metric => ({ metric }))
          }
        },
        participations: {
          createMany: {
            data: participationsResult.value.participations
          }
        }
      },
      include: {
        participations: true
      }
    })
  );

  if (isErrored(createResult)) {
    logger.error('Failed to create competition', {
      error: createResult.error
    });

    return errored({ code: 'FAILED_TO_CREATE_COMPETITION' });
  }

  const createdCompetition = createResult.value;

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

  return complete({
    competition: createdCompetition,
    verificationCode: code
  });
}

async function validateGroupVerification(
  groupId: number,
  groupVerificationCode: string | undefined
): AsyncResult<
  true,
  | { code: 'INVALID_GROUP_VERIFICATION_CODE' }
  | { code: 'GROUP_NOT_FOUND' }
  | { code: 'INCORRECT_GROUP_VERIFICATION_CODE' }
> {
  if (groupVerificationCode === undefined) {
    return errored({ code: 'INVALID_GROUP_VERIFICATION_CODE' });
  }

  const group = await prisma.group.findFirst({
    where: { id: groupId },
    select: { verificationHash: true }
  });

  if (group === null) {
    return errored({ code: 'GROUP_NOT_FOUND' });
  }

  const verificationResult = await cryptService.verifyCode(group.verificationHash, groupVerificationCode);

  if (isErrored(verificationResult)) {
    return errored({ code: 'INCORRECT_GROUP_VERIFICATION_CODE' });
  }

  return complete(true);
}

async function getValidatedParticipations({
  participants,
  teams,
  groupId,
  groupVerificationCode
}: CreateCompetitionPayload): AsyncResult<
  {
    participations: Array<Pick<Participation, 'playerId' | 'teamName'>>;
    competitionType: CompetitionType;
  },
  | { code: 'PARTICIPANTS_AND_GROUP_MUTUALLY_EXCLUSIVE' }
  | { code: 'PARTICIPANTS_AND_TEAMS_MUTUALLY_EXCLUSIVE' }
  | { code: 'OPTED_OUT_PLAYERS_FOUND'; displayNames: string[] }
  | {
      code: 'FAILED_TO_VALIDATE_PARTICIPANTS';
      subError:
        | { code: 'INVALID_USERNAMES_FOUND'; usernames: string[] }
        | { code: 'DUPLICATE_USERNAMES_FOUND'; usernames: string[] };
    }
  | {
      code: 'FAILED_TO_VALIDATE_TEAMS';
      subError:
        | { code: 'INVALID_USERNAMES_FOUND'; usernames: string[] }
        | { code: 'DUPLICATE_USERNAMES_FOUND'; usernames: string[] }
        | { code: 'DUPLICATE_TEAM_NAMES_FOUND'; teamNames: string[] };
    }
  | {
      code: 'FAILED_TO_VERIFY_GROUP_VERIFICATION_CODE';
      subError:
        | { code: 'GROUP_NOT_FOUND' }
        | { code: 'INVALID_GROUP_VERIFICATION_CODE' }
        | { code: 'INCORRECT_GROUP_VERIFICATION_CODE' };
    }
> {
  if (participants && participants.length > 0 && groupId !== undefined) {
    return errored({ code: 'PARTICIPANTS_AND_GROUP_MUTUALLY_EXCLUSIVE' });
  }

  if (participants && participants.length > 0 && teams != undefined && teams.length > 0) {
    return errored({ code: 'PARTICIPANTS_AND_TEAMS_MUTUALLY_EXCLUSIVE' });
  }

  const isGroupCompetition = groupId !== undefined;
  const isTeamCompetition = teams !== undefined && teams.length > 0;
  const hasParticipants = participants !== undefined && participants.length > 0;

  let participations: Array<Pick<Participation, 'playerId' | 'teamName'>> = [];

  if (hasParticipants) {
    const participantValidationResult = combine([
      validateInvalidParticipants(participants),
      validateParticipantDuplicates(participants)
    ]);

    if (isErrored(participantValidationResult)) {
      return errored({
        code: 'FAILED_TO_VALIDATE_PARTICIPANTS',
        subError: participantValidationResult.error
      });
    }

    const players = await findOrCreatePlayers(participants);

    participations = players.map(p => ({ playerId: p.id, teamName: null }));
  } else if (isTeamCompetition) {
    // ensures every team name is sanitized, and every username is standardized
    const sanitizedTeams = sanitizeTeams(teams);

    const teamValidationResult = combine([
      validateTeamDuplicates(sanitizedTeams),
      validateInvalidParticipants(sanitizedTeams.map(t => t.participants).flat()),
      validateParticipantDuplicates(sanitizedTeams.map(t => t.participants).flat())
    ]);

    if (isErrored(teamValidationResult)) {
      return errored({
        code: 'FAILED_TO_VALIDATE_TEAMS',
        subError: teamValidationResult.error
      });
    }

    const players = await findOrCreatePlayers(teams.map(t => t.participants).flat());
    const playerMap = new Map(players.map(p => [p.username, p.id]));

    participations = sanitizedTeams
      .map(t => t.participants.map(u => ({ teamName: t.name, playerId: playerMap.get(u)! })))
      .flat();
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
      return errored({
        code: 'OPTED_OUT_PLAYERS_FOUND',
        displayNames: optOuts.map(o => o.player.displayName)
      });
    }
  }

  if (isGroupCompetition) {
    const verificationResult = await validateGroupVerification(groupId, groupVerificationCode);

    if (isErrored(verificationResult)) {
      return errored({
        code: 'FAILED_TO_VERIFY_GROUP_VERIFICATION_CODE',
        subError: verificationResult.error
      });
    }

    if (!isTeamCompetition) {
      const memberships = await prisma.membership.findMany({
        where: { groupId },
        select: { playerId: true }
      });

      participations = memberships.map(m => ({ playerId: m.playerId, teamName: null }));
    }
  }

  return complete({
    participations,
    competitionType: isTeamCompetition ? CompetitionType.TEAM : CompetitionType.CLASSIC
  });
}
