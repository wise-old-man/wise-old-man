import { getThreadIndex } from '../../env';
import { Job } from '../job.class';

export class UpdateQueueMetricsJob extends Job<unknown> {
  async execute() {
    if (
      process.env.NODE_ENV === 'test' ||
      (process.env.NODE_ENV === 'production' && getThreadIndex() !== 0)
    ) {
      return;
    }

    await this.jobManager.updateQueueMetrics();
  }
}
