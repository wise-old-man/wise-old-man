import { z } from 'zod';
import { CompetitionType, Metric } from '../../../../utils';
import prisma, {
  PrismaPlayer,
  Competition,
  Participation,
  PrismaTypes,
  PrismaPromise,
  modifyPlayer
} from '../../../../prisma';
import * as playerServices from '../../players/player.services';
import { BadRequestError, NotFoundError, ServerError } from '../../../errors';
import {
  sanitizeTeams,
  validateTeamDuplicates,
  validateInvalidParticipants,
  validateParticipantDuplicates,
  sanitizeTitle
} from '../competition.utils';
import { standardize } from '../../players/player.utils';
import { omit } from 'lodash';
import { CompetitionWithParticipations } from '../competition.types';

const INVALID_TYPE_ERROR =
  'Invalid teams list. Must be an array of { name: string; participants: string[]; }.';

const TEAM_INPUT_SCHEMA = z.object(
  {
    name: z
      .string({
        required_error: INVALID_TYPE_ERROR,
        invalid_type_error: INVALID_TYPE_ERROR
      })
      .min(1, 'Team names must have at least one character.')
      .max(30, 'Team names cannot be longer than 30 characters.'),
    participants: z
      .array(z.string(), {
        invalid_type_error: INVALID_TYPE_ERROR,
        required_error: INVALID_TYPE_ERROR
      })
      .nonempty({ message: 'All teams must have a valid non-empty participants array.' })
  },
  {
    invalid_type_error: INVALID_TYPE_ERROR
  }
);

const inputSchema = z
  .object({
    id: z.number().int().positive(),
    title: z
      .string({ required_error: "Parameter 'title' is undefined." })
      .min(1, 'Competition title must have at least one character.')
      .max(50, 'Competition title cannot be longer than 50 characters.')
      .optional(),
    metric: z.nativeEnum(Metric).optional(),
    startsAt: z
      .date({
        invalid_type_error: "Parameter 'startsAt' is not a valid date.",
        required_error: "Parameter 'startsAt' is undefined."
      })
      .optional(),
    endsAt: z
      .date({
        invalid_type_error: "Parameter 'endsAt' is not a valid date.",
        required_error: "Parameter 'endsAt' is undefined."
      })
      .optional(),
    participants: z
      // Allowing "any" so that we could do better error messages below
      .array(z.string().or(z.any()).optional(), {
        invalid_type_error: "Parameter 'participants' is not a valid array.",
        required_error: "Parameter 'participants' is undefined."
      })
      .optional(),
    teams: z
      .array(TEAM_INPUT_SCHEMA, { invalid_type_error: "Parameter 'teams' is not a valid array." })
      .optional()
  })
  .refine(s => !(s.participants && s.participants.length > 0 && s.teams && s.teams.length > 0), {
    message: 'Cannot include both "participants" and "teams", they are mutually exclusive.'
  });

type EditCompetitionParams = z.infer<typeof inputSchema>;

type PartialParticipation = { playerId: number; username: string; teamName?: string };

