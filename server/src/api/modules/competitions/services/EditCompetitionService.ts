import { AsyncResult, combine, complete, Errored, errored, fromPromise, isErrored } from '@attio/fetchable';
import prisma, { PrismaTypes } from '../../../../prisma';
import logger from '../../../../services/logging.service';
import {
  Competition,
  CompetitionTeam,
  CompetitionType,
  Metric,
  Participation,
  Player,
  PlayerAnnotationType
} from '../../../../types';
import { sanitizeWhitespace } from '../../../../utils/sanitize-whitespace.util';
import { MetricProps } from '../../../../utils/shared';
import { eventEmitter, EventType } from '../../../events';
import { standardize } from '../../players/player.utils';
import { findOrCreatePlayers } from '../../players/services/FindOrCreatePlayersService';
import { findGroupSnapshots } from '../../snapshots/services/FindGroupSnapshotsService';
import {
  sanitizeTeams,
  validateInvalidParticipants,
  validateParticipantDuplicates,
  validateTeamDuplicates
} from '../competition.utils';

interface EditCompetitionPayload {
  title?: string;
  metrics?: Metric[];
  startsAt?: Date;
  endsAt?: Date;
  participants?: string[];
  teams?: CompetitionTeam[];
}

interface PartialParticipation {
  playerId: number;
  username: string;
  teamName: string | null;
}

export async function editCompetition(
  id: number,
  payload: EditCompetitionPayload
): AsyncResult<
  Competition,
  | { code: 'PARTICIPANTS_AND_TEAMS_MUTUALLY_EXCLUSIVE' }
  | { code: 'NOTHING_TO_UPDATE' }
  | { code: 'COMPETITION_NOT_FOUND' }
  | { code: 'COMPETITION_START_DATE_AFTER_END_DATE' }
  | { code: 'COMPETITION_TYPE_CANNOT_BE_CHANGED' }
  | { code: 'METRICS_MUST_BE_OF_SAME_TYPE' }
  | { code: 'OPTED_OUT_PLAYERS_FOUND'; displayNames: string[] }
  | { code: 'FAILED_TO_UPDATE_COMPETITION' }
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
> {
  const { title, metrics, startsAt, endsAt, participants, teams } = payload;

  if (participants && participants.length > 0 && teams && teams.length > 0) {
    return errored({ code: 'PARTICIPANTS_AND_TEAMS_MUTUALLY_EXCLUSIVE' });
  }

  if (
    title === undefined &&
    metrics === undefined &&
    startsAt === undefined &&
    endsAt === undefined &&
    teams === undefined &&
    participants === undefined
  ) {
    return errored({ code: 'NOTHING_TO_UPDATE' });
  }

  const competitionUpdatePayload: PrismaTypes.CompetitionUpdateInput = {};

  const competition = await prisma.competition.findFirst({
    where: { id }
  });

  if (competition === null) {
    return errored({ code: 'COMPETITION_NOT_FOUND' });
  }

  if (startsAt || endsAt) {
    const startDate = startsAt || competition.startsAt;
    const endDate = endsAt || competition.endsAt;

    if (endDate.getTime() < startDate.getTime()) {
      return errored({ code: 'COMPETITION_START_DATE_AFTER_END_DATE' });
    }
  }

  if (competition.type === CompetitionType.CLASSIC && teams !== undefined && teams.length > 0) {
    return errored({ code: 'COMPETITION_TYPE_CANNOT_BE_CHANGED' });
  }

  if (competition.type === CompetitionType.TEAM && participants !== undefined && participants.length > 0) {
    return errored({ code: 'COMPETITION_TYPE_CANNOT_BE_CHANGED' });
  }

  if (metrics !== undefined && new Set(metrics.map(m => MetricProps[m].type)).size > 1) {
    return errored({ code: 'METRICS_MUST_BE_OF_SAME_TYPE' });
  }

  const participationsResult = await getValidatedParticipations(competition, payload);

  if (isErrored(participationsResult)) {
    return participationsResult;
  }

  if (title) competitionUpdatePayload.title = sanitizeWhitespace(title);
  if (startsAt) competitionUpdatePayload.startsAt = startsAt;
  if (endsAt) competitionUpdatePayload.endsAt = endsAt;

  const updateResult = await executeUpdate(id, competitionUpdatePayload, metrics, participationsResult.value);

  if (isErrored(updateResult)) {
    return updateResult;
  }

  const { updatedCompetition, addedParticipations } = updateResult.value;

  if (addedParticipations.length > 0) {
    eventEmitter.emit(EventType.COMPETITION_PARTICIPANTS_JOINED, {
      competitionId: id,
      participants: addedParticipations.map(p => ({
        playerId: p.playerId
      }))
    });
  }

  // if start date changed
  if (competition.startsAt.getTime() !== updatedCompetition.startsAt.getTime()) {
    if (updatedCompetition.startsAt.getTime() < Date.now()) {
      // if new start date is in the past
      await recalculateParticipationsStart(competition.id, updatedCompetition.startsAt);
    } else if (competition.startsAt.getTime() < Date.now()) {
      // if had already started and new start date is in the future
      await invalidateParticipations(competition.id);
    }
  }

  // if end date changed and (had already ended OR new end date is in the past)
  if (
    competition.endsAt.getTime() !== updatedCompetition.endsAt.getTime() &&
    (competition.endsAt.getTime() < Date.now() || updatedCompetition.endsAt.getTime() < Date.now())
  ) {
    await recalculateParticipationsEnd(competition.id, updatedCompetition.endsAt);
  }

  return complete(updatedCompetition);
}

