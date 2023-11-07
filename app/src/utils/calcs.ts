import { PeriodProps, Period } from "@wise-old-man/utils";

export function calculateGainBuckets(
  data: Array<{ value: number; date: Date }>,
  minDate: Date,
  maxDate: Date
) {
  const normalizeDate = (date: Date) => {
    const copy = new Date(date.getTime());
    copy.setHours(0, 0, 0, 0);
    return copy;
  };

  const map = new Map<number, { count: number; gained: number | null }>();

  if (data.length > 0) {
    let previousLastValue = data[0].value;
    let currentDay = normalizeDate(data[0].date);

    for (let i = 1; i < data.length; i++) {
      const normalized = normalizeDate(data[i].date);

      if (currentDay.getTime() !== normalized.getTime()) {
        previousLastValue = data[i - 1].value;
        currentDay = normalized;
      }

      const entry = map.get(currentDay.getTime());
      const gained = data[i].value - previousLastValue;

      if (entry) {
        entry.count++;
        entry.gained = gained;
      } else {
        map.set(currentDay.getTime(), { count: 1, gained });
      }
    }
  }

  // go between min and max date and fill in missing days
  let current = normalizeDate(minDate);
  while (current.getTime() <= maxDate.getTime()) {
    if (!map.has(current.getTime())) {
      map.set(current.getTime(), { count: 0, gained: null });
    }
    current = new Date(current.getTime() + PeriodProps[Period.DAY].milliseconds);
  }

  const results: { date: Date; count: number; gained: number | null }[] = [];

  map.forEach((val, key) => {
    results.push({ ...val, date: new Date(key) });
  });

  return results.sort((a, b) => a.date.getTime() - b.date.getTime());
}
