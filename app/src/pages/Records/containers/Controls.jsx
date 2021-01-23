import React, { useContext } from 'react';
import { Selector } from 'components';
import { PLAYER_TYPES, PLAYER_BUILDS, ALL_METRICS, COUNTRIES } from 'config';
import { capitalize, getPlayerTypeIcon, getPlayerBuild, getMetricIcon, getMetricName } from 'utils';
import { RecordsContext } from '../context';

const PLAYER_TYPES_OPTIONS = [
  { label: 'All player types', value: null },
  ...PLAYER_TYPES.map(type => ({
    label: capitalize(type),
    icon: getPlayerTypeIcon(type),
    value: type
  }))
];

const PLAYER_BUILDS_OPTIONS = [
  { label: 'All player builds', value: null },
  ...PLAYER_BUILDS.map(type => ({
    label: getPlayerBuild(type),
    value: type
  }))
];

const METRIC_OPTIONS = ALL_METRICS.map(metric => ({
  label: getMetricName(metric),
  icon: getMetricIcon(metric, true),
  value: metric
}));

const COUNTRY_OPTIONS = [
  { label: 'All countries', value: null },
  ...COUNTRIES.map(c => ({
    label: c.name,
    icon: `/img/flags/${c.code}.svg`,
    value: c.code
  }))
];

function Controls() {
  const { context, updateContext } = useContext(RecordsContext);
  const { metric, type, build, country } = context;

  const metricIndex = METRIC_OPTIONS.findIndex(o => o.value === metric);
  const playerTypeIndex = PLAYER_TYPES_OPTIONS.findIndex(o => o.value === type);
  const playerBuildIndex = PLAYER_BUILDS_OPTIONS.findIndex(o => o.value === build);
  const countryIndex = COUNTRY_OPTIONS.findIndex(o => o.value === country);

  const handleMetricSelected = e => {
    if (!e || !e.value) return;
    updateContext({ metric: e.value });
  };

  const handleTypeSelected = e => {
    updateContext({ type: e.value });
  };

  const handleBuildSelected = e => {
    updateContext({ build: e.value });
  };

  const handleCountrySelected = e => {
    updateContext({ country: e.value });
  };

  return (
    <>
      <div className="col-lg-4 col-md-6">
        <Selector
          options={METRIC_OPTIONS}
          selectedIndex={metricIndex}
          onSelect={handleMetricSelected}
          search
        />
      </div>
      <div className="col-lg-2 col-md-4">
        <Selector
          options={PLAYER_TYPES_OPTIONS}
          selectedIndex={playerTypeIndex}
          onSelect={handleTypeSelected}
        />
      </div>
      <div className="col-lg-3 col-md-5">
        <Selector
          options={PLAYER_BUILDS_OPTIONS}
          selectedIndex={playerBuildIndex}
          onSelect={handleBuildSelected}
        />
      </div>
      <div className="col-lg-3 col-md-5">
        <Selector
          options={COUNTRY_OPTIONS}
          selectedIndex={countryIndex}
          onSelect={handleCountrySelected}
          search
        />
      </div>
    </>
  );
}

export default Controls;
