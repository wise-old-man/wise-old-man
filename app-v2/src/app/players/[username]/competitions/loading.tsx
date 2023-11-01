import { CompetitionsListSkeleton } from "~/components/competitions/CompetitionsList";

export default function Loading() {
  return (
    <div>
      <div className="h-3 w-32 animate-pulse rounded-full bg-gray-700" />
      <div className="mt-4 md:mt-1">
        <CompetitionsListSkeleton count={3} />
      </div>
    </div>
  );
}