async function invalidateParticipations(competitionId: number) {
  await prisma.participation.updateMany({
    where: { competitionId },
    data: {
      startSnapshotId: null,
      endSnapshotId: null,
      startSnapshotDate: null,
      endSnapshotDate: null
    }
  });
}

async function recalculateParticipationsStart(competitionId: number, startDate: Date) {
  // Fetch the player IDs of all the participants
  const playerIds = (
    await prisma.participation.findMany({
      where: { competitionId },
      select: { playerId: true }
    })
  ).map(p => p.playerId);

  // Find everyone's first snapshot AFTER the new start date
  const playerSnapshots = await findGroupSnapshots(playerIds, { minDate: startDate });

  // Map these snapshots for O(1) lookups
  const snapshotMap = new Map(playerSnapshots.map(s => [s.playerId, s]));

  await prisma.$transaction(async transaction => {
    // Update participations with the new start snapshot IDs
    for (const playerId of playerIds) {
      await transaction.participation.update({
        where: { playerId_competitionId: { competitionId, playerId } },
        data: {
          startSnapshotId: snapshotMap.get(playerId)?.id ?? null,
          startSnapshotDate: snapshotMap.get(playerId)?.createdAt ?? null
        }
      });
    }
  });
}

async function recalculateParticipationsEnd(competitionId: number, endDate: Date) {
  // Fetch the player IDs of all the participants
  const playerIds = (
    await prisma.participation.findMany({
      where: { competitionId },
      select: { playerId: true }
    })
  ).map(p => p.playerId);

  // Find everyone's last snapshot BEFORE the new end date
  const playerSnapshots = await findGroupSnapshots(playerIds, { maxDate: endDate });

  // Map these snapshots for O(1) lookups
  const snapshotMap = new Map(playerSnapshots.map(s => [s.playerId, s]));

  await prisma.$transaction(async transaction => {
    // Update participations with the new end snapshot IDs
    for (const playerId of playerIds) {
      await transaction.participation.update({
        where: { playerId_competitionId: { competitionId, playerId } },
        data: {
          endSnapshotId: snapshotMap.get(playerId)?.id ?? null,
          endSnapshotDate: snapshotMap.get(playerId)?.createdAt ?? null
        }
      });
    }
  });
}

async function executeUpdate(
  competitionId: number,
  competitionUpdatePayload: PrismaTypes.CompetitionUpdateInput,
  nextMetrics: Metric[] | undefined,
  nextParticipations: PartialParticipation[] | undefined
): AsyncResult<
  {
    updatedCompetition: Competition;
    addedParticipations: PartialParticipation[];
  },
  { code: 'FAILED_TO_UPDATE_COMPETITION' } | { code: 'OPTED_OUT_PLAYERS_FOUND'; displayNames: string[] }
> {
  const transactionResult = await fromPromise(
    prisma.$transaction(async transaction => {
      const updatedCompetition = await transaction.competition.update({
        where: {
          id: competitionId
        },
        data: {
          ...competitionUpdatePayload,
          updatedAt: new Date() // Force update the "updatedAt" field
        }
      });

      if (nextMetrics !== undefined) {
        // Only update the participations if the consumer supplied an array
        const currentMetrics = await transaction.competitionMetric.findMany({
          where: {
            competitionId,
            deletedAt: null
          }
        });

        const { excessMetrics, missingMetrics } = getMetricDiffs(
          currentMetrics.map(m => m.metric),
          nextMetrics
        );

        await transaction.competitionMetric.updateMany({
          where: {
            competitionId,
            metric: { in: excessMetrics }
          },
          data: {
            deletedAt: new Date()
          }
        });

        for (const metric of missingMetrics) {
          await transaction.competitionMetric.upsert({
            where: {
              competitionId_metric: {
                competitionId,
                metric
              }
            },
            create: {
              competitionId,
              metric
            },
            update: {
              deletedAt: null
            }
          });
        }
      }

      if (nextParticipations === undefined) {
        return {
          updatedCompetition,
          addedParticipations: []
        };
      }

      // Only update the participations if the consumer supplied an array
      const currentParticipations = await transaction.participation.findMany({
        where: { competitionId },
        include: { player: true }
      });

      const { missingParticipations, excessParticipants, teamChanges } = getParticipationDiffs(
        currentParticipations,
        nextParticipations
      );

      if (missingParticipations.length > 0) {
        const optOuts = await transaction.playerAnnotation.findMany({
          where: {
            player: {
              username: { in: missingParticipations.map(m => m.username) }
            },
            type: {
              in: [PlayerAnnotationType.OPT_OUT, PlayerAnnotationType.OPT_OUT_COMPETITIONS]
            }
          },
          include: {
            player: {
              select: { displayName: true }
            }
          }
        });

        if (optOuts.length > 0) {
          // Throw here to rollback the transaction
          throw {
            code: 'OPTED_OUT_PLAYERS_FOUND',
            displayNames: optOuts.map(o => o.player.displayName)
          };
        }
      }

      // Remove any players that are no longer participants
      await transaction.participation.deleteMany({
        where: {
          competitionId,
          playerId: { in: excessParticipants.map(m => m.playerId) }
        }
      });

      // Add any missing participations
      await transaction.participation.createMany({
        data: missingParticipations.map(p => ({
          competitionId,
          playerId: p.playerId,
          teamName: p.teamName
        })),
        skipDuplicates: true
      });

      // Apply any team changes
      for (const teamName of teamChanges.keys()) {
        await transaction.participation.updateMany({
          where: {
            competitionId,
            playerId: { in: teamChanges.get(teamName) ?? [] }
          },
          data: {
            teamName
          }
        });
      }

      return {
        updatedCompetition,
        addedParticipations: missingParticipations
      };
    })
  );

  if (isErrored(transactionResult)) {
    // Prisma error
    if (!('error' in transactionResult)) {
      logger.error('Failed to update competition', transactionResult);
      return errored({ code: 'FAILED_TO_UPDATE_COMPETITION' });
    }

    // A little type coercion never hurt nobody...right?
    return transactionResult as Errored<{
      code: 'OPTED_OUT_PLAYERS_FOUND';
      displayNames: string[];
    }>;
  }

  return transactionResult;
}

