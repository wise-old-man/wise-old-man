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
import { Container } from "~/components/Container";
import { FormattedNumber } from "~/components/FormattedNumber";
import { Tabs, TabsList, TabsTrigger } from "~/components/Tabs";
import { ListTable, ListTableCell, ListTableRow } from "~/components/ListTable";
import { LeaderboardsFilters } from "./LeaderboardsFilters";

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
  const { section } = params;

  const filters = {
    metric: getMetricParam(searchParams.metric) || Metric.OVERALL,
    country: getCountryParam(searchParams.country),
    playerType: getPlayerTypeParam(searchParams.playerType),
    playerBuild: getPlayerBuildParam(searchParams.playerBuild),
  };

  return (
    <Container>
      <h1 className="mb-8 text-h1 font-bold">Leaderboards</h1>
      <Tabs defaultValue={section}>
        <TabsList>
          <Link href="/leaderboards/top">
            <TabsTrigger value="top">Current Top</TabsTrigger>
          </Link>
          <Link href="/leaderboards/records">
            <TabsTrigger value="records">Records</TabsTrigger>
          </Link>
          <Link href="/leaderboards/efficiency">
            <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
          </Link>
        </TabsList>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
          <LeaderboardsFilters {...filters} />
        </div>
        <div className="mx-auto mt-10 grid max-w-md grid-cols-1 gap-x-4 gap-y-8 lg:max-w-none lg:grid-cols-3">
          <Suspense fallback={<LeaderboardSkeleton period={Period.WEEK} />}>
            {/** @ts-expect-error - Server Component */}
            <Leaderboard period={Period.WEEK} filters={filters} />
          </Suspense>
          <Suspense fallback={<LeaderboardSkeleton period={Period.MONTH} />}>
            {/** @ts-expect-error - Server Component */}
            <Leaderboard period={Period.MONTH} filters={filters} />
          </Suspense>
          <Suspense fallback={<LeaderboardSkeleton period={Period.YEAR} />}>
            {/** @ts-expect-error - Server Component */}
            <Leaderboard period={Period.YEAR} filters={filters} />
          </Suspense>
        </div>
      </Tabs>
    </Container>
  );
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

function LeaderboardSkeleton(props: { period: Period }) {
  const { period } = props;

  return (
    <div>
      <h3 className="pb-3 text-h3 font-bold">{PeriodProps[period].name}</h3>
      <ListTable>
        {[...Array(20)].map((i) => (
          <ListTableRow key={`${period}_skeleton_${i}`}>
            <ListTableCell className="w-1 pr-1">
              <div className="h-4 w-4 animate-pulse rounded-xl bg-gray-600" />
            </ListTableCell>
            <ListTableCell className="flex items-center text-sm text-white">
              <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-gray-600" />
              <div className="ml-2 h-4 w-24 animate-pulse rounded-xl bg-gray-600" />
            </ListTableCell>
            <ListTableCell className="w-5 text-right font-medium">
              <div className="h-5 w-12 animate-pulse rounded-xl bg-gray-600" />
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
