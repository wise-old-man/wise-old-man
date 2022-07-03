import { Competition } from '../../../database/models';
import { Competition as PrismaCompetition } from '../../../prisma';
import { EventPeriodDelay } from '../../../types';
import { PlayerType } from '../../../utils';
import jobs from '../../jobs';
import * as discordService from '../../services/external/discord.service';
import metrics from '../../services/external/metrics.service';
import * as playerServices from '../players/player.services';
import * as competitionServices from '../competitions/competition.services';

async function onParticipantsJoined(_: number, playerIds: number[]) {
  // Fetch all the newly added participants
  const players = await playerServices.findPlayers({ ids: playerIds });

  // If couldn't find any players for these ids, ignore event
  if (!players || players.length === 0) return;

  // Request updates for any new players
  players.forEach(({ username, type, registeredAt }) => {
    if (type !== PlayerType.UNKNOWN || Date.now() - registeredAt.getTime() > 60_000) return;
    jobs.add('UpdatePlayer', { username, source: 'Competition:OnParticipantsJoined' });
  });
}

async function onCompetitionCreated(competition: PrismaCompetition) {
  // Dispatch a competition created event to our discord bot API.
  await metrics.measureReaction('DiscordCompetitionCreated', () =>
    discordService.dispatchCompetitionCreated(competition)
  );
}

async function onCompetitionStarted(competition: Competition) {
  // Update all players when the competition starts
  await metrics.measureReaction('UpdateAllCompetitionStart', async () => {
    await competitionServices.updateAllParticipants({ competitionId: competition.id, forcedUpdate: true });
  });

  // Dispatch a competition started event to our discord bot API.
  await metrics.measureReaction('DiscordCompetitionStarted', () =>
    discordService.dispatchCompetitionStarted(competition)
  );
}

async function onCompetitionEnded(competition: Competition) {
  const competitionDetails = await competitionServices.fetchCompetitionDetails({ id: competition.id });
  if (!competitionDetails) return;

  // Dispatch a competition ended event to our discord bot API.
  await metrics.measureReaction('DiscordCompetitionEnded', () =>
    discordService.dispatchCompetitionEnded(competitionDetails)
  );
}

async function onCompetitionStarting(competition: Competition, period: EventPeriodDelay) {
  // Dispatch a competition starting event to our discord bot API.
  await metrics.measureReaction('DiscordCompetitionStarting', () =>
    discordService.dispatchCompetitionStarting(competition, period)
  );
}

async function onCompetitionEnding(competition: Competition, period: EventPeriodDelay) {
  // Dispatch a competition ending event to our discord bot API.
  await metrics.measureReaction('DiscordCompetitionEnding', () =>
    discordService.dispatchCompetitionEnding(competition, period)
  );
}

export {
  onParticipantsJoined,
  onCompetitionCreated,
  onCompetitionStarted,
  onCompetitionEnded,
  onCompetitionStarting,
  onCompetitionEnding
};
