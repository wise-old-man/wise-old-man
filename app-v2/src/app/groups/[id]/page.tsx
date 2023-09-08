import { getGroupDetails } from "~/services/wiseoldman";
import { GroupWidgets } from "~/components/groups/GroupWidgets";
import { MembersTable } from "~/components/groups/MembersTable";

export const dynamic = "force-dynamic";

interface PageProps {
  params: {
    id: number;
  };
  searchParams: {
    filter: string;
  };
}

export async function generateMetadata(props: PageProps) {
  const { id } = props.params;

  const group = await getGroupDetails(id);

  return {
    title: group.name,
    description: group.description,
  };
}

export default async function GroupDetailsPage(props: PageProps) {
  const { id } = props.params;
  const { filter } = props.searchParams;

  const group = await getGroupDetails(id);

  return (
    <div className="flex flex-col gap-y-10">
      <GroupWidgets group={group} />
      <MembersTable group={group} filter={filter} />
    </div>
  );
}
