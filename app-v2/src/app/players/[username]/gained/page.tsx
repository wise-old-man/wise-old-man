import { Suspense } from "react";
import {
  MeasuredDeltaProgress,
  Metric,
  MetricProps,
  Period,
  PeriodProps,
  PlayerDeltasMap,
  Skill,
  isActivity,
  isBoss,
} from "@wise-old-man/utils";
import { cn } from "~/utils/styling";
import { getMetricParam, getTimeRangeFilterParams } from "~/utils/params";
import { TimeRangeFilter, fetchPlayer, fetchPlayerGains } from "~/services/wiseoldman";
import { FormattedNumber } from "~/components/FormattedNumber";
import { PlayerGainedTable } from "~/components/players/PlayerGainedTable";
import { PlayerGainedTimeCards } from "~/components/players/PlayerGainedTimeCards";
import { PlayerGainedChart, PlayerGainedChartSkeleton } from "~/components/players/PlayerGainedChart";
import {
  PlayerGainedBarchart,
  PlayerGainedBarchartSkeleton,
} from "~/components/players/PlayerGainedBarchart";

interface PageProps {
  params: {
    username: string;
  };
  searchParams: {
    metric?: string;
    period?: string;
    startDate?: string;
    endDate?: string;
  };
}

export async function generateMetadata(props: PageProps) {
  const player = await fetchPlayer(decodeURI(props.params.username));

  return {
    title: `Gained: ${player.displayName}`,
  };
}

export default async function PlayerGainedPage(props: PageProps) {
  const { params, searchParams } = props;

  const username = decodeURI(params.username);

  const metric = getMetricParam(searchParams.metric) || Metric.OVERALL;

  const timeRange = getTimeRangeFilterParams(new URLSearchParams(searchParams));

  const [player, gains] = await Promise.all([
    fetchPlayer(username),
    fetchPlayerGains(username, timeRange),
  ]);

  return (
    <div>
      <div className="grid grid-cols-4 gap-x-4">
        <PlayerGainedTimeCards player={player} timeRange={timeRange} earliestDataDate={gains.startsAt} />
      </div>
      <div className="mt-5">
        <PlayerGainedTable player={player} gains={gains.data} metric={metric} timeRange={timeRange}>
          <div className="divide-y divide-gray-500">
            <GainedHeader gains={gains.data} metric={metric} />
            <CumulativeGainsPanel username={username} timeRange={timeRange} metric={metric} />
            <BucketedDailyGainsPanel username={username} timeRange={timeRange} metric={metric} />
          </div>
        </PlayerGainedTable>
      </div>
    </div>
  );
}

interface CumulativeGainsPanelProps {
  username: string;
  timeRange: TimeRangeFilter;
  metric: Metric;
}

function CumulativeGainsPanel(props: CumulativeGainsPanelProps) {
  const { timeRange, metric } = props;

  return (
    <div className="p-5">
      <div className="mb-5">
        <h3 className="text-h3 font-medium text-white">
          Cumulative {MetricProps[metric].measure} gained
        </h3>
        <p className="text-body text-gray-200">
          {"period" in timeRange ? (
            <>
              A timeline of {MetricProps[metric].name} {MetricProps[metric].measure} over the past&nbsp;
              <span className="text-white">{PeriodProps[timeRange.period].name.toLowerCase()}</span>
            </>
          ) : (
            <>
              A timeline of {MetricProps[metric].name} {MetricProps[metric].measure} during the custom
              period
            </>
          )}
        </p>
      </div>
      <Suspense key={JSON.stringify(props)} fallback={<PlayerGainedChartSkeleton />}>
        {/* @ts-expect-error - Server Component  */}
        <PlayerGainedChart {...props} />
      </Suspense>
    </div>
  );
}

interface BucketedDailyGainsPanelProps {
  username: string;
  timeRange: TimeRangeFilter;
  metric: Metric;
}

function BucketedDailyGainsPanel(props: BucketedDailyGainsPanelProps) {
  const { metric, timeRange } = props;

  return (
    <div className="p-5">
      <div className="mb-5">
        <h3 className="text-h3 font-medium text-white">Daily {MetricProps[metric].measure} gained</h3>
        <p className="text-body text-gray-200">
          {"period" in timeRange ? (
            <>
              {MetricProps[metric].name} {MetricProps[metric].measure} gains over the past&nbsp;
              {PeriodProps[timeRange.period].name.toLowerCase()}, bucketed by day
            </>
          ) : (
            <>
              {MetricProps[metric].name} {MetricProps[metric].measure} gains during the custom period,
              bucketed by day
            </>
          )}
        </p>
      </div>
      <Suspense key={JSON.stringify(props)} fallback={<PlayerGainedBarchartSkeleton />}>
        {/* @ts-expect-error - Server Component  */}
        <PlayerGainedBarchart {...props} timeRange={timeRange} />
      </Suspense>
    </div>
  );
}

interface GainedHeaderProps {
  gains: PlayerDeltasMap;
  metric: Metric;
}

function GainedHeader(props: GainedHeaderProps) {
  const { metric, gains } = props;

  const measure = MetricProps[metric].measure;

  let values: MeasuredDeltaProgress;

  if (isBoss(metric)) {
    values = gains.bosses[metric].kills;
  } else if (isActivity(metric)) {
    values = gains.activities[metric].score;
  } else {
    values = gains.skills[metric as Skill].experience;
  }

  const { gained, start, end } = values;

  const gainedPercent = getPercentGained(metric, values);

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
              <FormattedNumber value={gained} colored /> {measure} {gained >= 0 ? "gained" : ""}
            </span>
          </span>
        </div>
      </div>
      <div className="grid grid-cols-3 divide-x divide-gray-500">
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
