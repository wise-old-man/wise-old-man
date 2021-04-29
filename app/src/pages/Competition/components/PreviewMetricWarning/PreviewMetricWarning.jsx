import React from 'react';
import PropTypes from 'prop-types';
import { getMetricName } from 'utils';
import './PreviewMetricWarning.scss';

function PreviewMetricWarning({ trueMetric, previewMetric }) {
  return (
    <div className="metric-preview-warning">
      <span>Previewing gains for</span>
      <b>{getMetricName(previewMetric)}</b>
      <span>. This competition&apos;s true metric is</span>
      <b>{`${getMetricName(trueMetric)}.`}</b>
    </div>
  );
}

PreviewMetricWarning.propTypes = {
  trueMetric: PropTypes.string.isRequired,
  previewMetric: PropTypes.string.isRequired
};

export default PreviewMetricWarning;
