import LoadingIcon from "~/assets/loading.svg";
import { GroupLeaderboardsNavigation } from "~/components/groups/GroupLeaderboardsNavigation";

export default function Loading() {
  return (
    <div>
      <GroupLeaderboardsNavigation />
      <div className="mt-10 flex h-[20rem] items-center justify-center rounded-lg border border-gray-600">
        <LoadingIcon className="h-6 w-6 animate-spin text-gray-300" />
      </div>
    </div>
  );
}
