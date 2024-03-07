import { Job as BullJob, Queue, QueueScheduler, Worker } from 'bullmq';
import metricsService from '../api/services/external/metrics.service';
import logger from '../api/util/logging';
import redisConfig from '../config/redis.config';
import { getThreadIndex } from '../env';
import { CheckPlayerBannedJob } from './instances/CheckPlayerBannedJob';
import { ScheduleCompetitionEventsJob } from './instances/ScheduleCompetitionEventsJob';
import { SyncApiKeysJob } from './instances/SyncApiKeysJob';
import { SyncPatronsJob } from './instances/SyncPatronsJob';
import { Job, JobPriority } from './job.utils';

const JOBS: (typeof Job)[] = [
  SyncApiKeysJob,
  SyncPatronsJob,
  ScheduleCompetitionEventsJob,
  CheckPlayerBannedJob
];

const CRON_CONFIG = [
  {
    interval: '* * * * *', // every 1 min
    job: SyncApiKeysJob
  },
  {
    interval: '* * * * *', // every 1 min
    job: ScheduleCompetitionEventsJob
  },
  {
    interval: '* * * * *', // every 1 min
    job: SyncPatronsJob
  }
];

class JobManager {
  private queues: Queue[];
  private workers: Worker[];
  private schedulers: QueueScheduler[];

  constructor() {
    this.queues = [];
    this.workers = [];
    this.schedulers = [];
  }

  async add(job: Job) {
    if (process.env.NODE_ENV === 'test') return;

    const matchingQueue = this.queues.find(queue => queue.name === job.jobName);

    if (!matchingQueue) {
      throw new Error(`No job implementation found for "${job.jobName}".`);
    }

    const opts = {
      ...job.options,
      priority: job.options.priority || JobPriority.MEDIUM
    };

    if (job.instanceId) {
      opts.jobId = job.instanceId;
    }

    await matchingQueue.add(job.jobName, job, opts);

    logger.info(`Added job: ${job.jobName}`, job.instanceId, true);
  }

  private async processJob(bullJob: BullJob, jobType: typeof Job) {
    const instance = new jobType();
    Object.assign(instance, bullJob.data);

    const maxAttempts = bullJob.opts.attempts || 1;
    const attemptTag = maxAttempts > 1 ? `(#${bullJob.attemptsMade})` : '';

    try {
      logger.info(`Executing job: ${bullJob.name} ${attemptTag}`, instance.instanceId, true);

      await metricsService.trackJob(bullJob.name, async () => {
        await instance.execute();
      });

      instance.onSuccess();
    } catch (error) {
      logger.error(`Failed job: ${bullJob.name}`, { ...bullJob.data, error }, true);

      if (bullJob.attemptsMade >= maxAttempts) {
        instance.onFailedAllAttempts(error);
      }

      instance.onFailure(error);
    }
  }

  async init() {
    for (const jobType of JOBS) {
      const { jobName, options } = new jobType();

      const scheduler = new QueueScheduler(jobName, {
        prefix: 'experimental',
        connection: redisConfig
      });

      const queue = new Queue(jobName, {
        prefix: 'experimental',
        connection: redisConfig,
        defaultJobOptions: { removeOnComplete: true, removeOnFail: true, ...(options || {}) }
      });

      const worker = new Worker(jobName, bullJob => this.processJob(bullJob, jobType), {
        prefix: 'experimental',
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

    // If running through pm2 (production), only run cronjobs on the first CPU core.
    // Otherwise, on a 4 core server, every cronjob would run 4x as often.
    if (getThreadIndex() !== 0 && process.env.NODE_ENV !== 'development') {
      return;
    }

    for (const queue of this.queues) {
      const activeJobs = await queue.getRepeatableJobs();

      for (const job of activeJobs) {
        await queue.removeRepeatableByKey(job.key);
      }
    }

    for (const cron of CRON_CONFIG) {
      const jobName = cron.job.name;

      const matchingQueue = this.queues.find(q => q.name === jobName);

      if (!matchingQueue) {
        throw new Error(`No job implementation found for type "${jobName}".`);
      }

      logger.info('Scheduling cron job', { jobName, interval: cron.interval }, true);
      await matchingQueue.add(jobName, {}, { repeat: { pattern: cron.interval } });
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

export default new JobManager();
