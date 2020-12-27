import React, { useContext, useCallback } from 'react';
import { TextInput, Selector, DateRangeSelector } from 'components';
import { getMetricIcon, getMetricName } from 'utils';
import { ALL_METRICS } from 'config';
import { CreateCompetitionContext } from '../context';

const MAXIMUM_TITLE_LENGTH = 50;

const METRIC_OPTIONS = ALL_METRICS.map(metric => ({
  label: getMetricName(metric),
  icon: getMetricIcon(metric, true),
  value: metric
}));

function Step1() {
  const { data, setData } = useContext(CreateCompetitionContext);
  const { title, metric, startDate, endDate } = data;

  const selectedMetricIndex = METRIC_OPTIONS.findIndex(o => o.value === metric);

  const handleTitleChanged = e => {
    const newTitle = e.target.value;
    setData(d => ({ ...d, title: newTitle }));
  };

  const handleMetricSelected = e => {
    const newMetric = (e && e.value) || null;
    setData(d => ({ ...d, metric: newMetric }));
  };

  const handleDatesChanged = dates => {
    const [newStartDate, newEndDate] = dates;
    setData(d => ({ ...d, startDate: newStartDate, endDate: newEndDate }));
  };

  // The handleDatesChanged goes into a loop
  // if not called through a useCallback, idk why
  const onDateRangeChanged = useCallback(handleDatesChanged, []);

  return (
    <div className="step1__container">
      <div className="form-row">
        <span className="form-row__label">Title</span>
        <TextInput
          placeholder="Ex: Varrock Titan's firemaking comp"
          value={title}
          onChange={handleTitleChanged}
          maxCharacters={MAXIMUM_TITLE_LENGTH}
        />
      </div>
      <div className="form-row">
        <span className="form-row__label">Metric</span>
        <Selector
          options={METRIC_OPTIONS}
          selectedIndex={selectedMetricIndex}
          onSelect={handleMetricSelected}
          search
        />
      </div>
      <div className="form-row">
        <span className="form-row__label">Time range</span>
        <DateRangeSelector start={startDate} end={endDate} onRangeChanged={onDateRangeChanged} />
      </div>
    </div>
  );
}

export default Step1;
