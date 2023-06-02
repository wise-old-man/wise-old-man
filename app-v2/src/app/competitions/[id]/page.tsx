import { CompetitionType, isMetric } from "@wise-old-man/utils";
import { fetchCompetition } from "~/services/wiseoldman";
import { TeamsTable } from "~/components/competitions/TeamsTable";
import { ParticipantsTable } from "~/components/competitions/ParticipantsTable";
import { TeamDetailsDialog } from "~/components/competitions/TeamDetailsDialog";
import { CompetitionWidgets } from "~/components/competitions/CompetitionWidgets";

export const runtime = "edge";

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

  return (
    <>
      <CompetitionWidgets metric={metric} competition={competition} />
      <div className="mt-10">
        {competition.type === CompetitionType.TEAM ? (
          <TeamsTable metric={metric} competition={competition} />
        ) : (
          <ParticipantsTable metric={metric} competition={competition} />
        )}
      </div>
    </>
  );
}
