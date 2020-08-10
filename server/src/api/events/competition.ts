import { EventPeriod } from 'types';
import { Competition } from 'database/models';
import * as discordService from 'api/services/external/discord';
import jobs from '../jobs';

function onCompetitionCreated(competition: Competition) {
  // Schedule all competition started/starting events
  setupCompetitionStart(competition);

  // Schedule all competition ended/ending events
  setupCompetitionEnd(competition);

  // Dispatch a competition created event to our discord bot API.
  discordService.dispatchCompetitionCreated(competition);
}

function onCompetitionUpdated(competition: Competition, editedFields: string[]) {
  // Start date has been changed
  if (editedFields.includes('startsAt')) {
    setupCompetitionStart(competition);
  }

  // End date has been changed
  if (editedFields.includes('endsAt')) {
    setupCompetitionEnd(competition);
  }
}

function onCompetitionStarted(competition: Competition) {
  // Dispatch a competition started event to our discord bot API.
  discordService.dispatchCompetitionStarted(competition);
}

function onCompetitionEnded(competition: Competition) {
  // Dispatch a competition ended event to our discord bot API.
  discordService.dispatchCompetitionEnded(competition);
}

function onCompetitionStarting(competition: Competition, period: EventPeriod) {
  // Dispatch a competition starting event to our discord bot API.
  discordService.dispatchCompetitionStarting(competition, period);
}

function onCompetitionEnding(competition: Competition, period: EventPeriod) {
  // Dispatch a competition ending event to our discord bot API.
  discordService.dispatchCompetitionEnding(competition, period);
}

function setupCompetitionStart(competition: Competition) {
  if (!competition) return;

  const { id, startsAt } = competition;

  // Time intervals to send "starting in" notifications at (in minutes)
  // Current: 24h, 6h, 1h, 5mins
  const startingIntervals = [1440, 360, 60, 5];

  // On competition started
  jobs.schedule('CompetitionStarted', { competitionId: id }, startsAt);

  // On competition starting
  startingIntervals.forEach(minutes => {
    const date = new Date(startsAt.getTime() - minutes * 60 * 1000);
    jobs.schedule('CompetitionStarting', { competitionId: id, minutes }, date);
  });
}

function setupCompetitionEnd(competition: Competition) {
  if (!competition) return;

  const { id, endsAt } = competition;

  // Time intervals to send "ending in" notifications at (in minutes)
  // Current: 24h, 6h, 1h, 5mins
  const endingIntervals = [1440, 360, 60, 5];

  // On competition ended
  jobs.schedule('CompetitionEnded', { competitionId: id }, endsAt);

  // On competition ending
  endingIntervals.forEach(minutes => {
    const date = new Date(endsAt.getTime() - minutes * 60 * 1000);
    jobs.schedule('CompetitionStarting', { competitionId: id, minutes }, date);
  });
}

export {
  onCompetitionCreated,
  onCompetitionUpdated,
  onCompetitionStarted,
  onCompetitionEnded,
  onCompetitionStarting,
  onCompetitionEnding
};
