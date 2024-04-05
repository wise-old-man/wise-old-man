import { MemberActivityWithPlayer, ActivityType, GroupRoleProps } from "@wise-old-man/utils";
import { formatDatetime, timeago } from "~/utils/dates";
import { GroupRoleIcon } from "../Icon";
import { PlayerIdentity } from "../PlayerIdentity";
import { Tooltip, TooltipContent, TooltipTrigger } from "../Tooltip";

import ArrowBottomRightIcon from "~/assets/arrow_bottom_right.svg";
import React from "react";

const MoreContextTooltip = ({ activity }: { activity: MemberActivityWithPlayer }) =>
  activity.previousRole ? (
    <>
      <span className="mb-1 text-xs text-gray-200">Prev. Role</span>
      <div className="flex items-center gap-x-2">
        <GroupRoleIcon role={activity.previousRole} />
        <span>{GroupRoleProps[activity.previousRole].name}</span>
      </div>
    </>
  ) : null;

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
        <span className="line-clamp-1">Changed to</span>
        <GroupRoleIcon role={activity.role} />
        <span className="line-clamp-1 text-white">{GroupRoleProps[activity.role].name}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-x-3 px-4 py-3">
      <PlayerIdentity
        player={activity.player}
        caption={typeElement}
        moreContextTooltip={activity.previousRole && <MoreContextTooltip activity={activity} />}
      />
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="shrink-0 text-xs text-gray-200">{timeago.format(activity.createdAt)}</span>
        </TooltipTrigger>
        <TooltipContent align="end">{formatDatetime(activity.createdAt)}</TooltipContent>
      </Tooltip>
    </div>
  );
}
