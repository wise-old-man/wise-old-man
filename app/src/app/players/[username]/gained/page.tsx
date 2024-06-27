import { Suspense } from "react";
import {
  MeasuredDeltaProgress,
  Metric,
  MetricMeasure,
  MetricProps,
  Period,
  PeriodProps,
  PlayerDeltasMap,
  isActivity,
  isBoss,
  isSkill,
} from "@wise-old-man/utils";
import { cn } from "~/utils/styling";
import { getMetricParam, getTimeRangeFilterParams } from "~/utils/params";
import {
  TimeRangeFilter,
  getPlayerDetails,
  getSnapshotTimelineByPeriod,
  getSnapshotTimelineByDate,
  getPlayerGainsByPeriod,
  getPlayerGainsByDates,
} from "~/services/wiseoldman";
import { FormattedNumber } from "~/components/FormattedNumber";
import { PlayerGainedTable } from "~/components/players/PlayerGainedTable";
import { PlayerGainedTimeCards } from "~/components/players/PlayerGainedTimeCards";
import { PlayerGainedChart, PlayerGainedChartSkeleton } from "~/components/players/PlayerGainedChart";
import { ExpandableChartPanel } from "~/components/players/ExpandableChartPanel";
import {
  PlayerGainedBarchart,
  PlayerGainedBarchartSkeleton,
} from "~/components/players/PlayerGainedBarchart";
import { Await } from "~/components/Await";
import { ChartViewSelect } from "~/components/players/ChartViewSelect";
import { calculateGainBuckets } from "~/utils/calcs";
import { YearlyHeatmapPanel } from "~/components/players/YearlyHeatmapPanel";

export const dynamic = "force-dynamic";

interface PageProps {
  params: {
    username: string;
  };
  searchParams: {
    metric?: string;
    period?: string;
    startDate?: string;
    endDate?: string;
    view?: string;
    excludeInitial?: string;
  };
}

export async function generateMetadata(props: PageProps) {
  const player = await getPlayerDetails(decodeURI(props.params.username));

  return {
    title: `Gained: ${player.displayName}`,
  };
}

export default async function PlayerGainedPage(props: PageProps) {
  const { params, searchParams } = props;

  const username = decodeURI(params.username);
  const excludeInitialHeatmapData = props.searchParams.excludeInitial === "true";

  const metric = getMetricParam(searchParams.metric) || Metric.OVERALL;
  const view = searchParams.view === "ranks" ? "ranks" : "values";

  const timeRange = getTimeRangeFilterParams(new URLSearchParams(searchParams));

  const [player, gains] = await Promise.all([
    getPlayerDetails(username),
    "period" in timeRange
      ? getPlayerGainsByPeriod(username, timeRange.period)
      : getPlayerGainsByDates(username, timeRange.startDate, timeRange.endDate),
  ]);

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <PlayerGainedTimeCards player={player} timeRange={timeRange} earliestDataDate={gains.startsAt} />
      </div>
      <div className="mt-5">
        <PlayerGainedTable player={player} gains={gains.data} metric={metric} timeRange={timeRange}>
          <div className="divide-y divide-gray-500">
            <GainedHeader gains={gains.data} metric={metric} view={view} />
            <CumulativeGainsPanel
              username={username}
              view={view}
              timeRange={timeRange}
              metric={metric}
            />
            <BucketedDailyGainsPanel
              username={username}
              view={view}
              timeRange={timeRange}
              metric={metric}
            />
            <YearlyHeatmapPanel
              username={username}
              metric={metric}
              view={view}
              excludeInitial={excludeInitialHeatmapData}
            />
          </div>
        </PlayerGainedTable>
      </div>
    </div>
  );
}

interface CumulativeGainsPanelProps {
  username: string;
  metric: Metric;
  view: "values" | "ranks";
  timeRange: TimeRangeFilter;
}

function CumulativeGainsPanel(props: CumulativeGainsPanelProps) {
  const { username, view, timeRange, metric } = props;

  const isShowingRanks = view === "ranks";

  const promise =
    "period" in timeRange
      ? getSnapshotTimelineByPeriod(username, metric, timeRange.period)
      : getSnapshotTimelineByDate(username, metric, timeRange.startDate, timeRange.endDate);

  return (
    <ExpandableChartPanel
      id="line-chart"
      className="w-[56rem] !max-w-[calc(100vw-4rem)]"
      titleSlot={<>Cumulative {isShowingRanks ? "ranks" : MetricProps[metric].measure} gained</>}
      descriptionSlot={
        <>
          {"period" in timeRange ? (
            <>
              A timeline of {MetricProps[metric].name}{" "}
              {isShowingRanks ? "rank" : MetricProps[metric].measure} over the past&nbsp;
              <span className="text-white">{PeriodProps[timeRange.period].name.toLowerCase()}</span>
            </>
          ) : (
            <>
              A timeline of {MetricProps[metric].name}{" "}
              {isShowingRanks ? "rank" : MetricProps[metric].measure} during the custom period
            </>
          )}
        </>
      }
    >
      <Suspense fallback={<PlayerGainedChartSkeleton />}>
        <Await promise={promise}>
          {(data) => <PlayerGainedChart data={data} view={view} metric={metric} timeRange={timeRange} />}
        </Await>
      </Suspense>
    </ExpandableChartPanel>
  );
}

interface BucketedDailyGainsPanelProps {
  username: string;
  metric: Metric;
  view: "values" | "ranks";
  timeRange: TimeRangeFilter;
}

