import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { METRICS, MetricProps } from '@wise-old-man/utils';
import { Button, Selector } from 'components';
import { getMetricIcon } from 'utils';
import './SelectMetricModal.scss';

const METRIC_OPTIONS = METRICS.map(metric => ({
  label: MetricProps[metric].name,
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
          selectedIndex={METRICS.indexOf(metric)}
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
