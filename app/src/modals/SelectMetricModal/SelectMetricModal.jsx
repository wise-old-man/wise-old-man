import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Selector } from 'components';
import { getMetricIcon, getMetricName } from 'utils';
import { ALL_METRICS } from 'config';
import './SelectMetricModal.scss';

const METRIC_OPTIONS = ALL_METRICS.map(metric => ({
  label: getMetricName(metric),
  icon: getMetricIcon(metric, true),
  value: metric
}));

function SelectMetric({ defaultMetric, onCancel, onSubmit }) {
  const [metric, setMetric] = useState(defaultMetric);

  return (
    <div className="select-metric">
      <div className="select-metric__modal">
        <button className="close-btn" type="button" onClick={onCancel}>
          <img src="/img/icons/clear.svg" alt="X" />
        </button>
        <b className="modal-title">Preview Other Metric</b>
        <span className="modal-warning">
          Select another metric to preview everyone&apos;s gains without the need to edit this
          competition, or create new concurrent competitions.
        </span>
        <Selector
          options={METRIC_OPTIONS}
          selectedIndex={ALL_METRICS.indexOf(metric)}
          onSelect={o => setMetric(o.value)}
          search
        />
        <Button text="Preview" onClick={() => onSubmit(metric)} disabled={metric === defaultMetric} />
      </div>
    </div>
  );
}

SelectMetric.propTypes = {
  defaultMetric: PropTypes.string.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired
};

export default SelectMetric;
