import { Suspense } from "react";
import Link from "next/link";
import {
  DeltaLeaderboardFilter,
  Metric,
  Period,
  PeriodProps,
  isCountry,
  isMetric,
  isPlayerBuild,
  isPlayerType,
} from "@wise-old-man/utils";
import { apiClient } from "~/utils/api";
import { FormattedNumber } from "~/components/FormattedNumber";
import { ListTable, ListTableCell, ListTableRow } from "~/components/ListTable";
import { LeaderboardSkeleton } from "./LeaderboardSkeleton";

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

export default async function LeaderboardsPage(props: LeaderboardsPageProps) {
  const { params, searchParams } = props;
  // const { section } = params;

  const filters = {
    metric: getMetricParam(searchParams.metric) || Metric.OVERALL,
    country: getCountryParam(searchParams.country),
    playerType: getPlayerTypeParam(searchParams.playerType),
    playerBuild: getPlayerBuildParam(searchParams.playerBuild),
  };

  // return (
  //   <>
  //     {/* @ts-expect-error - Server Component  */}
  //     <Leaderboard period={Period.DAY} filters={filters} />
  //     {/* Wrap these in suspense to allow the UI to be shown as soon as day leaderboards are loaded */}
  //     <Suspense fallback={<LeaderboardSkeleton period={Period.WEEK} />}>
  //       {/* @ts-expect-error - Server Component  */}
  //       <Leaderboard period={Period.WEEK} filters={filters} />
  //     </Suspense>
  //     <Suspense fallback={<LeaderboardSkeleton period={Period.MONTH} />}>
  //       {/* @ts-expect-error - Server Component  */}
  //       <Leaderboard period={Period.MONTH} filters={filters} />
  //     </Suspense>
  //   </>
  // );

  return <div>content!</div>;
}

interface LeaderboardProps {
  period: Period;
  filters: Omit<DeltaLeaderboardFilter, "period">;
}

async function Leaderboard(props: LeaderboardProps) {
  const { period, filters } = props;

  const data = await apiClient.deltas.getDeltaLeaderboard({ period, ...filters });

  return (
    <div>
      <h3 className="pb-3 text-h3 font-bold">{PeriodProps[period].name}</h3>
      <ListTable>
        {data.map((row, index) => (
          <ListTableRow key={row.player.username}>
            <ListTableCell className="w-1 pr-1">{index + 1}</ListTableCell>
            <ListTableCell className="flex items-center text-sm text-white">
              <div className="h-8 w-8 shrink-0 rounded-full bg-gray-600" />
              <Link
                href={`/players/${row.player.username}`}
                className="ml-2 line-clamp-1 text-sm font-medium hover:underline"
              >
                {row.player.displayName}
              </Link>
            </ListTableCell>
            <ListTableCell className="w-5 text-right font-medium text-green-400">
              <FormattedNumber value={row.gained} />
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
