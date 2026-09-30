import { Suspense } from "react";
import type { Metadata } from "next";
import { MetricType, PlayerType, PlayerTypeProps, formatNumber } from "@wise-old-man/utils";
import { buildPlayerMetadata } from "~/utils/metadata";
import { getPlayerDetails } from "~/services/wiseoldman";
import { PlayerStatsTable } from "~/components/players/PlayerStatsTable";
import { PlayerOverviewWidgets } from "~/components/players/PlayerOverviewWidgets";
import { PlayerOverviewAchievements } from "~/components/players/PlayerOverviewAchievements";
import { PlayerOverviewMemberships } from "~/components/players/PlayerOverviewGroups";
import { PlayerOverviewCompetition } from "~/components/players/PlayerOverviewCompetition";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: {
    username: string;
  };
  searchParams: {
    view?: string;
    levels?: string;
  };
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { params } = props;

  const username = decodeURI(params.username);
  const player = await getPlayerDetails(username);

  const accountType =
    player.type === PlayerType.REGULAR || player.type === PlayerType.UNKNOWN
      ? "player"
      : `(${PlayerTypeProps[player.type].name}) player`;

  const stats = [
    `${formatNumber(player.exp, true)} overall exp`,
    `${formatNumber(Math.round(player.ehp), true)} EHP`,
    `${formatNumber(Math.round(player.ehb), true)} EHB`,
  ].join(", ");

  return {
    ...buildPlayerMetadata(player),
    title: player.displayName,
    description: `${player.displayName} is an OSRS ${accountType} with ${stats} - Track their hiscores, gains, records and achievements`,
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
        <div className="col-span-12 mt-8 flex flex-col gap-y-7 lg:col-span-8 lg:gap-y-4">
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
