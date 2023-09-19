import dynamicImport from "next/dynamic";
import { Metric, MetricProps, PeriodProps } from "@wise-old-man/utils";
import { TimeRangeFilter, getPlayerSnapshotTimeline } from "~/services/wiseoldman";
import { calculateGainBuckets } from "~/utils/calcs";

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
      data={bucketedData.map((b) => ({ date: b.date, value: b.gained || 0 }))}
    />
  );
}

export function PlayerGainedBarchartSkeleton() {
  return (
    <div className="flex aspect-video w-full items-center justify-center bg-transparent text-gray-200">
      Loading...
    </div>
  );
}
