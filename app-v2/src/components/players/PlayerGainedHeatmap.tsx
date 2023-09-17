import { Metric, Period, PeriodProps } from "@wise-old-man/utils";
import { getPlayerSnapshotTimeline } from "~/services/wiseoldman";
import { calculateGainBuckets } from "~/utils/calcs";
import { CalendarHeatmap } from "../CalendarHeatmap";

interface PlayerGainedHeatmapProps {
  username: string;
  metric: Metric;
}

export async function PlayerGainedHeatmap(props: PlayerGainedHeatmapProps) {
  const { username, metric } = props;

  const timelineData = await getPlayerSnapshotTimeline(
    username,
    metric,
    Period.YEAR,
    undefined,
    undefined
  );

  const minDate = new Date(Date.now() - PeriodProps[Period.YEAR].milliseconds);
  const maxDate = new Date();

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
    <CalendarHeatmap
      data={bucketedData.map((b) => ({
        date: b.date,
        value: b.gained,
      }))}
    />
  );
}

export function PlayerGainedHeatmapSkeleton() {
  return (
    <div className="flex aspect-video w-full items-center justify-center bg-transparent text-gray-200">
      Loading...
    </div>
  );
}
