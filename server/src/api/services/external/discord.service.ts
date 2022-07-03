import axios from 'axios';
import env, { isTesting } from '../../../env';
import prisma, { Achievement, Player, Competition } from '../../../prisma';
import { EventPeriodDelay } from '../../../types';
import { CompetitionDetails } from '../../modules/competitions/competition.types';
import * as playerServices from '../../modules/players/player.services';

/**
 * Dispatch an event to our Discord Bot API.
 */
function dispatch(type: string, payload: any) {
  if (isTesting()) return;

  const url = env.DISCORD_BOT_API_URL;
  const api_token = env.DISCORD_BOT_API_TOKEN;
  const body = { type, api_token, data: payload };

  axios.post(url, body).catch(() => {
    console.log('Error sending discord event.');
  });
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

  const memberships = await prisma.membership.findMany({ where: { playerId } });

  // The following actions are only relevant to players
  // that are group members, so ignore any that aren't
  if (!memberships || memberships.length === 0) return;

  const [player] = await playerServices.findPlayer({ id: playerId });

  memberships.forEach(({ groupId }) => {
    dispatch('MEMBER_ACHIEVEMENTS', { groupId, player, achievements: recent });
  });
}

/**
 * Send a "HCIM Player Died" notification to our discord API,
 * so that it can notify any relevant guilds/servers.
 */
async function dispatchHardcoreDied(player: Player) {
  const memberships = await prisma.membership.findMany({
    where: { playerId: player.id }
  });

  // The following actions are only relevant to players
  // that are group members, so ignore any that aren't
  if (!memberships || memberships.length === 0) return;

  memberships.forEach(({ groupId }) => {
    dispatch('MEMBER_HCIM_DIED', { groupId, player });
  });
}

/**
 * Send a "Player Name Changed" notification to our discord API,
 * so that it can notify any relevant guilds/servers.
 */
async function dispatchNameChanged(player: Player, previousDisplayName: string) {
  const memberships = await prisma.membership.findMany({
    where: { playerId: player.id }
  });

  // The following actions are only relevant to players
  // that are group members, so ignore any that aren't
  if (!memberships || memberships.length === 0) return;

  memberships.forEach(({ groupId }) => {
    dispatch('MEMBER_NAME_CHANGED', { groupId, player, previousName: previousDisplayName });
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
  const players = await playerServices.findPlayers({ ids: playerIds });

  // If couldn't find any players for these ids, ignore event
  if (!players || players.length === 0) return;

  dispatch('GROUP_MEMBERS_LEFT', { groupId, players });
}

/**
 * Dispatch a competition created event to our discord bot API.
 */
function dispatchCompetitionCreated(competition: Competition) {
  dispatch('COMPETITION_CREATED', {
    groupId: competition.groupId,
    competition
  });
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
function dispatchCompetitionEnded(competition: CompetitionDetails) {
  const { groupId, participations } = competition;

  // Only dispatch this event for group competitions
  if (!groupId) return;

  // Map the competition's end standings
  const standings = participations
    .filter(p => p.progress.gained > 0)
    .map(p => ({ displayName: p.player.displayName, teamName: p.teamName, gained: p.progress.gained }));

  dispatch('COMPETITION_ENDED', { groupId, competition, standings });
}

/**
 * Dispatch a competition starting event to our discord bot API.
 */
function dispatchCompetitionStarting(competition: Competition, period: EventPeriodDelay) {
  const { groupId } = competition;

  // Only dispatch this event for group competitions
  if (!groupId) return;

  dispatch('COMPETITION_STARTING', { groupId, competition, period });
}

/**
 * Dispatch a competition ending event to our discord bot API.
 */
function dispatchCompetitionEnding(competition: Competition, period: EventPeriodDelay) {
  const { groupId } = competition;

  // Only dispatch this event for group competitions
  if (!groupId) return;

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
