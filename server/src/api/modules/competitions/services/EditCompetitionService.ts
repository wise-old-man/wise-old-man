import { CompetitionType, Metric, Snapshot } from '../../../../utils';
import prisma, { Participation, PrismaTypes, PrismaPromise, Player } from '../../../../prisma';
import logger from '../../../util/logging';
import { omit } from '../../../util/objects';
import { BadRequestError, NotFoundError, ServerError } from '../../../errors';
import {
  sanitizeTeams,
  validateTeamDuplicates,
  validateInvalidParticipants,
  validateParticipantDuplicates,
  sanitizeTitle
} from '../competition.utils';
import { standardize } from '../../players/player.utils';
import { CompetitionWithParticipations, Team } from '../competition.types';
import { findGroupSnapshots } from '../../snapshots/services/FindGroupSnapshotsService';
import { findPlayers } from '../../players/services/FindPlayersService';

interface EditCompetitionPayload {
  title?: string;
  metric?: Metric;
  startsAt?: Date;
  endsAt?: Date;
  participants?: string[];
  teams?: Team[];
}

interface PartialParticipation {
  playerId: number;
  username: string;
  teamName?: string;
}

async function editCompetition(
  id: number,
  payload: EditCompetitionPayload
): Promise<CompetitionWithParticipations> {
  const { title, metric, startsAt, endsAt, participants, teams } = payload;

  if (participants?.length > 0 && teams?.length > 0) {
    throw new BadRequestError('Cannot include both "participants" and "teams", they are mutually exclusive.');
  }

  if (!title && !metric && !startsAt && !endsAt && !participants && !teams) {
    throw new BadRequestError('Nothing to update.');
  }

  const updatedCompetitionFields: PrismaTypes.CompetitionUpdateInput = {};

  const teamsExist = teams !== undefined;
  const participantsExist = participants !== undefined;
  const hasTeams = teamsExist && teams.length > 0;
  const hasParticipants = participantsExist && participants.length > 0;

  const competition = await prisma.competition.findFirst({
    where: { id }
  });

  if (!competition) {
    throw new NotFoundError('Competition not found.');
  }

  if (startsAt || endsAt) {
    const startDate = startsAt || competition.startsAt;
    const endDate = endsAt || competition.endsAt;

    if (endDate.getTime() < startDate.getTime()) {
      throw new BadRequestError('Start date must be before the end date.');
    }
  }

  if (competition.type === CompetitionType.CLASSIC && hasTeams) {
    throw new BadRequestError("The competition type cannot be changed to 'team'.");
  }

  if (competition.type === CompetitionType.TEAM && hasParticipants) {
    throw new BadRequestError("The competition type cannot be changed to 'classic'.");
  }

  let participations: PartialParticipation[] = null;

  if (participantsExist && competition.type === CompetitionType.CLASSIC) {
    participations = await getParticipations(payload);
  } else if (teamsExist && competition.type === CompetitionType.TEAM) {
    participations = await getTeamsParticipations(payload);
  }

  if (title) updatedCompetitionFields.title = sanitizeTitle(title);
  if (startsAt) updatedCompetitionFields.startsAt = startsAt;
  if (endsAt) updatedCompetitionFields.endsAt = endsAt;
  if (metric) updatedCompetitionFields.metric = metric;

  const updatedCompetition = await executeUpdate(id, participations, updatedCompetitionFields);

  logger.moderation(`[Competition:${id}] Edited`);

  if (!updatedCompetition) {
    throw new ServerError('Failed to edit competition. (EditCompetitionService)');
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

  return {
    ...omit(updatedCompetition, 'verificationHash'),
    group: updatedCompetition.group
      ? {
          ...omit(updatedCompetition.group, '_count', 'verificationHash'),
          memberCount: updatedCompetition.group._count.memberships
        }
      : undefined,
    participantCount: updatedCompetition.participations.length,
    participations: updatedCompetition.participations.map(p => ({
      ...omit(p, 'startSnapshotId', 'endSnapshotId')
    }))
  };
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
  const playerSnapshots = await findGroupSnapshots({ playerIds, minDate: startDate });

  // Map these snapshots for O(1) lookups
  const snapshotMap = new Map<number, Snapshot>(playerSnapshots.map(s => [s.playerId, s]));

  // Update participations with the new start snapshot IDs
  for (const playerId of playerIds) {
    await prisma.participation.update({
      where: { playerId_competitionId: { competitionId, playerId } },
      data: { startSnapshotId: snapshotMap.get(playerId) ? snapshotMap.get(playerId).id : null }
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
  const playerSnapshots = await findGroupSnapshots({ playerIds, maxDate: endDate });

  // Map these snapshots for O(1) lookups
  const snapshotMap = new Map<number, Snapshot>(playerSnapshots.map(s => [s.playerId, s]));

  // Update participations with the new end snapshot IDs
  for (const playerId of playerIds) {
    await prisma.participation.update({
      where: { playerId_competitionId: { competitionId, playerId } },
      data: { endSnapshotId: snapshotMap.get(playerId) ? snapshotMap.get(playerId).id : null }
    });
  }
}

async function executeUpdate(
  id: number,
  nextParticipations: PartialParticipation[] | null,
  updatedCompetitionFields: PrismaTypes.CompetitionUpdateInput
) {
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

  // Only update the participations if the consumer supplied an array
  if (nextParticipations) {
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

    const results = await prisma.$transaction([
      // Remove any players that are no longer participants
      removeExcessParticipations(id, nextUsernames, currentParticipations),
      // Add any missing participations
      addMissingParticipations(id, missingParticipations),
      // Update any team changes
      ...updateExistingTeams(id, currentParticipations, keptParticipations),
      // Update the competition
      competitionUpdatePromise
    ]);

    return results[results.length - 1] as Awaited<typeof competitionUpdatePromise>;
  }

  return await competitionUpdatePromise;
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

async function getParticipations(payload: EditCompetitionPayload) {
  // throws an error if any participant is invalid
  validateInvalidParticipants(payload.participants);
  // throws an error if any participant is duplicated
  validateParticipantDuplicates(payload.participants);

  // Find or create all players with the given usernames
  const players = await findPlayers({
    usernames: payload.participants,
    createIfNotFound: true
  });

  return players.map(p => ({ playerId: p.id, username: p.username, teamName: null }));
}

async function getTeamsParticipations(payload: EditCompetitionPayload) {
  // ensures every team name is sanitized, and every username is standardized
  const newTeams = sanitizeTeams(payload.teams);

  // throws an error if any team name is duplicated
  validateTeamDuplicates(newTeams);
  // throws an error if any team participant is invalid
  validateInvalidParticipants(newTeams.map(t => t.participants).flat());
  // throws an error if any team participant is duplicated
  validateParticipantDuplicates(newTeams.map(t => t.participants).flat());

  // Find or create all players with the given usernames
  const players = await findPlayers({
    usernames: newTeams.map(t => t.participants).flat(),
    createIfNotFound: true
  });

  // Map player usernames into IDs, for O(1) checks below
  const playerMap = Object.fromEntries(players.map(p => [p.username, p.id]));

  return newTeams
    .map(t => t.participants.map(u => ({ playerId: playerMap[u], username: u, teamName: t.name })))
    .flat();
}

export { editCompetition };
