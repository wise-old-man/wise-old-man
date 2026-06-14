import { CompetitionType, isMetric } from "@wise-old-man/utils";
import { getCompetitionDetails } from "~/services/wiseoldman";
import { TeamsTable } from "~/components/competitions/TeamsTable";
import { ParticipantsTable } from "~/components/competitions/ParticipantsTable";
import { CompetitionWidgets } from "~/components/competitions/CompetitionWidgets";
import { CompetitionStatusWarning } from "~/components/competitions/CompetitionStatusWarning";

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

  // Starting in less than 3 hours
  const isStartingSoon =
    competition.startsAt.getTime() > Date.now() &&
    competition.startsAt.getTime() < Date.now() + 1000 * 60 * 60 * 3;

  // Ending in less than 3 hours
  const isEndingSoon =
    competition.endsAt.getTime() > Date.now() &&
    competition.endsAt.getTime() < Date.now() + 1000 * 60 * 60 * 3;

  return (
    <div className="flex flex-col gap-y-10">
      {isEndingSoon && <CompetitionStatusWarning status="ending" />}
      {isStartingSoon && <CompetitionStatusWarning status="starting" />}

      <CompetitionWidgets metric={selectedMetric} competition={competition} />

      {competition.type === CompetitionType.TEAM ? (
        <TeamsTable metric={selectedMetric} competition={competition} />
      ) : (
        <ParticipantsTable metric={selectedMetric} competition={competition} />
      )}
    </div>
  );
}
