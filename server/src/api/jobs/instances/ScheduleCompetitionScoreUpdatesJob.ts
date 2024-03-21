import { ScheduleCompetitionScoreUpdatesJob as NewScheduleCompetitionScoreUpdatesJob } from '../../../jobs/instances/ScheduleCompetitionScoreUpdatesJob';
import { JobType, JobDefinition } from '../job.types';

class ScheduleCompetitionScoreUpdatesJob implements JobDefinition<unknown> {
  type: JobType;

  constructor() {
    this.type = JobType.SCHEDULE_COMPETITION_SCORE_UPDATES;
  }

  async execute() {
    // We're migrating to a new job manager, but jobs for the current one are still in-queue
    // so to prevent duplicating code, just use the old job manager to execute the job on the new one
    // Once this old job is no longer in use, we can remove this entire file.
    await new NewScheduleCompetitionScoreUpdatesJob().execute();
  }
}

export default new ScheduleCompetitionScoreUpdatesJob();
