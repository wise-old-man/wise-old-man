import { EditGroupForm } from "~/components/groups/EditGroupForm";
import { getGroupDetails } from "~/services/wiseoldman";

export const dynamic = "force-dynamic";

interface PageProps {
  params: {
    id: number;
  };
}

export async function generateMetadata(props: PageProps) {
  const { id } = props.params;

  const group = await getGroupDetails(id);

  return {
    title: `Editing ${group.name}`,
    description: group.description,
  };
}

export default async function EditGroupPage(props: PageProps) {
  const { id } = props.params;

  const group = await getGroupDetails(id);

  return <EditGroupForm group={group} />;
}
