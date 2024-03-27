import { Job as BullJob, Queue, QueueScheduler, Worker } from 'bullmq';
import prometheus from '../api/services/external/prometheus.service';
import logger from '../api/util/logging';
import redisConfig from '../config/redis.config';
import { getThreadIndex } from '../env';
import { CheckPlayerBannedJob } from './instances/CheckPlayerBannedJobs';
import { SyncPatronsJob } from './instances/SyncPatronsJob';
import { UpdateGroupScoreJob } from './instances/UpdateGroupScoreJob';
import type { ExtractInstanceType, Options, ValueOf } from './job.utils';
import { Job, JobPriority } from './job.utils';

const JOBS_MAP = {
  UpdateGroupScoreJob,
  CheckPlayerBannedJob,
  SyncPatronsJob
};

const CRON_CONFIG = {
  SyncPatronsJob: '* * * * *' // every 1 min
};

const PREFIX = 'experimental_v2';

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
      ...options,
      priority: options?.priority || JobPriority.MEDIUM
    };

    if (payload && !opts.skipDedupe) {
      opts.jobId = `${jobName}_${JSON.stringify(payload)}`;
    }

    await matchingQueue.add(jobName, payload, opts);

    logger.info(`Added job: ${jobName}`, opts.jobId, true);
  }

  async handleJob(bullJob: BullJob, jobHandler: Job<unknown>) {
    const maxAttempts = bullJob.opts.attempts || 1;
    const attemptTag = maxAttempts > 1 ? `(#${bullJob.attemptsMade})` : '';

    try {
      logger.info(`Executing job: ${bullJob.name} ${attemptTag}`, bullJob.opts.jobId, true);

      await prometheus.trackJob(bullJob.name, PREFIX, async () => {
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
      const cronJobs = Object.keys(CRON_CONFIG).filter(c => !jobsToInit.map(j => j.name).includes(c));
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

    for (const [jobName, interval] of Object.entries(CRON_CONFIG)) {
      const matchingQueue = this.queues.find(q => q.name === jobName);

      if (!matchingQueue) {
        throw new Error(`No job implementation found for type "${jobName}".`);
      }

      logger.info('Scheduling cron job', { jobName, interval }, true);
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

export type { JobManager };
export default new JobManager();
