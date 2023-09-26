"use client";

import { CalendarHeatmap } from "../CalendarHeatmap";

interface PlayerGainedHeatmapProps {
  data: Array<{ date: Date; value: number | null }>;
}

export function PlayerGainedHeatmap(props: PlayerGainedHeatmapProps) {
  const { data } = props;

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
