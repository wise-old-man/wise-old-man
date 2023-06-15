import { fetchGroup } from "~/services/wiseoldman";
import { GroupWidgets } from "~/components/groups/GroupWidgets";

interface PageProps {
  params: {
    id: number;
  };
}

export async function generateMetadata(props: PageProps) {
  const { id } = props.params;

  const group = await fetchGroup(id);

  return {
    title: group.name,
    description: group.description,
  };
}

export default async function GroupDetailsPage(props: PageProps) {
  const { id } = props.params;

  const group = await fetchGroup(id);

  return (
    <>
      <GroupWidgets group={group} />
    </>
  );
}
