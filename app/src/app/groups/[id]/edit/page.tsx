import { getGroupDetails } from "~/services/wiseoldman";
import { EditGroupForm } from "~/components/groups/EditGroupForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{
    id: number;
  }>;
}

export async function generateMetadata(props: PageProps) {
  const { id } = (await props.params);

  const group = await getGroupDetails(id);

  return {
    title: `Edit - ${group.name}`,
    description: group.description,
  };
}

export default async function EditGroupPage(props: PageProps) {
  const { id } = (await props.params);

  const group = await getGroupDetails(id);

  return <EditGroupForm group={group} />;
}
