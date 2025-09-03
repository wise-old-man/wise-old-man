import { Job } from '../job.class';

export class UpdateQueueMetricsJob extends Job<unknown> {
  async execute() {
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    await this.jobManager.updateQueueMetrics();
  }
}
