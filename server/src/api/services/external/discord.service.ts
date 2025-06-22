import axios from 'axios';
import { Competition } from '../../../prisma';
import logger from '../../util/logging';

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
function dispatchCompetitionStarted(competition: Competition) {
  const { groupId } = competition;

  // Only dispatch this event for group competitions
  if (!groupId) return;

  dispatch('COMPETITION_STARTED', { groupId, competition });
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

export { dispatchCompetitionEnding, dispatchCompetitionStarted, dispatchCompetitionStarting };
