import { Job } from '../jobs.util';

export class UpdateQueueMetricsJob extends Job<unknown> {
  async execute() {
    this.jobManager.updateQueueMetrics();
  }
}
