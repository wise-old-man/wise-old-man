const { ALL_METRICS, getAbbreviation } = require('../constants/metrics');

function metricAbbreviation(req, res, next) {
  if (!req) {
    next();
  }

  // Swap any metric abbreviations in the request body
  if (req.body && req.body.metric) {
    const metric = req.body.metric.toLowerCase();

    if (!ALL_METRICS.includes(metric)) {
      req.body.metric = getAbbreviation(metric);
    }
  }

  // Swap any metric abbreviations in the request query
  if (req.query && req.query.metric) {
    const metric = req.query.metric.toLowerCase();

    if (!ALL_METRICS.includes(metric)) {
      req.query.metric = getAbbreviation(metric);
    }
  }

  next();
}

exports.metricAbbreviation = metricAbbreviation;
