import { isMetric } from "@wise-old-man/utils";
import { CompetitionWidgets } from "~/components/competitions/CompetitionWidgets";
import { ParticipantsTable } from "~/components/competitions/ParticipantsTable";
import { fetchCompetition } from "~/services/wiseoldman";

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
  const { preview } = props.searchParams;

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
      <div className="mt-7">
        <ParticipantsTable metric={metric} competition={competition} />
      </div>
    </>
  );
}
