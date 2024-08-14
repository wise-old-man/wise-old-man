import { CreateCompetitionForm } from "~/components/competitions/CreateCompetitionForm";
import { getGroupDetails } from "~/services/wiseoldman";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Create a new competition",
};

interface PageProps {
  searchParams: {
    groupId: number;
  };
}

export default async function CreateCompetitionPage(props: PageProps) {
  const { groupId } = props.searchParams;

  const group = groupId ? await getGroupDetails(groupId) : undefined;

  return <CreateCompetitionForm group={group} />;
}
