import { Period } from "@wise-old-man/utils";
import { LeaderboardSkeleton } from "../_components/LeaderboardSkeleton";

export default function Loading() {
  return (
    <>
      <LeaderboardSkeleton period={Period.DAY} />
      <LeaderboardSkeleton period={Period.WEEK} />
      <LeaderboardSkeleton period={Period.MONTH} />
    </>
  );
}
