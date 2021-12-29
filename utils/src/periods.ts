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
    if (value.name === periodName) return key as Period;
  }

  return null;
}

function parsePeriodExpression(periodExpression: string): [string, number] | null {
  const fixed = periodExpression.toLowerCase();

  if (PERIODS.includes(fixed as any)) {
    return [fixed, PeriodProps[fixed].milliseconds];
  }

  const result = fixed.match(CUSTOM_PERIOD_REGEX);

  if (!result || result.length === 0 || result[0] !== fixed) return null;

  const years = result[1] ? parseInt(result[1].replace(/\D/g, '')) : null;
  const months = result[2] ? parseInt(result[2].replace(/\D/g, '')) : null;
  const weeks = result[3] ? parseInt(result[3].replace(/\D/g, '')) : null;
  const days = result[4] ? parseInt(result[4].replace(/\D/g, '')) : null;
  const hours = result[5] ? parseInt(result[5].replace(/\D/g, '')) : null;

  const yearsMs = years ? years * PeriodProps[Period.YEAR].milliseconds : 0;
  const monthsMs = months ? months * PeriodProps[Period.MONTH].milliseconds : 0;
  const weeksMs = weeks ? weeks * PeriodProps[Period.WEEK].milliseconds : 0;
  const daysMs = days ? days * PeriodProps[Period.DAY].milliseconds : 0;
  const hoursMs = hours ? hours * (PeriodProps[Period.DAY].milliseconds / 24) : 0;

  const totalMs = yearsMs + monthsMs + weeksMs + daysMs + hoursMs;

  return [result[0], totalMs];
}

export { Period, PeriodProps, PERIODS, findPeriod, parsePeriodExpression };
