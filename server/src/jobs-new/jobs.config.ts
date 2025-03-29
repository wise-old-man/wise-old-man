import { JobType } from './types/job-type.enum';
import { AutoUpdatePatronGroupsJob } from './jobs/auto-update-patron-groups.job';
import { SyncApiKeysJob } from './jobs/sync-api-keys.job';
import { UpdatePlayerJob } from './jobs/update-player.job';
import { UpdateQueueMetricsJob } from './jobs/update-queue-metrics.job';
import { SyncPlayerCompetitionParticipationsJob } from './jobs/sync-player-competition-participations.job';

export const JOB_HANDLER_MAP = {
  [JobType.AUTO_UPDATE_PATRON_GROUPS]: AutoUpdatePatronGroupsJob,
  [JobType.SYNC_API_KEYS]: SyncApiKeysJob,
  [JobType.SYNC_PLAYER_COMPETITION_PARTICIPATIONS]: SyncPlayerCompetitionParticipationsJob,
  [JobType.UPDATE_PLAYER]: UpdatePlayerJob,
  [JobType.UPDATE_QUEUE_METRICS]: UpdateQueueMetricsJob
};

export const CRON_CONFIG = [
  // every 1 min
  { interval: '* * * * *', type: JobType.SYNC_API_KEYS },
  { interval: '* * * * *', type: JobType.UPDATE_QUEUE_METRICS },
  // every 5 mins
  { interval: '*/5 * * * *', type: JobType.AUTO_UPDATE_PATRON_GROUPS }
];

// Jobs to run when the server starts
export const STARTUP_JOBS = [JobType.SYNC_API_KEYS, JobType.UPDATE_QUEUE_METRICS] as const;