function getParticipationDiffs(
  currentParticipations: Array<Participation & { player: Player }>,
  nextParticipations: PartialParticipation[]
) {
  // The usernames of all current (pre-edit) participants
  const currentUsernames = currentParticipations.map(m => m.player.username);

  // The usernames of all future (post-edit) participants
  const nextUsernames = nextParticipations.map(p => standardize(p.username));

  // These players should be added to the competition
  const missingUsernames = nextUsernames.filter(u => !currentUsernames.includes(u));

  // These players should remain in the group
  const keptUsernames = nextUsernames.filter(u => currentUsernames.includes(u));

  const missingParticipations = nextParticipations.filter(p => missingUsernames.includes(p.username));
  const keptParticipations = nextParticipations.filter(p => keptUsernames.includes(p.username));

  const excessParticipants = currentParticipations.filter(p => !nextUsernames.includes(p.player.username));

  const currentTeamNameMap = new Map<string, number[]>();
  const newTeamNameMap = new Map<string, number[]>();

  currentParticipations.forEach(p => {
    if (p.teamName === null) return;

    const val = currentTeamNameMap.get(p.teamName);

    if (val !== undefined) {
      val.push(p.playerId);
    } else {
      currentTeamNameMap.set(p.teamName, [p.playerId]);
    }
  });

  keptParticipations.forEach(p => {
    if (p.teamName === null) return;

    // Player team hasn't changed
    if (currentTeamNameMap.get(p.teamName)?.includes(p.playerId)) {
      return;
    }

    const val = newTeamNameMap.get(p.teamName);

    if (val !== undefined) {
      val.push(p.playerId);
    } else {
      newTeamNameMap.set(p.teamName, [p.playerId]);
    }
  });

  return {
    excessParticipants,
    missingParticipations,
    teamChanges: newTeamNameMap
  };
}

function getMetricDiffs(currentMetrics: Metric[], nextMetrics: Metric[]) {
  return {
    excessMetrics: currentMetrics.filter(m => !nextMetrics.includes(m)),
    missingMetrics: nextMetrics.filter(m => !currentMetrics.includes(m))
  };
}

async function getValidatedParticipations(
  competition: Competition,
  { participants, teams }: EditCompetitionPayload
): AsyncResult<
  Array<PartialParticipation> | undefined,
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
> {
  let participations: PartialParticipation[] | undefined = undefined;

  if (participants !== undefined && competition.type === CompetitionType.CLASSIC) {
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
    participations = players.map(p => ({ playerId: p.id, username: p.username, teamName: null }));
  }

  if (teams !== undefined && competition.type === CompetitionType.TEAM) {
    // ensures every team name is sanitized, and every username is standardized
    const newTeams = sanitizeTeams(teams);

    const teamValidationResult = combine([
      validateTeamDuplicates(newTeams),
      validateInvalidParticipants(newTeams.map(t => t.participants).flat()),
      validateParticipantDuplicates(newTeams.map(t => t.participants).flat())
    ]);

    if (isErrored(teamValidationResult)) {
      return errored({
        code: 'FAILED_TO_VALIDATE_TEAMS',
        subError: teamValidationResult.error
      });
    }

    // Find or create all players with the given usernames
    const players = await findOrCreatePlayers(newTeams.map(t => t.participants).flat());

    // Map player usernames into IDs, for O(1) checks below
    const playerMap = new Map(players.map(p => [p.username, p.id]));

    participations = newTeams
      .map(t => t.participants.map(u => ({ playerId: playerMap.get(u)!, username: u, teamName: t.name })))
      .flat();
  }

  return complete(participations);
}
