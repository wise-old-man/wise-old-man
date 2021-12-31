import {
  METRICS,
  Metrics,
  MetricProps,
  findMetric,
  Metric,
  isSkill,
  isBoss,
  isActivity,
  isVirtualMetric,
  getMetricRankKey,
  getMetricValueKey,
  getMetricMeasure,
  getMetricName,
  getMinimumBossKc,
  getParentVirtualMetric,
  parseMetricAbbreviation,
  MetricMeasure
} from '../lib/metrics';

describe('Util - Metrics', () => {
  test('Props', () => {
    expect(METRICS.some(t => !(t in MetricProps))).toBe(false);
    expect(Object.keys(Metrics).length).toBe(Object.keys(MetricProps).length);
  });

  test('findMetric', () => {
    expect(findMetric('AGILITY')).toBe(Metrics.AGILITY);
    expect(findMetric('MAgiC')).toBe(Metrics.MAGIC);
    expect(findMetric('Other')).toBe(null);
  });

  test('isSkill', () => {
    expect(isSkill('Other' as Metric)).toBe(false);
    expect(isSkill(Metrics.ZULRAH)).toBe(false);
    expect(isSkill(Metrics.LAST_MAN_STANDING)).toBe(false);
    expect(isSkill(Metrics.WOODCUTTING)).toBe(true);
    expect(isSkill(findMetric('Runecrafting') as Metric)).toBe(true);
  });

  test('isBoss', () => {
    expect(isBoss('Other' as Metric)).toBe(false);
    expect(isBoss(Metrics.WOODCUTTING)).toBe(false);
    expect(isBoss(Metrics.LAST_MAN_STANDING)).toBe(false);
    expect(isBoss(Metrics.ZULRAH)).toBe(true);
    expect(isBoss(findMetric('Obor') as Metric)).toBe(true);
  });

  test('isActivity', () => {
    expect(isActivity('Other' as Metric)).toBe(false);
    expect(isActivity(Metrics.WOODCUTTING)).toBe(false);
    expect(isActivity(Metrics.ZULRAH)).toBe(false);
    expect(isActivity(Metrics.LAST_MAN_STANDING)).toBe(true);
    expect(isActivity(findMetric('Soul Wars Zeal') as Metric)).toBe(true);
  });

  test('isVirtualMetric', () => {
    expect(isVirtualMetric('Other' as Metric)).toBe(false);
    expect(isVirtualMetric(Metrics.WOODCUTTING)).toBe(false);
    expect(isVirtualMetric(Metrics.LAST_MAN_STANDING)).toBe(false);
    expect(isVirtualMetric(Metrics.EHP)).toBe(true);
    expect(isVirtualMetric(findMetric('EHB') as Metric)).toBe(true);
  });

  test('getMetricRankKey', () => {
    expect(getMetricRankKey(Metrics.EHP)).toBe('ehpRank');
    expect(getMetricRankKey(Metrics.ZALCANO)).toBe('zalcanoRank');
    expect(getMetricRankKey(Metrics.WOODCUTTING)).toBe('woodcuttingRank');
    expect(getMetricRankKey(Metrics.SOUL_WARS_ZEAL)).toBe('soul_wars_zealRank');
  });

  test('getMetricValueKey', () => {
    expect(getMetricValueKey(Metrics.EHP)).toBe('ehpValue');
    expect(getMetricValueKey(Metrics.ZALCANO)).toBe('zalcanoKills');
    expect(getMetricValueKey(Metrics.WOODCUTTING)).toBe('woodcuttingExperience');
    expect(getMetricValueKey(Metrics.SOUL_WARS_ZEAL)).toBe('soul_wars_zealScore');
  });

  test('getMetricMeasure', () => {
    expect(getMetricMeasure(Metrics.EHP)).toBe(MetricMeasure.VALUE);
    expect(getMetricMeasure(Metrics.ZALCANO)).toBe(MetricMeasure.KILLS);
    expect(getMetricMeasure(Metrics.WOODCUTTING)).toBe(MetricMeasure.EXPERIENCE);
    expect(getMetricMeasure(Metrics.SOUL_WARS_ZEAL)).toBe(MetricMeasure.SCORE);
  });

  test('getMetricName', () => {
    expect(getMetricName(Metrics.EHP)).toBe('EHP');
    expect(getMetricName(Metrics.ZALCANO)).toBe('Zalcano');
    expect(getMetricName(Metrics.WOODCUTTING)).toBe('Woodcutting');
    expect(getMetricName(Metrics.SOUL_WARS_ZEAL)).toBe('Soul Wars Zeal');
  });

  test('getMinimumBossKc', () => {
    expect(getMinimumBossKc(Metrics.ATTACK)).toBe(0);
    expect(getMinimumBossKc(Metrics.ZALCANO)).toBe(50);
    expect(getMinimumBossKc(Metrics.TZTOK_JAD)).toBe(10);
    expect(getMinimumBossKc(Metrics.TZKAL_ZUK)).toBe(2);
  });

  test('getParentVirtualMetric', () => {
    expect(getParentVirtualMetric(Metrics.EHP)).toBe(null);
    expect(getParentVirtualMetric(Metrics.ZALCANO)).toBe(Metrics.EHB);
    expect(getParentVirtualMetric(Metrics.WOODCUTTING)).toBe(Metrics.EHP);
    expect(getParentVirtualMetric(Metrics.SOUL_WARS_ZEAL)).toBe(null);
  });

  test('parseMetricAbbreviation', () => {
    expect(parseMetricAbbreviation('')).toBe(null);
    expect(parseMetricAbbreviation('agility')).toBe(Metrics.AGILITY);
    expect(parseMetricAbbreviation('SIRE')).toBe(Metrics.ABYSSAL_SIRE);
    expect(parseMetricAbbreviation('corp')).toBe(Metrics.CORPOREAL_BEAST);
  });
});
