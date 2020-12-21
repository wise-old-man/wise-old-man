import React, { useMemo, useContext } from 'react';
import PropTypes from 'prop-types';
import { TextInput, Selector } from 'components';
import { COMPETITION_STATUSES, ALL_METRICS } from 'config';
import { capitalize, getMetricIcon, getMetricName } from 'utils';
import { CompetitionsListContext } from '../context';

const DEFAULT_METRICS_OPTION = { label: 'Any metric', value: null };
const DEFAULT_STATUS_OPTION = { label: 'Any status', value: null };

function Controls({ onSearchInputChanged }) {
  const { context, updateContext } = useContext(CompetitionsListContext);

  const metricOptions = useMemo(getMetricOptions, []);
  const statusOptions = useMemo(getStatusOptions, []);

  const selectedMetricIndex = metricOptions.findIndex(o => o.value === context.metric);
  const selectedStatusIndex = statusOptions.findIndex(o => o.value === context.status);

  const onMetricSelected = e => {
    updateContext({ metric: (e && e.value) || null });
  };

  const onStatusSelected = e => {
    updateContext({ status: (e && e.value) || null });
  };

  return (
    <>
      <div className="col-md-4 col-sm-12">
        <TextInput onChange={onSearchInputChanged} placeholder="Search competition" />
      </div>
      <div className="col-md-4 col-sm-6">
        <Selector
          options={metricOptions}
          selectedIndex={selectedMetricIndex}
          onSelect={onMetricSelected}
          search
        />
      </div>
      <div className="col-md-4 col-sm-6">
        <Selector
          options={statusOptions}
          selectedIndex={selectedStatusIndex}
          onSelect={onStatusSelected}
        />
      </div>
    </>
  );
}

function getStatusOptions() {
  return [
    DEFAULT_STATUS_OPTION,
    ...COMPETITION_STATUSES.map(status => ({ label: capitalize(status), value: status }))
  ];
}

function getMetricOptions() {
  return [
    DEFAULT_METRICS_OPTION,
    ...ALL_METRICS.map(metric => ({
      label: getMetricName(metric),
      icon: getMetricIcon(metric, true),
      value: metric
    }))
  ];
}

Controls.propTypes = {
  onSearchInputChanged: PropTypes.func.isRequired
};

export default Controls;
