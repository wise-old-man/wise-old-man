import { Details as UserAgentDetails } from 'express-useragent';
import prometheus, { Histogram, Registry } from 'prom-client';
import { getThreadIndex } from '../../../env';

type HttpParams = 'method' | 'route' | 'status' | 'userAgent';
type JobParams = 'jobName' | 'status';

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
      labelNames: ['jobName', 'status'],
      buckets: [0.1, 0.5, 1, 5, 10, 30, 60]
    });

    this.registry.registerMetric(this.jobHistogram);
  }

  private setupHttpHistogram() {
    this.httpHistogram = new prometheus.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in microseconds',
      labelNames: ['method', 'route', 'status', 'userAgent'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10, 30]
    });

    this.registry.registerMetric(this.httpHistogram);
  }

  reduceUserAgent(userAgent: string, details: UserAgentDetails) {
    if (!userAgent) return 'Other';

    const ownAgents = ['WiseOldMan Webapp', 'WiseOldMan Discord Bot', 'WiseOldMan RuneLite Plugin'];

    if (ownAgents.includes(userAgent)) return userAgent;
    if (userAgent.startsWith('RuneLite')) return 'RuneLite';

    return details?.browser || 'Other';
  }

  trackHttpRequestStarted() {
    return this.httpHistogram.startTimer();
  }

  trackHttpRequestEnded(
    endTimerFn: any,
    route: string,
    status: number,
    method: string,
    userAgent: string
  ) {
    endTimerFn({ route, status, method, userAgent });
  }

  trackJobStarted() {
    return this.jobHistogram.startTimer();
  }

  trackJobEnded(endTimerFn: any, jobName: string, status: number) {
    endTimerFn({ jobName, status });
  }

  async getMetrics() {
    return this.registry.getMetricsAsJSON();
  }
}

export default new MetricsService();
