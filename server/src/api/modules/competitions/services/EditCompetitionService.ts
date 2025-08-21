import { AsyncResult, combine, complete, errored, fromPromise, isErrored } from '@attio/fetchable';
import prisma, { PrismaPromise, PrismaTypes } from '../../../../prisma';
import logger from '../../../../services/logging.service';
import {
  Competition,
  CompetitionTeam,
  CompetitionType,
  Metric,
  Participation,
  Player,
  PlayerAnnotationType,
  Snapshot
} from '../../../../types';
import { eventEmitter, EventType } from '../../../events';
import { standardize } from '../../players/player.utils';
import { findOrCreatePlayers } from '../../players/services/FindOrCreatePlayersService';
import { findGroupSnapshots } from '../../snapshots/services/FindGroupSnapshotsService';
import {
  sanitizeTeams,
  sanitizeTitle,
  validateInvalidParticipants,
  validateParticipantDuplicates,
  validateTeamDuplicates
} from '../competition.utils';

interface EditCompetitionPayload {
  title?: string;
  metric?: Metric;
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
  const { title, metric, startsAt, endsAt, participants, teams } = payload;

  if (participants && participants.length > 0 && teams && teams.length > 0) {
    return errored({ code: 'PARTICIPANTS_AND_TEAMS_MUTUALLY_EXCLUSIVE' });
  }

  if (!title && !metric && !startsAt && !endsAt && !participants && !teams) {
    return errored({ code: 'NOTHING_TO_UPDATE' });
  }

  const updatedCompetitionFields: PrismaTypes.CompetitionUpdateInput = {};

  const teamsExist = teams !== undefined;
  const participantsExist = participants !== undefined;
  const hasTeams = teamsExist && teams.length > 0;
  const hasParticipants = participantsExist && participants.length > 0;

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

  if (competition.type === CompetitionType.CLASSIC && hasTeams) {
    return errored({ code: 'COMPETITION_TYPE_CANNOT_BE_CHANGED' });
  }

  if (competition.type === CompetitionType.TEAM && hasParticipants) {
    return errored({ code: 'COMPETITION_TYPE_CANNOT_BE_CHANGED' });
  }

  let participations: PartialParticipation[] | null = null;

