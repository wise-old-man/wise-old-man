import React, { useMemo, useContext } from 'react';
import PropTypes from 'prop-types';
import { TextInput, Selector } from 'components';
import { COMPETITION_STATUSES, COMPETITION_TYPES, ALL_METRICS } from 'config';
import { capitalize, getMetricIcon, getMetricName } from 'utils';
import { CompetitionsListContext } from '../context';

const DEFAULT_METRICS_OPTION = { label: 'Any metric', value: null };
const DEFAULT_STATUS_OPTION = { label: 'Any status', value: null };
const DEFAULT_TYPE_OPTION = { label: 'Any type', value: null };

function Controls({ onSearchInputChanged }) {
  const { context, updateContext } = useContext(CompetitionsListContext);

  const metricOptions = useMemo(getMetricOptions, []);
  const statusOptions = useMemo(getStatusOptions, []);
  const typeOptions = useMemo(getTypeOptions, []);

  const selectedMetricIndex = metricOptions.findIndex(o => o.value === context.metric);
  const selectedStatusIndex = statusOptions.findIndex(o => o.value === context.status);
  const selectedTypeIndex = typeOptions.findIndex(o => o.value === context.type);

  const onMetricSelected = e => {
    updateContext({ metric: (e && e.value) || null });
  };

  const onStatusSelected = e => {
    updateContext({ status: (e && e.value) || null });
  };

  const onTypeSelected = e => {
    updateContext({ type: (e && e.value) || null });
  };

  return (
    <>
      <div className="col-lg-3 col-md-6 col-sm-6">
        <TextInput onChange={onSearchInputChanged} placeholder="Search competition" />
      </div>
      <div className="col-lg-4 col-md-6 col-sm-6">
        <Selector
          options={metricOptions}
          selectedIndex={selectedMetricIndex}
          onSelect={onMetricSelected}
          search
        />
      </div>
      <div className="col-lg-3 col-sm-6">
        <Selector
          options={statusOptions}
          selectedIndex={selectedStatusIndex}
          onSelect={onStatusSelected}
        />
      </div>
      <div className="col-lg-2 col-sm-6">
        <Selector options={typeOptions} selectedIndex={selectedTypeIndex} onSelect={onTypeSelected} />
      </div>
    </>
  );
}

function getTypeOptions() {
  return [
    DEFAULT_TYPE_OPTION,
    ...COMPETITION_TYPES.map(type => ({ label: capitalize(type), value: type }))
  ];
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
