import { createSelector } from 'reselect';
import { COLORS } from '../../config';
import { capitalize, distribute } from '../../utils';

const snapshotsSelector = state => state.snapshots.snapshots;

export const getSnapshotsMap = createSelector(snapshotsSelector, map => map);

export const getSnapshots = createSelector(snapshotsSelector, map => Object.values(map));

export const getPlayerSnapshots = (state, playerId) => getSnapshotsMap(state)[playerId];

export const getChartData = (state, playerId, period, skill, measure, reducedMode) => {
  const snapshotsData = getPlayerSnapshots(state, playerId);

  if (!snapshotsData) {
    return {
      distribution: {
        enabled: false,
        before: 0,
        after: 0
      },
      datasets: []
    };
  }

  const snapshots = snapshotsData[period];

  // If enabled, this will evenly distribute the snapshots to a maximum of 30,
  // to make the charts cleaner by not displaying snapshots that are too near eachother
  const distributedSnapshots = distribute(snapshots, reducedMode ? 30 : 100000);

  const data = distributedSnapshots.map(s => ({
    x: s.createdAt,
    y: s[skill][measure]
  }));

  return {
    distribution: {
      enabled: reducedMode && snapshots.length !== distributedSnapshots.length,
      before: snapshots.length,
      after: distributedSnapshots.length
    },
    datasets: [
      {
        borderColor: COLORS[measure === 'experience' ? 0 : 1],
        pointBorderWidth: 4,
        label: capitalize(measure),
        // If showing ranks, don't include any -1 ranks
        data: measure === 'rank' ? data.filter(d => d.y > 0) : data,
        fill: false
      }
    ]
  };
};
