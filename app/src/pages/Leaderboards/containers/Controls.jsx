import React, { useContext } from 'react';
import {
  PLAYER_TYPES,
  PLAYER_BUILDS,
  PlayerBuildProps,
  COMPUTED_METRICS,
  PlayerType,
  MetricProps,
  PlayerTypeProps,
  CountryProps
} from '@wise-old-man/utils';
import { Selector } from 'components';
import { getPlayerTypeIcon, getMetricIcon } from 'utils';
import { LeaderboardContext } from '../context';

const PLAYER_TYPES_OPTIONS = PLAYER_TYPES.filter(type => type !== PlayerType.UNKNOWN).map(type => ({
  label: PlayerTypeProps[type].name,
  icon: getPlayerTypeIcon(type),
  value: type
}));

const PLAYER_BUILDS_OPTIONS = [
  { label: 'All player builds', value: null },
  ...PLAYER_BUILDS.map(type => ({
    label: PlayerBuildProps[type].name,
    value: type
  }))
];

const METRIC_OPTIONS = [...COMPUTED_METRICS, 'ehp+ehb'].map(metric => ({
  label: metric === 'ehp+ehb' ? 'EHP + EHB' : MetricProps[metric].name,
  icon: getMetricIcon(metric, true),
  value: metric
}));

const COUNTRY_OPTIONS = [
  { label: 'All countries', value: null },
  ...Object.entries(CountryProps).map(([code, details]) => ({
    label: details.name,
    icon: `/img/flags/${code}.svg`,
    value: code
  }))
];

function Controls() {
  const { context, updateContext } = useContext(LeaderboardContext);
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
      <div className="col-lg-2 col-md-3">
        <Selector
          options={METRIC_OPTIONS}
          selectedIndex={metricIndex}
          onSelect={handleMetricSelected}
          search
        />
      </div>
      <div className="col-lg-3 col-md-5">
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
      <div className="col-lg-4 col-md-5">
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
