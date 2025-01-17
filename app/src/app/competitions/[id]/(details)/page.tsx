import { CompetitionType, Metric, isMetric } from "@wise-old-man/utils";
import { getCompetitionDetails } from "~/services/wiseoldman";
import { TeamsTable } from "~/components/competitions/TeamsTable";
import { Alert, AlertDescription, AlertTitle } from "~/components/Alert";
import { ParticipantsTable } from "~/components/competitions/ParticipantsTable";
import { CompetitionWidgets } from "~/components/competitions/CompetitionWidgets";
import { CompetitionStatusWarning } from "~/components/competitions/CompetitionStatusWarning";

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

function getPreviewMetric(previewParam: string | undefined) {
  return previewParam && isMetric(previewParam) ? previewParam : undefined;
}

export async function generateMetadata(props: PageProps) {
  const { id } = (await props.params);
  const { preview } = (await props.searchParams);

  const previewMetric = getPreviewMetric(preview);

  const competition = await getCompetitionDetails(id, previewMetric);

  return {
    title: competition.title,
  };
}

export default async function CompetitionOverviewPage(props: PageProps) {
  const { id } = (await props.params);
  const { preview } = (await props.searchParams);

  const previewMetric = getPreviewMetric(preview);

  const competition = await getCompetitionDetails(id, previewMetric);
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
    <div className="flex flex-col gap-y-10">
      {isEndingSoon && <CompetitionStatusWarning status="ending" />}
      {isStartingSoon && <CompetitionStatusWarning status="starting" />}

      {metric === Metric.LEAGUE_POINTS && (
        <Alert className="pb-4" variant="error">
          <AlertTitle>League Points competitions are not supported on this version.</AlertTitle>
          <AlertDescription>
            <p className="mb-3">{`You might want to use the "Raging Echoes" version of our website that does allow you to create League-specific competitions.`}</p>
            <a
              href="https://league.wiseoldman.net"
              className="font-medium text-blue-400 hover:text-blue-400"
            >
              Go to Raging Echoes Website
            </a>
          </AlertDescription>
        </Alert>
      )}

      <CompetitionWidgets metric={metric} competition={competition} />

      {competition.type === CompetitionType.TEAM ? (
        <TeamsTable metric={metric} competition={competition} />
      ) : (
        <ParticipantsTable metric={metric} competition={competition} />
      )}
    </div>
  );
}