  if (participantsExist && competition.type === CompetitionType.CLASSIC) {
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

  if (teamsExist && competition.type === CompetitionType.TEAM) {
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

  if (title) {
    updatedCompetitionFields.title = sanitizeTitle(title);
  }

  if (startsAt) updatedCompetitionFields.startsAt = startsAt;
  if (endsAt) updatedCompetitionFields.endsAt = endsAt;
  if (metric) updatedCompetitionFields.metric = metric;

  const updateResult = await executeUpdate(id, participations, updatedCompetitionFields);

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
    data: { startSnapshotId: null, endSnapshotId: null }
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
  const snapshotMap = new Map<number, Snapshot>(playerSnapshots.map(s => [s.playerId, s]));

  // Update participations with the new start snapshot IDs
  for (const playerId of playerIds) {
    const snapshot = snapshotMap.get(playerId);

    await prisma.participation.update({
      where: { playerId_competitionId: { competitionId, playerId } },
      data: { startSnapshotId: snapshot ? snapshot.id : null }
    });
  }
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
  const snapshotMap = new Map<number, Snapshot>(playerSnapshots.map(s => [s.playerId, s]));

  // Update participations with the new end snapshot IDs
  for (const playerId of playerIds) {
    const snapshot = snapshotMap.get(playerId);

    await prisma.participation.update({
      where: { playerId_competitionId: { competitionId, playerId } },
      data: { endSnapshotId: snapshot ? snapshot.id : null }
    });
  }
}

async function executeUpdate(
  id: number,
  nextParticipations: PartialParticipation[] | null,
  updatedCompetitionFields: PrismaTypes.CompetitionUpdateInput
): AsyncResult<
  {
    updatedCompetition: Competition;
    addedParticipations: PartialParticipation[];
  },
  { code: 'FAILED_TO_UPDATE_COMPETITION' } | { code: 'OPTED_OUT_PLAYERS_FOUND'; displayNames: string[] }
> {
  // This action updates the competition's fields and returns all the new data + participations,
  // If ran inside a transaction, it should be the last thing to run, to ensure it returns updated data
  const competitionUpdatePromise = prisma.competition.update({
    where: {
      id
    },
    data: {
      ...updatedCompetitionFields,
      updatedAt: new Date() // Force update the "updatedAt" field
    },
    include: {
      participations: true
    }
  });

  if (!nextParticipations) {
    const promiseResult = await fromPromise(competitionUpdatePromise);

    if (isErrored(promiseResult)) {
      logger.error(`Failed to update competition`, promiseResult.error);

      return errored({ code: 'FAILED_TO_UPDATE_COMPETITION' });
    }

    return complete({ updatedCompetition: promiseResult.value, addedParticipations: [] });
  }

  // Only update the participations if the consumer supplied an array
  const currentParticipations = await prisma.participation.findMany({
    where: { competitionId: id },
    include: { player: true }
  });

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

  if (missingUsernames.length > 0) {
    const optOuts = await prisma.playerAnnotation.findMany({
      where: {
        player: {
          username: { in: missingUsernames }
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
      return errored({
        code: 'OPTED_OUT_PLAYERS_FOUND',
        displayNames: optOuts.map(o => o.player.displayName)
      });
    }
  }

  const transactionResult = await fromPromise(
    prisma.$transaction([
      // Remove any players that are no longer participants
      removeExcessParticipations(id, nextUsernames, currentParticipations),
      // Add any missing participations
      addMissingParticipations(id, missingParticipations),
      // Update any team changes
      ...updateExistingTeams(id, currentParticipations, keptParticipations),
      // Update the competition
      competitionUpdatePromise
    ])
  );

  if (isErrored(transactionResult)) {
    logger.error(`Failed to update competition`, transactionResult.error);

    return errored({ code: 'FAILED_TO_UPDATE_COMPETITION' });
  }

  const results = transactionResult.value;

  const updatedCompetition = results[results.length - 1] as Awaited<typeof competitionUpdatePromise>;

  return complete({
    updatedCompetition,
    addedParticipations: missingParticipations
  });
}

function updateExistingTeams(
  competitionId: number,
  currentParticipations: Participation[],
  keptParticipations: PartialParticipation[]
): PrismaPromise<PrismaTypes.BatchPayload>[] {
  const currentTeamNameMap: { [teamName: string]: number[] } = {};
  const newTeamNameMap: { [teamName: string]: number[] } = {};

  currentParticipations.forEach(p => {
    if (!p.teamName) return;

    if (p.teamName in currentTeamNameMap) {
      currentTeamNameMap[p.teamName].push(p.playerId);
    } else {
      currentTeamNameMap[p.teamName] = [p.playerId];
    }
  });

  keptParticipations.forEach(p => {
    if (!p.teamName) return;

    // Player team hasn't changed
    if (currentTeamNameMap[p.teamName] && currentTeamNameMap[p.teamName].includes(p.playerId)) return;

    if (p.teamName in newTeamNameMap) {
      newTeamNameMap[p.teamName].push(p.playerId);
    } else {
      newTeamNameMap[p.teamName] = [p.playerId];
    }
  });

  return Object.keys(newTeamNameMap).map(teamName => {
    return prisma.participation.updateMany({
      where: {
        competitionId,
        playerId: { in: newTeamNameMap[teamName] }
      },
      data: {
        teamName
      }
    });
  });
}

function addMissingParticipations(
  competitionId: number,
  missingParticipations: PartialParticipation[]
): PrismaPromise<PrismaTypes.BatchPayload> {
  return prisma.participation.createMany({
    data: missingParticipations.map(p => ({ competitionId, playerId: p.playerId, teamName: p.teamName })),
    skipDuplicates: true
  });
}

function removeExcessParticipations(
  competitionId: number,
  nextUsernames: string[],
  currentParticipations: (Participation & { player: Player })[]
): PrismaPromise<PrismaTypes.BatchPayload> {
  const excessParticipants = currentParticipations.filter(p => !nextUsernames.includes(p.player.username));

  return prisma.participation.deleteMany({
    where: {
      competitionId,
      playerId: { in: excessParticipants.map(m => m.playerId) }
    }
  });
}
