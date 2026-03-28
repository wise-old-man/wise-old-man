import { calculateValueDiff } from '../../../src/api/modules/deltas/delta.utils';
import { buildHiscoresSnapshot } from '../../../src/api/modules/snapshots/services/BuildHiscoresSnapshot';
import { HiscoresDataSchema } from '../../../src/services/jagex.service';
import { Metric, Snapshot } from '../../../src/types';
import { readFile } from '../../utils';

const globalData = {
  baseSnapshot: {} as Snapshot
};

beforeAll(async () => {
  const hiscoresJSON = await readFile(`${__dirname}/../../data/hiscores/psikoi_hiscores.json`);
  globalData.baseSnapshot = buildHiscoresSnapshot(-1, HiscoresDataSchema.parse(JSON.parse(hiscoresJSON)));
});

describe('Util - Calculate Value Diff', () => {
  it('should calculate a positive diff for ranked values', () => {
    const startSnapshot = globalData.baseSnapshot;

    const endSnapshot = {
      ...globalData.baseSnapshot,
      miningExperience: startSnapshot.miningExperience + 50_000
    };

    const diff = calculateValueDiff(Metric.MINING, startSnapshot, endSnapshot);

    expect(diff).toMatchObject({
      start: startSnapshot.miningExperience,
      end: endSnapshot.miningExperience,
      gained: 50_000
    });
  });

  it('should not calculate a negative diff for ranked values', () => {
    const startSnapshot = globalData.baseSnapshot;

    const endSnapshot = {
      ...globalData.baseSnapshot,
      miningExperience: startSnapshot.miningExperience - 50_000
    };

    const diff = calculateValueDiff(Metric.MINING, startSnapshot, endSnapshot);

    expect(diff).toMatchObject({
      start: startSnapshot.miningExperience,
      end: endSnapshot.miningExperience,
      gained: 0
    });
  });

  it('should not calculate the diff for ranked->unranked', () => {
    const startSnapshot = globalData.baseSnapshot;

    const endSnapshot = {
      ...globalData.baseSnapshot,
      miningExperience: -1
    };

    const diff = calculateValueDiff(Metric.MINING, startSnapshot, endSnapshot);

    expect(diff).toMatchObject({
      start: startSnapshot.miningExperience,
      end: endSnapshot.miningExperience,
      gained: 0
    });
  });

  it('should calculate the diff for unranked->ranked', () => {
    const startSnapshot = {
      ...globalData.baseSnapshot,
      miningExperience: -1
    };

    const endSnapshot = {
      ...globalData.baseSnapshot,
      miningExperience: 300_000
    };

    const diff = calculateValueDiff(Metric.MINING, startSnapshot, endSnapshot);

    expect(diff).toMatchObject({
      start: startSnapshot.miningExperience,
      end: endSnapshot.miningExperience,
      gained: 300_000
    });
  });

  it('should not calculate the diff for unranked->ranked (overall)', () => {
    const startSnapshot = {
      ...globalData.baseSnapshot,
      overallExperience: -1
    };

    const endSnapshot = {
      ...globalData.baseSnapshot,
      overallExperience: 3_000_000
    };

    const diff = calculateValueDiff(Metric.OVERALL, startSnapshot, endSnapshot);

    expect(diff).toMatchObject({
      start: startSnapshot.overallExperience,
      end: endSnapshot.overallExperience,
      gained: 0
    });
  });

  it('should calculate the diff for unranked->ranked (with minimum kc)', () => {
    const startSnapshot = {
      ...globalData.baseSnapshot,
      zulrahKills: -1
    };

    const endSnapshot = {
      ...globalData.baseSnapshot,
      zulrahKills: 12
    };

    const diff = calculateValueDiff(Metric.ZULRAH, startSnapshot, endSnapshot);

    expect(diff).toMatchObject({
      start: startSnapshot.zulrahKills,
      end: endSnapshot.zulrahKills,
      gained: 12
    });
  });

  it('should calculate a negative diff for LMS score', () => {
    const startSnapshot = {
      ...globalData.baseSnapshot,
      last_man_standingScore: 500
    };

    const endSnapshot = {
      ...globalData.baseSnapshot,
      last_man_standingScore: 450
    };

    const diff = calculateValueDiff(Metric.LAST_MAN_STANDING, startSnapshot, endSnapshot);

    expect(diff).toMatchObject({
      start: 500,
      end: 450,
      gained: -50
    });
  });

  it('should calculate a negative diff for PVP Arena score', () => {
    const startSnapshot = {
      ...globalData.baseSnapshot,
      pvp_arenaScore: 1200
    };

    const endSnapshot = {
      ...globalData.baseSnapshot,
      pvp_arenaScore: 1150
    };

    const diff = calculateValueDiff(Metric.PVP_ARENA, startSnapshot, endSnapshot);

    expect(diff).toMatchObject({
      start: 1200,
      end: 1150,
      gained: -50
    });
  });

  it('should calculate the diff for unranked->ranked (with minimum kc, and start kc below min)', () => {
    const startSnapshot = {
      ...globalData.baseSnapshot,
      zulrahKills: 2
    };

    const endSnapshot = {
      ...globalData.baseSnapshot,
      zulrahKills: 12
    };

    const diff = calculateValueDiff(Metric.ZULRAH, startSnapshot, endSnapshot);

    expect(diff).toMatchObject({
      start: startSnapshot.zulrahKills,
      end: endSnapshot.zulrahKills,
      gained: 10
    });
  });
});
