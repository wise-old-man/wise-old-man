import prometheus, { Histogram, Registry } from 'prom-client';
import { getThreadIndex } from '../../../env';

type HttpParams = 'method' | 'route' | 'status';
type JobParams = 'job' | 'status';

class MetricsService {
  private registry: Registry;
  private jobHistogram: Histogram<JobParams>;
  private httpHistogram: Histogram<HttpParams>;

  constructor() {
    this.registry = new prometheus.Registry();
    this.registry.setDefaultLabels({ app: 'wise-old-man', threadIndex: getThreadIndex() });

    prometheus.collectDefaultMetrics({ register: this.registry });

    this.setupJobHistogram();
    this.setupHttpHistogram();
  }

  private setupJobHistogram() {
    this.jobHistogram = new prometheus.Histogram({
      name: 'job_duration_seconds',
      help: 'Duration of jobs in microseconds',
      labelNames: ['job', 'status'],
      buckets: [0.1, 0.5, 1, 5, 10, 30, 60]
    });

    this.registry.registerMetric(this.jobHistogram);
  }

  private setupHttpHistogram() {
    this.httpHistogram = new prometheus.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in microseconds',
      labelNames: ['method', 'route', 'status'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10, 30]
    });

    this.registry.registerMetric(this.httpHistogram);
  }

  trackHttpRequestStarted() {
    return this.httpHistogram.startTimer();
  }

  trackHttpRequestEnded(endTimerFn: any, route: string, status: number, method: string) {
    endTimerFn({ route, status, method });
  }

  trackJobStarted() {
    return this.jobHistogram.startTimer();
  }

  trackJobEnded(endTimerFn: any, job: string, status: number) {
    endTimerFn({ job, status });
  }

  async getMetrics() {
    return this.registry.getMetricsAsJSON();
  }
}

export default new MetricsService();
