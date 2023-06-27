import { Suspense } from "react";
import {
  ComputedMetric,
  EfficiencyLeaderboardsFilter,
  Metric,
  MetricProps,
  PlayerBuildProps,
  formatNumber,
} from "@wise-old-man/utils";
import { fetchEfficiencyLeaderboards } from "~/services/wiseoldman";
import { PlayerIdentity } from "~/components/PlayerIdentity";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/Tooltip";
import { ListTable, ListTableCell, ListTableRow } from "~/components/ListTable";
import { LeaderboardSkeleton } from "~/components/leaderboards/LeaderboardSkeleton";
import {
  getPlayerTypeParam,
  getPlayerBuildParam,
  getComputedMetricParam,
  getCountryParam,
} from "~/utils/params";

const COMBINED_METRIC = "combined";

export const runtime = "edge";
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

export default async function EfficiencyLeaderboardsPageWrapper(props: PageProps) {
  // As of Next.js 13.4.1, modifying searchParams doesn't trigger the page's file-based suspense boundary to re-fallback.
  // So to bypass that until there's a fix, we'll make our manage our own suspense boundary with params as a unique key.
  return (
    <Suspense key={JSON.stringify(props.searchParams)} fallback={<LoadingState />}>
      {/* @ts-expect-error - Server Component  */}
      <EfficiencyLeaderboardsPage {...props} />
    </Suspense>
  );
}

async function EfficiencyLeaderboardsPage(props: PageProps) {
  const { searchParams } = props;

  const filters = {
    metric: getComputedMetricParam(searchParams.metric) || Metric.EHP,
    country: getCountryParam(searchParams.country),
    playerType: getPlayerTypeParam(searchParams.playerType),
    playerBuild: getPlayerBuildParam(searchParams.playerBuild),
  };

  return (
    <>
      {/* @ts-expect-error - Server Component  */}
      <EfficiencyLeaderboard filters={filters} />
    </>
  );
}

interface EfficiencyLeaderboardProps {
  filters: {
    metric: ComputedMetric | typeof COMBINED_METRIC;
  } & Omit<EfficiencyLeaderboardsFilter, "metric">;
}

async function EfficiencyLeaderboard(props: EfficiencyLeaderboardProps) {
  const { metric, ...filters } = props.filters;

  const data = await fetchEfficiencyLeaderboards({
    metric: metric === COMBINED_METRIC ? "ehp+ehb" : metric,
    ...filters,
  });

  return (
    <div className="col-span-3 mx-auto w-full max-w-lg">
      {data.length === 0 ? (
        <div className="w-full rounded border border-gray-700 py-10 text-center text-sm text-gray-300">
          No results were found
        </div>
      ) : (
        <ListTable>
          {data.map((player, index) => (
            <ListTableRow key={player.username}>
              <ListTableCell className="w-1 pr-1">{index + 1}</ListTableCell>
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
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="col-span-3 mx-auto w-full max-w-lg">
      <LeaderboardSkeleton hasCaption />
    </div>
  );
}
