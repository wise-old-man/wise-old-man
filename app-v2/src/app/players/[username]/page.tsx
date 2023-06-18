import { MetricType } from "@wise-old-man/utils";
import { PlayerStatsTable } from "~/components/players/PlayerStatsTable";
import { fetchPlayer } from "~/services/wiseoldman";

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

  const player = await fetchPlayer(username);

  return (
    <div className="grid grid-cols-12 gap-x-5">
      <div className="h-50 col-span-4 rounded-lg border border-gray-500 p-5">dd</div>
      <div className="col-span-8">
        <PlayerStatsTable
          player={player}
          metricType={metricType}
          showVirtualLevels={showVirtualLevels}
        />
      </div>
    </div>
  );
}

function convertMetricType(metricType?: string) {
  if (metricType === "activities") return MetricType.ACTIVITY;
  if (metricType === "bosses") return MetricType.BOSS;
  return MetricType.SKILL;
}
