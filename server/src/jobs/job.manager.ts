import { Job as BullJob, Queue, QueueScheduler, Worker } from 'bullmq';
import prometheus from '../api/services/external/prometheus.service';
import logger from '../api/util/logging';
import redisConfig from '../config/redis.config';
import { getThreadIndex } from '../env';
import { AutoUpdatePatronGroupsJob } from './instances/AutoUpdatePatronGroupsJob';
import { AutoUpdatePatronPlayersJob } from './instances/AutoUpdatePatronPlayersJob';
import { CalculateComputedMetricRankTablesJob } from './instances/CalculateComputedMetricRankTablesJob';
import { CheckMissingComputedTablesJob } from './instances/CheckMissingComputedTablesJob';
import { CheckPlayerBannedJob } from './instances/CheckPlayerBannedJob';
import { CheckPlayerRankedJob } from './instances/CheckPlayerRankedJob';
import { CheckPlayerTypeJob } from './instances/CheckPlayerTypeJob';
import { ReviewNameChangeJob } from './instances/ReviewNameChangeJob';
import { ScheduleBannedPlayerChecksJob } from './instances/ScheduleBannedPlayerChecksJob';
import { ScheduleCompetitionEventsJob } from './instances/ScheduleCompetitionEventsJob';
import { ScheduleCompetitionScoreUpdatesJob } from './instances/ScheduleCompetitionScoreUpdatesJob';
import { ScheduleDeltaInvalidationsJob } from './instances/ScheduleDeltaInvalidationsJob';
import { ScheduleFlaggedPlayerReviewJob } from './instances/ScheduleFlaggedPlayerReviewJob';
import { ScheduleGroupScoreUpdatesJob } from './instances/ScheduleGroupScoreUpdatesJob';
import { ScheduleNameChangeReviewsJob } from './instances/ScheduleNameChangeReviewsJob';
import { SyncApiKeysJob } from './instances/SyncApiKeysJob';
import { SyncPatronsJob } from './instances/SyncPatronsJob';
import { UpdateCompetitionScoreJob } from './instances/UpdateCompetitionScoreJob';
import { UpdateGroupScoreJob } from './instances/UpdateGroupScoreJob';
import { UpdatePlayerJob } from './instances/UpdatePlayerJob';
import type { ExtractInstanceType, Options, ValueOf } from './job.utils';
import { Job, JobPriority } from './job.utils';

const JOBS_MAP = {
  AutoUpdatePatronGroupsJob,
  AutoUpdatePatronPlayersJob,
  CalculateComputedMetricRankTablesJob,
  CheckMissingComputedTablesJob,
  CheckPlayerBannedJob,
  CheckPlayerRankedJob,
  CheckPlayerTypeJob,
  ReviewNameChangeJob,
  ScheduleBannedPlayerChecksJob,
  ScheduleCompetitionEventsJob,
  ScheduleCompetitionScoreUpdatesJob,
  ScheduleDeltaInvalidationsJob,
  ScheduleFlaggedPlayerReviewJob,
  ScheduleGroupScoreUpdatesJob,
  ScheduleNameChangeReviewsJob,
  SyncApiKeysJob,
  SyncPatronsJob,
  UpdateCompetitionScoreJob,
  UpdateGroupScoreJob,
  UpdatePlayerJob
};

const CRON_CONFIG = [
  // every 1 min
  { interval: '* * * * *', jobName: 'SyncApiKeysJob' },
  { interval: '* * * * *', jobName: 'SyncPatronsJob' },
  { interval: '* * * * *', jobName: 'ScheduleCompetitionEventsJob' },
  // every 5 mins
  { interval: '*/5 * * * *', jobName: 'AutoUpdatePatronGroupsJob' },
  { interval: '*/5 * * * *', jobName: 'AutoUpdatePatronPlayersJob' },
  // every hour
  { interval: '0 * * * *', jobName: 'ScheduleFlaggedPlayerReviewJob' },
  // every 6 hours
  { interval: '0 */6 * * *', jobName: 'ScheduleDeltaInvalidationsJob' },
  // everyday at 8 AM
  { interval: '0 8 * * *', jobName: 'ScheduleNameChangeReviewsJob' },
  { interval: '0 8 * * *', jobName: 'ScheduleGroupScoreUpdatesJob' },
  { interval: '0 8 * * *', jobName: 'ScheduleBannedPlayerChecksJob' },
  { interval: '0 8 * * *', jobName: 'ScheduleCompetitionScoreUpdatesJob' },
  { interval: '0 8 * * *', jobName: 'CalculateComputedMetricRankTablesJob' }
] satisfies CronJob[];

const PREFIX = 'jobs';

class JobManager {
  private queues: Queue[];
  private workers: Worker[];
  private schedulers: QueueScheduler[];

