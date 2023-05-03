import { Suspense } from "react";
import {
  DeltaLeaderboardFilter,
  Metric,
  MetricProps,
  Period,
  PeriodProps,
  isCountry,
  isMetric,
  isPlayerBuild,
  isPlayerType,
} from "@wise-old-man/utils";
import { apiClient } from "~/utils/api";
import { PlayerIdentity } from "~/components/PlayerIdentity";
import { FormattedNumber } from "~/components/FormattedNumber";
import { LeaderboardSkeleton } from "./components/LeaderboardSkeleton";
import { ListTable, ListTableCell, ListTableRow } from "~/components/ListTable";

interface LeaderboardsPageProps {
  params: {
    section: string;
  };
  searchParams: {
    metric?: string;
    playerType?: string;
    playerBuild?: string;
    country?: string;
  };
}

export function generateMetadata(props: LeaderboardsPageProps) {
  const { params, searchParams } = props;
  const { section } = params;

  const metric = getMetricParam(searchParams.metric) || Metric.OVERALL;
  const sectionName = section === "records" ? "Records" : "Top";

  return {
    title: `${MetricProps[metric].name} - ${sectionName} Leaderboards`,
  };
}

export default async function LeaderboardsPage(props: LeaderboardsPageProps) {
  const { params, searchParams } = props;
  const { section } = params;

  const filters = {
    metric: getMetricParam(searchParams.metric) || Metric.OVERALL,
    country: getCountryParam(searchParams.country),
    playerType: getPlayerTypeParam(searchParams.playerType),
    playerBuild: getPlayerBuildParam(searchParams.playerBuild),
  };

  if (section === "top") {
    return (
      <>
        {/* @ts-expect-error - Server Component  */}
        <TopLeaderboard period={Period.DAY} filters={filters} />
        {/* Wrap these in suspense to allow the UI to be shown as soon as day leaderboards are loaded */}
        <Suspense fallback={<LeaderboardSkeleton period={Period.WEEK} />}>
          {/* @ts-expect-error - Server Component  */}
          <TopLeaderboard period={Period.WEEK} filters={filters} />
        </Suspense>
        <Suspense fallback={<LeaderboardSkeleton period={Period.MONTH} />}>
          {/* @ts-expect-error - Server Component  */}
          <TopLeaderboard period={Period.MONTH} filters={filters} />
        </Suspense>
      </>
    );
  }

  if (section === "records") {
    return (
      <>
        {/* @ts-expect-error - Server Component  */}
        <RecordLeaderboard period={Period.DAY} filters={filters} />
        {/* Wrap these in suspense to allow the UI to be shown as soon as day leaderboards are loaded */}
        <Suspense fallback={<LeaderboardSkeleton period={Period.WEEK} />}>
          {/* @ts-expect-error - Server Component  */}
          <RecordLeaderboard period={Period.WEEK} filters={filters} />
        </Suspense>
        <Suspense fallback={<LeaderboardSkeleton period={Period.MONTH} />}>
          {/* @ts-expect-error - Server Component  */}
          <RecordLeaderboard period={Period.MONTH} filters={filters} />
        </Suspense>
      </>
    );
  }

  return <>Not yet implemented.</>;
}

interface LeaderboardProps {
  period: Period;
  filters: Omit<DeltaLeaderboardFilter, "period">;
}

async function TopLeaderboard(props: LeaderboardProps) {
  const { period, filters } = props;

  const data = await apiClient.deltas.getDeltaLeaderboard({ period, ...filters });

  return (
    <div>
      <h3 className="pb-3 text-h3 font-bold">{PeriodProps[period].name}</h3>
      <ListTable>
        {data.map((row, index) => (
          <ListTableRow key={row.player.username}>
            <ListTableCell className="w-1 pr-1">{index + 1}</ListTableCell>
            <ListTableCell>
              <PlayerIdentity player={row.player} />
            </ListTableCell>
            <ListTableCell className="w-5 text-right font-medium text-green-400">
              +<FormattedNumber value={row.gained} />
            </ListTableCell>
          </ListTableRow>
        ))}
      </ListTable>
    </div>
  );
}

async function RecordLeaderboard(props: LeaderboardProps) {
  const { period, filters } = props;

  const data = await apiClient.records.getRecordLeaderboard({ period, ...filters });

  return (
    <div>
      <h3 className="pb-3 text-h3 font-bold">{PeriodProps[period].name}</h3>
      <ListTable>
        {data.map((row, index) => (
          <ListTableRow key={row.player.username}>
            <ListTableCell className="w-1 pr-1">{index + 1}</ListTableCell>
            <ListTableCell>
              <PlayerIdentity player={row.player} caption={formatRecordDate(row.updatedAt)} />
            </ListTableCell>
            <ListTableCell className="w-5 text-right font-medium text-green-400">
              +<FormattedNumber value={row.value} />
            </ListTableCell>
          </ListTableRow>
        ))}
      </ListTable>
    </div>
  );
}

function getMetricParam(param: string | undefined) {
  if (!param) return undefined;
  if (!isMetric(param)) return undefined;
  return param;
}

function getPlayerTypeParam(param: string | undefined) {
  if (!param) return undefined;
  if (!isPlayerType(param)) return undefined;
  return param;
}

function getPlayerBuildParam(param: string | undefined) {
  if (!param) return undefined;
  if (!isPlayerBuild(param)) return undefined;
  return param;
}

function getCountryParam(param: string | undefined) {
  if (!param) return undefined;
  if (!isCountry(param)) return undefined;
  return param;
}

function formatRecordDate(date: Date) {
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
