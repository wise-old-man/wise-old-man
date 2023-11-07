import { Metric, MetricProps, Period, PeriodProps, RecordLeaderboardFilter } from "@wise-old-man/utils";
import { getRecordLeaderboard } from "~/services/wiseoldman";
import { PlayerIdentity } from "~/components/PlayerIdentity";
import { FormattedNumber } from "~/components/FormattedNumber";
import { ListTable, ListTableCell, ListTableRow } from "~/components/ListTable";
import { getCountryParam, getMetricParam, getPlayerBuildParam } from "~/utils/params";
import { formatDate } from "~/utils/dates";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: {
    metric?: string;
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

export default async function RecordsLeaderboardsPage(props: PageProps) {
  const { searchParams } = props;

  const filters = {
    metric: getMetricParam(searchParams.metric) || Metric.OVERALL,
    country: getCountryParam(searchParams.country),
    playerBuild: getPlayerBuildParam(searchParams.playerBuild),
  };

  return (
    <>
      <RecordLeaderboard period={Period.DAY} filters={filters} />
      <RecordLeaderboard period={Period.WEEK} filters={filters} />
      <RecordLeaderboard period={Period.MONTH} filters={filters} />
    </>
  );
}

interface RecordLeaderboardProps {
  period: Period;
  filters: Omit<RecordLeaderboardFilter, "period">;
}

async function RecordLeaderboard(props: RecordLeaderboardProps) {
  const { period, filters } = props;

  const data = await getRecordLeaderboard(
    filters.metric,
    period,
    filters.country,
    undefined,
    filters.playerBuild
  );

  return (
    <div>
      <h3 className="pb-3 text-h3 font-bold">{PeriodProps[period].name}</h3>
      {data.length === 0 ? (
        <div className="w-full rounded border border-gray-700 py-10 text-center text-sm text-gray-200">
          No results were found
        </div>
      ) : (
        <ListTable>
          {data.map((roww, index) => {
            const { player, value, updatedAt, metric } = roww;
            const startDate = new Date(updatedAt.getTime() - PeriodProps[period].milliseconds);

            const params = new URLSearchParams({
              metric,
              startDate: startDate.toISOString(),
              endDate: updatedAt.toISOString(),
            });

            return (
              <ListTableRow key={player.username}>
                <ListTableCell className="w-1 pr-1">{index + 1}</ListTableCell>
                <ListTableCell>
                  <PlayerIdentity
                    player={player}
                    caption={formatDate(updatedAt)}
                    href={`/players/${player.displayName}/gained?${params.toString()}`}
                  />
                </ListTableCell>
                <ListTableCell className="w-5 text-right font-medium">
                  <FormattedNumber value={value} colored />
                </ListTableCell>
              </ListTableRow>
            );
          })}
        </ListTable>
      )}
    </div>
  );
}