  constructor() {
    this.queues = [];
    this.workers = [];
    this.schedulers = [];
  }

  async add<T extends keyof JobPayloadMapper>(jobName: T, payload?: JobPayloadMapper[T], options?: Options) {
    if (process.env.NODE_ENV === 'test') return;

    const matchingQueue = this.queues.find(queue => queue.name === jobName);

    if (!matchingQueue) {
      throw new Error(`No job implementation found for "${jobName}".`);
    }

    const opts = {
      ...(options || {}),
      priority: options?.priority || JobPriority.MEDIUM
    };

    if (payload && !opts.skipDedupe) {
      opts.jobId = this.getUniqueJobId(payload);
    }

    await matchingQueue.add(jobName, payload, opts);

    logger.info(`Added job: ${jobName}`, opts.jobId, true);
  }

  getUniqueJobId(payload: unknown) {
    if (typeof payload === 'object' && Object.keys(payload as object).length > 0) {
      return Object.values(payload as object)[0];
    }

    return JSON.stringify(payload);
  }

  async handleJob(bullJob: BullJob, jobHandler: Job<unknown>) {
    const maxAttempts = bullJob.opts.attempts || 1;
    const attemptTag = maxAttempts > 1 ? `(#${bullJob.attemptsMade})` : '';

    try {
      logger.info(`Executing job: ${bullJob.name} ${attemptTag}`, bullJob.opts.jobId, true);

      await prometheus.trackJob(bullJob.name, async () => {
        await jobHandler.execute(bullJob.data);
      });

      await jobHandler.onSuccess(bullJob.data);
    } catch (error) {
      logger.error(`Failed job: ${bullJob.name}`, { ...bullJob.data, error }, true);

      await jobHandler.onFailure(bullJob.data, error);

      if (bullJob.attemptsMade >= maxAttempts) {
        await jobHandler.onFailedAllAttempts(bullJob.data, error);
      }

      throw error;
    }
  }

  async init() {
    if (process.env.NODE_ENV === 'test') return;

    const isMainThread = getThreadIndex() === 0 || process.env.NODE_ENV === 'development';

    const jobsToInit = [...Object.values(JOBS_MAP)];

    if (isMainThread) {
      // Only initialize queues and workers for cron jobs if we're running this on the "main" thread.
      const cronJobs = CRON_CONFIG.map(c => c.jobName).filter(c => !jobsToInit.map(j => j.name).includes(c));
      jobsToInit.push(...cronJobs.map(c => JOBS_MAP[c]));
    }

    for (const jobClass of jobsToInit) {
      const jobHandler = new jobClass(this);
      const { name, options } = jobHandler;

      const scheduler = new QueueScheduler(name, {
        prefix: PREFIX,
        connection: redisConfig
      });

      const queue = new Queue(name, {
        prefix: PREFIX,
        connection: redisConfig,
        defaultJobOptions: { removeOnComplete: true, removeOnFail: true, ...(options || {}) }
      });

      const worker = new Worker(name, bullJob => this.handleJob(bullJob, jobHandler), {
        prefix: PREFIX,
        limiter: options?.rateLimiter,
        connection: redisConfig,
        autorun: false
      });

      this.schedulers.push(scheduler);
      this.queues.push(queue);
      this.workers.push(worker);
    }

    for (const worker of this.workers) {
      worker.run();
    }

    // If running through pm2 (production), only run cronjobs on the "main" thread (index 0).
    // Otherwise, on a 4 core server, every cronjob would run 4x as often.
    if (!isMainThread) {
      return;
    }

    for (const queue of this.queues) {
      const activeJobs = await queue.getRepeatableJobs();

      for (const job of activeJobs) {
        await queue.removeRepeatableByKey(job.key);
      }
    }

    for (const { interval, jobName } of CRON_CONFIG) {
      const matchingQueue = this.queues.find(q => q.name === jobName);

      if (!matchingQueue) {
        throw new Error(`No job implementation found for type "${jobName}".`);
      }

      logger.info(`Scheduling cron job`, { jobName, interval }, true);
      await matchingQueue.add(jobName, {}, { repeat: { pattern: interval } });
    }
  }

  async shutdown() {
    for (const queue of this.queues) {
      await queue.close();
    }

    for (const worker of this.workers) {
      await worker.close();
    }

    for (const scheduler of this.schedulers) {
      await scheduler.close();
    }
  }
}

type JobPayloadType<T extends ValueOf<typeof JOBS_MAP>> = Parameters<ExtractInstanceType<T>['execute']>[0];

type JobPayloadMapper = {
  [K in keyof typeof JOBS_MAP]: JobPayloadType<(typeof JOBS_MAP)[K]>;
};

type CronJob = {
  interval: string;
  jobName: keyof typeof JOBS_MAP;
};

export type { JobManager };
export default new JobManager();
