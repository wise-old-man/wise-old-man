"use client";

import { padNumber } from "@wise-old-man/utils";
import { useTicker } from "~/hooks/useTicker";
import { durationBetween } from "~/utils/dates";

interface CompetitionCountdownProps {
  startsAt: Date;
  endsAt: Date;
}

export default function CompetitionCountdown(props: CompetitionCountdownProps) {
  const { startsAt, endsAt } = props;

  const now = new Date();

  // Update this component every second (if the competition isn't over)
  useTicker(1000, endsAt > now);

  const isOngoing = startsAt < now && endsAt > now;

  const progress = getProgress(startsAt, endsAt);
  const { days, hours, minutes, seconds } = durationBetween(new Date(), isOngoing ? endsAt : startsAt);

  return (
    <div className="relative flex h-24 w-full items-center justify-around overflow-hidden rounded-lg border border-gray-500 px-3">
      <div className="flex flex-col items-center">
        <span className="text-2xl font-medium">{padNumber(days)}</span>
        <span className="text-xs text-gray-200">days</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-2xl font-medium">{padNumber(hours)}</span>
        <span className="text-xs text-gray-200">hours</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-2xl font-medium">{padNumber(minutes)}</span>
        <span className="text-xs text-gray-200">minutes</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-2xl font-medium">{padNumber(seconds)}</span>
        <span className="text-xs text-gray-200">seconds</span>
      </div>
      {isOngoing && progress > 0 && (
        <div className="absolute bottom-0 left-0 right-0">
          <div className="h-[2px] bg-green-500" style={{ width: `${Math.floor(progress * 100)}%` }} />
        </div>
      )}
    </div>
  );
}

function getProgress(startsAt: Date, endsAt: Date) {
  const total = endsAt.getTime() - startsAt.getTime();
  const elapsed = Date.now() - startsAt.getTime();

  return elapsed / total;
}
