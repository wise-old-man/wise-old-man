import dynamicImport from "next/dynamic";
import { Metric, MetricProps, Period, PeriodProps } from "@wise-old-man/utils";
import { TimeRangeFilter, getPlayerSnapshotTimeline } from "~/services/wiseoldman";

const BarChartSSR = dynamicImport(() => import("../BarChart"), {
  ssr: false,
  loading: () => <PlayerGainedBarchartSkeleton />,
});

interface PlayerGainedBarchartProps {
  username: string;
  metric: Metric;
  timeRange: TimeRangeFilter;
}

export async function PlayerGainedBarchart(props: PlayerGainedBarchartProps) {
  const { username, metric, timeRange } = props;

  const { name, measure } = MetricProps[metric];

  const timelineData =
    "period" in timeRange
      ? await getPlayerSnapshotTimeline(username, metric, timeRange.period, undefined, undefined)
      : await getPlayerSnapshotTimeline(
          username,
          metric,
          undefined,
          timeRange.startDate,
          timeRange.endDate
        );

  const minDate =
    "period" in timeRange
      ? new Date(Date.now() - PeriodProps[timeRange.period].milliseconds)
      : timeRange.startDate;

  const maxDate = "period" in timeRange ? new Date() : timeRange.endDate;

  // Convert the timeseries data into daily (bucket) gains
  const bucketedData = calculateGainBuckets([...timelineData].reverse(), minDate, maxDate);

  // If has more than 3 "0 snapshot" days during the week
  if (bucketedData.filter((b) => b.count !== 0).length / bucketedData.length < 0.5) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-md border border-gray-600 text-gray-200">
        Not enough data
      </div>
    );
  }

  // If has no gains on any of the days of the week
  if (bucketedData.every((b) => b.gained === 0)) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-md border border-gray-600 text-gray-200">
        No gains
      </div>
    );
  }

  return (
    <BarChartSSR
      name={`${name} ${measure}`}
      data={bucketedData.map((b) => ({ date: b.date, value: b.gained }))}
    />
  );
}

function calculateGainBuckets(data: Array<{ value: number; date: Date }>, minDate: Date, maxDate: Date) {
  const normalizeDate = (date: Date) => {
    const copy = new Date(date.getTime());
    copy.setHours(0, 0, 0, 0);
    return copy;
  };

  const map = new Map<number, { count: number; gained: number }>();

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
      map.set(current.getTime(), { count: 0, gained: 0 });
    }
    current = normalizeDate(new Date(current.getTime() + PeriodProps[Period.DAY].milliseconds));
  }

  const results: { date: Date; count: number; gained: number }[] = [];

  map.forEach((val, key) => {
    results.push({ ...val, date: new Date(key) });
  });

  return results.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function PlayerGainedBarchartSkeleton() {
  return (
    <div className="flex aspect-video w-full items-center justify-center bg-transparent text-gray-200">
      Loading...
    </div>
  );
}
