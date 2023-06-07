import { isMetric } from "@wise-old-man/utils";
import { fetchCompetition } from "~/services/wiseoldman";
import { ParticipantsTable } from "~/components/competitions/ParticipantsTable";

export const runtime = "edge";
export const dynamic = "force-dynamic";

interface PageProps {
  params: {
    id: number;
  };
  searchParams: {
    preview?: string;
  };
}

export async function generateMetadata(props: PageProps) {
  const { id } = props.params;

  const competition = await fetchCompetition(id);

  return {
    title: competition.title,
  };
}

export default async function CompetitionOverviewPage(props: PageProps) {
  const { id } = props.params;
  const { preview } = props.searchParams;

  const previewMetric = preview && isMetric(preview) ? preview : undefined;

  const competition = await fetchCompetition(id, previewMetric);
  const metric = previewMetric || competition.metric;

  return <ParticipantsTable metric={metric} competition={competition} />;
}
