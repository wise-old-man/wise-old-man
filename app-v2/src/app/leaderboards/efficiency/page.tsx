import {
  ComputedMetric,
  EfficiencyLeaderboardsFilter,
  Metric,
  MetricProps,
  PlayerBuildProps,
  formatNumber,
} from "@wise-old-man/utils";
import { getEfficiencyLeaderboards } from "~/services/wiseoldman";
import { PlayerIdentity } from "~/components/PlayerIdentity";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/Tooltip";
import { ListTable, ListTableCell, ListTableRow } from "~/components/ListTable";
import {
  getPlayerTypeParam,
  getPlayerBuildParam,
  getComputedMetricParam,
  getCountryParam,
  getPageParam,
} from "~/utils/params";
import { Pagination } from "~/components/Pagination";

const COMBINED_METRIC = "combined";
const RESULTS_PER_PAGE = 30;

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: {
    page?: string;
    metric?: string;
    playerType?: string;
    playerBuild?: string;
    country?: string;
  };
}

export function generateMetadata(props: PageProps) {
  const { searchParams } = props;

  if (searchParams?.metric === COMBINED_METRIC) {
    return {
      title: `EHP + EHB - Efficiency Leaderboards`,
    };
  }

  const metric = getComputedMetricParam(searchParams.metric) || Metric.EHP;

  return {
    title: `${MetricProps[metric as ComputedMetric].name} - Efficiency Leaderboards`,
  };
}

export default async function EfficiencyLeaderboardsPage(props: PageProps) {
  const { searchParams } = props;

  const filters = {
    metric: (getComputedMetricParam(searchParams.metric) || Metric.EHP) as ComputedMetric,
    country: getCountryParam(searchParams.country),
    playerType: getPlayerTypeParam(searchParams.playerType),
    playerBuild: getPlayerBuildParam(searchParams.playerBuild),
    page: getPageParam(searchParams.page) || 1,
  };

  return <EfficiencyLeaderboard filters={filters} />;
}

interface EfficiencyLeaderboardProps {
  filters: {
    metric: ComputedMetric | typeof COMBINED_METRIC;
    page?: string;
  } & Omit<EfficiencyLeaderboardsFilter, "metric">;
}

async function EfficiencyLeaderboard(props: EfficiencyLeaderboardProps) {
  const { metric, page, ...filters } = props.filters;
  
  const pageNumber = parseInt(page || "1");

  const data = await getEfficiencyLeaderboards(
    metric === COMBINED_METRIC ? "ehp+ehb" : metric,
    RESULTS_PER_PAGE,
    (pageNumber - 1) * RESULTS_PER_PAGE,
    filters.country,
    filters.playerType,
    filters.playerBuild,
  );

  return (
    <div className="col-span-3 mx-auto w-full max-w-lg">
      {data.length === 0 ? (
        <>
          <div className="w-full rounded border border-gray-700 py-10 text-center text-sm text-gray-300">
            No results were found
          </div>
          <div className="mt-4">
            <Pagination currentPage={pageNumber} hasMorePages={data.length >= RESULTS_PER_PAGE} />
          </div>
        </>
      ) : (
        <>
          <ListTable>
            {data.map((player, index) => (
              <ListTableRow key={player.username}>
                <ListTableCell className="w-1 pr-1">{pageNumber == 1 ? index + 1 : (index + 1) + ((pageNumber - 1) * RESULTS_PER_PAGE)}</ListTableCell>
                <ListTableCell>
                  <PlayerIdentity player={player} caption={PlayerBuildProps[player.build].name} />
                </ListTableCell>
                <ListTableCell className="w-5 text-right font-medium">
                  {metric === COMBINED_METRIC ? (
                    <>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>{formatNumber(player.ehp + player.ehb)}</span>
                        </TooltipTrigger>
                        <TooltipContent align="start">
                          {formatNumber(player.ehp)} EHP + {formatNumber(player.ehb)} EHB
                        </TooltipContent>
                      </Tooltip>
                    </>
                  ) : (
                    <>{metric === Metric.EHP ? formatNumber(player.ehp) : formatNumber(player.ehb)}</>
                  )}
                </ListTableCell>
              </ListTableRow>
            ))}
          </ListTable>
          <div className="mt-4">
            <Pagination currentPage={pageNumber} hasMorePages={data.length >= RESULTS_PER_PAGE} />
          </div>
        </>
      )}
    </div>
  );
}
