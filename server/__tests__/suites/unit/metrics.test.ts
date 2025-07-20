import { Metric, MetricMeasure, METRICS } from '../../../src/types';
import { getMetricRankKey } from '../../../src/utils/get-metric-rank-key.util';
import { getMetricValueKey } from '../../../src/utils/get-metric-value-key.util';
import {
  getMinimumValue,
  getParentEfficiencyMetric,
  isActivity,
  isBoss,
  isComputedMetric,
  isSkill,
  MetricProps
} from '../../../src/utils/shared';

describe('Util - Metrics', () => {
  test('Props', () => {
    expect(METRICS.some(t => !(t in MetricProps))).toBe(false);
    expect(Object.keys(Metric).length).toBe(Object.keys(MetricProps).length);
  });

  test('isSkill', () => {
    expect(isSkill('Other' as Metric)).toBe(false);
    expect(isSkill(Metric.ZULRAH)).toBe(false);
    expect(isSkill(Metric.LAST_MAN_STANDING)).toBe(false);
    expect(isSkill(Metric.WOODCUTTING)).toBe(true);
  });

  test('isBoss', () => {
    expect(isBoss('Other' as Metric)).toBe(false);
    expect(isBoss(Metric.WOODCUTTING)).toBe(false);
    expect(isBoss(Metric.LAST_MAN_STANDING)).toBe(false);
    expect(isBoss(Metric.ZULRAH)).toBe(true);
  });

  test('isActivity', () => {
    expect(isActivity('Other' as Metric)).toBe(false);
    expect(isActivity(Metric.WOODCUTTING)).toBe(false);
    expect(isActivity(Metric.ZULRAH)).toBe(false);
    expect(isActivity(Metric.LAST_MAN_STANDING)).toBe(true);
  });

  test('isComputedMetric', () => {
    expect(isComputedMetric('Other' as Metric)).toBe(false);
    expect(isComputedMetric(Metric.WOODCUTTING)).toBe(false);
    expect(isComputedMetric(Metric.LAST_MAN_STANDING)).toBe(false);
    expect(isComputedMetric(Metric.EHP)).toBe(true);
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

  test('MetricProps', () => {
    expect(MetricProps[Metric.EHP].measure).toBe(MetricMeasure.VALUE);
    expect(MetricProps[Metric.ZALCANO].measure).toBe(MetricMeasure.KILLS);
    expect(MetricProps[Metric.WOODCUTTING].measure).toBe(MetricMeasure.EXPERIENCE);
    expect(MetricProps[Metric.SOUL_WARS_ZEAL].measure).toBe(MetricMeasure.SCORE);
    expect(MetricProps[Metric.EHP].name).toBe('EHP');
    expect(MetricProps[Metric.ZALCANO].name).toBe('Zalcano');
    expect(MetricProps[Metric.WOODCUTTING].name).toBe('Woodcutting');
    expect(MetricProps[Metric.SOUL_WARS_ZEAL].name).toBe('Soul Wars Zeal');
  });

  test('getMinimumValue', () => {
    expect(getMinimumValue(Metric.ATTACK)).toBe(1);
    expect(getMinimumValue(Metric.ZALCANO)).toBe(5);
    expect(getMinimumValue(Metric.TZTOK_JAD)).toBe(5);
    expect(getMinimumValue(Metric.TZKAL_ZUK)).toBe(1);
    expect(getMinimumValue(Metric.CLUE_SCROLLS_ALL)).toBe(1);
    expect(getMinimumValue(Metric.SOUL_WARS_ZEAL)).toBe(200);
    expect(getMinimumValue(Metric.LAST_MAN_STANDING)).toBe(500);
  });

  test('getParentEfficiencyMetric', () => {
    expect(getParentEfficiencyMetric(Metric.EHP)).toBe(null);
    expect(getParentEfficiencyMetric(Metric.ZALCANO)).toBe(Metric.EHB);
    expect(getParentEfficiencyMetric(Metric.WOODCUTTING)).toBe(Metric.EHP);
    expect(getParentEfficiencyMetric(Metric.SOUL_WARS_ZEAL)).toBe(null);
  });
});
