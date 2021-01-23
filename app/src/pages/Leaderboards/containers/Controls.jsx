import React, { useContext } from 'react';
import { Selector } from 'components';
import { PLAYER_TYPES, PLAYER_BUILDS, VIRTUALS } from 'config';
import { capitalize, getPlayerTypeIcon, getPlayerBuild, getMetricIcon, getMetricName } from 'utils';
import { LeaderboardContext } from '../context';

const PLAYER_TYPES_OPTIONS = PLAYER_TYPES.map(type => ({
  label: capitalize(type),
  icon: getPlayerTypeIcon(type),
  value: type
}));

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

function Controls() {
  const { context, updateContext } = useContext(LeaderboardContext);
  const { metric, type, build } = context;

  const metricIndex = METRIC_OPTIONS.findIndex(o => o.value === metric);
  const playerTypeIndex = PLAYER_TYPES_OPTIONS.findIndex(o => o.value === type);
  const playerBuildIndex = PLAYER_BUILDS_OPTIONS.findIndex(o => o.value === build);

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

  return (
    <>
      <div className="col-lg-4 col-md-3">
        <Selector
          options={METRIC_OPTIONS}
          selectedIndex={metricIndex}
          onSelect={handleMetricSelected}
          search
        />
      </div>
      <div className="col-lg-4 col-md-5">
        <Selector
          options={PLAYER_TYPES_OPTIONS}
          selectedIndex={playerTypeIndex}
          onSelect={handleTypeSelected}
        />
      </div>
      <div className="col-lg-4 col-md-5">
        <Selector
          options={PLAYER_BUILDS_OPTIONS}
          selectedIndex={playerBuildIndex}
          onSelect={handleBuildSelected}
        />
      </div>
    </>
  );
}

export default Controls;
