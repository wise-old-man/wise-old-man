import Queue from 'bull';
import { isDevelopment, isRunningInMainCPUCore, isTesting } from '../../env';
import logger from '../services/external/logger.service';
import crons from './config/crons';
import redisConfig from './config/redis';
import jobs from './instances';

export interface Job {
  name: string;
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
export interface JobRunCache {
  [key: string]: number;
}

class JobHandler {
  private queues: JobQueue[];
  private cachedRuns: JobRunCache;

  constructor() {
    this.queues = jobs.map((job: Job) => ({
      bull: new Queue(job.name, redisConfig),
      name: job.name,
      handle: job.handle,
      onFailure: job.onFailure,
      onSuccess: job.onSuccess
    }));

    this.cachedRuns = {};
  }

  /**
   * Adds a new job to the queue, to be executed ASAP.
   */
  add(name: string, data: any, options?: any) {
    if (isTesting()) return;

    const queue = this.queues.find(q => q.name === name);

    if (!queue) throw new Error(`No job found for name ${name}`);

    if (options?.cache) {
      const lastExecutionTime = this.cachedRuns[options.cache.identifier];

      // Skipping execution, the cooldown time hasn't passed yet
      if (lastExecutionTime && lastExecutionTime > Date.now() - options.cache.cooldown) return;
    }

    const priority = (options && options.priority) || JobPriority.MEDIUM;
    queue.bull.add({ ...data, created: new Date() }, { ...options, priority });
  }

  /**
   * Adds new scheduled job, to be executed at the specified date.
   */
  schedule(name: string, data: any, date: Date) {
    const msDiff = date.getTime() - Date.now();

    // Don't allow scheduling for past dates
    if (msDiff < 0) return;

    this.add(name, data, { delay: msDiff, priority: JobPriority.MEDIUM });
  }

  init() {
    // Initialize all queue processing
    this.queues.forEach(queue => {
      queue.bull.process(5, ({ data }) => queue.handle(data));

      // On Success callback
      queue.bull.on('completed', job => {
        if (queue.onSuccess) {
          queue.onSuccess(job.data);
        }

        // If this job has cache configs, update this run's "last executed" timestamp
        if (job?.opts?.cache) {
          this.cachedRuns[job.opts.cache.identifier] = Date.now();
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
    if (isRunningInMainCPUCore() || isDevelopment()) {
      // Remove any active cron jobs
      this.queues.forEach(async ({ bull }) => {
        const activeQueues = await bull.getRepeatableJobs();
        activeQueues.forEach(async job => bull.removeRepeatable({ cron: job.cron, jobId: job.id }));
      });

      // Start all cron jobs (with a 10 second delay, to wait for old jobs to be removed)
      // TODO: this can be improved to await for the removal above, instead of the hacky 10sec wait
      setTimeout(() => {
        crons.forEach(({ jobName, cronConfig }) =>
          this.add(jobName, null, { repeat: { cron: cronConfig }, priority: JobPriority.LOW })
        );
      }, 10000);
    }
  }
}

export default new JobHandler();
