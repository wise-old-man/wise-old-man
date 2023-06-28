import { AchievementProgress, formatNumber } from "@wise-old-man/utils";
import { AchievementDate } from "./AchievementDate";
import { MetricIcon } from "./Icon";

export function AchievementListItem(props: AchievementProgress) {
  return (
    <div className="flex items-center gap-x-4 rounded-lg border border-gray-600 px-4 py-3">
      <MetricIcon metric={props.metric} />
      <div className="flex flex-col gap-y-1">
        <span className="line-clamp-1 text-sm font-medium">{props.name}</span>
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
