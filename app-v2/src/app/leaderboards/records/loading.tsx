import { Period } from "@wise-old-man/utils";
import { LeaderboardSkeleton } from "~/components/leaderboards/LeaderboardSkeleton";

export default function Loading() {
  return (
    <>
      <LeaderboardSkeleton period={Period.DAY} hasCaption />
      <LeaderboardSkeleton period={Period.WEEK} hasCaption />
      <LeaderboardSkeleton period={Period.MONTH} hasCaption />
    </>
  );
}
