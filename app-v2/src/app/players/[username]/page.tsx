import { Suspense } from "react";
import { MetricType } from "@wise-old-man/utils";
import { getPlayerDetails } from "~/services/wiseoldman";
import { PlayerStatsTable } from "~/components/players/PlayerStatsTable";
import { PlayerOverviewWidgets } from "~/components/players/PlayerOverviewWidgets";
import { PlayerOverviewAchievements } from "~/components/players/PlayerOverviewAchievements";
import { PlayerOverviewMemberships } from "~/components/players/PlayerOverviewGroups";
import { PlayerOverviewCompetition } from "~/components/players/PlayerOverviewCompetition";

export const dynamic = "force-dynamic";

interface PageProps {
  params: {
    username: string;
  };
  searchParams: {
    view?: string;
    levels?: string;
  };
}

export async function generateMetadata(props: PageProps) {
  const { params } = props;

  const username = decodeURI(params.username);
  const player = await getPlayerDetails(username);

  return {
    title: player.displayName,
  };
}

export default async function PlayerPage(props: PageProps) {
  const { params, searchParams } = props;

  const username = decodeURI(params.username);
  const metricType = convertMetricType(searchParams.view);

  const player = await getPlayerDetails(username);

  return (
    <div>
      <div className="mt-6 grid grid-cols-12 gap-x-5">
        <div className="col-span-12 flex flex-col gap-y-3 lg:col-span-4">
          <Suspense fallback={<LoadingSkeleton />}>
            <PlayerOverviewCompetition username={username} />
            <PlayerOverviewMemberships username={username} />
            <PlayerOverviewAchievements player={player} />
          </Suspense>
        </div>
        <div className="col-span-12 mt-8 flex flex-col gap-y-4 lg:col-span-8">
          <PlayerOverviewWidgets {...player} />
          {player.latestSnapshot ? (
            <PlayerStatsTable
              player={player}
              metricType={metricType}
              showVirtualLevels={searchParams.levels === "virtual"}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center rounded-lg border border-gray-500 p-20">
              <p className="text-center text-body text-gray-200">
                Last time we checked, this player could not be found on the hiscores. This could either
                be because that username is incorrect, or because the player is not yet ranked on any
                skill on the hiscores.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div>
      <div className="mb-3 mt-1 h-4 w-20 animate-pulse rounded-full bg-gray-700" />
      <div className="mb-3 h-16 animate-pulse rounded-lg border border-gray-700 bg-gray-800" />
      <div className="mb-3 h-16 animate-pulse rounded-lg border border-gray-700 bg-gray-800" />
      <div className="mb-3 h-16 animate-pulse rounded-lg border border-gray-700 bg-gray-800" />
    </div>
  );
}

function convertMetricType(metricType?: string) {
  if (metricType === "activities") return MetricType.ACTIVITY;
  if (metricType === "bosses") return MetricType.BOSS;
  return MetricType.SKILL;
}
