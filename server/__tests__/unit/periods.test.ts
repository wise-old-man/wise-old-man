import { PERIODS, Period, PeriodProps, findPeriod, parsePeriodExpression } from '../../src/utils';

describe('Util - Periods', () => {
  test('Props', () => {
    expect(PERIODS.some(t => !(t in PeriodProps))).toBe(false);
    expect(Object.keys(Period).length).toBe(Object.keys(PeriodProps).length);
  });

  test('findPeriod', () => {
    expect(findPeriod('week')).toBe(Period.WEEK);
    expect(findPeriod('MONTH')).toBe(Period.MONTH);
    expect(findPeriod('Other')).toBe(null);
  });

  test('parsePeriodExpression', () => {
    expect(parsePeriodExpression('week')).toEqual({
      expression: 'week',
      durationMs: PeriodProps[Period.WEEK].milliseconds
    });

    expect(parsePeriodExpression('3w')).toEqual({
      expression: '3w',
      durationMs: 3 * PeriodProps[Period.WEEK].milliseconds
    });

    expect(parsePeriodExpression('1y2m3w')).toEqual({
      expression: '1y2m3w',
      durationMs:
        PeriodProps[Period.YEAR].milliseconds +
        2 * PeriodProps[Period.MONTH].milliseconds +
        3 * PeriodProps[Period.WEEK].milliseconds
    });

    expect(parsePeriodExpression('other')).toEqual(null);
  });
});
