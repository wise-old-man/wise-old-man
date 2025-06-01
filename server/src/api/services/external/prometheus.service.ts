import axios from 'axios';
import prometheus, { Histogram, Gauge, Registry, Counter } from 'prom-client';
import { getThreadIndex } from '../../../env';
import { AsyncResult, complete, errored, fromPromise, isErrored } from '@attio/fetchable';

type HttpParams = 'method' | 'route' | 'status' | 'userAgent';
type EffectParams = 'effectName' | 'status';
type JobParams = 'jobName' | 'status';
type JobQueueParams = 'queueName' | 'state';
type EventParams = 'eventType';
type CustomPeriodParams = 'customPeriod';
type UpdatePlayerJobSourceParams = 'source';

class PrometheusService {
  private registry: Registry;
  private jobHistogram: Histogram<JobParams>;
  private jobQueueGauge: Gauge<JobQueueParams>;
  private httpHistogram: Histogram<HttpParams>;
  private effectHistogram: Histogram<EffectParams>;
  private eventCounter: Counter<EventParams>;
  private customPeriodCounter: Counter<CustomPeriodParams>;
  private updatePlayerJobSourceCounter: Counter<UpdatePlayerJobSourceParams>;

  constructor() {
    this.registry = new prometheus.Registry();
    this.registry.setDefaultLabels({ app: 'wise-old-man', threadIndex: getThreadIndex() });

    prometheus.collectDefaultMetrics({ register: this.registry });

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
      labelNames: ['jobName', 'version', 'status'],
      buckets: [0.1, 0.5, 1, 5, 10, 30, 60]
    });

    this.jobQueueGauge = new prometheus.Gauge({
      name: 'job_queue_size',
      help: 'Number of jobs in different states for each queue',
      labelNames: ['queueName', 'state']
    });

    this.eventCounter = new prometheus.Counter({
      name: 'event_counter',
      help: 'Count of events emitted',
      labelNames: ['eventType']
    });

    this.customPeriodCounter = new prometheus.Counter({
      name: 'custom_period_counter',
      help: 'Count of custom period expressions used',
      labelNames: ['customPeriod']
    });

    this.updatePlayerJobSourceCounter = new prometheus.Counter({
      name: 'update_player_job_source_counter',
      help: 'Count of update player jobs dispatched',
      labelNames: ['source']
    });

    this.registry.registerMetric(this.jobHistogram);
    this.registry.registerMetric(this.jobQueueGauge);
    this.registry.registerMetric(this.httpHistogram);
    this.registry.registerMetric(this.effectHistogram);
    this.registry.registerMetric(this.eventCounter);
    this.registry.registerMetric(this.customPeriodCounter);
    this.registry.registerMetric(this.updatePlayerJobSourceCounter);

    setInterval(() => {
      this.pushMetrics();
    }, 60_000);
  }

  async pushMetrics(): AsyncResult<
    true,
    | { code: 'NOT_ALLOWED_IN_TEST_ENV' }
    | { code: 'MISSING_METRICS_URL' }
    | { code: 'FAILED_TO_GET_PROMETHEUS_METRICS'; subError: unknown }
    | { code: 'FAILED_TO_PUSH_PROMETHEUS_METRICS'; subError: unknown }
  > {
    if (process.env.NODE_ENV === 'test') {
      return errored({ code: 'NOT_ALLOWED_IN_TEST_ENV' });
    }

    if (!process.env.PROMETHEUS_METRICS_SERVICE_URL) {
      return errored({ code: 'MISSING_METRICS_URL' });
    }

    const metricsResult = await fromPromise(this.registry.getMetricsAsJSON());

    if (isErrored(metricsResult)) {
      return errored({
        code: 'FAILED_TO_GET_PROMETHEUS_METRICS',
        subError: metricsResult.error
      });
    }

    const requestResult = await fromPromise(
      axios.post(process.env.PROMETHEUS_METRICS_SERVICE_URL, {
        source: 'api',
        data: metricsResult.value,
        threadIndex: getThreadIndex()
      })
    );

    if (isErrored(requestResult)) {
      return errored({
        code: 'FAILED_TO_PUSH_PROMETHEUS_METRICS',
        subError: requestResult.error
      });
    }

    return complete(true);
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

  async trackJob(jobName: string, handler: () => Promise<void>) {
    const endTimer = this.jobHistogram.startTimer();

    try {
      await handler();
      endTimer({ jobName, status: 1 });
    } catch (error) {
      endTimer({ jobName, status: 0 });
      throw error;
    }
  }

  trackEventEmitted(eventType: string) {
    this.eventCounter.inc({ eventType });
  }

  trackCustomPeriodExpression(customPeriod: string) {
    this.customPeriodCounter.inc({ customPeriod });
  }

  trackUpdatePlayerJobSource(source: string) {
    this.updatePlayerJobSourceCounter.inc({ source });
  }

  async updateQueueMetrics(queueName: string, counts: Record<string, number>) {
    for (const [state, count] of Object.entries(counts)) {
      this.jobQueueGauge.set({ queueName, state }, count);
    }
  }
}

export default new PrometheusService();
