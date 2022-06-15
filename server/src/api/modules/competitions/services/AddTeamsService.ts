import { z } from 'zod';
import prisma from '../../../../prisma';
import { CompetitionType } from '../../../../utils';
import { BadRequestError, NotFoundError } from '../../../errors';
import { Team } from '../competition.types';
import { sanitizeTitle } from '../competition.utils';
import * as playerUtils from '../../players/player.utils';
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
  id: z.number().positive(),
  teams: z
    .array(TEAM_INPUT_SCHEMA, { invalid_type_error: "Parameter 'teams' is not a valid array." })
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

  const newTeams = validateTeamsList(params.teams);
  const currentTeams = await fetchCurrentTeams(params.id);

  // Throws errors if needed
  validateRepeatedEntries(currentTeams, newTeams);

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

function validateRepeatedEntries(currentTeams: Team[], newTeams: Team[]) {
  const newTeamNames = newTeams.map(t => t.name.toLowerCase());
  const newParticipants = newTeams.map(t => t.participants).flat();

  const currentTeamNames = currentTeams.map(t => t.name.toLowerCase());
  const currentParticipants = currentTeams.map(t => t.participants).flat();

  const duplicateTeamNames = newTeamNames.filter(t => currentTeamNames.includes(t));

  if (duplicateTeamNames.length > 0) {
    throw new BadRequestError(`Found repeated team names: [${duplicateTeamNames.join(', ')}]`);
  }

  const invalidUsernames = newParticipants.filter(t => !playerUtils.isValidUsername(t));

  if (invalidUsernames && invalidUsernames.length > 0) {
    throw new BadRequestError(
      `Found ${invalidUsernames.length} invalid usernames: Names must be 1-12 characters long,
       contain no special characters, and/or contain no space at the beginning or end of the name.`,
      invalidUsernames
    );
  }

  const duplicateParticipants = newParticipants.filter(t => currentParticipants.includes(t));

  if (duplicateParticipants.length > 0) {
    throw new BadRequestError(`Found repeated usernames: [${duplicateParticipants.join(', ')}]`);
  }
}

function validateTeamsList(teamInputs: AddTeamsParams['teams']): Team[] {
  // Sanitize the team inputs
  const teams: Team[] = teamInputs.map(t => ({
    name: sanitizeTitle(t.name),
    participants: t.participants.map(playerUtils.standardize) as any
  }));

  // Check for duplicate team names
  const teamNames = teams.map(t => t.name.toLowerCase());
  const duplicateTeamNames = [...new Set(teamNames.filter(t => teamNames.filter(it => it === t).length > 1))];

  if (duplicateTeamNames.length > 0) {
    throw new BadRequestError(`Found repeated team names: [${duplicateTeamNames.join(', ')}]`);
  }

  const usernames = teams.map(t => t.participants).flat();
  const duplicateUsernames = [...new Set(usernames.filter(u => usernames.filter(iu => iu === u).length > 1))];

  if (duplicateUsernames && duplicateUsernames.length > 0) {
    throw new BadRequestError(`Found repeated usernames: [${duplicateUsernames.join(', ')}]`);
  }

  const invalidUsernames = usernames.filter(u => !playerUtils.isValidUsername(u));

  if (invalidUsernames.length > 0) {
    throw new BadRequestError(
      `Found ${invalidUsernames.length} invalid usernames: Names must be 1-12 characters long,
       contain no special characters, and/or contain no space at the beginning or end of the name.`,
      invalidUsernames
    );
  }

  return teams;
}

export { addTeams };
