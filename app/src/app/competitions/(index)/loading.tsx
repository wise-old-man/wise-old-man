import { CompetitionsListSkeleton } from "~/components/competitions/CompetitionsList";

export default function LoadingState() {
  return <CompetitionsListSkeleton count={5} />;
}
