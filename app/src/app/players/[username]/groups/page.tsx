import { getPlayerDetails, getPlayerGroups } from "~/services/wiseoldman";
import { MembershipListItem } from "~/components/groups/MembershipListItem";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: {
    username: string;
  };
}

export async function generateMetadata(props: PageProps) {
  const player = await getPlayerDetails(decodeURI(props.params.username));

  return {
    title: `Groups: ${player.displayName}`,
  };
}

export default async function PlayerGroupsPage(props: PageProps) {
  const { params } = props;

  const username = decodeURI(params.username);

  const [player, groups] = await Promise.all([getPlayerDetails(username), getPlayerGroups(username)]);

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
        <MembershipListItem {...g} key={g.group.name} />
      ))}
    </div>
  );
}
