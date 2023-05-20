import { Competition, Participation } from '../../../prisma';
import { CompetitionWithParticipations, PlayerType } from '../../../utils';
import { jobManager, JobType } from '../../jobs';
import * as discordService from '../../services/external/discord.service';
import metrics from '../../services/external/metrics.service';
import * as playerServices from '../players/player.services';
import * as competitionServices from '../competitions/competition.services';
import { EventPeriodDelay } from '../../services/external/discord.service';

async function onParticipantsJoined(participations: Participation[]) {
  const playerIds = participations.map(p => p.playerId);

  // Fetch all the newly added participants
  const players = await playerServices.findPlayers({ ids: playerIds });

  // If couldn't find any players for these ids, ignore event
  if (!players || players.length === 0) return;

  // Request updates for any new players
  players.forEach(({ username, type, registeredAt }) => {
    if (type !== PlayerType.UNKNOWN || Date.now() - registeredAt.getTime() > 60_000) return;

    jobManager.add({
      type: JobType.UPDATE_PLAYER,
      payload: { username }
    });
  });
}

async function onCompetitionCreated(competition: CompetitionWithParticipations) {
  // Dispatch a competition created event to our discord bot API.
  await metrics.trackEffect(discordService.dispatchCompetitionCreated, competition);
}

async function onCompetitionStarted(competition: Competition) {
  // Update all players when the competition starts
  await metrics.trackEffect(competitionServices.updateAllParticipants, {
    competitionId: competition.id,
    forcedUpdate: true
  });

  // Dispatch a competition started event to our discord bot API.
  await metrics.trackEffect(discordService.dispatchCompetitionStarted, competition);

  jobManager.add({
    type: JobType.UPDATE_COMPETITION_SCORE,
    payload: { competitionId: competition.id }
  });
}

async function onCompetitionEnded(competition: Competition) {
  const competitionDetails = await competitionServices.fetchCompetitionDetails({ id: competition.id });
  if (!competitionDetails) return;

  // Dispatch a competition ended event to our discord bot API.
  await metrics.trackEffect(discordService.dispatchCompetitionEnded, competitionDetails);

  jobManager.add({
    type: JobType.UPDATE_COMPETITION_SCORE,
    payload: { competitionId: competition.id }
  });
}

async function onCompetitionStarting(competition: Competition, period: EventPeriodDelay) {
  // Dispatch a competition starting event to our discord bot API.
  await metrics.trackEffect(discordService.dispatchCompetitionStarting, competition, period);
}

async function onCompetitionEnding(competition: Competition, period: EventPeriodDelay) {
  // Dispatch a competition ending event to our discord bot API.
  await metrics.trackEffect(discordService.dispatchCompetitionEnding, competition, period);
}

export {
  onParticipantsJoined,
  onCompetitionCreated,
  onCompetitionStarted,
  onCompetitionEnded,
  onCompetitionStarting,
  onCompetitionEnding
};
