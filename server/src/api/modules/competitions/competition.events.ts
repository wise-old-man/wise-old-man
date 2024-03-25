import { UpdateCompetitionScoreJob } from '../../../jobs/instances/UpdateCompetitionScoreJob';
import { UpdatePlayerJob } from '../../../jobs/instances/UpdatePlayerJob';
import experimentalJobManager from '../../../jobs/job.manager';
import { JobPriority } from '../../../jobs/job.utils';
import prisma, { Competition, Participation } from '../../../prisma';
import { CompetitionWithParticipations, PlayerType } from '../../../utils';
import * as discordService from '../../services/external/discord.service';
import { EventPeriodDelay } from '../../services/external/discord.service';
import prometheus from '../../services/external/prometheus.service';
import { fetchCompetitionDetails } from './services/FetchCompetitionDetailsService';
import { updateAllParticipants } from './services/UpdateAllParticipantsService';

async function onParticipantsJoined(participations: Pick<Participation, 'playerId' | 'competitionId'>[]) {
  // Fetch all the newly added participants
  const players = await prisma.player.findMany({
    where: { id: { in: participations.map(p => p.playerId) } }
  });

  // If couldn't find any players for these ids, ignore event
  if (!players || players.length === 0) return;

  // Request updates for any new players
  players.forEach(({ username, type, registeredAt }) => {
    if (type !== PlayerType.UNKNOWN || Date.now() - registeredAt.getTime() > 60_000) return;
    experimentalJobManager.add(new UpdatePlayerJob(username));
  });
}

async function onCompetitionCreated(competition: CompetitionWithParticipations) {
  // Dispatch a competition created event to our discord bot API.
  await prometheus.trackEffect('dispatchCompetitionCreated', async () => {
    discordService.dispatchCompetitionCreated(competition);
  });
}

async function onCompetitionStarted(competition: Competition) {
  // Update all players when the competition starts
  await prometheus.trackEffect('updateAllParticipants', async () => {
    await updateAllParticipants(competition.id, true);
  });

  // Dispatch a competition started event to our discord bot API.
  await prometheus.trackEffect('dispatchCompetitionStarted', async () => {
    discordService.dispatchCompetitionStarted(competition);
  });

  // Trigger a score update job, without any instance id, so that it doesn't get deduplicated.
  await experimentalJobManager.add(new UpdateCompetitionScoreJob(competition.id).unsetInstanceId());
}

async function onCompetitionEnded(competition: Competition) {
  const competitionDetails = await fetchCompetitionDetails(competition.id);
  if (!competitionDetails) return;

  // Dispatch a competition ended event to our discord bot API.
  await prometheus.trackEffect('dispatchCompetitionEnded', async () => {
    discordService.dispatchCompetitionEnded(competitionDetails);
  });

  // Trigger a score update job, without any instance id, so that it doesn't get deduplicated.
  await experimentalJobManager.add(new UpdateCompetitionScoreJob(competition.id).unsetInstanceId());
}

async function onCompetitionStarting(competition: Competition, period: EventPeriodDelay) {
  // Dispatch a competition starting event to our discord bot API.
  await prometheus.trackEffect('dispatchCompetitionStarting', async () => {
    discordService.dispatchCompetitionStarting(competition, period);
  });
}

async function onCompetitionEnding(competition: Competition, period: EventPeriodDelay) {
  // Dispatch a competition ending event to our discord bot API.
  await prometheus.trackEffect('dispatchCompetitionEnding', async () => {
    discordService.dispatchCompetitionEnding(competition, period);
  });

  if (period.hours === 2) {
    // 2 hours before a competition ends, update any players that are actually competing in the competition,
    // this is just a precaution in case the competition manager forgets to update people before the end.
    // With this, we can ensure that any serious competitors will at least be updated once 2 hours before it ends.
    // Note: We're doing this 2 hours before, because that'll still allow "update all" to update these players in the final hour.
    const competitionDetails = await fetchCompetitionDetails(competition.id);

    competitionDetails.participations
      .filter(p => p.progress.gained > 0) // Only update players that have gained xp
      .forEach(p => experimentalJobManager.add(new UpdatePlayerJob(p.player.username)));

    return;
  }

  if (period.hours === 12) {
    // 12 hours before a competition ends, update all participants. This solves a fairly rare occurence
    // where a player is actively competing, but has only been updated once at the start of the competition.
    // By updating them again 12h before it ends, that'll award them some gains, ensuring they get updated twice,
    // and making them an active competitor. This active competitor status is important for the code block above this,
    // where 2h before a competition ends, all active competitors get updated again.
    // Note: These should be low priority updates as to not delay regularly scheduled updates. 10-12h should be more than enough
    // for these to slowly get processed.
    const competitionDetails = await fetchCompetitionDetails(competition.id);

    competitionDetails.participations
      // Only update players that haven't been updated in the last 24h
      .filter(p => {
        return !p.player.updatedAt || Date.now() - p.player.updatedAt.getTime() > 1000 * 60 * 60 * 24;
      })
      .forEach(p => {
        experimentalJobManager.add(new UpdatePlayerJob(p.player.username).setPriority(JobPriority.LOW));
      });
  }
}

export {
  onCompetitionCreated,
  onCompetitionEnded,
  onCompetitionEnding,
  onCompetitionStarted,
  onCompetitionStarting,
  onParticipantsJoined
};
