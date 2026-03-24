import {
  get200msCount,
  getCappedExp,
  getCombatLevelFromSnapshot,
  getMinimumExp,
  getTotalLevel,
  is10HP,
  is1Def,
  isF2p,
  isLvl3,
  isZerker
} from '../../../src/api/modules/snapshots/snapshot.utils';
import { SKILLS, Snapshot } from '../../../src/types';
import { getMetricValueKey } from '../../../src/utils/get-metric-value-key.util';
import {
  getCombatLevel,
  getExpForLevel,
  getLevel,
  MAX_SKILL_EXP,
  REAL_SKILLS,
  SKILL_EXP_AT_99
} from '../../../src/utils/shared';

describe('Util - Experience', () => {
  test('getExpForLevel', () => {
    expect(getExpForLevel(1)).toBe(0);
    expect(getExpForLevel(2)).toBe(83);
    expect(getExpForLevel(10)).toBe(1154);
    expect(getExpForLevel(99)).toBe(SKILL_EXP_AT_99);
  });

  test('getLevel', () => {
    expect(getLevel(SKILL_EXP_AT_99)).toBe(99);
    expect(getLevel(110_000)).toBe(50);
    expect(getLevel(getExpForLevel(67))).toBe(67);
  });

  test('getCombatLevelFromExp', () => {
    expect(getCombatLevel(1, 1, 1, 1, 1, 10, 1)).toBe(3);
    expect(getCombatLevel(1, 1, 1, 1, 1, 10, 99)).toBe(15);
    expect(getCombatLevel(99, 99, 99, 99, 99, 99, 99)).toBe(126);
    expect(getCombatLevel(80, 87, 78, 80, 81, 85, 80)).toBe(105);
  });

  test('getCombatLevel', () => {
    expect(
      getCombatLevelFromSnapshot({
        hitpointsExperience: 1154,
        attackExperience: 0,
        strengthExperience: 0,
        defenceExperience: 0,
        magicExperience: 0,
        rangedExperience: 0,
        prayerExperience: 0
      } as Snapshot)
    ).toBe(3);

    expect(
      getCombatLevelFromSnapshot({
        hitpointsExperience: 1154,
        attackExperience: 0,
        strengthExperience: 0,
        defenceExperience: 0,
        magicExperience: 0,
        rangedExperience: 0,
        prayerExperience: SKILL_EXP_AT_99
      } as Snapshot)
    ).toBe(15);

    expect(
      getCombatLevelFromSnapshot({
        hitpointsExperience: SKILL_EXP_AT_99,
        attackExperience: SKILL_EXP_AT_99,
        strengthExperience: SKILL_EXP_AT_99,
        defenceExperience: SKILL_EXP_AT_99,
        magicExperience: SKILL_EXP_AT_99,
        rangedExperience: SKILL_EXP_AT_99,
        prayerExperience: SKILL_EXP_AT_99
      } as Snapshot)
    ).toBe(126);
  });

  test('isF2p', () => {
    expect(
      isF2p({
        hitpointsExperience: SKILL_EXP_AT_99,
        attackExperience: SKILL_EXP_AT_99,
        strengthExperience: SKILL_EXP_AT_99,
        defenceExperience: SKILL_EXP_AT_99,
        magicExperience: SKILL_EXP_AT_99,
        rangedExperience: SKILL_EXP_AT_99,
        prayerExperience: SKILL_EXP_AT_99
      } as Snapshot)
    ).toBe(true);

    expect(
      isF2p({
        hitpointsExperience: SKILL_EXP_AT_99,
        attackExperience: SKILL_EXP_AT_99,
        strengthExperience: SKILL_EXP_AT_99,
        defenceExperience: SKILL_EXP_AT_99,
        magicExperience: SKILL_EXP_AT_99,
        rangedExperience: SKILL_EXP_AT_99,
        prayerExperience: SKILL_EXP_AT_99,
        fletchingExperience: 1000
      } as Snapshot)
    ).toBe(false);

    expect(
      isF2p({
        hitpointsExperience: SKILL_EXP_AT_99,
        attackExperience: SKILL_EXP_AT_99,
        strengthExperience: SKILL_EXP_AT_99,
        thievingExperience: 50
      } as Snapshot)
    ).toBe(false);

    expect(
      isF2p({
        attackExperience: 1000,
        woodcuttingExperience: 1000,
        prayerExperience: 1000,
        oborKills: 10
      } as Snapshot)
    ).toBe(true);

    expect(
      isF2p({
        attackExperience: 1000,
        woodcuttingExperience: 1000,
        prayerExperience: 1000,
        oborKills: 10,
        zulrahKills: 4
      } as Snapshot)
    ).toBe(false);
  });

  test('isLvl3', () => {
    expect(
      isLvl3({
        attackExperience: 1000
      } as Snapshot)
    ).toBe(false);

    expect(
      isLvl3({
        hitpointsExperience: 1154
      } as Snapshot)
    ).toBe(true);

    expect(
      isLvl3({
        woodcuttingExperience: 1000
      } as Snapshot)
    ).toBe(true);
  });

  test('isDef1', () => {
    expect(
      is1Def({
        defenceExperience: 1000
      } as Snapshot)
    ).toBe(false);

    expect(
      is1Def({
        defenceExperience: 1,
        prayerExperience: 100000
      } as Snapshot)
    ).toBe(true);
  });

  test('is10HP', () => {
    expect(
      is10HP({
        hitpointsExperience: 1154
      } as Snapshot)
    ).toBe(false); // only lvl3

    expect(
      is10HP({
        hitpointsExperience: 1500
      } as Snapshot)
    ).toBe(false); // over 10 hp

    expect(
      is10HP({
        hitpointsExperience: 1154,
        defenceExperience: 40_000
      } as Snapshot)
    ).toBe(true);
  });

  test('isZerker', () => {
    expect(
      isZerker({
        hitpointsExperience: 1154,
        attackExperience: 10_000
      } as Snapshot)
    ).toBe(false);

    expect(
      isZerker({
        defenceExperience: 1500
      } as Snapshot)
    ).toBe(false);

    expect(
      isZerker({
        defenceExperience: 150_000
      } as Snapshot)
    ).toBe(false);

    expect(
      isZerker({
        defenceExperience: 37_200 // lvl 39, almost 40
      } as Snapshot)
    ).toBe(false);

    expect(
      isZerker({
        defenceExperience: 50_000 // lvl 42, almost 43
      } as Snapshot)
    ).toBe(true);

    expect(
      isZerker({
        defenceExperience: 62_000
      } as Snapshot)
    ).toBe(true);

    expect(
      isZerker({
        defenceExperience: 67_983 // lvl 46
      } as Snapshot)
    ).toBe(false);
  });

  test('get200msCount', () => {
    expect(
      get200msCount({
        hitpointsExperience: MAX_SKILL_EXP,
        attackExperience: 10_000
      } as Snapshot)
    ).toBe(1);

    expect(
      get200msCount({
        hitpointsExperience: MAX_SKILL_EXP + 1,
        attackExperience: MAX_SKILL_EXP - 1
      } as Snapshot)
    ).toBe(0);

    expect(
      get200msCount({
        overallExperience: MAX_SKILL_EXP,
        fishingExperience: MAX_SKILL_EXP,
        woodcuttingExperience: MAX_SKILL_EXP
      } as Snapshot)
    ).toBe(2);
  });

  test('getMinimumExp', () => {
    expect(
      getMinimumExp({
        ...Object.fromEntries(SKILLS.map(s => [getMetricValueKey(s), 100_000])),
        hitpointsExperience: MAX_SKILL_EXP,
        attackExperience: 10_000
      } as Snapshot)
    ).toBe(10_000);

    expect(
      getMinimumExp({
        hitpointsExperience: MAX_SKILL_EXP,
        attackExperience: 10_000,
        woodcuttingExperience: -1
      } as Snapshot)
    ).toBe(0);
  });

  test('getCappedExp', () => {
    expect(
      getCappedExp(
        {
          ...Object.fromEntries(SKILLS.map(s => [getMetricValueKey(s), 100_000])),
          hitpointsExperience: MAX_SKILL_EXP,
          attackExperience: 123_456
        } as Snapshot,
        5000
      )
    ).toBe(REAL_SKILLS.length * 5000);

    expect(
      getCappedExp(
        {
          ...Object.fromEntries(SKILLS.map(s => [getMetricValueKey(s), 100_000])),
          hitpointsExperience: MAX_SKILL_EXP,
          attackExperience: 1234,
          hunterExperience: 4897
        } as Snapshot,
        5000
      )
    ).toBe(22 * 5000 + 1234 + 4897);
  });

  test('getTotalLevel', () => {
    expect(
      getTotalLevel({
        ...Object.fromEntries(SKILLS.map(s => [getMetricValueKey(s), 110_000])),
        attackExperience: 1
      } as Snapshot)
    ).toBe(23 * 50 + 1);

    expect(
      getTotalLevel({
        ...Object.fromEntries(SKILLS.map(s => [getMetricValueKey(s), 0])),
        hitpointsExperience: 1154
      } as Snapshot)
    ).toBe(23 + 10); // 1 everything, 10 hp

    expect(
      getTotalLevel({
        ...Object.fromEntries(SKILLS.map(s => [getMetricValueKey(s), MAX_SKILL_EXP])),
        hitpointsExperience: 110_000,
        woodcuttingExperience: 5_346_332
      } as Snapshot)
    ).toBe(22 * 99 + 50 + 90);

    expect(
      getTotalLevel(
        Object.fromEntries(SKILLS.map(s => [getMetricValueKey(s), MAX_SKILL_EXP])) as unknown as Snapshot
      )
    ).toBe(REAL_SKILLS.length * 99);

    expect(
      getTotalLevel(
        Object.fromEntries(SKILLS.map(s => [getMetricValueKey(s), SKILL_EXP_AT_99])) as unknown as Snapshot
      )
    ).toBe(REAL_SKILLS.length * 99);

    expect(
      getTotalLevel({
        attackExperience: MAX_SKILL_EXP,
        strengthExperience: MAX_SKILL_EXP
      } as Snapshot)
    ).toBe(229); // 99 attack + 99 strength + 10 hitpoints + 1 all other skills

    expect(
      getTotalLevel({
        overallLevel: 200, // lower than the computed total level
        attackExperience: MAX_SKILL_EXP,
        strengthExperience: MAX_SKILL_EXP
      } as Snapshot)
    ).toBe(229);

    expect(
      getTotalLevel({
        overallLevel: 277, // higher than the computed total level
        attackExperience: MAX_SKILL_EXP,
        strengthExperience: MAX_SKILL_EXP
      } as Snapshot)
    ).toBe(277);
  });
});
