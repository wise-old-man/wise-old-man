import { Suspense } from "react";
import { Metric, MetricProps, Period, PeriodProps } from "@wise-old-man/utils";
import { getSnapshotTimelineByPeriod } from "~/services/wiseoldman";
import { ExpandableChartPanel } from "~/components/players/ExpandableChartPanel";
import {
  PlayerGainedHeatmap,
  PlayerGainedHeatmapSkeleton,
} from "~/components/players/PlayerGainedHeatmap";
import { Await } from "~/components/Await";
import { calculateGainBuckets } from "~/utils/calcs";
import { HeatmapOptionsMenu } from "./HeatmapOptionsMenu";

interface YearlyHeatmapPanelProps {
  username: string;
  metric: Metric;
  excludeInitial: boolean;
  view: "values" | "ranks";
}
export function YearlyHeatmapPanel(props: YearlyHeatmapPanelProps) {
  const { username, metric, view, excludeInitial } = props;

  const isShowingRanks = view === "ranks";

  const promise = getSnapshotTimelineByPeriod(username, metric, Period.YEAR);

  return (
    <ExpandableChartPanel
      id="year-heatmap"
      className="w-[56rem] !max-w-[calc(100vw-4rem)]"
      titleSlot={<>Gains heatmap</>}
      optionsSlot={<HeatmapOptionsMenu username={username} excludeInitialLoad={excludeInitial} />}
      descriptionSlot={
        <>
          A heatmap of the past <span className="text-white">year&apos;s</span>&nbsp;
          {MetricProps[metric].name} {isShowingRanks ? "rank" : MetricProps[metric].measure} gains
        </>
      }
    >
      <Suspense fallback={<PlayerGainedHeatmapSkeleton />}>
        <Await promise={promise}>
          {(data) => {
            const minDate = new Date(Date.now() - PeriodProps[Period.YEAR].milliseconds);
            const maxDate = new Date();

            // Convert the timeseries data into daily (bucket) gains
            const bucketedData = calculateGainBuckets(
              (isShowingRanks
                ? data
                    .filter((x) => x.date === new Date(2024, 0, 10))
                    .map((d) => ({ date: d.date, value: d.rank }))
                : [...data]
              ).reverse(),
              minDate,
              maxDate
            );
            return (
              <PlayerGainedHeatmap
                excludeInitial={props.excludeInitial}
                username={props.username}
                data={bucketedData.map((b) => ({
                  date: b.date,
                  value: b.gained != null ? b.gained * (isShowingRanks ? -1 : 1) : null,
                }))}
              ></PlayerGainedHeatmap>
            );
          }}
        </Await>
      </Suspense>
    </ExpandableChartPanel>
  );
}
