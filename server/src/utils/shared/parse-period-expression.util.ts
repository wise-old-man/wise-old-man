import { isPeriod, PeriodProps } from '.';
import { Period } from '../../types';

const CUSTOM_PERIOD_REGEX = /(\d+y)?(\d+m)?(\d+w)?(\d+d)?(\d+h)?/;

export function parsePeriodExpression(periodExpression: string) {
  const fixed = periodExpression.toLowerCase();

  if (isPeriod(fixed)) {
    return {
      expression: fixed,
      durationMs: PeriodProps[fixed].milliseconds
    };
  }

  const result = fixed.match(CUSTOM_PERIOD_REGEX);

  if (!result || result.length === 0 || result[0] !== fixed) return null;

  const years = result[1] ? parseInt(result[1].replace(/\D/g, '')) : 0;
  const months = result[2] ? parseInt(result[2].replace(/\D/g, '')) : 0;
  const weeks = result[3] ? parseInt(result[3].replace(/\D/g, '')) : 0;
  const days = result[4] ? parseInt(result[4].replace(/\D/g, '')) : 0;
  const hours = result[5] ? parseInt(result[5].replace(/\D/g, '')) : 0;

  const yearsMs = years * PeriodProps[Period.YEAR].milliseconds;
  const monthsMs = months * PeriodProps[Period.MONTH].milliseconds;
  const weeksMs = weeks * PeriodProps[Period.WEEK].milliseconds;
  const daysMs = days * PeriodProps[Period.DAY].milliseconds;
  const hoursMs = hours * (PeriodProps[Period.DAY].milliseconds / 24);

  const totalMs = yearsMs + monthsMs + weeksMs + daysMs + hoursMs;

  return {
    expression: result[0],
    durationMs: totalMs
  };
}
