import Link from "next/link";
import { AchievementProgress, SKILL_EXP_AT_99, formatNumber, isSkill } from "@wise-old-man/utils";
import { Label } from "../Label";
import { MetricIcon } from "../Icon";
import { AchievementDate } from "../AchievementDate";

import ArrowRightIcon from "~/assets/arrow_right.svg";

interface PlayerOverviewAchievementsProps {
  username: string;
  achievementsProgress: AchievementProgress[];
}

export function PlayerOverviewAchievements(props: PlayerOverviewAchievementsProps) {
  const { username, achievementsProgress } = props;

  const nearest99s = achievementsProgress
    .filter((a) => isSkill(a.metric) && a.threshold === SKILL_EXP_AT_99 && !a.createdAt)
    .sort((a, b) => b.absoluteProgress - a.absoluteProgress)
    .slice(0, 3);

  const recentAchievements = achievementsProgress
    .filter((a) => !!a.createdAt)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 3);

  return (
    <div className="flex flex-col gap-y-3">
      {nearest99s.length > 0 && (
        <div>
          <Label className="text-xs leading-4 text-gray-200">Nearest 99s</Label>
          <div className="mt-2 flex flex-col gap-y-2">
            {nearest99s.map((a) => (
              <AchievementListItem {...a} key={a.name} />
            ))}
          </div>
          <div className="mt-3 flex justify-end">
            <Link
              href={`/players/${username}/achievements`}
              className="flex items-center text-xs font-medium text-gray-200 hover:underline"
            >
              View all
              <ArrowRightIcon className="ml-1 mt-px h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
      {recentAchievements.length > 0 && (
        <div>
          <Label className="text-xs leading-4 text-gray-200">Recent achievements</Label>
          <div className="mt-2 flex flex-col gap-y-2">
            {recentAchievements.map((a) => (
              <AchievementListItem {...a} key={a.name} />
            ))}
          </div>
          <div className="mt-3 flex justify-end">
            <Link
              href={`/players/${username}/achievements`}
              className="flex items-center text-xs font-medium text-gray-200 hover:underline"
            >
              View all
              <ArrowRightIcon className="ml-1 mt-px h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function AchievementListItem(props: AchievementProgress) {
  return (
    <div className="flex items-center gap-x-4 rounded-lg border border-gray-600 px-4 py-3">
      <MetricIcon metric={props.metric} />
      <div className="flex flex-col gap-y-1">
        <span className="text-sm font-medium">{props.name}</span>
        <span className="text-xs text-gray-200">
          {props.createdAt ? (
            <AchievementDate {...props} />
          ) : (
            <>{formatNumber(props.threshold - Math.max(0, props.currentValue), true)} left</>
          )}
        </span>
      </div>
    </div>
  );
}
