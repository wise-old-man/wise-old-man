import * as snapshotUtils from '../../../src/api/modules/snapshots/snapshot.utils';

describe('Util - Snapshots', () => {
  test('average', () => {
    expect(() => snapshotUtils.average([])).toThrow('Invalid snapshots list. Failed to find average.');
    expect(() => snapshotUtils.average(null)).toThrow('Invalid snapshots list. Failed to find average.');
    expect(() => snapshotUtils.average(undefined)).toThrow('Invalid snapshots list. Failed to find average.');
  });

  test('getBestInEachMetric', () => {
    expect(() => snapshotUtils.getMetricLeaders([])).toThrow(
      'Invalid snapshots list. Failed to find best players.'
    );

    expect(() => snapshotUtils.getMetricLeaders(null)).toThrow(
      'Invalid snapshots list. Failed to find best players.'
    );

    expect(() => snapshotUtils.getMetricLeaders(undefined)).toThrow(
      'Invalid snapshots list. Failed to find best players.'
    );
  });
});