function BucketedDailyGainsPanel(props: BucketedDailyGainsPanelProps) {
  const { username, view, metric } = props;

  const isShowingRanks = view === "ranks";

  let timeRange = { ...props.timeRange };

  // Any periods below a week are can't really be bucketed by day, and usually players don't update
  // often enough for us to have enough temporal resolution to bucket by hour or minute.
  // So, just default to week for those periods
  if (
    "period" in timeRange &&
    (timeRange.period === Period.DAY || timeRange.period === Period.FIVE_MIN)
  ) {
    timeRange.period = Period.WEEK;
  }

  const promise =
    "period" in timeRange
      ? getSnapshotTimelineByPeriod(username, metric, timeRange.period)
      : getSnapshotTimelineByDate(username, metric, timeRange.startDate, timeRange.endDate);

  return (
    <ExpandableChartPanel
      id="bar-chart"
      className="w-[56rem] !max-w-[calc(100vw-4rem)]"
      titleSlot={<>Daily {isShowingRanks ? "ranks" : MetricProps[metric].measure} gained</>}
      descriptionSlot={
        <>
          {"period" in timeRange ? (
            <>
              {MetricProps[metric].name} {isShowingRanks ? "ranks" : MetricProps[metric].measure} gains
              over the past&nbsp;
              <span className="text-white">{PeriodProps[timeRange.period].name.toLowerCase()}</span>,
              bucketed by day
            </>
          ) : (
            <>
              {MetricProps[metric].name} {isShowingRanks ? "ranks" : MetricProps[metric].measure} gains
              during the custom period, bucketed by day
            </>
          )}
        </>
      }
    >
      <Suspense fallback={<PlayerGainedBarchartSkeleton />}>
        <Await promise={promise}>
          {(data) => {
            const minDate =
              "period" in timeRange
                ? new Date(Date.now() - PeriodProps[timeRange.period].milliseconds)
                : timeRange.startDate;

            const maxDate = "period" in timeRange ? new Date() : timeRange.endDate;

            // Convert the timeseries data into daily (bucket) gains
            const bucketedData = calculateGainBuckets(
              (isShowingRanks
                ? data.map((d) => ({ date: d.date, value: d.rank }))
                : [...data]
              ).reverse(),
              minDate,
              maxDate
            );

            return (
              <PlayerGainedBarchart
                view={view}
                metric={metric}
                data={bucketedData.map((b) => ({
                  date: b.date,
                  value: b.gained != null ? b.gained * (isShowingRanks ? -1 : 1) : 0,
                }))}
              />
            );
          }}
        </Await>
      </Suspense>
    </ExpandableChartPanel>
  );
}

interface GainedHeaderProps {
  metric: Metric;
  view: "values" | "ranks";
  gains: PlayerDeltasMap;
}

function GainedHeader(props: GainedHeaderProps) {
  const { metric, view, gains } = props;

  const isShowingRanks = view === "ranks";

  let measure = MetricProps[metric].measure as string;
  if (measure === MetricMeasure.EXPERIENCE) measure = "exp.";

  let values: MeasuredDeltaProgress;

  if (isBoss(metric)) {
    values = isShowingRanks ? gains.bosses[metric].rank : gains.bosses[metric].kills;
  } else if (isActivity(metric)) {
    values = isShowingRanks ? gains.activities[metric].rank : gains.activities[metric].score;
  } else if (isSkill(metric)) {
    values = isShowingRanks ? gains.skills[metric].rank : gains.skills[metric].experience;
  } else {
    values = isShowingRanks ? gains.computed[metric].rank : gains.computed[metric].value;
  }

  const { start, end } = values;

  const gained = values.gained * (isShowingRanks ? -1 : 1);
  const gainedPercent = getPercentGained(metric, values) * (isShowingRanks ? -1 : 1);

  return (
    <>
      <div className="flex items-center justify-between p-5">
        <div className="flex flex-col">
          <span className="text-lg font-medium text-white">{MetricProps[metric].name}</span>
          <span className="text-sm text-gray-200">
            <span
              className={cn({
                "text-green-500": gained > 0,
                "text-red-500": gained < 0,
              })}
            >
              <FormattedNumber value={gained} colored /> {isShowingRanks ? "ranks" : measure}{" "}
              {gained >= 0 ? "gained" : ""}
            </span>
          </span>
        </div>
        <div className="w-36">
          <ChartViewSelect metric={metric} />
        </div>
      </div>
      <div className="grid grid-cols-3 divide-x divide-gray-500 ">
        <div className="px-5 py-3">
          <span className="text-xs text-gray-200">Start</span>
          <span className="block text-sm text-white">
            {start === -1 ? "Unranked" : <FormattedNumber value={start} />}
          </span>
        </div>
        <div className="px-5 py-3">
          <span className="text-xs text-gray-200">End</span>
          <span className="block text-sm text-white">
            {end === -1 ? "Unranked" : <FormattedNumber value={end} />}
          </span>
        </div>
        <div className="px-5 py-3">
          <span className="text-xs text-gray-200">%</span>
          <span
            className={cn("flex items-center text-sm text-white", {
              "text-green-500": gainedPercent > 0,
              "text-red-500": gainedPercent < 0,
            })}
          >
            {gainedPercent > 0 ? "+" : ""}
            {Math.abs(gainedPercent * 100).toFixed(2)}%
          </span>
        </div>
      </div>
    </>
  );
}

function getPercentGained(metric: Metric, progress: MeasuredDeltaProgress, includeMinimums = true) {
  if (progress.gained === 0) return 0;

  let minimum = 0;

  if (includeMinimums && (isBoss(metric) || isActivity(metric)))
    minimum = MetricProps[metric].minimumValue - 1;

  const start = Math.max(minimum, progress.start);

  if (start === 0) return 1;

  return (progress.end - start) / start;
}
