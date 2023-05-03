import { Suspense } from "react";
import { DeltaLeaderboardFilter, Metric, MetricProps, Period, PeriodProps } from "@wise-old-man/utils";
import { apiClient } from "~/utils/api";
import { PlayerIdentity } from "~/components/PlayerIdentity";
import { FormattedNumber } from "~/components/FormattedNumber";
import { ListTable, ListTableCell, ListTableRow } from "~/components/ListTable";
import { LeaderboardSkeleton } from "../_components/LeaderboardSkeleton";
import {
  getMetricParam,
  getCountryParam,
  getPlayerTypeParam,
  getPlayerBuildParam,
} from "~/utils/params";

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

export default async function LeaderboardsPage(props: PageProps) {
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
