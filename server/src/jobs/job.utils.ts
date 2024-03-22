import { JobsOptions, RateLimiterOptions } from 'bullmq';

export enum JobPriority {
  LOW = 3,
  MEDIUM = 2,
  HIGH = 1
}

interface Options extends JobsOptions {
  rateLimiter?: RateLimiterOptions;
}

export class Job {
  public jobName: string;
  public options: Options;
  public instanceId: string | undefined;

  constructor(instanceId?: unknown) {
    this.jobName = this.constructor.name;
    this.options = {};

    if (instanceId) {
      // Any job that provides an instanceId will be deduplicated in the queue
      // Ex: if two instances of UpdatePlayerJob("psikoi") were to be added,
      // the second one would be discarded while the first one is still in queue or processing.
      this.instanceId = String(instanceId);
    }
  }

  async execute(): Promise<void> {}
  async onSuccess(): Promise<void> {}
  async onFailure(_error: Error): Promise<void> {}
  async onFailedAllAttempts(_error: Error): Promise<void> {}

  public setDelay(milliseconds: number): Job {
    this.options.delay = milliseconds;
    return this;
  }

  public setPriority(priority: JobPriority): Job {
    this.options.priority = priority;
    return this;
  }

  public unsetInstanceId() {
    this.instanceId = undefined;
    return this;
  }
}
