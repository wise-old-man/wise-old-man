import { MetricType } from "@wise-old-man/utils";
import {
  fetchPlayer,
  fetchPlayerAchievementProgress,
  fetchPlayerMemberships,
  fetchPlayerParticipations,
} from "~/services/wiseoldman";
import { PlayerWidgets } from "~/components/players/PlayerWidgets";
import { PlayerStatsTable } from "~/components/players/PlayerStatsTable";
import { PlayerOverviewAchievements } from "~/components/players/PlayerOverviewAchievements";
import { PlayerOverviewMemberships } from "~/components/players/PlayerOverviewGroups";
import { PlayerOverviewCompetition } from "~/components/players/PlayerOverviewCompetition";

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
  const player = await fetchPlayer(decodeURI(props.params.username));

  return {
    title: player.displayName,
  };
}

export default async function PlayerPage(props: PageProps) {
  const { params, searchParams } = props;

  const username = decodeURI(params.username);
  const metricType = convertMetricType(searchParams.view);

  const [player, memberships, participations, achievementsProgress] = await Promise.all([
    fetchPlayer(username),
    fetchPlayerMemberships(username),
    fetchPlayerParticipations(username),
    fetchPlayerAchievementProgress(username),
  ]);

  return (
    <div>
      <PlayerWidgets {...player} />
      <div className="mt-6 grid grid-cols-12 gap-x-5">
        <div className="col-span-4 flex flex-col gap-y-3">
          <PlayerOverviewCompetition username={username} participations={participations} />
          <PlayerOverviewMemberships username={username} memberships={memberships} />
          <PlayerOverviewAchievements
            username={player.username}
            achievementsProgress={achievementsProgress}
          />
        </div>
        <div className="col-span-8 mt-8">
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

function convertMetricType(metricType?: string) {
  if (metricType === "activities") return MetricType.ACTIVITY;
  if (metricType === "bosses") return MetricType.BOSS;
  return MetricType.SKILL;
}
