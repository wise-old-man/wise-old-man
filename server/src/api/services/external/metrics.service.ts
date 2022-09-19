import { Details as UserAgentDetails } from 'express-useragent';
import prometheus, { Histogram, Registry } from 'prom-client';
import { getThreadIndex } from '../../../env';
import { JobType } from '../../jobs';

type HttpParams = 'method' | 'route' | 'status' | 'userAgent';
type ReactionParams = 'reactionName' | 'status';
type JobParams = 'jobName' | 'status';

class MetricsService {
  private registry: Registry;
  private jobHistogram: Histogram<JobParams>;
  private httpHistogram: Histogram<HttpParams>;
  private reactionHistogram: Histogram<ReactionParams>;

  constructor() {
    this.registry = new prometheus.Registry();
    this.registry.setDefaultLabels({ app: 'wise-old-man', threadIndex: getThreadIndex() });

    prometheus.collectDefaultMetrics({ register: this.registry });

    this.setupReactionHistogram();
    this.setupHttpHistogram();
    this.setupJobHistogram();
  }

  private setupReactionHistogram() {
    this.reactionHistogram = new prometheus.Histogram({
      name: 'reaction_duration_seconds',
      help: 'Duration of reactions in microseconds',
      labelNames: ['reactionName', 'status'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10, 30]
    });

    this.registry.registerMetric(this.reactionHistogram);
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

  private setupJobHistogram() {
    this.jobHistogram = new prometheus.Histogram({
      name: 'job_duration_seconds',
      help: 'Duration of jobs in microseconds',
      labelNames: ['jobName', 'status'],
      buckets: [0.1, 0.5, 1, 5, 10, 30, 60]
    });

    this.registry.registerMetric(this.jobHistogram);
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

  trackHttpRequestEnded(endTimerFn: any, route: string, status: number, method: string, userAgent: string) {
    endTimerFn({ route, status, method, userAgent });
  }

  async trackJob(jobType: JobType, handler: () => Promise<void>) {
    const endTimer = this.jobHistogram.startTimer();

    try {
      await handler();
      endTimer({ jobName: jobType.toString(), status: 1 });
    } catch (error) {
      endTimer({ jobName: jobType.toString(), status: 0 });
      throw error;
    }
  }

  async getMetrics() {
    return this.registry.getMetricsAsJSON();
  }

  async measureReaction(reactionName: string, reactionFn: () => Promise<any> | any) {
    const endTimer = this.reactionHistogram.startTimer();
    try {
      await reactionFn();
      endTimer({ reactionName, status: 1 });
    } catch (error) {
      endTimer({ reactionName, status: 0 });
    }
  }
}

export default new MetricsService();
