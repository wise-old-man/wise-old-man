import { isMetric } from "@wise-old-man/utils";
import { getCompetitionDetails } from "~/services/wiseoldman";
import { ParticipantsTable } from "~/components/competitions/ParticipantsTable";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: {
    id: number;
  };
  searchParams: {
    metric?: string;
  };
}

function getMetricParam(metricParam: string | undefined) {
  return metricParam && isMetric(metricParam) ? metricParam : undefined;
}

export async function generateMetadata(props: PageProps) {
  const { id } = props.params;

  const metricParam = getMetricParam(props.searchParams.metric);
  const competition = await getCompetitionDetails(id, metricParam);

  return {
    title: competition.title,
  };
}

export default async function CompetitionOverviewPage(props: PageProps) {
  const { id } = props.params;

  const metricParam = getMetricParam(props.searchParams.metric);
  const competition = await getCompetitionDetails(id, metricParam);

  const selectedMetric =
    metricParam ?? (competition.metrics.length > 1 ? "total" : competition.metrics[0].metric);

  return <ParticipantsTable metric={selectedMetric} competition={competition} />;
}
