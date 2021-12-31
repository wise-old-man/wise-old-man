const CUSTOM_PERIOD_REGEX = /(\d+y)?(\d+m)?(\d+w)?(\d+d)?(\d+h)?/;

enum Period {
  FIVE_MIN = '5min',
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year'
}

const PeriodProps = {
  [Period.FIVE_MIN]: { name: '5 Min', milliseconds: 300_000 },
  [Period.DAY]: { name: 'Day', milliseconds: 86_400_000 },
  [Period.WEEK]: { name: 'Week', milliseconds: 604_800_000 },
  [Period.MONTH]: { name: 'Month', milliseconds: 2_678_400_000 },
  [Period.YEAR]: { name: 'Year', milliseconds: 31_556_926_000 }
};

const PERIODS = Object.values(Period);

function findPeriod(periodName: string): Period | null {
  for (var [key, value] of Object.entries(PeriodProps)) {
    if (value.name.toUpperCase() === periodName.toUpperCase()) return key as Period;
  }

  return null;
}

function isValidPeriod(period: string): boolean {
  return PERIODS.includes(period as Period);
}

function parsePeriodExpression(periodExpression: string) {
  const fixed = periodExpression.toLowerCase();

  if (isValidPeriod(fixed)) {
    return {
      expression: fixed,
      durationMs: PeriodProps[fixed as Period].milliseconds
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

export { Period, PeriodProps, PERIODS, findPeriod, isValidPeriod, parsePeriodExpression };
