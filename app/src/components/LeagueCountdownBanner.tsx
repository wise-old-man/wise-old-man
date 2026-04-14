"use client";

import { useTicker } from "~/hooks/useTicker";
import { TopBanner } from "./TopBanner";
import { durationBetween } from "~/utils/dates";
import { useHasMounted } from "~/hooks/useHasMounted";
import { LEAGUE_RELEASE_DATE_UTC } from "~/league";

export function LeagueCountdownBanner() {
  const releaseDate = new Date(LEAGUE_RELEASE_DATE_UTC);
  const hasMounted = useHasMounted();

  useTicker(1000, hasMounted);

  const { days, hours, minutes, seconds } = durationBetween(new Date(), releaseDate);

  if (releaseDate.getTime() < new Date().getTime()) {
    return null;
  }

  return (
    <TopBanner
      color="blue"
      body={
        hasMounted ? (
          <p>
            Demonic Pacts League starting in: {days} days, {hours} hours, {minutes} minutes, {seconds}{" "}
            seconds
          </p>
        ) : (
          <p className="invisible">
            Demonic Pacts League starting in: ? days, ? hours, ? minutes, ? seconds
          </p>
        )
      }
    />
  );
}
