import { JobType } from './job-type.enum';

export const CRON_CONFIG = [
  // every 1 min
  { interval: '* * * * *', type: JobType.SYNC_API_KEYS },
  { interval: '* * * * *', type: JobType.UPDATE_QUEUE_METRICS },
  // every 5 mins
  { interval: '*/5 * * * *', type: JobType.AUTO_UPDATE_PATRON_GROUPS }
];
