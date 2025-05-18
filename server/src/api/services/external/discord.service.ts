import axios from 'axios';
import { Competition } from '../../../prisma';
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
  dispatchCompetitionStarting
};
