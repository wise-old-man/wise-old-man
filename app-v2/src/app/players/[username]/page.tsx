import { MetricType } from "@wise-old-man/utils";
import { fetchPlayer, fetchPlayerAchievementProgress } from "~/services/wiseoldman";
import { PlayerWidgets } from "~/components/players/PlayerWidgets";
import { PlayerStatsTable } from "~/components/players/PlayerStatsTable";
import { PlayerOverviewAchievements } from "~/components/players/PlayerOverviewAchievements";

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

export default async function PlayerPage(props: PageProps) {
  const username = decodeURI(props.params.username);
  const metricType = convertMetricType(props.searchParams.view);
  const showVirtualLevels = props.searchParams.levels === "virtual";

  const [player, achievementsProgress] = await Promise.all([
    fetchPlayer(username),
    fetchPlayerAchievementProgress(username),
  ]);

  return (
    <div>
      <PlayerWidgets {...player} />
      <div className="mt-4 grid grid-cols-12 gap-x-5">
        <div className="col-span-4">
          <PlayerOverviewAchievements achievementsProgress={achievementsProgress} />
        </div>
        <div className="col-span-8 mt-8">
          <PlayerStatsTable
            player={player}
            metricType={metricType}
            showVirtualLevels={showVirtualLevels}
          />
        </div>
      </div>
    </div>
  );
}

function convertMetricType(metricType?: string) {
  if (metricType === "activities") return MetricType.ACTIVITY;
  if (metricType === "bosses") return MetricType.BOSS;
  return MetricType.SKILL;
}
