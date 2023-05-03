import { LeaderboardSkeleton } from "../_components/LeaderboardSkeleton";

export default function Loading() {
  return (
    <div className="col-span-3 mx-auto w-full max-w-lg">
      <LeaderboardSkeleton />
    </div>
  );
}
