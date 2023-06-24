import { Suspense } from "react";
import { Metric, MetricProps, Period, PeriodProps } from "@wise-old-man/utils";
import { timeago } from "~/utils/dates";
import { getMetricParam, getPeriodParam } from "~/utils/params";
import { fetchPlayer, fetchPlayerGains } from "~/services/wiseoldman";
import { PlayerGainedTable } from "~/components/players/PlayerGainedTable";
import { PlayerGainedHeader } from "~/components/players/PlayerGainedHeader";
import {
  PlayerTimelineChart,
  PlayerTimelineChartSkeleton,
} from "~/components/players/PlayerTimelineChart";
import {
  PlayerDailyBarchart,
  PlayerDailyBarchartSkeleton,
} from "~/components/players/PlayerDailyBarchart";

interface PageProps {
  params: {
    username: string;
  };
  searchParams: {
    metric?: string;
    period?: string;
  };
}

export default async function PlayerGainedPage(props: PageProps) {
  const { params, searchParams } = props;

  const username = decodeURI(params.username);

  const metric = getMetricParam(searchParams.metric) || Metric.OVERALL;
  const period = getPeriodParam(searchParams.period) || Period.WEEK;

  const [player, gains] = await Promise.all([fetchPlayer(username), fetchPlayerGains(username, period)]);

  const expDropDate = gains.startsAt
    ? new Date(gains.startsAt.getTime() + PeriodProps[Period.WEEK].milliseconds)
    : null;

  return (
    <div>
      <div className="grid grid-cols-4 gap-x-4">
        <InfoPanel label="Last updated" date={player.updatedAt || new Date()} />
        <InfoPanel label="Last progressed" date={player.lastChangedAt || new Date()} />
        <InfoPanel label="Earliest snapshot in period" date={gains.startsAt} />
        <InfoPanel label="Exp drop in" date={expDropDate} />
      </div>
      <div className="mt-5">
        <PlayerGainedTable player={player} gains={gains.data} metric={metric} period={period}>
          <div className="divide-y divide-gray-500">
            <PlayerGainedHeader gains={gains.data} metric={metric} />
            <CumulativeGainsChart username={username} period={period} metric={metric} />
            <DailyGainsChart username={username} metric={metric} />
          </div>
        </PlayerGainedTable>
      </div>
    </div>
  );
}

interface CumulativeGainsChartProps {
  username: string;
  period: Period;
  metric: Metric;
}

function CumulativeGainsChart(props: CumulativeGainsChartProps) {
  const { period, metric } = props;

  return (
    <div className="p-5">
      <div className="mb-5">
        <h3 className="text-h3 font-medium text-white">
          Cumulative {MetricProps[metric].measure} gained
        </h3>
        <p className="text-body text-gray-200">
          {`A timeline of ${MetricProps[metric].name} ${MetricProps[metric].measure} over the past `}
          <span className="text-white">{PeriodProps[period].name.toLowerCase()}</span>
        </p>
      </div>
      <Suspense key={JSON.stringify(props)} fallback={<PlayerTimelineChartSkeleton />}>
        {/* @ts-expect-error - Server Component  */}
        <PlayerTimelineChart {...props} />
      </Suspense>
    </div>
  );
}

interface DailyGainsChartProps {
  username: string;
  metric: Metric;
}

function DailyGainsChart(props: DailyGainsChartProps) {
  const { metric } = props;

  return (
    <div className="p-5">
      <div className="mb-5">
        <h3 className="text-h3 font-medium text-white">Daily {MetricProps[metric].measure} gained</h3>
        <p className="text-body text-gray-200">
          {MetricProps[metric].name}
          {MetricProps[metric].measure} gains over the past week, bucketed by day
        </p>
      </div>
      <Suspense key={JSON.stringify(props)} fallback={<PlayerDailyBarchartSkeleton />}>
        {/* @ts-expect-error - Server Component  */}
        <PlayerDailyBarchart {...props} />
      </Suspense>
    </div>
  );
}

interface InfoPanelProps {
  label: string;
  date: Date | null;
}

function InfoPanel(props: InfoPanelProps) {
  return (
    <div className="flex flex-col gap-y-1 rounded-lg border border-gray-600 p-4">
      <span className="text-xs text-gray-200">{props.label}</span>
      <span className="text-sm text-white">{props.date ? timeago.format(props.date) : "---"}</span>
    </div>
  );
}
