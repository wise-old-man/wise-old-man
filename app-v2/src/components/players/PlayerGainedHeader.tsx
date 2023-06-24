import {
  MetricProps,
  MeasuredDeltaProgress,
  isBoss,
  isActivity,
  Skill,
  PlayerDeltasMap,
  Metric,
} from "@wise-old-man/utils";
import { cn } from "~/utils/styling";
import { FormattedNumber } from "../FormattedNumber";

interface PlayerGainedHeaderProps {
  gains: PlayerDeltasMap;
  metric: Metric;
}

export function PlayerGainedHeader(props: PlayerGainedHeaderProps) {
  const { metric, gains } = props;

  const measure = MetricProps[metric].measure;

  let values: MeasuredDeltaProgress;

  if (isBoss(metric)) {
    values = gains.bosses[metric].kills;
  } else if (isActivity(metric)) {
    values = gains.activities[metric].score;
  } else {
    values = gains.skills[metric as Skill].experience;
  }

  const { gained, start, end } = values;

  const gainedPercent = getPercentGained(metric, values);

  return (
    <>
      <div className="flex items-center justify-between p-5">
        <div className="flex flex-col">
          <span className="text-lg font-medium text-white">{MetricProps[metric].name}</span>
          <span className="text-sm text-gray-200">
            <span
              className={cn({
                "text-green-500": gained > 0,
                "text-red-500": gained < 0,
              })}
            >
              <FormattedNumber value={gained} colored /> {measure} {gained >= 0 ? "gained" : ""}
            </span>
          </span>
        </div>
      </div>
      <div className="grid grid-cols-3 divide-x divide-gray-500">
        <div className="px-5 py-3">
          <span className="text-xs text-gray-200">Start</span>
          <span className="block text-sm text-white">
            {start === -1 ? "Unranked" : <FormattedNumber value={start} />}
          </span>
        </div>
        <div className="px-5 py-3">
          <span className="text-xs text-gray-200">End</span>
          <span className="block text-sm text-white">
            {end === -1 ? "Unranked" : <FormattedNumber value={end} />}
          </span>
        </div>
        <div className="px-5 py-3">
          <span className="text-xs text-gray-200">%</span>
          <span
            className={cn("flex items-center text-sm text-white", {
              "text-green-500": gainedPercent > 0,
              "text-red-500": gainedPercent < 0,
            })}
          >
            {gainedPercent > 0 ? "+" : ""}
            {Math.abs(gainedPercent * 100).toFixed(2)}%
          </span>
        </div>
      </div>
    </>
  );
}

function getPercentGained(metric: Metric, progress: MeasuredDeltaProgress, includeMinimums = true) {
  if (progress.gained === 0) return 0;

  let minimum = 0;

  if (includeMinimums && (isBoss(metric) || isActivity(metric)))
    minimum = MetricProps[metric].minimumValue - 1;

  const start = Math.max(minimum, progress.start);

  if (start === 0) return 1;

  return (progress.end - start) / start;
}
