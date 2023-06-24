import { Suspense } from "react";
import { Metric, MetricProps, Period, PeriodProps, RecordLeaderboardFilter } from "@wise-old-man/utils";
import { apiClient } from "~/utils/api";
import { PlayerIdentity } from "~/components/PlayerIdentity";
import { FormattedNumber } from "~/components/FormattedNumber";
import { LeaderboardSkeleton } from "~/components/leaderboards/LeaderboardSkeleton";
import { ListTable, ListTableCell, ListTableRow } from "~/components/ListTable";
import {
  getCountryParam,
  getMetricParam,
  getPlayerBuildParam,
  getPlayerTypeParam,
} from "~/utils/params";
import { formatDate } from "~/utils/dates";

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
    title: `${MetricProps[metric].name} - Records Leaderboards`,
  };
}

export default async function RecordsLeaderboardsPageWrapper(props: PageProps) {
  // As of Next.js 13.4.1, modifying searchParams doesn't trigger the page's file-based suspense boundary to re-fallback.
  // So to bypass that until there's a fix, we'll make our manage our own suspense boundary with params as a unique key.
  return (
    <Suspense key={JSON.stringify(props.searchParams)} fallback={<LoadingState />}>
      {/* @ts-expect-error - Server Component  */}
      <RecordsLeaderboardsPage {...props} />
    </Suspense>
  );
}

async function RecordsLeaderboardsPage(props: PageProps) {
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
      <RecordLeaderboard period={Period.DAY} filters={filters} />
      {/* Wrap these in suspense to allow the UI to be shown as soon as day leaderboards are loaded */}
      <Suspense fallback={<LeaderboardSkeleton period={Period.WEEK} hasCaption />}>
        {/* @ts-expect-error - Server Component  */}
        <RecordLeaderboard period={Period.WEEK} filters={filters} />
      </Suspense>
      <Suspense fallback={<LeaderboardSkeleton period={Period.MONTH} hasCaption />}>
        {/* @ts-expect-error - Server Component  */}
        <RecordLeaderboard period={Period.MONTH} filters={filters} />
      </Suspense>
    </>
  );
}

interface RecordLeaderboardProps {
  period: Period;
  filters: Omit<RecordLeaderboardFilter, "period">;
}

async function RecordLeaderboard(props: RecordLeaderboardProps) {
  const { period, filters } = props;

  const data = await apiClient.records.getRecordLeaderboard({ period, ...filters });

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
                <PlayerIdentity player={row.player} caption={formatDate(row.updatedAt)} />
              </ListTableCell>
              <ListTableCell className="w-5 text-right font-medium">
                <FormattedNumber value={row.value} colored />
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
      <LeaderboardSkeleton period={Period.DAY} hasCaption />
      <LeaderboardSkeleton period={Period.WEEK} hasCaption />
      <LeaderboardSkeleton period={Period.MONTH} hasCaption />
    </>
  );
}
