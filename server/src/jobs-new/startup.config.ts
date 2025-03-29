import { JobType } from './job-type.enum';

// Jobs to run when the server starts
export const STARTUP_JOBS = [JobType.SYNC_API_KEYS];
