"use client";

import { useTicker } from "~/hooks/useTicker";
import { TopBanner } from "./TopBanner";
import { durationBetween } from "~/utils/dates";
import { useHasMounted } from "~/hooks/useHasMounted";

const RELEASE_DATE_UTC = `2023-11-15T12:00:00.000Z`;

export function LeagueCountdownBanner() {
  const releaseDate = new Date(RELEASE_DATE_UTC);

  const hasMounted = useHasMounted();

  useTicker(1000, hasMounted);

  const { days, hours, minutes, seconds } = durationBetween(new Date(), releaseDate);

  return (
    <TopBanner
      className="justify-center bg-primary-600"
      body={
        hasMounted ? (
          <p>
            Trailblazer Reloaded League starting in: {days} days, {hours} hours, {minutes} minutes,{" "}
            {seconds} seconds
          </p>
        ) : (
          <p className="invisible">
            Trailblazer Reloaded League starting in: ? days, ? hours, ? minutes, ? seconds
          </p>
        )
      }
    />
  );
}
