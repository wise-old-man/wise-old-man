import { AchievementProgress, formatNumber } from "@wise-old-man/utils";
import { AchievementDate } from "./AchievementDate";
import { MetricIcon } from "./Icon";
import { ProgressCircle } from "./ProgressCircle";

export function AchievementListItem(props: AchievementProgress) {
  return (
    <div className="flex items-center gap-x-4 rounded-lg border border-gray-500 bg-gray-800 px-4 py-3 shadow-sm">
      <MetricIcon metric={props.metric} />
      <div className="flex grow flex-col gap-y-1">
        <span className="line-clamp-1 text-sm font-medium">{props.name}</span>
        <span className="text-xs text-gray-200">
          {props.createdAt ? (
            <AchievementDate {...props} />
          ) : (
            <span className="leading-[1.125rem]">
              {formatNumber(props.threshold - Math.max(0, props.currentValue), true)} left
            </span>
          )}
        </span>
      </div>
      {props.absoluteProgress < 1 && (
        <div className="flex items-center gap-x-2">
          <ProgressCircle percentage={props.absoluteProgress} radius={14} />
          <span className="text-xs font-normal text-gray-200">
            {Math.floor(props.absoluteProgress * 100)}%
          </span>
        </div>
      )}
    </div>
  );
}
