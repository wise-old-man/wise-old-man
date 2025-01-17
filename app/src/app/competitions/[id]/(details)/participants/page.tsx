import { isMetric } from "@wise-old-man/utils";
import { getCompetitionDetails } from "~/services/wiseoldman";
import { ParticipantsTable } from "~/components/competitions/ParticipantsTable";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{
    id: number;
  }>;
  searchParams: Promise<{
    preview?: string;
  }>;
}

export async function generateMetadata(props: PageProps) {
  const { id } = (await props.params);
  const { preview } = (await props.searchParams);

  const previewMetric = preview && isMetric(preview) ? preview : undefined;

  const competition = await getCompetitionDetails(id, previewMetric);

  return {
    title: competition.title,
  };
}

export default async function CompetitionOverviewPage(props: PageProps) {
  const { id } = (await props.params);
  const { preview } = (await props.searchParams);

  const previewMetric = preview && isMetric(preview) ? preview : undefined;

  const competition = await getCompetitionDetails(id, previewMetric);
  const metric = previewMetric || competition.metric;

  return <ParticipantsTable metric={metric} competition={competition} />;
}
