import axios from 'axios';
import prisma, { Competition, Player } from '../../../prisma';
import { FlaggedPlayerReviewContext, MemberJoinedEvent, MemberRoleChangeEvent } from '../../../utils';
import {
  CompetitionDetails,
  CompetitionWithParticipations
} from '../../modules/competitions/competition.types';
import logger from '../../util/logging';
import { omit } from '../../util/objects';

export interface EventPeriodDelay {
  hours?: number;
  minutes?: number;
}

/**
 * Dispatch an event to our Discord Bot API.
 */
function dispatch(type: string, payload: unknown) {
  if (process.env.NODE_ENV === 'test') return;

  if (!process.env.DISCORD_BOT_API_URL) {
    logger.error('Missing Discord Bot API URL.');
    return;
  }

  axios.post(process.env.DISCORD_BOT_API_URL, { type, data: payload }).catch(e => {
    logger.error('Error sending discord event.', e);
  });
}

function dispatchPlayerFlaggedReview(player: Player, flagContext: FlaggedPlayerReviewContext) {
  if (!player || !flagContext) return;

  dispatch('PLAYER_FLAGGED_REVIEW', { player, flagContext });
}

async function dispatchMembersRolesChanged(events: MemberRoleChangeEvent[]) {
  if (events.length === 0) return;

  // Fetch all the affected players
  const players = await prisma.player.findMany({
    where: { id: { in: events.map(m => m.playerId) } }
  });

  if (players.length === 0) return;

  const playersMap = new Map<number, Player>(players.map(p => [p.id, p]));

  dispatch('GROUP_MEMBERS_CHANGED_ROLES', {
    groupId: events[0].groupId,
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
  const players = await prisma.player.findMany({
    where: { id: { in: playerIds } }
  });

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
  dispatchCompetitionCreated,
  dispatchCompetitionEnded,
  dispatchCompetitionEnding,
  dispatchCompetitionStarted,
  dispatchCompetitionStarting,
  dispatchMembersJoined,
  dispatchMembersLeft,
  dispatchMembersRolesChanged,
  dispatchPlayerFlaggedReview
};
