import { AutoUpdatePatronGroupsJob } from './handlers/auto-update-patron-groups.job';
import { AutoUpdatePatronPlayersJob } from './handlers/auto-update-patron-players.job';
import { SyncApiKeysJob } from './handlers/sync-api-keys.job';
import { SyncPlayerAchievementsJob } from './handlers/sync-player-achievements.job';
import { SyncPlayerCompetitionParticipationsJob } from './handlers/sync-player-competition-participations.job';
import { SyncPlayerDeltasJob } from './handlers/sync-player-deltas.job';
import { UpdatePlayerJob } from './handlers/update-player.job';
import { UpdateQueueMetricsJob } from './handlers/update-queue-metrics.job';
import { JobType } from './types/job-type.enum';

export const JOB_HANDLER_MAP = {
  [JobType.AUTO_UPDATE_PATRON_GROUPS]: AutoUpdatePatronGroupsJob,
  [JobType.AUTO_UPDATE_PATRON_PLAYERS]: AutoUpdatePatronPlayersJob,
  [JobType.SYNC_API_KEYS]: SyncApiKeysJob,
  [JobType.SYNC_PLAYER_ACHIEVEMENTS]: SyncPlayerAchievementsJob,
  [JobType.SYNC_PLAYER_DELTAS]: SyncPlayerDeltasJob,
  [JobType.SYNC_PLAYER_COMPETITION_PARTICIPATIONS]: SyncPlayerCompetitionParticipationsJob,
  [JobType.UPDATE_PLAYER]: UpdatePlayerJob,
  [JobType.UPDATE_QUEUE_METRICS]: UpdateQueueMetricsJob
};

export const CRON_CONFIG = [
  // every 1 min
  { interval: '* * * * *', type: JobType.SYNC_API_KEYS },
  { interval: '* * * * *', type: JobType.UPDATE_QUEUE_METRICS },
  // every 5 mins
  { interval: '*/5 * * * *', type: JobType.AUTO_UPDATE_PATRON_GROUPS },
  { interval: '*/5 * * * *', type: JobType.AUTO_UPDATE_PATRON_PLAYERS }
];

// Jobs to run when the server starts
export const STARTUP_JOBS = [JobType.SYNC_API_KEYS, JobType.UPDATE_QUEUE_METRICS] as const;
