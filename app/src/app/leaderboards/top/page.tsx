import {
  Country,
  Metric,
  MetricProps,
  Period,
  PeriodProps,
  PlayerBuild,
  PlayerType,
} from "@wise-old-man/utils";
import { getDeltaLeaderboard } from "~/services/wiseoldman";
import { PlayerIdentity } from "~/components/PlayerIdentity";
import { FormattedNumber } from "~/components/FormattedNumber";
import { ListTable, ListTableCell, ListTableRow } from "~/components/ListTable";
import {
  getMetricParam,
  getCountryParam,
  getPlayerTypeParam,
  getPlayerBuildParam,
} from "~/utils/params";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

export default async function TopLeaderboardsPage(props: PageProps) {
  const { searchParams } = props;

  const filters = {
    metric: getMetricParam(searchParams.metric) || Metric.OVERALL,
    country: getCountryParam(searchParams.country),
    playerType: getPlayerTypeParam(searchParams.playerType),
    playerBuild: getPlayerBuildParam(searchParams.playerBuild),
  };

  return (
    <>
      <TopLeaderboard period={Period.DAY} filters={filters} />
      <TopLeaderboard period={Period.WEEK} filters={filters} />
      <TopLeaderboard period={Period.MONTH} filters={filters} />
    </>
  );
}

interface TopLeaderboardProps {
  period: Period;
  filters: {
    country?: Country;
    playerType?: PlayerType;
    playerBuild?: PlayerBuild;
    metric: Metric;
  };
}

async function TopLeaderboard(props: TopLeaderboardProps) {
  const { period, filters } = props;

  let data: Awaited<ReturnType<typeof getDeltaLeaderboard>> = [];
  let fetchError = false;

  try {
    data = await getDeltaLeaderboard(
      filters.metric,
      period,
      filters.country,
      filters.playerType,
      filters.playerBuild,
    );
  } catch {
    fetchError = true;
  }

  return (
    <div>
      <h3 className="pb-3 text-h3 font-bold">{PeriodProps[period].name}</h3>
      {fetchError ? (
        <div className="w-full rounded border border-gray-700 py-10 text-center text-sm text-gray-200">
          Could not load leaderboard data for this filter.
        </div>
      ) : data.length === 0 ? (
        <div className="w-full rounded border border-gray-700 py-10 text-center text-sm text-gray-200">
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
