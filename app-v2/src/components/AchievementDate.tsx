import { Achievement } from "@wise-old-man/utils";
import { formatDatetime, timeago } from "~/utils/dates";
import { cn } from "~/utils/styling";
import { Tooltip, TooltipContent, TooltipTrigger } from "./Tooltip";

const ACCURACY_LEVEL_LABEL = {
  0: "Unknown",
  1: "Weak",
  2: "Decent",
  3: "Good",
};

export function AchievementDate(props: Achievement) {
  const { createdAt, accuracy } = props;

  const accuracyLevel = getAccuracyLevel(accuracy);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="w-32 overflow-hidden">
          <div className="flex items-center gap-x-2">
            <AccuracyMeter accuracyLevel={accuracyLevel} />
            <span className="mt-0.5 inline-block">{timeago.format(createdAt)}</span>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent className="max-w-lg p-0">
        <AchievementAccuracyTooltip date={createdAt} accuracy={accuracy} />
      </TooltipContent>
    </Tooltip>
  );
}

function AchievementAccuracyTooltip(props: { date: Date; accuracy: number | null }) {
  const { accuracy, date } = props;

  const accuracyLevel = getAccuracyLevel(accuracy);

  let accuracyNumber;

  if (accuracy) {
    if (accuracyLevel === 3) accuracyNumber = `< ${Math.ceil(accuracy / 1000 / 60 / 60)} hours`;
    else accuracyNumber = `< ${Math.ceil(accuracy / 1000 / 60 / 60 / 24)} days`;
  }

  return (
    <div className="flex flex-col gap-y-5 pt-4">
      <div className="px-5">
        <div className="mb-1 text-gray-200">Achieved on:</div>
        <div className="text-white">{formatDatetime(date)}</div>
      </div>
      <div className="px-5">
        <div className="mb-1 text-gray-200">Achievement date accuracy:&nbsp;</div>
        <div className="flex items-center gap-x-2 text-white">
          <AccuracyMeter accuracyLevel={accuracyLevel} />
          {ACCURACY_LEVEL_LABEL[accuracyLevel]}
          {accuracyNumber && <>&nbsp;({accuracyNumber})</>}
        </div>
      </div>
      <div className="border-t border-gray-500 px-5 py-4">
        <h3 className="text-sm font-medium text-white">What does accuracy mean?</h3>
        <p className="mt-1 text-body text-gray-200">
          Accuracy is the time span between the player&apos;s last update before the achievement, and
          their first update after the achievement. If a player isn&apos;t updated often, their accuracy
          will be weaker.
        </p>
      </div>
    </div>
  );
}

function AccuracyMeter(props: { accuracyLevel: number }) {
  const { accuracyLevel } = props;

  return (
    <div className="flex items-end gap-x-0.5">
      <div
        className={cn("h-2.5 w-0.5 bg-gray-300", {
          "bg-green-500": accuracyLevel === 3,
        })}
      />
      <div
        className={cn("h-2 w-0.5 bg-gray-300", {
          "bg-yellow-300": accuracyLevel === 2,
          "bg-green-500": accuracyLevel === 3,
        })}
      />
      <div
        className={cn("h-1.5 w-0.5 bg-gray-300", {
          "bg-red-500": accuracyLevel === 1,
          "bg-yellow-300": accuracyLevel === 2,
          "bg-green-500": accuracyLevel === 3,
        })}
      />
    </div>
  );
}

function getAccuracyLevel(accuracy: number | null) {
  if (!accuracy || accuracy === -1) return 0;

  // If accuracy is < 24 hours, it's decently accurate, level 3
  if (accuracy < 1000 * 60 * 60 * 24) {
    return 3;
  }

  // If accuracy is < 7 days, it's somewhat accurate, level 2
  if (accuracy < 1000 * 60 * 60 * 168) {
    return 2;
  }

  // If accuracy is > 7 days, it's not too accurate, level 1
  return 1;
}
