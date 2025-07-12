import { Job as BullJob, JobsOptions as BullJobOptions, Queue, Worker } from 'bullmq';
import redisConfig from '../config/redis.config';
import { getThreadIndex } from '../env';
import logger from '../services/logging.service';
import prometheus from '../services/prometheus.service';
import { buildCompoundRedisKey, redisClient } from '../services/redis.service';
import { Job } from './job.class';
import { CRON_CONFIG, JOB_HANDLER_MAP, STARTUP_JOBS } from './jobs.config';
import type { JobOptions } from './types/job-options.type';
import type { JobPayloadMapper } from './types/job-payload.type';
import { JobPriority } from './types/job-priority.enum';
import { JobType } from './types/job-type.enum';

const REDIS_PREFIX = 'jobs-v2';

class JobManager {
  private queues: Queue[];
  private workers: Worker[];

  constructor() {
    this.queues = [];
    this.workers = [];
  }

  /**
   * This function is used to run a job handler directly, without adding it to the queue.
   * This should be used sparingly, as it bypasses the queue system and does not allow for retrying jobs.
   */
  async runAsync<T extends JobType, TPayload extends JobPayloadMapper[T]>(
    type: T,
    payload: TPayload extends undefined ? Record<string, never> : TPayload
  ) {
    const handlerClass = JOB_HANDLER_MAP[type];

    if (handlerClass === undefined) {
      throw new Error(`No job implementation found for "${type}".`);
    }

    // @ts-expect-error -- 🤷‍♂️
    await new handlerClass(this).execute(payload);
  }

  async add<T extends JobType, TPayload extends JobPayloadMapper[T]>(
    type: T,
    payload: TPayload extends undefined ? Record<string, never> : TPayload,
    options?: JobOptions
  ) {
    if (process.env.NODE_ENV === 'test') {
      // If in test mode, execute the job handler directly instead of adding it to the queue.
      // This is useful for testing because we want to test the job handler logic without
      // actually running the job in the queue.
      return this.runAsync(type, payload);
    }

    if (type === JobType.UPDATE_PLAYER && 'username' in payload) {
      // Some players are put into the queue too often (patron group updates),
      // and result in no valid updates due to a "banned" or "unranked" status.
      // This clogs up the queue for valid players, so we need to put them on a 24h cooldown.
      const isInCooldown = await redisClient.get(
        buildCompoundRedisKey('player-update-cooldown', payload.username)
      );

      if (isInCooldown !== null) {
        return;
      }
    }

    const matchingQueue = this.queues.find(queue => queue.name === type);

    if (matchingQueue === undefined) {
      throw new Error(`No job implementation found for "${type}".`);
    }

    const opts: BullJobOptions = {
      ...(options || {}),
      attempts: options?.attempts ?? 3,
      priority: options?.priority ?? JobPriority.MEDIUM
    };

    if (payload !== undefined) {
      opts.jobId = this.getUniqueJobId(payload);
    }

    await matchingQueue.add(type, payload, opts);

    logger.info(`[v2] Added job: ${type}`, opts.jobId, true);
  }

  getUniqueJobId(payload: unknown) {
    if (!payload) {
      return undefined;
    }

    // Temporary, this should be fixed so that every job defines its own unique ID based on the payload shape
    return JSON.stringify(payload);
  }

  async handleJob(bullJob: BullJob, jobHandler: Job<unknown>) {
    const maxAttempts = bullJob.opts.attempts ?? 1;
    const attemptTag = maxAttempts > 1 ? `(#${bullJob.attemptsMade})` : '';

    const endTimer = prometheus.trackJob();

    try {
      logger.info(`[v2] Executing job: ${bullJob.name} ${attemptTag}`, bullJob.opts.jobId, true);

      await jobHandler.execute(bullJob.data);
      endTimer({ jobName: bullJob.name, status: 1 });
      await jobHandler.onSuccess(bullJob.data);
    } catch (error) {
      endTimer({ jobName: bullJob.name, status: 0 });
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

    for (const [jobType, jobClass] of Object.entries(JOB_HANDLER_MAP)) {
      const { options } = jobClass;

      const queue = new Queue(jobType, {
        prefix: REDIS_PREFIX,
        connection: redisConfig,
        defaultJobOptions: { removeOnComplete: true, removeOnFail: true, ...(options || {}) }
      });

      this.queues.push(queue);

      if (getThreadIndex() !== 2) {
        // Currently disabling job workers on a given thread
        // to monitor the impact it has on CPU and memory usage
        const worker = new Worker(jobType, bullJob => this.handleJob(bullJob, new jobClass(this)), {
          prefix: REDIS_PREFIX,
          limiter: options?.rateLimiter,
          connection: redisConfig,
          concurrency: options.maxConcurrent ?? 1,
          autorun: true
        });

        this.workers.push(worker);
      }
    }

    // sleep for 5 seconds to allow the workers to start up
    await new Promise(resolve => setTimeout(resolve, 5_000));

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
  }

  async updateQueueMetrics() {
    for (const queue of this.queues) {
      const queueMetrics = await queue.getJobCounts();
      prometheus.updateQueueMetrics(queue.name, queueMetrics);
    }
  }
}

export type { JobManager };
export default new JobManager();
