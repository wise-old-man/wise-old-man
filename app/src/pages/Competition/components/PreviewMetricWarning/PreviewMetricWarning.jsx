import React from 'react';
import PropTypes from 'prop-types';
import { MetricProps } from '@wise-old-man/utils';
import './PreviewMetricWarning.scss';

function PreviewMetricWarning({ trueMetric, previewMetric }) {
  return (
    <div className="metric-preview-warning">
      <span>Previewing gains for</span>
      <b>{MetricProps[previewMetric].name}</b>
      <span>. This competition&apos;s true metric is</span>
      <b>{`${MetricProps[trueMetric].name}.`}</b>
    </div>
  );
}

PreviewMetricWarning.propTypes = {
  trueMetric: PropTypes.string.isRequired,
  previewMetric: PropTypes.string.isRequired
};

export default PreviewMetricWarning;
