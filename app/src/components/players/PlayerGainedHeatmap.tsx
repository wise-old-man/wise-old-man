"use client";

import { useMemo } from "react";
import { CalendarHeatmap } from "../CalendarHeatmap";
import { calculateGainBuckets } from "~/utils/calcs";

interface PlayerGainedHeatmapProps {
  rawData: Array<{ date: Date; value: number; rank: number }>;
  minDate: Date;
  maxDate: Date;
  view: "values" | "ranks";
}

export function PlayerGainedHeatmap(props: PlayerGainedHeatmapProps) {
  const { rawData, minDate, maxDate, view } = props;

  // Do the bucketing on the client side using the browser's timezone
  const data = useMemo(() => {
    const isShowingRanks = view === "ranks";

    // Convert the timeseries data into daily (bucket) gains
    const bucketedData = calculateGainBuckets(
      (isShowingRanks ? rawData.map((d) => ({ date: d.date, value: d.rank })) : [...rawData]).reverse(),
      minDate,
      maxDate,
    );

    return bucketedData.map((b) => ({
      date: b.date,
      value: b.gained != null ? b.gained * (isShowingRanks ? -1 : 1) : null,
    }));
  }, [rawData, view, minDate, maxDate]);

  // If has no gains on any of the days of the week
  if (data.every((b) => b.value === 0)) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-md border border-gray-600 text-gray-200">
        No gains
      </div>
    );
  }

  return <CalendarHeatmap data={data} />;
}

export function PlayerGainedHeatmapSkeleton() {
  return (
    <div className="flex aspect-[5/1] w-full items-center justify-center bg-transparent text-gray-200">
      Loading...
    </div>
  );
}
