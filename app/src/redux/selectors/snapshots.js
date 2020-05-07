import _ from 'lodash';
import { createSelector } from 'reselect';
import { COLORS } from '../../config';
import { capitalize } from '../../utils';

const snapshotsSelector = state => state.snapshots.snapshots;

export const getSnapshotsMap = createSelector(snapshotsSelector, map => map);

export const getSnapshots = createSelector(snapshotsSelector, map => Object.values(map));

export const getPlayerSnapshots = (state, playerId) => getSnapshotsMap(state)[playerId];

export const getChartData = (state, playerId, period, skill, measure) => {
  const snapshotsData = getPlayerSnapshots(state, playerId);

  if (!snapshotsData) {
    return [];
  }

  const data = _.uniqBy(
    snapshotsData[period].map(s => ({
      x: s.createdAt,
      y: s[skill][measure]
    })),
    'y'
  );

  return [
    {
      borderColor: COLORS[measure === 'experience' ? 0 : 1],
      pointBorderWidth: 4,
      label: capitalize(measure),
      // If showing ranks, don't include any -1 ranks
      data: measure === 'rank' ? data.filter(d => d.y > 0) : data,
      fill: false
    }
  ];
};
