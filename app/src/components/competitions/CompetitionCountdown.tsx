"use client";

import { padNumber } from "@wise-old-man/utils";
import { useHasMounted } from "~/hooks/useHasMounted";
import { useTicker } from "~/hooks/useTicker";
import { durationBetween } from "~/utils/dates";
import { useCompetitionPageContext } from "./CompetitionPageContext";

export function CompetitionCountdown() {
  const { competition } = useCompetitionPageContext();
  const { startsAt, endsAt } = competition;

  const hasMounted = useHasMounted();

  const now = new Date();

  // Update this component every second (if the competition isn't over)
  useTicker(1000, hasMounted && endsAt > now);

  const isOngoing = startsAt < now && endsAt > now;

  const { days, hours, minutes, seconds } = durationBetween(new Date(), isOngoing ? endsAt : startsAt);

  return (
    <div className="relative flex h-20 w-full items-center justify-around overflow-hidden rounded-lg border border-gray-500 bg-gray-800 px-3 shadow-md">
      <div className="flex flex-col items-center">
        <span className="text-xl font-medium tabular-nums">{padNumber(days)}</span>
        <span className="text-xs text-gray-200">days</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-xl font-medium tabular-nums">{padNumber(hours)}</span>
        <span className="text-xs text-gray-200">hours</span>
      </div>
      <div className="flex flex-col items-center">
        <span suppressHydrationWarning className="text-xl font-medium tabular-nums">
          {padNumber(minutes)}
        </span>
        <span className="text-xs text-gray-200">mins</span>
      </div>
      <div className="flex flex-col items-center">
        <span suppressHydrationWarning className="text-xl font-medium tabular-nums">
          {padNumber(seconds)}
        </span>
        <span className="text-xs text-gray-200">secs</span>
      </div>
    </div>
  );
}
