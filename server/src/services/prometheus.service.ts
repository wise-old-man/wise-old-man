import { AsyncResult, complete, errored, fromPromise, isErrored } from '@attio/fetchable';
import axios from 'axios';
import prometheus, { Counter, Gauge, Histogram, Registry } from 'prom-client';
import { getThreadIndex } from '../env';

class PrometheusService {
  private registry: Registry;
  private jobHistogram: Histogram<'jobName' | 'status'>;
  private jobQueueGauge: Gauge<'queueName' | 'state'>;
  private httpHistogram: Histogram<'method' | 'route' | 'status' | 'userAgent'>;
  private eventCounter: Counter<'eventType'>;
  private hiscoresHistogram: Histogram<'status'>;
  private runeMetricsHistogram: Histogram<'status'>;

  private pushInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.registry = new prometheus.Registry();

    this.registry.setDefaultLabels({
      app: 'wise-old-man',
      threadIndex: getThreadIndex()
    });

    prometheus.collectDefaultMetrics({ register: this.registry });

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

    this.runeMetricsHistogram = new prometheus.Histogram({
      name: 'runemetrics_duration_seconds',
      help: 'Duration of RuneMetrics requests in microseconds',
      labelNames: ['status'],
      buckets: [0.1, 0.3, 0.5, 1, 5, 10, 30]
    });

    this.hiscoresHistogram = new prometheus.Histogram({
      name: 'hiscores_duration_seconds',
      help: 'Duration of hiscores requests in microseconds',
      labelNames: ['status'],
      buckets: [0.1, 0.3, 0.5, 1, 5, 10, 30]
    });

    this.registry.registerMetric(this.jobHistogram);
    this.registry.registerMetric(this.jobQueueGauge);
    this.registry.registerMetric(this.httpHistogram);
    this.registry.registerMetric(this.eventCounter);
    this.registry.registerMetric(this.runeMetricsHistogram);
    this.registry.registerMetric(this.hiscoresHistogram);
  }

  init() {
    this.pushInterval = setInterval(() => {
      this.pushMetrics();
    }, 60_000);
  }

  shutdown() {
    if (this.pushInterval !== null) {
      clearInterval(this.pushInterval);
    }
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

    const metricsResult = await fromPromise(this.registry.metrics());

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
        thread_index: getThreadIndex()
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

  trackHttpRequest() {
    return this.httpHistogram.startTimer();
  }

  trackRuneMetricsRequest() {
    return this.runeMetricsHistogram.startTimer();
  }

  trackHiscoresRequest() {
    return this.hiscoresHistogram.startTimer();
  }

  trackJob() {
    return this.jobHistogram.startTimer();
  }

  trackEventEmitted(eventType: string) {
    this.eventCounter.inc({ eventType });
  }

  updateQueueMetrics(queueName: string, counts: Record<string, number>) {
    for (const [state, count] of Object.entries(counts)) {
      this.jobQueueGauge.set({ queueName, state }, count);
    }
  }
}

export default new PrometheusService();
