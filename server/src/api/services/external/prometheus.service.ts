import { Details as UserAgentDetails } from 'express-useragent';
import prometheus, { Counter, Histogram, Registry } from 'prom-client';
import { getThreadIndex } from '../../../env';
import { JobType } from '../../jobs';

type HttpParams = 'method' | 'route' | 'status' | 'userAgent';
type EffectParams = 'effectName' | 'status';
type JobParams = 'jobName' | 'status';

class PrometheusService {
  private registry: Registry;
  private jobHistogram: Histogram<JobParams>;
  private httpHistogram: Histogram<HttpParams>;
  private effectHistogram: Histogram<EffectParams>;
  private arrayFormattingCounter: Counter<'userAgent'>;
  private metricCorrectionCounter: Counter<'userAgent' | 'route' | 'method'>;

  constructor() {
    this.registry = new prometheus.Registry();
    this.registry.setDefaultLabels({ app: 'wise-old-man', threadIndex: getThreadIndex() });

    prometheus.collectDefaultMetrics({ register: this.registry });

    this.arrayFormattingCounter = new prometheus.Counter({
      name: 'array_formatting',
      help: 'Temporary counter for tracking purposes.',
      labelNames: ['userAgent']
    });

    this.metricCorrectionCounter = new prometheus.Counter({
      name: 'metric_correction',
      help: 'Temporary counter for tracking purposes.',
      labelNames: ['userAgent', 'route', 'method']
    });

    this.effectHistogram = new prometheus.Histogram({
      name: 'effect_duration_seconds',
      help: 'Duration of effects in microseconds',
      labelNames: ['effectName', 'status'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10, 30]
    });

    this.httpHistogram = new prometheus.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in microseconds',
      labelNames: ['method', 'route', 'status', 'userAgent'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10, 30]
    });

    this.jobHistogram = new prometheus.Histogram({
      name: 'job_duration_seconds',
      help: 'Duration of jobs in microseconds',
      labelNames: ['jobName', 'status'],
      buckets: [0.1, 0.5, 1, 5, 10, 30, 60]
    });

    this.registry.registerMetric(this.arrayFormattingCounter);
    this.registry.registerMetric(this.metricCorrectionCounter);
    this.registry.registerMetric(this.jobHistogram);
    this.registry.registerMetric(this.httpHistogram);
    this.registry.registerMetric(this.effectHistogram);
  }

  incrementArrayFormattingCounter(userAgent: string) {
    this.arrayFormattingCounter.labels({ userAgent }).inc();
  }

  incrementMetricCorrectionCounter(userAgent: string, route: string, method: string) {
    this.metricCorrectionCounter.labels({ userAgent, route, method }).inc();
  }

  reduceUserAgent(userAgent: string | undefined, details: UserAgentDetails | undefined) {
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
    endTimerFn: (labels?: Partial<Record<HttpParams, string | number>>) => number,
    route: string,
    status: number,
    method: string,
    userAgent: string
  ) {
    endTimerFn({ route, status, method, userAgent });
  }

  async trackEffect(effectName: string, fn: () => Promise<void>) {
    const endTimer = this.effectHistogram.startTimer();

    try {
      await fn();
      endTimer({ effectName, status: 1 });
    } catch (error) {
      endTimer({ effectName, status: 0 });
      throw error;
    }
  }

  async trackJob(jobType: JobType | string, handler: () => Promise<void>) {
    const endTimer = this.jobHistogram.startTimer();

    try {
      await handler();
      endTimer({ jobName: String(jobType), status: 1 });
    } catch (error) {
      endTimer({ jobName: String(jobType), status: 0 });
      throw error;
    }
  }

  async getMetrics() {
    return this.registry.getMetricsAsJSON();
  }
}

export default new PrometheusService();
