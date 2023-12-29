"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import dynamicImport from "next/dynamic";
import { TimeRangeFilter } from "~/services/wiseoldman";
import { Metric, MetricProps, PeriodProps } from "@wise-old-man/utils";
import { formatDate, formatDatetime } from "~/utils/dates";

const LineChartSSR = dynamicImport(() => import("../LineChart"), {
  ssr: false,
  loading: () => <PlayerGainedChartSkeleton />,
});

interface PlayerGainedChartProps {
  metric: Metric;
  view: "values" | "ranks";
  timeRange: TimeRangeFilter;
  data: Array<{ date: Date; rank: number; value: number }>;
}

export async function PlayerGainedChart(props: PlayerGainedChartProps) {
  const { data, view, metric, timeRange } = props;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [, startTransition] = useTransition();

  function handleTimeRangeSelected(range: [Date, Date]) {
    const [startDate, endDate] = range;

    const nextParams = new URLSearchParams(searchParams);

    // Pad these dates by 1 second in each direction so that the next data set includes them
    nextParams.set("startDate", new Date(startDate.getTime() - 1000).toISOString());
    nextParams.set("endDate", new Date(endDate.getTime() + 1000).toISOString());

    startTransition(() => {
      router.push(`${pathname}?${nextParams.toString()}`, { scroll: false });
    });
  }

  if (data.length < 2 || data.every((d) => d.value === -1)) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-md border border-gray-600 text-gray-200">
        Not enough data
      </div>
    );
  }

  const isShowingRanks = view === "ranks";

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
          name: `${name} ${isShowingRanks ? "rank" : measure}`,
          data: data.map((d) => ({
            value: isShowingRanks ? d.rank : d.value,
            time: d.date.getTime(),
          })),
        },
      ]}
      reversed={isShowingRanks}
      minDate={minDate}
      maxDate={maxDate}
      xAxisLabelFormatter={(timestamp) => {
        // If the timespan is under 3 days long, show hours and minutes too
        if (maxDate.getTime() - minDate.getTime() < 1000 * 60 * 60 * 24 * 3) {
          return formatDatetime(new Date(timestamp), {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          });
        }

        return formatDate(new Date(timestamp), { month: "short", day: "numeric" });
      }}
      onRangeSelected={handleTimeRangeSelected}
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
