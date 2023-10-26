import { MemberActivityWithPlayer, ActivityType, GroupRoleProps } from "@wise-old-man/utils";
import { timeago } from "~/utils/dates";
import { GroupRoleIcon } from "../Icon";
import { PlayerIdentity } from "../PlayerIdentity";

import ArrowBottomRightIcon from "~/assets/arrow_bottom_right.svg";

interface GroupActivityItemProps {
  activity: MemberActivityWithPlayer;
}

export function GroupActivityItem(props: GroupActivityItemProps) {
  const { activity } = props;

  let typeElement: JSX.Element | undefined;
  if (activity.type === ActivityType.LEFT) {
    typeElement = (
      <div className="flex items-center gap-x-0.5 text-xs text-red-400">
        <ArrowBottomRightIcon className="h-4 w-4 -scale-x-100 text-red-400" />
        Left
      </div>
    );
  } else if (activity.type === ActivityType.JOINED) {
    typeElement = (
      <div className="flex items-center gap-x-0.5 text-xs text-green-400">
        <ArrowBottomRightIcon className="-ml-px h-4 w-4 text-green-400" />
        Joined
      </div>
    );
  } else if (activity.role) {
    typeElement = (
      <div className="flex items-center gap-x-1 text-xs text-gray-200">
        <span className="line-clamp-1 hidden 2xl:inline">Role changed to</span>
        <span className="line-clamp-1 inline 2xl:hidden">Changed to</span>
        <GroupRoleIcon role={activity.role} />
        <span className="line-clamp-1 text-white">{GroupRoleProps[activity.role].name}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-x-3 px-5 py-3">
      <PlayerIdentity player={activity.player} caption={typeElement} />
      <span className="shrink-0 text-xs text-gray-200">{timeago.format(activity.createdAt)}</span>
    </div>
  );
}
