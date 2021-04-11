import { Competition } from '../../database/models';
import { EventPeriod } from '../../types';
import jobs from '../jobs';
import * as discordService from '../services/external/discord.service';
import metrics from '../services/external/metrics.service';
import * as competitionService from '../services/internal/competition.service';

async function onCompetitionCreated(competition: Competition) {
  // Schedule all competition started/starting events
  await metrics.measureReaction('ScheduleCompetitionStart', () => setupCompetitionStart(competition));

  // Schedule all competition ended/ending events
  await metrics.measureReaction('ScheduleCompetitionEnd', () => setupCompetitionEnd(competition));

  // Dispatch a competition created event to our discord bot API.
  await metrics.measureReaction('DiscordCompetitionCreated', () =>
    discordService.dispatchCompetitionCreated(competition)
  );
}

async function onCompetitionUpdated(competition: Competition, editedFields: string[]) {
  // Start date has been changed
  if (editedFields.includes('startsAt')) {
    await metrics.measureReaction('ScheduleCompetitionStart', () => setupCompetitionStart(competition));
  }

  // End date has been changed
  if (editedFields.includes('endsAt')) {
    await metrics.measureReaction('ScheduleCompetitionEnd', () => setupCompetitionEnd(competition));
  }
}

async function onCompetitionStarted(competition: Competition) {
  // Update all players when the competition starts
  await metrics.measureReaction('UpdateAllCompetitionStart', async () => {
    await competitionService.updateAll(competition, true, player => {
      // Attempt this 3 times per player, waiting 65 seconds in between
      jobs.add('UpdatePlayer', { username: player.username }, { attempts: 3, backoff: 65000 });
    });
  });

  // Dispatch a competition started event to our discord bot API.
  await metrics.measureReaction('DiscordCompetitionStarted', () =>
    discordService.dispatchCompetitionStarted(competition)
  );
}

async function onCompetitionEnded(competition: Competition) {
  // Dispatch a competition ended event to our discord bot API.
  await metrics.measureReaction('DiscordCompetitionEnded', () =>
    discordService.dispatchCompetitionEnded(competition)
  );
}

async function onCompetitionStarting(competition: Competition, period: EventPeriod) {
  // Dispatch a competition starting event to our discord bot API.
  await metrics.measureReaction('DiscordCompetitionStarting', () =>
    discordService.dispatchCompetitionStarting(competition, period)
  );
}

async function onCompetitionEnding(competition: Competition, period: EventPeriod) {
  // Dispatch a competition ending event to our discord bot API.
  await metrics.measureReaction('DiscordCompetitionEnding', () =>
    discordService.dispatchCompetitionEnding(competition, period)
  );
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
