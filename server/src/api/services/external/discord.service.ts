import axios from 'axios';
import { WebhookClient } from 'discord.js';
import env, { isTesting } from '../../../env';
import prisma, { Achievement, Competition, Player } from '../../../prisma';
import { FlaggedPlayerReviewContext, MemberJoinedEvent, MemberRoleChangeEvent } from '../../../utils';
import {
  CompetitionDetails,
  CompetitionWithParticipations
} from '../../modules/competitions/competition.types';
import { findPlayers } from '../../modules/players/services/FindPlayersService';
import logger from '../../util/logging';
import { omit } from '../../util/objects';

export interface EventPeriodDelay {
  hours?: number;
  minutes?: number;
}

function sendMonitoringMessage(text: string, tagAdmin?: boolean) {
  if (isTesting()) return;

  if (!env.DISCORD_MONITORING_WEBHOOK_URL) {
    logger.error('Missing Discord Monitoring Webhook URL.');
    return;
  }

  const webhookClient = new WebhookClient({ url: env.DISCORD_MONITORING_WEBHOOK_URL });
  return webhookClient.send({ content: `${text} ${tagAdmin ? '<@329256344798494773>' : ''}` });
}

function sendPatreonUpdateMessage(text: string) {
  if (isTesting()) return;

  if (!env.DISCORD_PATREON_WEBHOOK_URL) {
    logger.error('Missing Discord Patreon Webhook URL.');
    return;
  }

  const webhookClient = new WebhookClient({ url: env.DISCORD_PATREON_WEBHOOK_URL });
  return webhookClient.send({ content: text });
}

/**
 * Dispatch an event to our Discord Bot API.
 */
function dispatch(type: string, payload: unknown) {
  if (isTesting()) return;

  if (!env.DISCORD_BOT_API_URL) {
    logger.error('Missing Discord Bot API URL.');
    return;
  }

  axios.post(env.DISCORD_BOT_API_URL, { type, data: payload }).catch(e => {
    logger.error('Error sending discord event.', e);
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

  const player = await prisma.player.findFirst({
    where: { id: playerId }
  });

  memberships.forEach(({ groupId }) => {
    dispatch('MEMBER_ACHIEVEMENTS', { groupId, player, achievements: recent });
  });
}

function dispatchPlayerFlaggedReview(player: Player, flagContext: FlaggedPlayerReviewContext) {
  if (!player || !flagContext) return;

  dispatch('PLAYER_FLAGGED_REVIEW', { player, flagContext });
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
  // If only capitlization changed, ignore this action
  if (player.displayName.toLowerCase() === previousDisplayName.toLowerCase()) return;

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

async function dispatchMembersRolesChanged(events: MemberRoleChangeEvent[]) {
  if (events.length === 0) return;

  const groupId = events[0].groupId;
  const playerIds = events.map(m => m.playerId);

  // Fetch all the affected players
  const players = await findPlayers({ ids: playerIds });
  if (players.length === 0) return;

  const playersMap = new Map<number, Player>(players.map(p => [p.id, p]));

  dispatch('GROUP_MEMBERS_CHANGED_ROLES', {
    groupId,
    members: events.map(e => {
      const player = playersMap.get(e.playerId);
      if (!player) return null;

      return { role: e.role, previousRole: e.previousRole, player };
    })
  });
}

/**
 * Select all new group members and dispatch them to our discord API,
 * so that it can notify any relevant guilds/servers.
 */
async function dispatchMembersJoined(groupId: number, events: MemberJoinedEvent[], players: Player[]) {
  if (events.length === 0 || players.length === 0) return;

  const playersMap = new Map<number, Player>(players.map(p => [p.id, p]));

  dispatch('GROUP_MEMBERS_JOINED', {
    groupId,
    members: events.map(e => {
      const player = playersMap.get(e.playerId);
      if (!player) return null;

      return { role: e.role, player };
    })
  });
}

/**
 * Select all group members who left and dispatch them to our discord API,
 * so that it can notify any relevant guilds/servers.
 */
async function dispatchMembersLeft(groupId: number, playerIds: number[]) {
  const players = await findPlayers({ ids: playerIds });

  // If couldn't find any players for these ids, ignore event
  if (!players || players.length === 0) return;

  dispatch('GROUP_MEMBERS_LEFT', { groupId, players });
}

/**
 * Dispatch a competition created event to our discord bot API.
 */
function dispatchCompetitionCreated(competition: CompetitionWithParticipations) {
  // Omit participations field when sending to discord, to decrease payload size
  dispatch('COMPETITION_CREATED', {
    groupId: competition.groupId,
    competition: omit(competition, 'participations')
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

  // Omit participations field when sending to discord, to decrease payload size
  dispatch('COMPETITION_ENDED', {
    competition: omit(competition, 'participations'),
    standings,
    groupId
  });
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
  dispatchCompetitionCreated,
  dispatchCompetitionEnded,
  dispatchCompetitionEnding,
  dispatchCompetitionStarted,
  dispatchCompetitionStarting,
  dispatchHardcoreDied,
  dispatchMembersJoined,
  dispatchMembersLeft,
  dispatchMembersRolesChanged,
  dispatchNameChanged,
  dispatchPlayerFlaggedReview,
  sendMonitoringMessage,
  sendPatreonUpdateMessage
};
