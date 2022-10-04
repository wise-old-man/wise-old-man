import { uniqBy } from 'lodash';
import { isSkill, isBoss, isActivity } from '@wise-old-man/utils';
import { capitalize } from 'utils/strings';
import { getMinimumBossKc } from 'utils/metrics';
import { CHART_COLORS } from 'config/visuals';

export function distribute(snapshots, limit) {
  if (snapshots.length <= limit) {
    return snapshots;
  }

  const startSnapshot = snapshots[snapshots.length - 1];
  const endSnapshot = snapshots[0];

  const startTime = startSnapshot.createdAt.getTime();
  const timeSliceSize = Math.round((endSnapshot.createdAt - startSnapshot.createdAt) / limit);
  const selected = [];

  for (let i = 0; i < limit; i++) {
    const startTimestamp = startTime + i * timeSliceSize;
    const endTimestamp = startTime + (i + 1) * timeSliceSize;
    const midTimestamp = startTimestamp + (endTimestamp - startTimestamp) / 2;

    const filtered = snapshots.filter(s => s.createdAt >= startTimestamp && s.createdAt <= endTimestamp);

    if (filtered && filtered.length > 0) {
      const best = filtered.reduce((a, b) => {
        return Math.abs(b.createdAt - midTimestamp) < Math.abs(a.createdAt - midTimestamp) ? b : a;
      });

      if (best) {
        selected.push(best);
      }
    }
  }

  return uniqBy([startSnapshot, ...selected, endSnapshot], s => s.createdAt.getTime());
}

export const getDeltasChartData = (snapshots, metric, measure, reducedMode) => {
  if (!snapshots || snapshots.length === 0) {
    return { distribution: { enabled: false, before: 0, after: 0 }, datasets: [] };
  }

  let array = 'computed';
  if (isSkill(metric)) array = 'skills';
  if (isBoss(metric)) array = 'bosses';
  if (isActivity(metric)) array = 'activities';

  // Ignore -1 values
  const validSnapshots = snapshots.filter(s => {
    return s.data[array][metric][measure] > 0;
  });

  const enableReduction = reducedMode && validSnapshots.length > 30;

  // If enabled, this will evenly distribute the snapshots to a maximum of 30,
  // to make the charts cleaner by not displaying snapshots that are too near eachother
  const data = distribute(validSnapshots, enableReduction ? 30 : 100000).map(s => ({
    x: s.createdAt,
    y: s.data[array][metric][measure]
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

export const getCompetitionChartData = (topHistory, metric) => {
  if (!topHistory || topHistory.length === 0) return [];

  const datasets = [];

  topHistory.forEach((participant, i) => {
    // Convert all the history data into chart points

    const points = [...participant.history]
      .reverse()
      .sort()
      .map(h => ({
        x: h.date,
        y: isBoss(metric) ? Math.max(h.value, getMinimumBossKc(metric) - 1) : h.value
      }));

    // Convert the exp values to exp delta values
    const diffPoints = points.map(p => ({ x: p.x, y: p.y - points[0].y }));

    // Include only unique points, and the last point (for visual clarity)
    const filteredPoints = [...uniqBy(diffPoints, 'y'), diffPoints[diffPoints.length - 1]];

    datasets.push({
      borderColor: CHART_COLORS[i],
      pointBorderWidth: 1,
      label: participant.player.displayName,
      data: filteredPoints,
      fill: false
    });
  });

  return datasets;
};
