import { Period } from '../../types';

export const PeriodProps: Record<Period, { name: string; milliseconds: number }> = {
  [Period.FIVE_MIN]: { name: '5 Min', milliseconds: 300_000 },
  [Period.DAY]: { name: 'Day', milliseconds: 86_400_000 },
  [Period.WEEK]: { name: 'Week', milliseconds: 604_800_000 },
  [Period.MONTH]: { name: 'Month', milliseconds: 2_678_400_000 },
  [Period.YEAR]: { name: 'Year', milliseconds: 31_556_926_000 }
};

export function isPeriod(periodString: string): periodString is Period {
  return periodString in PeriodProps;
}
