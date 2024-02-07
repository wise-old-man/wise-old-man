import Link from "next/link";
import { cn } from "~/utils/styling";
import { getPlayerGroups } from "~/services/wiseoldman";
import { Label } from "../Label";
import { MembershipListItem } from "../groups/MembershipListItem";

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
          <MembershipListItem {...m} key={m.group.id} />
        ))}
      </div>
      {hasMoreGroups && (
        <div className="mt-3 flex justify-end">
          <Link
            prefetch={false}
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
