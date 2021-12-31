import { getCombatLevel, getLevel, getExpForLevel, SKILL_EXP_AT_99 } from '../src/experience';

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

  test('getCombatLevel', () => {
    expect(getCombatLevel(1, 1, 1, 1, 1, 10, 1)).toBe(3);
    expect(getCombatLevel(1, 1, 1, 1, 1, 10, 99)).toBe(15);
    expect(getCombatLevel(99, 99, 99, 99, 99, 99, 99)).toBe(126);
    expect(getCombatLevel(80, 87, 78, 80, 81, 85, 80)).toBe(105);
  });
});
