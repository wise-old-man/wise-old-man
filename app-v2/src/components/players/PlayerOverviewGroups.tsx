import Link from "next/link";
import { GroupRoleProps, MembershipWithGroup } from "@wise-old-man/utils";
import { cn } from "~/utils/styling";
import { getPlayerGroups } from "~/services/wiseoldman";
import { Label } from "../Label";
import { GroupRoleIcon } from "../Icon";
import { Tooltip, TooltipContent, TooltipTrigger } from "../Tooltip";

import VerifiedIcon from "~/assets/verified.svg";

interface PlayerOverviewMembershipsProps {
  username: string;
}

export async function PlayerOverviewMemberships(props: PlayerOverviewMembershipsProps) {
  const { username } = props;

  const memberships = await getPlayerGroups(username);

  const highlighted = memberships.sort((a, b) => b.group.score - a.group.score).slice(0, 3);

  if (!highlighted || highlighted.length === 0) return null;

  const hasMoreGroups = highlighted.length < memberships.length;

  return (
    <div>
      <Label className="text-xs leading-4 text-gray-200">Group affilitations</Label>
      <div className={cn("mt-2 flex flex-col gap-y-2", !hasMoreGroups && "pb-4")}>
        {highlighted.map((m) => (
          <MembershipListItem {...m} key={m.group.name} />
        ))}
      </div>
      {hasMoreGroups && (
        <div className="mt-3 flex justify-end">
          <Link
            href={`/players/${username}/groups`}
            className="text-xs font-medium text-gray-200 hover:underline"
          >
            View all
          </Link>
        </div>
      )}
    </div>
  );
}

function MembershipListItem(props: MembershipWithGroup) {
  const { role, group } = props;

  return (
    <div className="flex flex-col gap-x-4 gap-y-1 rounded-lg border border-gray-500 bg-gray-800 px-5 py-3 shadow-sm transition-colors">
      <Link
        href={`/groups/${group.id}`}
        className="flex items-center gap-x-1.5 text-base font-medium hover:underline"
      >
        <span className="line-clamp-1">{group.name}</span>
        {group.verified && (
          <Tooltip>
            <TooltipTrigger asChild>
              <VerifiedIcon className="h-4 w-4" />
            </TooltipTrigger>
            <TooltipContent>This group is verified on our Discord server.</TooltipContent>
          </Tooltip>
        )}
      </Link>
      <span className="flex items-center gap-x-1 text-xs text-gray-200">
        <GroupRoleIcon role={role} />
        {GroupRoleProps[role].name}
      </span>
    </div>
  );
}
