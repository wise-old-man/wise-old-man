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

  const player = await getPlayerDetails(decodeURI(params.username));

  return {
    title: player.displayName,
  };
}

export default async function PlayerPage(props: PageProps) {
  const { params, searchParams } = props;

  const username = decodeURI(params.username);
  const metricType = convertMetricType(searchParams.view);

  const player = await getPlayerDetails(decodeURI(params.username));

  return (
    <div>
      <PlayerOverviewWidgets {...player} />
      <div className="mt-6 grid grid-cols-12 gap-x-5">
        <div className="col-span-12 flex flex-col gap-y-3 lg:col-span-4">
          <Suspense fallback={<LoadingSkeleton />}>
            <PlayerOverviewCompetition username={username} />
            <PlayerOverviewMemberships username={username} />
            <PlayerOverviewAchievements username={player.username} />
          </Suspense>
        </div>
        <div className="col-span-12 mt-8 lg:col-span-8">
          <PlayerStatsTable
            player={player}
            metricType={metricType}
            showVirtualLevels={searchParams.levels === "virtual"}
          />
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
