import Queue, { JobOptions, RateLimiter } from 'bull';
import { getThreadIndex, isTesting } from '../../env';
import logger from '../services/external/logger.service';
import redisService from '../services/external/redis.service';
import crons from './config/crons';
import redisConfig from './config/redis';
import jobs from './instances';

export interface Job {
  name: string;
  rateLimiter?: RateLimiter;
  defaultOptions?: JobOptions;
  handle(data: any): void;
  onSuccess?(data: any): void;
  onFailure?(data: any, error: Error): void;
}

export enum JobPriority {
  HIGH = 1,
  MEDIUM = 2,
  LOW = 3
}

export interface JobQueue extends Job {
  bull: any;
}

function wrapJobName(name) {
  return `league_${name}`;
}

class JobHandler {
  private queues: JobQueue[];

  constructor() {
    this.queues = jobs.map((job: Job) => ({
      bull: new Queue(wrapJobName(job.name), {
        redis: redisConfig,
        limiter: job.rateLimiter,
        defaultJobOptions: { removeOnComplete: true, removeOnFail: true, ...(job.defaultOptions || {}) }
      }),
      name: wrapJobName(job.name),
      handle: job.handle,
      onFailure: job.onFailure,
      onSuccess: job.onSuccess
    }));
  }

  /**
   * Adds a new job to the queue, to be executed ASAP.
   */
  async add(name: string, data: any, options?: any) {
    if (isTesting()) return;

    const queue = this.queues.find(q => q.name === wrapJobName(name));

    if (!queue) throw new Error(`No job found for name ${name}`);

    if (name === 'UpdatePlayer') {
      // Check if this username is already in cooldown
      const cooldown = await redisService.getValue('cd:league_UpdatePlayer', data.username);
      if (cooldown) return;

      // Store the current timestamp to activate the cooldown (1h)
      await redisService.setValue('cd:league_UpdatePlayer', data.username, Date.now(), 3_600_000);
    }

    const priority = (options && options.priority) || JobPriority.MEDIUM;
    queue.bull.add({ ...data, created: new Date() }, { ...options, priority });
  }

  init() {
    // Initialize all queue processing
    this.queues.forEach(queue => {
      queue.bull.process(({ data }) => queue.handle(data));

      // On Success callback
      queue.bull.on('completed', job => {
        if (queue.onSuccess) {
          queue.onSuccess(job.data);
        }
      });

      // On Failure callback
      queue.bull.on('failed', (job, error) => {
        if (queue.onFailure) {
          queue.onFailure(job.data, error);
        }

        logger.error(`Failed job (${job.queue.name})`, {
          data: job.data,
          error: { ...error, message: error.message || '' }
        });
      });
    });

    // If running through pm2 (production), only run cronjobs on the first CPU core.
    // Otherwise, on a 4 core server, every cronjob would run 4x as often.
    if (getThreadIndex() === 0) {
      // Remove any active cron jobs
      this.queues.forEach(async ({ bull }) => {
        const activeQueues = await bull.getRepeatableJobs();
        activeQueues.forEach(async job => bull.removeRepeatable({ cron: job.cron, jobId: job.id }));
      });

      // Start all cron jobs (with a 10 second delay, to wait for old jobs to be removed)
      // TODO: this can be improved to await for the removal above, instead of the hacky 10sec wait
      setTimeout(() => {
        crons.forEach(({ jobName, cronConfig }) =>
          this.add(jobName, null, {
            repeat: { cron: cronConfig },
            priority: JobPriority.LOW
          })
        );
      }, 10000);
    }
  }
}

export default new JobHandler();
