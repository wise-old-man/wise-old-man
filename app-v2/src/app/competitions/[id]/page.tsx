import { CompetitionType, isMetric } from "@wise-old-man/utils";
import { fetchCompetition } from "~/services/wiseoldman";
import { TeamsTable } from "~/components/competitions/TeamsTable";
import { ParticipantsTable } from "~/components/competitions/ParticipantsTable";
import { CompetitionWidgets } from "~/components/competitions/CompetitionWidgets";
import { EndingCompetitionWarning } from "~/components/competitions/EndingCompetitionWarning";
import { StartingCompetitionWarning } from "~/components/competitions/StartingCompetitionWarning";

export const runtime = "edge";
export const dynamic = "force-dynamic";

interface PageProps {
  params: {
    id: number;
  };
  searchParams: {
    preview?: string;
    filter?: string;
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
  const { preview, filter } = props.searchParams;

  const previewMetric = preview && isMetric(preview) ? preview : undefined;

  const competition = await fetchCompetition(id, previewMetric);
  const metric = previewMetric || competition.metric;

  // Starting in less than 3 hours
  const isStartingSoon =
    competition.startsAt.getTime() > Date.now() &&
    competition.startsAt.getTime() < Date.now() + 1000 * 60 * 60 * 3;

  // Ending in less than 3 hours
  const isEndingSoon =
    competition.endsAt.getTime() > Date.now() &&
    competition.endsAt.getTime() < Date.now() + 1000 * 60 * 60 * 3;

  return (
    <>
      {isEndingSoon && <EndingCompetitionWarning />}
      {isStartingSoon && <StartingCompetitionWarning />}
      <CompetitionWidgets metric={metric} competition={competition} />
      <div className="mt-10">
        {competition.type === CompetitionType.TEAM ? (
          <TeamsTable metric={metric} competition={competition} />
        ) : (
          <ParticipantsTable metric={metric} competition={competition} filter={filter} />
        )}
      </div>
    </>
  );
}
