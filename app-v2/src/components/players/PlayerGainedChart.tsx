import dynamicImport from "next/dynamic";
import { Metric, MetricProps, PeriodProps } from "@wise-old-man/utils";
import { TimeRangeFilter, apiClient } from "~/services/wiseoldman";

const LineChartSSR = dynamicImport(() => import("../LineChart"), {
  ssr: false,
  loading: () => <PlayerGainedChartSkeleton />,
});

export const runtime = "edge";
export const dynamic = "force-dynamic";

interface PlayerGainedChartProps {
  username: string;
  timeRange: TimeRangeFilter;
  metric: Metric;
}

export async function PlayerGainedChart(props: PlayerGainedChartProps) {
  const { username, timeRange, metric } = props;

  const { name, measure } = MetricProps[metric];

  const timelineData = await apiClient.players.getPlayerSnapshotTimeline(username, metric, timeRange);

  if (timelineData.length < 2 || timelineData.every((d) => d.value === -1)) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-md border border-gray-600 text-gray-200">
        Not enough data
      </div>
    );
  }

  const minDate =
    "period" in timeRange
      ? new Date(Date.now() - PeriodProps[timeRange.period].milliseconds)
      : timeRange.startDate;

  const maxDate = "period" in timeRange ? new Date() : timeRange.endDate;

  return (
    <LineChartSSR
      datasets={[
        {
          name: `${name} ${measure}`,
          data: timelineData.map((d) => ({ value: d.value, time: d.date.getTime() })),
        },
      ]}
      minDate={minDate}
      maxDate={maxDate}
    />
  );
}

export function PlayerGainedChartSkeleton() {
  return (
    <div className="flex aspect-video w-full items-center justify-center bg-transparent text-gray-200">
      Loading...
    </div>
  );
}
