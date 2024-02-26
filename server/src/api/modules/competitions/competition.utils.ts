import { BadRequestError } from '../../errors';
import * as playerUtils from '../players/player.utils';
import { Team } from './competition.types';

export function sanitizeTitle(title: string): string {
  return title
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/ +(?= )/g, '')
    .trim();
}

export function sanitizeTeams(teamInputs: Team[]): Team[] {
  // Sanitize the team inputs
  return teamInputs.map(t => ({
    name: sanitizeTitle(t.name),
    participants: t.participants.map(playerUtils.standardize)
  }));
}

export function validateTeamDuplicates(teams: Team[]) {
  // Check for duplicate team names
  const teamNames = teams.map(t => t.name.toLowerCase());
  const duplicateTeamNames = [...new Set(teamNames.filter(t => teamNames.filter(it => it === t).length > 1))];

  if (duplicateTeamNames.length > 0) {
    throw new BadRequestError(`Found repeated team names: [${duplicateTeamNames.join(', ')}]`);
  }
}

export function validateInvalidParticipants(participants: string[]) {
  const invalidUsernames = participants.filter(u => !playerUtils.isValidUsername(u));

  if (invalidUsernames && invalidUsernames.length > 0) {
    throw new BadRequestError(
      `Found ${invalidUsernames.length} invalid usernames: Names must be 1-12 characters long,
       contain no special characters, and/or contain no space at the beginning or end of the name.`,
      invalidUsernames
    );
  }
}

export function validateParticipantDuplicates(participants: string[]) {
  const usernames = participants.map(playerUtils.standardize);
  // adding dupes to a set, otherwise both copies of each dupe would get reported
  const duplicateUsernames = [...new Set(usernames.filter(u => usernames.filter(iu => iu === u).length > 1))];

  if (duplicateUsernames && duplicateUsernames.length > 0) {
    throw new BadRequestError(`Found repeated usernames: [${duplicateUsernames.join(', ')}]`);
  }
}
