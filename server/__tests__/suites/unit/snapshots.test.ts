import { Player, Snapshot } from 'src/utils/types';
import * as snapshotUtils from '../../../src/api/modules/snapshots/snapshot.utils';

describe('Util - Snapshots', () => {
  test('average', () => {
    expect(() => snapshotUtils.average([])).toThrow('Invalid snapshots list. Failed to find average.');
  });

  test('getBestInEachMetric', () => {
    expect(() => snapshotUtils.getBestInEachMetric([], [])).toThrow(
      'Invalid snapshots list. Failed to find best players.'
    );

    expect(() => snapshotUtils.getBestInEachMetric([{} as Snapshot], [])).toThrow(
      'Invalid players list. Failed to find best players.'
    );

    expect(() => snapshotUtils.getBestInEachMetric([], [{} as Player])).toThrow(
      'Invalid snapshots list. Failed to find best players.'
    );

    expect(() => snapshotUtils.getBestInEachMetric([{} as Snapshot], [{} as Player, {} as Player])).toThrow(
      'Invalid players list. Failed to find best players.'
    );
  });
});
