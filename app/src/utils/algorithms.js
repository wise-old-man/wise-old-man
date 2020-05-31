import _ from 'lodash';

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

  return _.uniqBy([startSnapshot, ...selected, endSnapshot], s => s.createdAt.getTime());
}
