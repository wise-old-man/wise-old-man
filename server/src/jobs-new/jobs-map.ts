import { JobType } from './job-type.enum';
import { AutoUpdatePatronGroupsJob } from './jobs/auto-update-patron-groups.job';
import { SyncApiKeysJob } from './jobs/sync-api-keys.job';
import { UpdatePlayerJob } from './jobs/update-player.job';
import { UpdateQueueMetricsJob } from './jobs/update-queue-metrics.job';

export const JOBS_MAP = {
  [JobType.AUTO_UPDATE_PATRON_GROUPS]: AutoUpdatePatronGroupsJob,
  [JobType.SYNC_API_KEYS]: SyncApiKeysJob,
  [JobType.UPDATE_PLAYER]: UpdatePlayerJob,
  [JobType.UPDATE_QUEUE_METRICS]: UpdateQueueMetricsJob
};
