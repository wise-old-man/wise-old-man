import { Competition } from '../../database/models';
import { EventPeriodDelay } from '../../types';
import jobs from '../jobs';
import * as discordService from '../services/external/discord.service';
import metrics from '../services/external/metrics.service';
import * as competitionService from '../services/internal/competition.service';

async function onCompetitionCreated(competition: Competition) {
  // Dispatch a competition created event to our discord bot API.
  await metrics.measureReaction('DiscordCompetitionCreated', () =>
    discordService.dispatchCompetitionCreated(competition)
  );
}

async function onCompetitionStarted(competition: Competition) {
  // Update all players when the competition starts
  await metrics.measureReaction('UpdateAllCompetitionStart', async () => {
    // Attempt this 3 times per player, waiting 65 seconds in between
    await competitionService.updateAll(competition, true, player => {
      jobs.add('UpdatePlayer', { username: player.username }, { attempts: 3, backoff: 65000 });
    });
  });

  const competitionDetails = await competitionService.getDetails(competition);
  if (!competitionDetails) return;

  // Dispatch a competition started event to our discord bot API.
  await metrics.measureReaction('DiscordCompetitionStarted', () =>
    discordService.dispatchCompetitionStarted(competitionDetails)
  );
}

async function onCompetitionEnded(competition: Competition) {
  const competitionDetails = await competitionService.getDetails(competition);
  if (!competitionDetails) return;

  // Dispatch a competition ended event to our discord bot API.
  await metrics.measureReaction('DiscordCompetitionEnded', () =>
    discordService.dispatchCompetitionEnded(competitionDetails)
  );
}

async function onCompetitionStarting(competition: Competition, period: EventPeriodDelay) {
  const competitionDetails = await competitionService.getDetails(competition);
  if (!competitionDetails) return;

  // Dispatch a competition starting event to our discord bot API.
  await metrics.measureReaction('DiscordCompetitionStarting', () =>
    discordService.dispatchCompetitionStarting(competitionDetails, period)
  );
}

async function onCompetitionEnding(competition: Competition, period: EventPeriodDelay) {
  const competitionDetails = await competitionService.getDetails(competition);
  if (!competitionDetails) return;

  // Dispatch a competition ending event to our discord bot API.
  await metrics.measureReaction('DiscordCompetitionEnding', () =>
    discordService.dispatchCompetitionEnding(competitionDetails, period)
  );
}

export {
  onCompetitionCreated,
  onCompetitionStarted,
  onCompetitionEnded,
  onCompetitionStarting,
  onCompetitionEnding
};
