import {
  AchievementProgress,
  METRICS,
  Metric,
  MetricMeasure,
  MetricProps,
  MetricType,
  Player,
  REAL_SKILLS,
  formatNumber,
  getLevel,
  isActivity,
  isBoss,
  isSkill,
} from "@wise-old-man/utils";
import { cn } from "~/utils/styling";
import { getPlayerAchievementProgress, getPlayerDetails } from "~/services/wiseoldman";
import { AchievementListItem } from "~/components/AchievementListItem";
import { Label } from "~/components/Label";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/Tooltip";
import { MetricIcon } from "~/components/Icon";
import { QueryLink } from "~/components/QueryLink";
import { AchievementAccuracyTooltip, IncompleteAchievementTooltip } from "~/components/AchievementDate";
import { getBuildHiddenMetrics } from "~/utils/metrics";

export const dynamic = "force-dynamic";

interface PageProps {
  params: {
    username: string;
  };
  searchParams: {
    view?: string;
  };
}

export async function generateMetadata(props: PageProps) {
  const player = await getPlayerDetails(decodeURI(props.params.username));

  return {
    title: `Achievements: ${player.displayName}`,
  };
}

export default async function PlayerAchievements(props: PageProps) {
  const { params, searchParams } = props;

  const metricType = convertMetricType(searchParams.view);

  const player = await getPlayerDetails(decodeURI(params.username));

  const achievements = await getPlayerAchievementProgress(player.username);
  const completedAchievements = achievements.filter((a) => !!a.createdAt);

  const skillAchievements = completedAchievements.filter((a) => isSkill(a.metric));
  const bossAchievements = completedAchievements.filter((a) => isBoss(a.metric));
  const activityAchievements = completedAchievements.filter((a) => isActivity(a.metric));

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <QueryLink query={{ view: null }} shallow={false}>
          <Tab
            label="Skill achievements"
            count={skillAchievements.length}
            isSelected={metricType === MetricType.SKILL}
          />
        </QueryLink>
        <QueryLink query={{ view: "bosses" }} shallow={false}>
          <Tab
            label="Boss achievements"
            count={bossAchievements.length}
            isSelected={metricType === MetricType.BOSS}
          />
        </QueryLink>
        <QueryLink query={{ view: "activities" }} shallow={false}>
          <Tab
            label="Activity achievements"
            count={activityAchievements.length}
            isSelected={metricType === MetricType.ACTIVITY}
          />
        </QueryLink>
      </div>
      <div className="mt-7 grid grid-cols-12 gap-4">
        <div className="col-span-12 grid grid-cols-1 flex-col gap-x-4 gap-y-7 sm:grid-cols-2 xl:col-span-4 xl:flex">
          <RecentAchievements achievements={completedAchievements} metricType={metricType} />
          <NearestAchievements achievements={achievements} metricType={metricType} />
        </div>
        <div className="col-span-12 xl:col-span-8">
          <ProgressTable player={player} achievements={achievements} metricType={metricType} />
        </div>
      </div>
    </div>
  );
}

interface ProgressTableProps {
  player: Player;
  achievements: AchievementProgress[];
  metricType?: MetricType;
}

function ProgressTable(props: ProgressTableProps) {
  const { player, metricType, achievements } = props;

  const hiddenMetrics = getBuildHiddenMetrics(player.build);
  const filteredAchievements = achievements.filter((a) => !hiddenMetrics.includes(a.metric));

  const groups = groupAchievementsByType(filteredAchievements).filter(
    (g) => !metricType || MetricProps[g.metric].type === metricType
  );

  return (
    <div>
      <Label className="text-xs text-gray-200">Achievement progress</Label>
      <div className="mt-2 flex flex-col gap-y-2">
        {groups.map((g) => (
          <ProgressTableRow key={`${g.metric}_${g.measure}`} {...g} />
        ))}
      </div>
    </div>
  );
}

interface ProgressTableRowProps {
  metric: Metric;
  measure: MetricMeasure | "levels";
  achievements: AchievementProgress[];
}

