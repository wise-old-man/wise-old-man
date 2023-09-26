"use client";

import dynamicImport from "next/dynamic";
import { TimeRangeFilter } from "~/services/wiseoldman";
import { Metric, MetricProps, PeriodProps } from "@wise-old-man/utils";

const LineChartSSR = dynamicImport(() => import("../LineChart"), {
  ssr: false,
  loading: () => <PlayerGainedChartSkeleton />,
});

interface PlayerGainedChartProps {
  metric: Metric;
  timeRange: TimeRangeFilter;
  data: Array<{ date: Date; value: number }>;
}

export async function PlayerGainedChart(props: PlayerGainedChartProps) {
  const { data, metric, timeRange } = props;

  if (data.length < 2 || data.every((d) => d.value === -1)) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-md border border-gray-600 text-gray-200">
        Not enough data
      </div>
    );
  }

  const { name, measure } = MetricProps[metric];

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
          data: data.map((d) => ({ value: d.value, time: d.date.getTime() })),
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
