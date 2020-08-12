import axios from 'axios';
import { Achievement, Competition } from '../../../database/models';
import env from '../../../env';
import { EventPeriod } from '../../../types';
import * as groupService from '../internal/group.service';
import * as playerService from '../internal/player.service';

/**
 * Dispatch an event to our Discord Bot API.
 */
function dispatch(type: string, payload: any) {
  const url = env.DISCORD_BOT_API_URL;
  const api_token = env.DISCORD_BOT_API_TOKEN;
  const body = { type, api_token, data: payload };

  axios.post(url, body);
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
  const groups = await groupService.getPlayerGroups(playerId);

  // The following actions are only relevant to players
  // that are group members, so ignore any that aren't
  if (!groups || groups.length === 0) return;

  const player = await playerService.findById(playerId);

  groups.forEach(({ id }) => {
    dispatch('MEMBER_ACHIEVEMENTS', { groupId: id, player, achievements: recent });
  });
}

/**
 * Select all new group members and dispatch them to our discord API,
 * so that it can notify any relevant guilds/servers.
 */
async function dispatchMembersJoined(groupId: number, playerIds: number[]) {
  // Fetch all the players for these ids
  const players = await playerService.findAllByIds(playerIds);

  // If couldn't find any players for these ids, ignore event
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
  dispatch('COMPETITION_CREATED', { groupId: competition.groupId, competition });
}

/**
 * Dispatch a competition created event to our discord bot API.
 */
function dispatchCompetitionStarted(competition: Competition) {
  const { groupId } = competition;

  // Only dispatch this event for group competitions
  if (!groupId) return;

  dispatch('COMPETITION_STARTED', { groupId, competition });
}

/**
 * Dispatch a competition ended event to our discord bot API.
 */
function dispatchCompetitionEnded(competition: Competition) {
  const { groupId, participants } = competition;

  // Only dispatch this event for group competitions
  if (!groupId) return;

  // Map the competition's end standings
  const standings = participants.map((p: any) => {
    const displayName = p.displayName;
    const gained = p.progress.gained;

    return { displayName, gained };
  });

  dispatch('COMPETITION_ENDED', { groupId, competition, standings });
}

/**
 * Dispatch a competition starting event to our discord bot API.
 */
function dispatchCompetitionStarting(competition: Competition, period: EventPeriod) {
  const { groupId } = competition;

  // Only dispatch this event for group competitions
  if (!groupId) return;

  dispatch('COMPETITION_STARTING', { groupId, competition, period });
}

/**
 * Dispatch a competition ending event to our discord bot API.
 */
function dispatchCompetitionEnding(competition: Competition, period: EventPeriod) {
  const { groupId } = competition;

  // Only dispatch this event for group competitions
  if (!groupId) return;

  dispatch('COMPETITION_ENDING', { groupId, competition, period });
}

export {
  dispatch,
  dispatchAchievements,
  dispatchMembersJoined,
  dispatchMembersLeft,
  dispatchCompetitionCreated,
  dispatchCompetitionStarted,
  dispatchCompetitionEnded,
  dispatchCompetitionStarting,
  dispatchCompetitionEnding
};
