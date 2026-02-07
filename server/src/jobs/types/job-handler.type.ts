import type { JobManager } from '../job-manager';
import { JobOptions } from './job-options.type';

export interface JobHandlerContext {
  jobManager: JobManager;
}

export interface JobHandler<T> {
  options?: JobOptions;
  generateUniqueJobId?(payload: T): string | undefined;
  execute(payload: T, context: JobHandlerContext): Promise<void>;
}
