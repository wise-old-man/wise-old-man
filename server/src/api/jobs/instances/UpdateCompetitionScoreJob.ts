import { UpdateCompetitionScoreJob as NewUpdateCompetitionScoreJob } from '../../../jobs/instances/UpdateCompetitionScoreJob';
import { JobType, JobDefinition } from '../job.types';

export interface UpdateCompetitionScorePayload {
  competitionId: number;
}

class UpdateCompetitionScoreJob implements JobDefinition<UpdateCompetitionScorePayload> {
  type: JobType;

  constructor() {
    this.type = JobType.UPDATE_COMPETITION_SCORE;
  }

  async execute(data: UpdateCompetitionScorePayload) {
    // We're migrating to a new job manager, but jobs for the current one are still in-queue
    // so to prevent duplicating code, just use the old job manager to execute the job on the new one
    // Once this old job is no longer in use, we can remove this entire file.
    await new NewUpdateCompetitionScoreJob(data.competitionId).execute();
  }
}

export default new UpdateCompetitionScoreJob();
