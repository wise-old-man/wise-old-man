import dynamic from "next/dynamic";
import { Metric, MetricProps, Period } from "@wise-old-man/utils";
import { fetchPlayerTimeline } from "~/services/wiseoldman";

const BarChartSSR = dynamic(() => import("../BarChart"), {
  ssr: false,
  loading: () => <PlayerGainedBarchartSkeleton />,
});

interface PlayerGainedBarchartProps {
  username: string;
  metric: Metric;
}

export async function PlayerGainedBarchart(props: PlayerGainedBarchartProps) {
  const { username, metric } = props;

  const { name, measure } = MetricProps[metric];
  const timelineData = await fetchPlayerTimeline(username, Period.WEEK, metric);

  // Convert the timeseries data into daily (bucket) gains
  const bucketedData = calculateGainBuckets([...timelineData].reverse());

  // If has more than 3 "0 snapshot" days during the week
  if (bucketedData.filter((b) => b.count !== 0).length < 4) {
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

function calculateGainBuckets(data: Array<{ value: number; date: Date }>) {
  const normalizeDate = (date: Date) => {
    const copy = new Date(date.getTime());
    copy.setHours(0, 0, 0, 0);
    return copy;
  };

  const map = new Map<number, { count: number; gained: number }>();

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
