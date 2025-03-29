import { Job } from '../job.class';

export class UpdateQueueMetricsJob extends Job<unknown> {
  async execute() {
    this.jobManager.updateQueueMetrics();
  }
}
