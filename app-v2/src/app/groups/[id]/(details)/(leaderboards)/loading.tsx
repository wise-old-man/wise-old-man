import { GroupLeaderboardsNavigation } from "~/components/groups/GroupLeaderboardsNavigation";
import LoadingIcon from "~/assets/loading.svg";

export default function Loading() {
  return (
    <div>
      <GroupLeaderboardsNavigation />
      <div className="mt-10 flex h-[24rem] items-center justify-center rounded-lg border border-gray-600">
        <LoadingIcon className="h-10 w-10 animate-spin text-gray-300" />
      </div>
    </div>
  );
}
