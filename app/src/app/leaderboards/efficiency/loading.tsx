import { LeaderboardSkeleton } from "~/components/leaderboards/LeaderboardSkeleton";

export default function Loading() {
  return (
    <div className="col-span-3 mx-auto w-full max-w-lg">
      <LeaderboardSkeleton hasCaption />
    </div>
  );
}
