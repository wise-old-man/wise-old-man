import { Job as BullJob, Queue, QueueScheduler, Worker } from 'bullmq';
import metricsService from '../api/services/external/metrics.service';
import logger from '../api/util/logging';
import redisConfig from '../config/redis.config';
import { getThreadIndex } from '../env';
import { AutoUpdatePatronGroupsJob } from './instances/AutoUpdatePatronGroupsJob';
import { AutoUpdatePatronPlayersJob } from './instances/AutoUpdatePatronPlayersJob';
import { CheckPlayerBannedJob } from './instances/CheckPlayerBannedJob';
import { ScheduleCompetitionEventsJob } from './instances/ScheduleCompetitionEventsJob';
import { ScheduleDeltaInvalidationsJob } from './instances/ScheduleDeltaInvalidationsJob';
import { ScheduleFlaggedPlayerReviewJob } from './instances/ScheduleFlaggedPlayerReviewJob';
import { SyncApiKeysJob } from './instances/SyncApiKeysJob';
import { SyncPatronsJob } from './instances/SyncPatronsJob';
import { ScheduleGroupScoreUpdatesJob } from './instances/ScheduleGroupScoreUpdatesJob';
import { ScheduleCompetitionScoreUpdatesJob } from './instances/ScheduleCompetitionScoreUpdatesJob';
import { UpdateCompetitionScoreJob } from './instances/UpdateCompetitionScoreJob';
import { UpdateGroupScoreJob } from './instances/UpdateGroupScoreJob';
import { Job, JobPriority } from './job.utils';

const DISPATCHABLE_JOBS = [
  CheckPlayerBannedJob,
  SyncApiKeysJob,
  SyncPatronsJob,
  UpdateGroupScoreJob,
  UpdateCompetitionScoreJob
] as const;

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
  },
  {
    interval: '*/5 * * * *', // every 5 mins
    job: AutoUpdatePatronPlayersJob
  },
  {
    interval: '*/5 * * * *', // every 5 mins
    job: AutoUpdatePatronGroupsJob
  },
  {
    interval: '0 * * * *', // every hour
    job: ScheduleFlaggedPlayerReviewJob
  },
  {
    interval: '0 */6 * * *', // every 6 hours
    job: ScheduleDeltaInvalidationsJob
  },
  {
    interval: '0 8 * * *', // everyday at 8AM
    job: ScheduleCompetitionScoreUpdatesJob
  },
  {
    interval: '0 8 * * *', // everyday at 8AM
    job: ScheduleGroupScoreUpdatesJob
  }
] as const;

class JobManager {
  private queues: Queue[];
  private workers: Worker[];
  private schedulers: QueueScheduler[];

  constructor() {
    this.queues = [];
    this.workers = [];
    this.schedulers = [];
  }

  async add(job: InstanceType<(typeof DISPATCHABLE_JOBS)[number]>) {
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
    const isMainThread = getThreadIndex() === 0 || process.env.NODE_ENV === 'development';

    const jobsToInit = [...DISPATCHABLE_JOBS];

    if (isMainThread) {
      // Only initialize queues and workers for cron jobs if we're running this on the "main" thread.
      jobsToInit.push(
        ...CRON_CONFIG.map(c => c.job).filter(c => !jobsToInit.map(j => j.name).includes(c.name))
      );
    }

    for (const jobType of jobsToInit) {
      const { jobName, options } = new (jobType as typeof Job)();

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
