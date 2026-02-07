import { JobHandler } from '../types/job-handler.type';

export const UpdateQueueMetricsJobHandler: JobHandler<unknown> = {
  async execute(_payload, context) {
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    await context.jobManager.updateQueueMetrics();
  }
};
