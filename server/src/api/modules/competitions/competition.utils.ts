import { complete, errored, Result } from '@attio/fetchable';
import { CompetitionTeam } from '../../../types';
import { sanitizeWhitespace } from '../../../utils/sanitize-whitespace.util';
import * as playerUtils from '../players/player.utils';

export function sanitizeTeams(teamInputs: CompetitionTeam[]): CompetitionTeam[] {
  // Sanitize the team inputs
  return teamInputs.map(t => ({
    name: sanitizeWhitespace(t.name),
    participants: t.participants.map(playerUtils.standardize)
  }));
}

export function validateTeamDuplicates(
  teams: CompetitionTeam[]
): Result<true, { code: 'DUPLICATE_TEAM_NAMES_FOUND'; teamNames: string[] }> {
  // Check for duplicate team names
  const teamNames = teams.map(t => t.name.toLowerCase());
  const duplicateTeamNames = [...new Set(teamNames.filter(t => teamNames.filter(it => it === t).length > 1))];

  if (duplicateTeamNames.length > 0) {
    return errored({
      code: 'DUPLICATE_TEAM_NAMES_FOUND',
      teamNames: duplicateTeamNames
    });
  }

  return complete(true);
}

export function validateInvalidParticipants(
  participants: string[]
): Result<true, { code: 'INVALID_USERNAMES_FOUND'; usernames: string[] }> {
  const invalidUsernames = participants.filter(u => !playerUtils.isValidUsername(u));

  if (invalidUsernames.length > 0) {
    return errored({
      code: 'INVALID_USERNAMES_FOUND',
      usernames: invalidUsernames
    });
  }

  return complete(true);
}

export function validateParticipantDuplicates(
  participants: string[]
): Result<true, { code: 'DUPLICATE_USERNAMES_FOUND'; usernames: string[] }> {
  const usernames = participants.map(playerUtils.standardize);
  // adding dupes to a set, otherwise both copies of each dupe would get reported
  const duplicateUsernames = [...new Set(usernames.filter(u => usernames.filter(iu => iu === u).length > 1))];

  if (duplicateUsernames.length > 0) {
    return errored({
      code: 'DUPLICATE_USERNAMES_FOUND',
      usernames: duplicateUsernames
    });
  }

  return complete(true);
}
