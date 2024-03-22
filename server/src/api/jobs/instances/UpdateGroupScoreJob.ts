import { UpdateGroupScoreJob as NewUpdateGroupScoreJob } from '../../../jobs/instances/UpdateGroupScoreJob';
import { JobType, JobDefinition } from '../job.types';

export interface UpdateGroupScorePayload {
  groupId: number;
}

class UpdateGroupScoreJob implements JobDefinition<UpdateGroupScorePayload> {
  type: JobType;

  constructor() {
    this.type = JobType.UPDATE_GROUP_SCORE;
  }

  async execute(data: UpdateGroupScorePayload) {
    // We're migrating to a new job manager, but jobs for the current one are still in-queue
    // so to prevent duplicating code, just use the old job manager to execute the job on the new one
    // Once this old job is no longer in use, we can remove this entire file.
    await new NewUpdateGroupScoreJob(data.groupId).execute();
  }
}

export default new UpdateGroupScoreJob();
