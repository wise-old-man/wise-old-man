/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import dynamicImport from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Metric, MetricProps } from "@wise-old-man/utils";
import { useMemo } from "react";
import { calculateGainBuckets } from "~/utils/calcs";

const BarChartSSR = dynamicImport(() => import("../BarChart"), {
  ssr: false,
  loading: () => <PlayerGainedBarchartSkeleton />,
});

interface PlayerGainedBarchartProps {
  metric: Metric;
  view: "values" | "ranks";
  rawData: Array<{ date: Date; value: number; rank: number }>;
  minDate: Date;
  maxDate: Date;
}

export async function PlayerGainedBarchart(props: PlayerGainedBarchartProps) {
  const { rawData, view, metric, minDate, maxDate } = props;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Do the bucketing on the client side using the browser's timezone
  const data = useMemo(() => {
    const isShowingRanks = view === "ranks";

    // Convert the timeseries data into daily (bucket) gains
    const bucketedData = calculateGainBuckets(
      (isShowingRanks
        ? rawData.map((d) => ({ date: d.date, value: d.rank }))
        : [...rawData]
      ).reverse(),
      minDate,
      maxDate
    );

    return bucketedData.map((b) => ({
      date: b.date,
      value: b.gained != null ? b.gained * (isShowingRanks ? -1 : 1) : 0,
    }));
  }, [rawData, view, minDate, maxDate]);

  function handleTimeRangeSelected(range: [Date, Date]) {
    const [startDate, endDate] = range;

    const nextParams = new URLSearchParams(searchParams);

    // Pad these dates by 1 second in each direction so that the next data set includes them
    nextParams.set("startDate", startDate.toISOString());
    nextParams.set("endDate", endDate.toISOString());
    nextParams.set("period", "custom");

    router.push(`${pathname}?${nextParams.toString()}`, { scroll: false });
  }

  const { name, measure } = MetricProps[metric];

  // If has no gains on any of the days of the week
  if (data.every((b) => b.value === 0)) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-md border border-gray-600 text-gray-200">
        No gains
      </div>
    );
  }

  return (
    <BarChartSSR
      name={`${name} ${view === "ranks" ? "ranks" : measure}`}
      data={data}
      onRangeSelected={handleTimeRangeSelected}
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
