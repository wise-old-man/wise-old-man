import { z } from 'zod';
import prisma from '../../../../prisma';
import { CompetitionType } from '../../../../utils';
import logger from '../../../util/logging';
import { BadRequestError, NotFoundError } from '../../../errors';
import { Team } from '../competition.types';
import {
  sanitizeTeams,
  validateInvalidParticipants,
  validateParticipantDuplicates,
  validateTeamDuplicates
} from '../competition.utils';
import * as playerServices from '../../players/player.services';

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

const inputSchema = z.object({
  id: z.number().int().positive(),
  teams: z
    .array(TEAM_INPUT_SCHEMA, {
      invalid_type_error: "Parameter 'teams' is not a valid array.",
      required_error: "Parameter 'teams' is not a valid array."
    })
    .nonempty({ message: 'Empty teams list.' })
});

type AddTeamsParams = z.infer<typeof inputSchema>;

async function addTeams(payload: AddTeamsParams): Promise<{ count: number }> {
  const params = inputSchema.parse(payload);

  const competition = await prisma.competition.findFirst({
    where: { id: params.id }
  });

  if (!competition) {
    throw new NotFoundError('Competition not found.');
  }

  if (competition.type === CompetitionType.CLASSIC) {
    throw new BadRequestError('Cannot add teams to a classic competition.');
  }

  // ensures every team name is sanitized, and every username is standardized
  const newTeams = sanitizeTeams(params.teams);
  // fetch this competition's current teams
  const currentTeams = await fetchCurrentTeams(params.id);

  // throws an error if any team name is duplicated
  validateTeamDuplicates([...newTeams, ...currentTeams]);
  // throws an error if any team participant is invalid
  validateInvalidParticipants([
    ...newTeams.map(t => t.participants).flat(),
    ...currentTeams.map(t => t.participants).flat()
  ]);
  // throws an error if any team participant is duplicated
  validateParticipantDuplicates([
    ...newTeams.map(t => t.participants).flat(),
    ...currentTeams.map(t => t.participants).flat()
  ]);

  const newPlayers = await playerServices.findPlayers({
    usernames: newTeams.map(t => t.participants).flat(),
    createIfNotFound: true
  });

  // Map player usernames into IDs, for O(1) checks below
  const playerMap = Object.fromEntries(newPlayers.map(p => [p.username, p.id]));

  // Turn all this data into a ({ teamName, playerId }) format, for DB insertion
  const newParticipations = newTeams
    .map(t => t.participants.map(u => ({ teamName: t.name, playerId: playerMap[u] })))
    .flat();

  const { count } = await prisma.participation.createMany({
    data: newParticipations.map(np => ({ ...np, competitionId: params.id }))
  });

  await prisma.competition.update({
    where: { id: params.id },
    data: { updatedAt: new Date() }
  });

  logger.moderation(`[Competition:${params.id}] (${newParticipations.map(p => p.playerId)}) joined`);

  return { count };
}

async function fetchCurrentTeams(id: number): Promise<Team[]> {
  const participations = await prisma.participation.findMany({
    where: { competitionId: id },
    select: { teamName: true, player: { select: { username: true } } }
  });

  const teamNameMap: { [teamName: string]: string[] } = {};

  participations.forEach(p => {
    if (p.teamName in teamNameMap) {
      teamNameMap[p.teamName] = [...teamNameMap[p.teamName], p.player.username];
    } else {
      teamNameMap[p.teamName] = [p.player.username];
    }
  });

  return Object.keys(teamNameMap).map(teamName => ({
    name: teamName,
    participants: teamNameMap[teamName]
  }));
}

export { addTeams };
