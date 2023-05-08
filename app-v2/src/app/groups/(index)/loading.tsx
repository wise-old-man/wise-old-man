import { GroupCardSkeleton } from "~/components/groups/GroupCard";

export default function GroupsLoading() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(15)].map((_, i) => (
        <GroupCardSkeleton key={`group_skeleton_${i}`} />
      ))}
    </div>
  );
}
