import { Achievement, Competition, Player } from '../../../database/models';
import { EventPeriodDelay } from '../../../types';
import { durationBetween } from '../../util/dates';
import { CompetitionDetails } from '../internal/competition.service';
import * as groupService from '../internal/group.service';
import * as playerService from '../internal/player.service';

/**
 * Dispatch an event to our Discord Bot API.
 */
function dispatch(type: string, payload: any) {
  console.log('Cannot dispatch discord events in the Shattered Relics Edition.');
}

/**
 * Select all new achievements and dispatch them to our discord API,
 * so that it can notify any relevant guilds/servers.
 */
async function dispatchAchievements(playerId: number, achievements: Achievement[]) {
  // Filter out any achievements from earlier dates
  const recent = achievements.filter(a => Date.now() - a.createdAt.getTime() < 30000);

  // If no new achievements are found, ignore this event
  if (recent.length === 0) return;

  // Find all the groups for which this player is a member
  const groups = await groupService.getPlayerGroups(playerId, { limit: 200, offset: 0 });

  // The following actions are only relevant to players
  // that are group members, so ignore any that aren't
  if (!groups || groups.length === 0) return;

  const player = await playerService.findById(playerId);

  groups.forEach(({ id }) => {
    dispatch('MEMBER_ACHIEVEMENTS', { groupId: id, player, achievements: recent });
  });
}

/**
 * Send a "HCIM Player Died" notification to our discord API,
 * so that it can notify any relevant guilds/servers.
 */
async function dispatchHardcoreDied(player: Player) {
  // Find all the groups for which this player is a member
  const groups = await groupService.getPlayerGroups(player.id, { limit: 200, offset: 0 });

  // The following actions are only relevant to players
  // that are group members, so ignore any that aren't
  if (!groups || groups.length === 0) return;

  groups.forEach(({ id }) => {
    dispatch('MEMBER_HCIM_DIED', { groupId: id, player });
  });
}

/**
 * Send a "Player Name Changed" notification to our discord API,
 * so that it can notify any relevant guilds/servers.
 */
async function dispatchNameChanged(player: Player, previousDisplayName: string) {
  // Find all the groups for which this player is a member
  const groups = await groupService.getPlayerGroups(player.id, { limit: 200, offset: 0 });

  // The following actions are only relevant to players
  // that are group members, so ignore any that aren't
  if (!groups || groups.length === 0) return;

  groups.forEach(({ id }) => {
    dispatch('MEMBER_NAME_CHANGED', { groupId: id, player, previousName: previousDisplayName });
  });
}

/**
 * Select all new group members and dispatch them to our discord API,
 * so that it can notify any relevant guilds/servers.
 */
async function dispatchMembersJoined(groupId: number, players: Player[]) {
  if (!players || players.length === 0) return;
  dispatch('GROUP_MEMBERS_JOINED', { groupId, players });
}

/**
 * Select all group members who left and dispatch them to our discord API,
 * so that it can notify any relevant guilds/servers.
 */
async function dispatchMembersLeft(groupId: number, playerIds: number[]) {
  // Fetch all the players for these ids
  const players = await playerService.findAllByIds(playerIds);

  // If couldn't find any players for these ids, ignore event
  if (!players || players.length === 0) return;

  dispatch('GROUP_MEMBERS_LEFT', { groupId, players });
}

/**
 * Dispatch a competition created event to our discord bot API.
 */
function dispatchCompetitionCreated(competition: Competition) {
  const duration = durationBetween(competition.startsAt, competition.endsAt);

  dispatch('COMPETITION_CREATED', {
    groupId: competition.groupId,
    competition: { ...competition.toJSON(), duration }
  });
}

/**
 * Dispatch a competition created event to our discord bot API.
 */
function dispatchCompetitionStarted(competition: CompetitionDetails) {
  const { groupId } = competition;

  // Only dispatch this event for group competitions
  if (!groupId) return;

  // Do not send the competition's participants, to not exceed the HTTP character limit
  delete competition.participants;

  dispatch('COMPETITION_STARTED', { groupId, competition });
}

/**
 * Dispatch a competition ended event to our discord bot API.
 */
function dispatchCompetitionEnded(competition: CompetitionDetails) {
  const { groupId, participants } = competition;

  // Only dispatch this event for group competitions
  if (!groupId) return;

  // Map the competition's end standings
  const standings = participants
    .filter(p => p.progress.gained > 0)
    .map((p: any) => {
      const { displayName, teamName } = p;
      const gained = p.progress.gained;

      return { displayName, teamName, gained };
    });

  // Do not send the competition's participants, to not exceed the HTTP character limit
  delete competition.participants;

  dispatch('COMPETITION_ENDED', { groupId, competition, standings });
}

/**
 * Dispatch a competition starting event to our discord bot API.
 */
function dispatchCompetitionStarting(competition: CompetitionDetails, period: EventPeriodDelay) {
  const { groupId } = competition;

  // Only dispatch this event for group competitions
  if (!groupId) return;

  // Do not send the competition's participants, to not exceed the HTTP character limit
  delete competition.participants;

  dispatch('COMPETITION_STARTING', { groupId, competition, period });
}

/**
 * Dispatch a competition ending event to our discord bot API.
 */
function dispatchCompetitionEnding(competition: CompetitionDetails, period: EventPeriodDelay) {
  const { groupId } = competition;

  // Only dispatch this event for group competitions
  if (!groupId) return;

  // Do not send the competition's participants, to not exceed the HTTP character limit
  delete competition.participants;

  dispatch('COMPETITION_ENDING', { groupId, competition, period });
}

export {
  dispatch,
  dispatchAchievements,
  dispatchHardcoreDied,
  dispatchNameChanged,
  dispatchMembersJoined,
  dispatchMembersLeft,
  dispatchCompetitionCreated,
  dispatchCompetitionStarted,
  dispatchCompetitionEnded,
  dispatchCompetitionStarting,
  dispatchCompetitionEnding
};