function ProgressTableRow(props: ProgressTableRowProps) {
  const { metric, measure, achievements } = props;

  const isFullyComplete = achievements.every((a) => !!a.createdAt);

  return (
    <div className="flex flex-col justify-between gap-3 rounded-lg border border-gray-500 bg-gray-800 p-4 pb-0 shadow-sm sm:pb-4 md:flex-row md:py-2">
      <div className="flex items-center border-b border-gray-600 pb-4 md:border-b-0 md:pb-0">
        <MetricIcon metric={metric} />
        <span className="ml-2 block text-sm text-white">
          {measure === "levels" ? "Base Stats" : MetricProps[metric].name}
        </span>
      </div>
      <div className="custom-scroll flex grow overflow-x-auto pb-4 sm:pb-0 md:max-w-md lg:max-w-lg xl:max-w-[29rem]">
        <div className="z-[1] flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gray-600 bg-gray-900 text-xs text-gray-200 shadow-md">
          0
        </div>
        {achievements.map((a, idx) => {
          const isDone = !!a.createdAt;
          const previous = idx > 0 ? achievements[idx - 1] : undefined;

          const isInProgress =
            (!previous || previous.relativeProgress === 1) &&
            a.relativeProgress >= 0 &&
            a.relativeProgress < 1;

          return (
            <div
              key={a.threshold}
              className={cn("flex items-center", (isInProgress || isFullyComplete) && "grow")}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="-mx-1 -mr-1 h-3 w-full min-w-[2rem] border-y border-gray-400 bg-gray-900 shadow-md">
                    <div
                      className="h-full w-full border-y-4 border-gray-900 bg-green-500"
                      style={{ width: `${Math.floor(a.relativeProgress * 100)}%` }}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {formatNumber(Math.max(a.currentValue, 0), false)} / {formatNumber(a.threshold, false)}{" "}
                  {a.relativeProgress >= 1
                    ? "(Completed)"
                    : `(${Math.floor(a.relativeProgress * 100)}% to the next tier)`}
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "z-[1] flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gray-600 bg-gray-900 text-xs text-gray-200 shadow-md",
                      isDone && "border-green-500 text-green-500",
                      isInProgress && "text-white"
                    )}
                  >
                    {formatThreshold(a.threshold)}
                  </div>
                </TooltipTrigger>
                <TooltipContent className="p-0">
                  {a.createdAt ? (
                    <AchievementAccuracyTooltip achievement={a} showTitle />
                  ) : (
                    <IncompleteAchievementTooltip achievement={a} />
                  )}
                </TooltipContent>
              </Tooltip>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface RecentAchievementsProps {
  achievements: AchievementProgress[];
  metricType?: MetricType;
}

function RecentAchievements(props: RecentAchievementsProps) {
  const { metricType, achievements } = props;

  const recentAchievements = achievements
    .filter((a) => !metricType || MetricProps[a.metric].type === metricType)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  if (recentAchievements.length === 0) return null;

  return (
    <div>
      <Label className="text-xs text-gray-200">
        Recent {metricType ? `${metricType} ` : ""} achievements
      </Label>
      <div className="mt-2 flex flex-col gap-y-3">
        {recentAchievements.map((a) => (
          <AchievementListItem {...a} key={a.name} />
        ))}
      </div>
    </div>
  );
}

interface NearestAchievementsProps {
  achievements: AchievementProgress[];
  metricType?: MetricType;
}

function NearestAchievements(props: NearestAchievementsProps) {
  const { metricType, achievements } = props;

  const nearestAchievements = achievements
    .filter((a) => (!metricType || MetricProps[a.metric].type === metricType) && !a.createdAt)
    .sort((a, b) => b.absoluteProgress - a.absoluteProgress)
    .slice(0, 5);

  if (nearestAchievements.length === 0) return null;

  return (
    <div>
      <Label className="text-xs text-gray-200">
        Nearest {metricType ? `${metricType} ` : ""} achievements
      </Label>
      <div className="mt-2 flex flex-col gap-y-3">
        {nearestAchievements.map((a) => (
          <AchievementListItem {...a} key={a.name} />
        ))}
      </div>
    </div>
  );
}

interface TabProps {
  label: string;
  count: number;
  isSelected: boolean;
}

function Tab(props: TabProps) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-lg border border-gray-600 bg-gray-800 px-5 py-3 shadow-md transition-colors hover:bg-gray-700",
        props.isSelected && "border-gray-400 bg-gray-700"
      )}
    >
      <span className="text-xl text-white">{props.count}</span>
      <span className="line-clamp-1 text-sm text-gray-200">{props.label}</span>
    </div>
  );
}

function convertMetricType(metricType?: string) {
  if (metricType === "activities") return MetricType.ACTIVITY;
  if (metricType === "bosses") return MetricType.BOSS;
  return MetricType.SKILL;
}

function groupAchievementsByType(achievements: AchievementProgress[]) {
  if (!achievements) {
    return [];
  }

  const groups: Array<{
    metric: Metric;
    measure: MetricMeasure;
    achievements: AchievementProgress[];
  }> = [];

  achievements.forEach((a) => {
    let group = groups.find((g) => g.measure === a.measure && g.metric === a.metric);

    if (!group) {
      group = { metric: a.metric, measure: a.measure as MetricMeasure, achievements: [] };
      groups.push(group);
    }

    group.achievements.push(a);
  });

  return groups.sort((a, b) => METRICS.indexOf(a.metric) - METRICS.indexOf(b.metric));
}

function formatThreshold(threshold: number) {
  if (threshold < 1000) {
    return threshold;
  }

  if (
    [273742, 737627, 1986068, 5346332, 13034431].map((i) => i * REAL_SKILLS.length).includes(threshold)
  ) {
    return getLevel(threshold / REAL_SKILLS.length + 100).toString();
  }

  if (threshold <= 10000) {
    return `${threshold / 1000}k`;
  }

  if (threshold === 13034431) {
    return "99";
  }

  return formatNumber(threshold, true);
}
