import { Activity, Boss, ComputedMetric, Metric, Skill } from '../types';
import { assertNever } from './assert-never.util';
import { isActivity, isBoss, isComputedMetric, isSkill } from './shared';

export type MetricValueKey<M extends Metric> = M extends Skill
  ? `${M}Experience`
  : M extends Boss
    ? `${M}Kills`
    : M extends Activity
      ? `${M}Score`
      : M extends ComputedMetric
        ? `${M}Value`
        : never;

export function getMetricValueKey<M extends Metric>(metric: M): MetricValueKey<M> {
  if (isSkill(metric)) {
    return `${metric}Experience` as MetricValueKey<M>;
  }

  if (isBoss(metric)) {
    return `${metric}Kills` as MetricValueKey<M>;
  }

  if (isActivity(metric)) {
    return `${metric}Score` as MetricValueKey<M>;
  }

  if (isComputedMetric(metric)) {
    return `${metric}Value` as MetricValueKey<M>;
  }

  return assertNever(metric);
}
