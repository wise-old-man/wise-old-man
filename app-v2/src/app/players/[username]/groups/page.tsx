import Link from "next/link";
import { GroupRoleProps, MembershipWithGroup } from "@wise-old-man/utils";
import { apiClient } from "~/services/wiseoldman";
import { GroupRoleIcon } from "~/components/Icon";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/Tooltip";

import VerifiedIcon from "~/assets/verified.svg";

export const dynamic = "force-dynamic";

interface PageProps {
  params: {
    username: string;
  };
}

export async function generateMetadata(props: PageProps) {
  const player = await apiClient.players.getPlayerDetails(decodeURI(props.params.username));

  return {
    title: `Groups: ${player.displayName}`,
  };
}

export default async function PlayerGroupsPage(props: PageProps) {
  const { params } = props;

  const username = decodeURI(params.username);

  const [player, groups] = await Promise.all([
    apiClient.players.getPlayerDetails(username),
    apiClient.players.getPlayerGroups(username),
  ]);

  if (!groups || groups.length === 0) {
    return (
      <div className="flex h-32 w-full items-center justify-center rounded-lg border border-gray-600 text-gray-400">
        {player.displayName} is not in a group.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-3">
      {groups.map((g) => (
        <MembershipListItem key={g.group.id} {...g} />
      ))}
    </div>
  );
}

function MembershipListItem(props: MembershipWithGroup) {
  const { role, group } = props;

  return (
    <Link
      href={`/groups/${group.id}`}
      className="flex flex-col gap-x-4 gap-y-1 rounded-lg border border-gray-600 bg-gray-800 px-5 py-3 shadow-md transition-colors hover:bg-gray-700"
    >
      <span className="flex gap-x-1.5 text-base font-medium">
        {group.name}
        {group.verified && (
          <Tooltip>
            <TooltipTrigger>
              <VerifiedIcon />
            </TooltipTrigger>
            <TooltipContent>This group is verified on our Discord server.</TooltipContent>
          </Tooltip>
        )}
      </span>
      <span className="flex items-center gap-x-1 text-xs text-gray-200">
        <GroupRoleIcon role={role} />
        {GroupRoleProps[role].name}
      </span>
    </Link>
  );
}
