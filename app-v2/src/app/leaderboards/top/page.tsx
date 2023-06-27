import { Suspense } from "react";
import { DeltaLeaderboardFilter, Metric, MetricProps, Period, PeriodProps } from "@wise-old-man/utils";
import { fetchDeltasLeaderboards } from "~/services/wiseoldman";
import { PlayerIdentity } from "~/components/PlayerIdentity";
import { FormattedNumber } from "~/components/FormattedNumber";
import { ListTable, ListTableCell, ListTableRow } from "~/components/ListTable";
import { LeaderboardSkeleton } from "~/components/leaderboards/LeaderboardSkeleton";
import {
  getMetricParam,
  getCountryParam,
  getPlayerTypeParam,
  getPlayerBuildParam,
} from "~/utils/params";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: {
    metric?: string;
    playerType?: string;
    playerBuild?: string;
    country?: string;
  };
}

export function generateMetadata(props: PageProps) {
  const { searchParams } = props;

  const metric = getMetricParam(searchParams.metric) || Metric.OVERALL;

  return {
    title: `${MetricProps[metric].name} - Top Leaderboards`,
  };
}

export default async function TopLeaderboardsPageWrapper(props: PageProps) {
  // As of Next.js 13.4.1, modifying searchParams doesn't trigger the page's file-based suspense boundary to re-fallback.
  // So to bypass that until there's a fix, we'll make our manage our own suspense boundary with params as a unique key.
  return (
    <Suspense key={JSON.stringify(props.searchParams)} fallback={<LoadingState />}>
      {/* @ts-expect-error - Server Component  */}
      <TopLeaderboardsPage {...props} />
    </Suspense>
  );
}

async function TopLeaderboardsPage(props: PageProps) {
  const { searchParams } = props;

  const filters = {
    metric: getMetricParam(searchParams.metric) || Metric.OVERALL,
    country: getCountryParam(searchParams.country),
    playerType: getPlayerTypeParam(searchParams.playerType),
    playerBuild: getPlayerBuildParam(searchParams.playerBuild),
  };

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

interface TopLeaderboardProps {
  period: Period;
  filters: Omit<DeltaLeaderboardFilter, "period">;
}

async function TopLeaderboard(props: TopLeaderboardProps) {
  const { period, filters } = props;

  const data = await fetchDeltasLeaderboards({ period, ...filters });

  return (
    <div>
      <h3 className="pb-3 text-h3 font-bold">{PeriodProps[period].name}</h3>
      {data.length === 0 ? (
        <div className="w-full rounded border border-gray-700 py-10 text-center text-sm text-gray-300">
          No results were found
        </div>
      ) : (
        <ListTable>
          {data.map((row, index) => (
            <ListTableRow key={row.player.username}>
              <ListTableCell className="w-1 pr-1">{index + 1}</ListTableCell>
              <ListTableCell>
                <PlayerIdentity
                  player={row.player}
                  href={`/players/${row.player.username}/gained?metric=${filters.metric}&period=${period}`}
                />
              </ListTableCell>
              <ListTableCell className="w-5 text-right font-medium">
                <FormattedNumber value={row.gained} colored />
              </ListTableCell>
            </ListTableRow>
          ))}
        </ListTable>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <>
      <LeaderboardSkeleton period={Period.DAY} />
      <LeaderboardSkeleton period={Period.WEEK} />
      <LeaderboardSkeleton period={Period.MONTH} />
    </>
  );
}
