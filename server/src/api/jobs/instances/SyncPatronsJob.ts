import { SyncPatronsJob as NewSyncPatronsJob } from '../../../jobs/instances/SyncPatronsJob';
import { JobDefinition, JobType } from '../job.types';

class SyncPatronsJob implements JobDefinition<unknown> {
  type: JobType;

  constructor() {
    this.type = JobType.SYNC_PATRONS;
  }

  async execute() {
    // We're migrating to a new job manager, but jobs for the current one are still in-queue
    // so to prevent duplicating code, just use the old job manager to execute the job on the new one.
    // Once this old job is no longer in use, we can remove this entire file.
    await new NewSyncPatronsJob().execute();
  }
}

export default new SyncPatronsJob();
