import { Job as BullJob, Queue, QueueScheduler, Worker } from 'bullmq';
import prometheus from '../api/services/external/prometheus.service';
import logger from '../api/util/logging';
import redisConfig from '../config/redis.config';
import { getThreadIndex } from '../env';
import { CalculateComputedMetricRankTablesJob } from './instances/CalculateComputedMetricRankTablesJob';
import { CheckMissingComputedTablesJob } from './instances/CheckMissingComputedTablesJob';
import { CheckPlayerBannedJob } from './instances/CheckPlayerBannedJob';
import { CheckPlayerRankedJob } from './instances/CheckPlayerRankedJob';
import { ReviewNameChangeJob } from './instances/ReviewNameChangeJob';
import { ScheduleBannedPlayerChecksJob } from './instances/ScheduleBannedPlayerChecksJob';
import { ScheduleCompetitionEventsJob } from './instances/ScheduleCompetitionEventsJob';
import { ScheduleCreationSpamChecksJob } from './instances/ScheduleCreationSpamChecksJob';
import { ScheduleDeltaInvalidationsJob } from './instances/ScheduleDeltaInvalidationsJob';
import { ScheduleFlaggedPlayerReviewJob } from './instances/ScheduleFlaggedPlayerReviewJob';
import { ScheduleNameChangeReviewsJob } from './instances/ScheduleNameChangeReviewsJob';
import { CheckOffensiveNamesJob } from './instances/CheckOffensiveNamesJob';
import type { ExtractInstanceType, Options, ValueOf } from './job.utils';
import { Job, JobPriority } from './job.utils';

const JOBS_MAP = {
  CalculateComputedMetricRankTablesJob,
  CheckMissingComputedTablesJob,
  CheckPlayerBannedJob,
  CheckPlayerRankedJob,
  CheckOffensiveNamesJob,
  ReviewNameChangeJob,
  ScheduleBannedPlayerChecksJob,
  ScheduleCompetitionEventsJob,
  ScheduleCreationSpamChecksJob,
  ScheduleDeltaInvalidationsJob,
  ScheduleFlaggedPlayerReviewJob,
  ScheduleNameChangeReviewsJob
};

// Jobs to run when the server starts up
const STARTUP_JOBS = ['CheckMissingComputedTablesJob'] satisfies Array<keyof typeof JOBS_MAP>;

const CRON_CONFIG = [
  // every 1 min
  { interval: '* * * * *', jobName: 'ScheduleCompetitionEventsJob' },
  { interval: '* * * * *', jobName: 'ScheduleCreationSpamChecksJob' },
  // every 5 mins
  { interval: '*/5 * * * *', jobName: 'CheckOffensiveNamesJob' },
  // every hour
  { interval: '0 * * * *', jobName: 'ScheduleFlaggedPlayerReviewJob' },
  // every 6 hours
  { interval: '0 */6 * * *', jobName: 'ScheduleDeltaInvalidationsJob' },
  // everyday at 8 AM
  { interval: '0 8 * * *', jobName: 'ScheduleNameChangeReviewsJob' },
  { interval: '0 8 * * *', jobName: 'ScheduleBannedPlayerChecksJob' },
  { interval: '0 8 * * *', jobName: 'CalculateComputedMetricRankTablesJob' }
] satisfies CronJob[];

const PREFIX = 'jobs';

class JobManager {
  private queues: Queue[];
  private workers: Worker[];
  private schedulers: QueueScheduler[];

  private metricUpdateInterval: NodeJS.Timeout | undefined;

  constructor() {
    this.queues = [];
    this.workers = [];
    this.schedulers = [];

    if (process.env.NODE_ENV !== 'test') {
      this.metricUpdateInterval = setInterval(() => {
        this.updateQueueMetrics();
      }, 30_000);
    }
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

      const startupJobs = STARTUP_JOBS.filter(c => !jobsToInit.map(j => j.name).includes(c));
      jobsToInit.push(...startupJobs.map(c => JOBS_MAP[c]));
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
        concurrency: options.maxConcurrent ?? 1,
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

    for (const jobName of STARTUP_JOBS) {
      const matchingQueue = this.queues.find(q => q.name === jobName);

      if (!matchingQueue) {
        throw new Error(`No job implementation found for type "${jobName}".`);
      }

      logger.info(`Scheduling startup job`, { jobName }, true);
      await matchingQueue.add(jobName, {}, { priority: JobPriority.HIGH });
    }
  }

  async shutdown() {
    clearInterval(this.metricUpdateInterval);

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

  async updateQueueMetrics() {
    if (process.env.NODE_ENV !== 'development' && getThreadIndex() !== 0) {
      return;
    }

    for (const queue of this.queues) {
      const queueMetrics = await queue.getJobCounts();
      await prometheus.updateQueueMetrics(queue.name, queueMetrics);
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
