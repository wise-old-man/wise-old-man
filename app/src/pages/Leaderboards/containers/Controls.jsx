import React, { useContext } from 'react';
import { Selector } from 'components';
import { PLAYER_BUILDS, VIRTUALS, COUNTRIES } from 'config';
import { getPlayerBuild, getMetricIcon, getMetricName } from 'utils';
import { LeaderboardContext } from '../context';

const PLAYER_BUILDS_OPTIONS = [
  { label: 'All player builds', value: null },
  ...PLAYER_BUILDS.map(type => ({
    label: getPlayerBuild(type),
    value: type
  }))
];

const METRIC_OPTIONS = [...VIRTUALS, 'ehp+ehb'].map(metric => ({
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
  const { context, updateContext } = useContext(LeaderboardContext);
  const { metric, build, country } = context;

  const metricIndex = METRIC_OPTIONS.findIndex(o => o.value === metric);
  const playerBuildIndex = PLAYER_BUILDS_OPTIONS.findIndex(o => o.value === build);
  const countryIndex = COUNTRY_OPTIONS.findIndex(o => o.value === country);

  const handleMetricSelected = e => {
    if (!e || !e.value) return;
    updateContext({ metric: e.value });
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
      <div className="col-lg-4 col-md-6">
        <Selector
          options={PLAYER_BUILDS_OPTIONS}
          selectedIndex={playerBuildIndex}
          onSelect={handleBuildSelected}
        />
      </div>
      <div className="col-lg-4 col-md-6">
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
