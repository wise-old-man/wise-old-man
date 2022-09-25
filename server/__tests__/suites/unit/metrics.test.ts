import {
  Metric,
  METRICS,
  MetricProps,
  findMetric,
  isSkill,
  isBoss,
  isActivity,
  isComputedMetric,
  getMetricRankKey,
  getMetricValueKey,
  getMetricMeasure,
  getMetricName,
  getMinimumBossKc,
  getParentEfficiencyMetric,
  parseMetricAbbreviation,
  MetricMeasure
} from '../../../src/utils';

describe('Util - Metrics', () => {
  test('Props', () => {
    expect(METRICS.some(t => !(t in MetricProps))).toBe(false);
    expect(Object.keys(Metric).length).toBe(Object.keys(MetricProps).length);
  });

  test('findMetric', () => {
    expect(findMetric('AGILITY')).toBe(Metric.AGILITY);
    expect(findMetric('MAgiC')).toBe(Metric.MAGIC);
    expect(findMetric('Other')).toBe(null);
  });

  test('isSkill', () => {
    expect(isSkill('Other' as Metric)).toBe(false);
    expect(isSkill(Metric.ZULRAH)).toBe(false);
    expect(isSkill(Metric.LAST_MAN_STANDING)).toBe(false);
    expect(isSkill(Metric.WOODCUTTING)).toBe(true);
    expect(isSkill(findMetric('Runecrafting') as Metric)).toBe(true);
  });

  test('isBoss', () => {
    expect(isBoss('Other' as Metric)).toBe(false);
    expect(isBoss(Metric.WOODCUTTING)).toBe(false);
    expect(isBoss(Metric.LAST_MAN_STANDING)).toBe(false);
    expect(isBoss(Metric.ZULRAH)).toBe(true);
    expect(isBoss(findMetric('Obor') as Metric)).toBe(true);
  });

  test('isActivity', () => {
    expect(isActivity('Other' as Metric)).toBe(false);
    expect(isActivity(Metric.WOODCUTTING)).toBe(false);
    expect(isActivity(Metric.ZULRAH)).toBe(false);
    expect(isActivity(Metric.LAST_MAN_STANDING)).toBe(true);
    expect(isActivity(findMetric('Soul Wars Zeal') as Metric)).toBe(true);
  });

  test('isComputedMetric', () => {
    expect(isComputedMetric('Other' as Metric)).toBe(false);
    expect(isComputedMetric(Metric.WOODCUTTING)).toBe(false);
    expect(isComputedMetric(Metric.LAST_MAN_STANDING)).toBe(false);
    expect(isComputedMetric(Metric.EHP)).toBe(true);
    expect(isComputedMetric(findMetric('EHB') as Metric)).toBe(true);
  });

  test('getMetricRankKey', () => {
    expect(getMetricRankKey(Metric.EHP)).toBe('ehpRank');
    expect(getMetricRankKey(Metric.ZALCANO)).toBe('zalcanoRank');
    expect(getMetricRankKey(Metric.WOODCUTTING)).toBe('woodcuttingRank');
    expect(getMetricRankKey(Metric.SOUL_WARS_ZEAL)).toBe('soul_wars_zealRank');
  });

  test('getMetricValueKey', () => {
    expect(getMetricValueKey(Metric.EHP)).toBe('ehpValue');
    expect(getMetricValueKey(Metric.ZALCANO)).toBe('zalcanoKills');
    expect(getMetricValueKey(Metric.WOODCUTTING)).toBe('woodcuttingExperience');
    expect(getMetricValueKey(Metric.SOUL_WARS_ZEAL)).toBe('soul_wars_zealScore');
  });

  test('getMetricMeasure', () => {
    expect(getMetricMeasure(Metric.EHP)).toBe(MetricMeasure.VALUE);
    expect(getMetricMeasure(Metric.ZALCANO)).toBe(MetricMeasure.KILLS);
    expect(getMetricMeasure(Metric.WOODCUTTING)).toBe(MetricMeasure.EXPERIENCE);
    expect(getMetricMeasure(Metric.SOUL_WARS_ZEAL)).toBe(MetricMeasure.SCORE);
  });

  test('getMetricName', () => {
    expect(getMetricName(Metric.EHP)).toBe('EHP');
    expect(getMetricName(Metric.ZALCANO)).toBe('Zalcano');
    expect(getMetricName(Metric.WOODCUTTING)).toBe('Woodcutting');
    expect(getMetricName(Metric.SOUL_WARS_ZEAL)).toBe('Soul Wars Zeal');
  });

  test('getMinimumBossKc', () => {
    expect(getMinimumBossKc(Metric.ATTACK)).toBe(0);
    expect(getMinimumBossKc(Metric.ZALCANO)).toBe(50);
    expect(getMinimumBossKc(Metric.TZTOK_JAD)).toBe(5);
    expect(getMinimumBossKc(Metric.TZKAL_ZUK)).toBe(1);
  });

  test('getParentEfficiencyMetric', () => {
    expect(getParentEfficiencyMetric(Metric.EHP)).toBe(null);
    expect(getParentEfficiencyMetric(Metric.ZALCANO)).toBe(Metric.EHB);
    expect(getParentEfficiencyMetric(Metric.WOODCUTTING)).toBe(Metric.EHP);
    expect(getParentEfficiencyMetric(Metric.SOUL_WARS_ZEAL)).toBe(null);
  });

  test('parseMetricAbbreviation', () => {
    expect(parseMetricAbbreviation('')).toBe(null);
    expect(parseMetricAbbreviation('agility')).toBe(Metric.AGILITY);
    expect(parseMetricAbbreviation('SIRE')).toBe(Metric.ABYSSAL_SIRE);
    expect(parseMetricAbbreviation('corp')).toBe(Metric.CORPOREAL_BEAST);
  });
});
