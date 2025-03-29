import { Job as BullJob, Queue, QueueScheduler, Worker } from 'bullmq';
import prometheus from '../api/services/external/prometheus.service';
import logger from '../api/util/logging';
import redisConfig from '../config/redis.config';
import { getThreadIndex } from '../env';
import { ExtractInstanceType, Job, Options, ValueOf } from './jobs.util';
import { CRON_CONFIG } from './cron.config';
import { JOBS_MAP } from './jobs-map';
import { JobType } from './job-type.enum';
import { STARTUP_JOBS } from './startup.config';
import { JobPriority } from './job-priority.enum';

const REDIS_PREFIX = 'jobs-v2';

class JobManager {
  private queues: Queue[];
  private workers: Worker[];
  private schedulers: QueueScheduler[];

  constructor() {
    this.queues = [];
    this.workers = [];
    this.schedulers = [];
  }

  async add<T extends JobType, TPayload extends JobPayloadMapper[T]>(
    type: T,
    payload: TPayload extends undefined ? Record<string, never> : TPayload,
    options?: Options
  ) {
    if (process.env.NODE_ENV === 'test') return;

    const matchingQueue = this.queues.find(queue => queue.name === type);

    if (!matchingQueue) {
      throw new Error(`No job implementation found for "${type}".`);
    }

    const opts = {
      ...(options || {}),
      priority: options?.priority || JobPriority.MEDIUM
    };

    if (payload && !opts.skipDedupe) {
      opts.jobId = this.getUniqueJobId(payload);
    }

    await matchingQueue.add(type, payload, opts);

    logger.info(`[v2] Added job: ${type}`, opts.jobId, true);
  }

  getUniqueJobId(payload: unknown) {
    if (typeof payload === 'object' && Object.keys(payload as object).length > 0) {
      return Object.values(payload as object)[0];
    }

    return JSON.stringify(payload);
  }

  async handleJob(bullJob: BullJob, jobHandler: Job<unknown>) {
    const maxAttempts = bullJob.opts.attempts ?? 1;
    const attemptTag = maxAttempts > 1 ? `(#${bullJob.attemptsMade})` : '';

    try {
      logger.info(`[v2] Executing job: ${bullJob.name} ${attemptTag}`, bullJob.opts.jobId, true);

      await prometheus.trackJob(bullJob.name, async () => {
        await jobHandler.execute(bullJob.data);
      });

      await jobHandler.onSuccess(bullJob.data);
    } catch (error) {
      logger.error(`[v2] Failed job: ${bullJob.name}`, { ...bullJob.data, error }, true);

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

    const queuesToInit = { ...JOBS_MAP };

    if (isMainThread) {
      // Only initialize queues and workers for cron/startup jobs if we're running this on the "min" thread.
      Object.keys({ ...CRON_CONFIG, ...STARTUP_JOBS }).forEach(jobType => {
        if (queuesToInit[jobType] === undefined) {
          queuesToInit[jobType] = JOBS_MAP[jobType];
        }
      });
    }

    for (const [jobType, jobClass] of Object.entries(JOBS_MAP)) {
      const jobHandler = new jobClass(this);
      const { options } = jobHandler;

      const scheduler = new QueueScheduler(jobType, {
        prefix: REDIS_PREFIX,
        connection: redisConfig
      });

      const queue = new Queue(jobType, {
        prefix: REDIS_PREFIX,
        connection: redisConfig,
        defaultJobOptions: { removeOnComplete: true, removeOnFail: true, ...(options || {}) }
      });

      const worker = new Worker(jobType, bullJob => this.handleJob(bullJob, jobHandler), {
        prefix: REDIS_PREFIX,
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

    for (const { interval, type } of CRON_CONFIG) {
      const matchingQueue = this.queues.find(q => q.name === type);

      if (!matchingQueue) {
        throw new Error(`No job implementation found for type "${type}".`);
      }

      logger.info(`[v2] Scheduling cron job`, { type, interval }, true);
      await matchingQueue.add(type, {}, { repeat: { pattern: interval } });
    }

    for (const jobName of STARTUP_JOBS) {
      const matchingQueue = this.queues.find(q => q.name === jobName);

      if (!matchingQueue) {
        throw new Error(`No job implementation found for type "${jobName}".`);
      }

      logger.info(`[v2] Scheduling startup job`, { jobName }, true);
      await matchingQueue.add(jobName, {}, { priority: JobPriority.HIGH });
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

export type { JobManager };
export default new JobManager();
