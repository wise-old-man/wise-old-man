import { apiClient } from "~/services/wiseoldman";
import { EditGroupForm } from "~/components/groups/EditGroupForm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: {
    id: number;
  };
}

export async function generateMetadata(props: PageProps) {
  const { id } = props.params;

  const group = await apiClient.groups.getGroupDetails(id);

  return {
    title: `Editing ${group.name}`,
    description: group.description,
  };
}

export default async function EditGroupPage(props: PageProps) {
  const { id } = props.params;

  const group = await apiClient.groups.getGroupDetails(id);

  return <EditGroupForm group={group} />;
}
