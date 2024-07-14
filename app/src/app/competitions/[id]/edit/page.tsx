import { getCompetitionDetails } from "~/services/wiseoldman";
import { EditCompetitionForm } from "~/components/competitions/EditCompetitionForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: {
    id: number;
  };
}

export async function generateMetadata(props: PageProps) {
  const { id } = props.params;

  const competition = await getCompetitionDetails(id);

  return {
    title: `Edit - ${competition.title}`,
  };
}

export default async function EditCompetitionPage(props: PageProps) {
  const { id } = props.params;

  const competition = await getCompetitionDetails(id);

  return <EditCompetitionForm competition={competition} />;
}
