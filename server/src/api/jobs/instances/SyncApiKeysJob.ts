import { SyncApiKeysJob as NewSyncApiKeysJob } from '../../../jobs/instances/SyncApiKeysJob';
import { JobType, JobDefinition } from '../job.types';

class SyncApiKeysJob implements JobDefinition<unknown> {
  type: JobType;

  constructor() {
    this.type = JobType.SYNC_API_KEYS;
  }

  async execute() {
    // We're migrating to a new job manager, but jobs for the current one are still in-queue
    // so to prevent duplicating code, just use the old job manager to execute the job on the new one
    // Once this old job is no longer in use, we can remove this entire file.
    await new NewSyncApiKeysJob().execute();
  }
}

export default new SyncApiKeysJob();
