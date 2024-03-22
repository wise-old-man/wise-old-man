import { CalculateComputedMetricRankTablesJob as NewCalculateComputedMetricRankTablesJob } from '../../../jobs/instances/CalculateComputedMetricRankTablesJob';
import { JobDefinition, JobType } from '../job.types';

class CalculateComputedMetricRankTablesJob implements JobDefinition<unknown> {
  type: JobType;

  constructor() {
    this.type = JobType.CALCULATE_COMPUTED_METRIC_RANK_TABLES;
  }

  async execute() {
    // We're migrating to a new job manager, but jobs for the current one are still in-queue
    // so to prevent duplicating code, just use the old job manager to execute the job on the new one.
    // Once this old job is no longer in use, we can remove this entire file.
    await new NewCalculateComputedMetricRankTablesJob().execute();
  }
}

export default new CalculateComputedMetricRankTablesJob();
