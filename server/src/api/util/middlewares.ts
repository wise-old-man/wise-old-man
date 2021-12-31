import { METRICS, parseMetricAbbreviation } from '@wise-old-man/utils';

function metricAbbreviation(req, res, next) {
  if (!req) {
    next();
  }

  // Swap any metric abbreviations in the request body
  if (req.body && req.body.metric) {
    const metric = req.body.metric.toLowerCase();

    if (!METRICS.includes(metric)) {
      req.body.metric = parseMetricAbbreviation(metric);
    }
  }

  // Swap any metric abbreviations in the request query
  if (req.query && req.query.metric) {
    const metric = req.query.metric.toLowerCase();

    if (!METRICS.includes(metric)) {
      req.query.metric = parseMetricAbbreviation(metric);
    }
  }

  next();
}

export { metricAbbreviation };
