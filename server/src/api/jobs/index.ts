import Queue, { JobOptions, RateLimiter } from 'bull';
import { isTesting } from '../../env';
import logger from '../services/external/logger.service';
import redisService from '../services/external/redis.service';
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

class JobHandler {
  private queues: JobQueue[];

  constructor() {
    this.queues = jobs.map((job: Job) => ({
      bull: new Queue(job.name, {
        redis: redisConfig,
        limiter: job.rateLimiter,
        defaultJobOptions: { removeOnComplete: true, removeOnFail: true, ...(job.defaultOptions || {}) }
      }),
      name: job.name,
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

    const queue = this.queues.find(q => q.name === name);

    if (!queue) throw new Error(`No job found for name ${name}`);

    if (name === 'UpdatePlayer') {
      // Check if this username is already in cooldown
      const cooldown = await redisService.getValue('cd:UpdatePlayer', data.username);
      if (cooldown) return;

      // Store the current timestamp to activate the cooldown (1h)
      await redisService.setValue('cd:UpdatePlayer', data.username, Date.now(), 3_600_000);
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
  }
}

export default new JobHandler();