async function editCompetition(payload: EditCompetitionParams): Promise<CompetitionWithParticipations> {
  const params = inputSchema.parse(payload);

  if (
    !params.title &&
    !params.metric &&
    !params.startsAt &&
    !params.endsAt &&
    !params.participants &&
    !params.teams
  ) {
    throw new BadRequestError('Nothing to update.');
  }

  const updatedCompetitionFields: PrismaTypes.CompetitionUpdateInput = {};

  const hasTeams = params.teams && params.teams.length > 0;
  const hasParticipants = params.participants && params.participants.length > 0;

  const competition = await prisma.competition.findFirst({
    where: { id: params.id }
  });

  if (!competition) {
    throw new NotFoundError('Competition not found.');
  }

  if (params.startsAt || params.endsAt) {
    const startDate = params.startsAt || competition.startsAt;
    const endDate = params.endsAt || competition.endsAt;

    if (endDate.getTime() < startDate.getTime()) {
      throw new BadRequestError('Start date must be before the end date.');
    }

    if (startDate.getTime() < Date.now() || endDate.getTime() < Date.now()) {
      throw new BadRequestError('Invalid dates: All start and end dates must be in the future.');
    }
  }

  if (competition.type === CompetitionType.CLASSIC && hasTeams) {
    throw new BadRequestError("The competition type cannot be changed to 'team'.");
  }

  if (competition.type === CompetitionType.TEAM && hasParticipants) {
    throw new BadRequestError("The competition type cannot be changed to 'classic'.");
  }

  // If competition has already started
  if (competition.startsAt.getTime() < Date.now()) {
    if (params.metric && params.metric !== competition.metric) {
      throw new BadRequestError('The competition has started, the metric cannot be changed.');
    }

    if (params.startsAt && params.startsAt.getTime() !== competition.startsAt.getTime()) {
      throw new BadRequestError('The competition has started, the start date cannot be changed.');
    }
  }

  let participations: PartialParticipation[] = [];

  if (hasParticipants) {
    participations = await getParticipations(params);
  } else if (hasTeams) {
    participations = await getTeamsParticipations(params);
  }

  if (params.title) updatedCompetitionFields.title = sanitizeTitle(params.title);
  if (params.startsAt) updatedCompetitionFields.startsAt = params.startsAt;
  if (params.endsAt) updatedCompetitionFields.endsAt = params.endsAt;
  if (params.metric) updatedCompetitionFields.metric = params.metric;

  const updatedCompetition = await executeUpdate(params, participations, updatedCompetitionFields);

  if (!updatedCompetition) {
    throw new ServerError('Failed to edit competition. (EditCompetitionService)');
  }

  return {
    ...omit(updatedCompetition, ['verificationHash']),
    participantCount: updatedCompetition.participations.length,
    participations: updatedCompetition.participations.map(p => ({
      ...omit(p, ['startSnapshotId', 'endSnapshotId']),
      player: modifyPlayer(p.player)
    }))
  };
}

type UpdateExecutionResult = Competition & {
  participations: (Participation & {
    player: PrismaPlayer;
  })[];
};

async function executeUpdate(
  params: EditCompetitionParams,
  nextParticipations: PartialParticipation[],
  updatedCompetitionFields: PrismaTypes.CompetitionUpdateInput
): Promise<UpdateExecutionResult> {
  // This action updates the competition's fields and returns all the new data + participations,
  // If ran inside a transaction, it should be the last thing to run, to ensure it returns updated data
  const competitionUpdatePromise = prisma.competition.update({
    where: {
      id: params.id
    },
    data: {
      ...updatedCompetitionFields,
      updatedAt: new Date() // Force update the "updatedAt" field
    },
    include: {
      participations: { include: { player: true } }
    }
  });

  const currentParticipations = await prisma.participation.findMany({
    where: { competitionId: params.id },
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
    removeExcessParticipations(params.id, nextUsernames, currentParticipations),
    // Add any missing participations
    addMissingParticipations(params.id, missingParticipations),
    // Update any team changes
    ...updateExistingTeams(params.id, currentParticipations, keptParticipations),
    // Update the competition
    competitionUpdatePromise
  ]);

  return results[results.length - 1];
}

function updateExistingTeams(
  competitionId: number,
  currentParticipations: Participation[],
  keptParticipations: PartialParticipation[]
): PrismaPromise<any>[] {
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
  currentParticipations: (Participation & { player: PrismaPlayer })[]
): PrismaPromise<PrismaTypes.BatchPayload> {
  const excessParticipants = currentParticipations.filter(p => !nextUsernames.includes(p.player.username));

  return prisma.participation.deleteMany({
    where: {
      competitionId,
      playerId: { in: excessParticipants.map(m => m.playerId) }
    }
  });
}

async function getParticipations(params: EditCompetitionParams) {
  // throws an error if any participant is invalid
  validateInvalidParticipants(params.participants);
  // throws an error if any participant is duplicated
  validateParticipantDuplicates(params.participants);

  // Find or create all players with the given usernames
  const players = await playerServices.findPlayers({
    usernames: params.participants,
    createIfNotFound: true
  });

  return players.map(p => ({ playerId: p.id, username: p.username, teamName: null }));
}

async function getTeamsParticipations(params: EditCompetitionParams) {
  // ensures every team name is sanitized, and every username is standardized
  const newTeams = sanitizeTeams(params.teams);

  // throws an error if any team name is duplicated
  validateTeamDuplicates(newTeams);
  // throws an error if any team participant is invalid
  validateInvalidParticipants(newTeams.map(t => t.participants).flat());
  // throws an error if any team participant is duplicated
  validateParticipantDuplicates(newTeams.map(t => t.participants).flat());

  // Find or create all players with the given usernames
  const players = await playerServices.findPlayers({
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
