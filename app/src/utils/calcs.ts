import {
  Metric,
  MetricProps,
  ParticipantHistoryResponse,
  isActivity,
  isBoss,
} from "@wise-old-man/utils";

/**
 * Converts a participant's value history into a timeseries of gains, relative to their
 * value at the start of the competition.
 */
export function convertToDiffTimeseries(
  metric: Metric | undefined,
  history: ParticipantHistoryResponse["history"],
) {
  if (history.length === 0) return [];

  // The API returns -1 when the player was unranked in the metric (or in all of them, for "total").
  // For boss/activity metrics we approximate it as "just below the minimum", everything else uses 0.
  const unrankedValue =
    metric && (isBoss(metric) || isActivity(metric)) ? MetricProps[metric].minimumValue - 1 : 0;

  const sanitizedPoints = [...history]
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map((p) => {
      return { time: p.date, value: p.value === -1 ? unrankedValue : p.value };
    });

  const diffPoints = sanitizedPoints.map((p) => ({
    time: p.time.getTime(),
    value: p.value - sanitizedPoints[0].value,
  }));

  return [...dedupeByValue(diffPoints.slice(0, -1)), diffPoints[diffPoints.length - 1]];
}

function dedupeByValue(points: Array<{ value: number; time: number }>) {
  const map = new Map<number, (typeof points)[number]>();

  points.forEach((p) => {
    if (!map.has(p.value)) {
      map.set(p.value, p);
    }
  });

  return Array.from(map.values());
}

export function calculateGainBuckets(
  data: Array<{ value: number; date: Date }>,
  minDate: Date,
  maxDate: Date,
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
    current.setDate(current.getDate() + 1);
  }

  const results: { date: Date; count: number; gained: number | null }[] = [];

  map.forEach((val, key) => {
    results.push({ ...val, date: new Date(key) });
  });

  return results.sort((a, b) => a.date.getTime() - b.date.getTime());
}
