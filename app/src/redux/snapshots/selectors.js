import { createSelector } from 'reselect';
import { CHART_COLORS } from 'config/visuals';
import { capitalize, distribute } from 'utils';

const snapshotsSelector = state => state.snapshots.snapshots;
const getSnapshotsMap = createSelector(snapshotsSelector, map => map);

export const getPlayerSnapshots = (state, username) => getSnapshotsMap(state)[username];

export const getChartData = (state, username, period, skill, measure, reducedMode) => {
  const snapshotsData = getPlayerSnapshots(state, username);

  if (!snapshotsData || !snapshotsData[period]) {
    return { distribution: { enabled: false, before: 0, after: 0 }, datasets: [] };
  }

  const snapshots = snapshotsData[period];

  // Ignore -1 values
  const validSnapshots = snapshots.filter(s => s[skill][measure] > 0);

  const enableReduction = reducedMode && validSnapshots.length > 30;

  // If enabled, this will evenly distribute the snapshots to a maximum of 30,
  // to make the charts cleaner by not displaying snapshots that are too near eachother
  const data = distribute(validSnapshots, enableReduction ? 30 : 100000).map(s => ({
    x: s.createdAt,
    y: s[skill][measure]
  }));

  return {
    distribution: {
      enabled: enableReduction,
      before: validSnapshots.length,
      after: data.length
    },
    datasets: [
      {
        borderColor: CHART_COLORS[measure === 'experience' ? 0 : 1],
        pointBorderWidth: 4,
        label: capitalize(measure),
        data,
        fill: false
      }
    ]
  };
};
