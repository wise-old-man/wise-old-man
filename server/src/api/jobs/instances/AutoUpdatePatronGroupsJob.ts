import { AutoUpdatePatronGroupsJob as NewAutoUpdatePatronGroupsJob } from '../../../jobs/instances/AutoUpdatePatronGroupsJob';
import { JobDefinition, JobType } from '../job.types';

class AutoUpdatePatronGroupsJob implements JobDefinition<unknown> {
  type: JobType;

  constructor() {
    this.type = JobType.AUTO_UPDATE_PATRON_GROUPS;
  }

  async execute() {
    // We're migrating to a new job manager, but jobs for the current one are still in-queue
    // so to prevent duplicating code, just use the old job manager to execute the job on the new one
    // Once this old job is no longer in use, we can remove this entire file.
    await new NewAutoUpdatePatronGroupsJob().execute();
  }
}

export default new AutoUpdatePatronGroupsJob();
