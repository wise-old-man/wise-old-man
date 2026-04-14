import { CompetitionType, isMetric } from "@wise-old-man/utils";
import { getCompetitionDetails } from "~/services/wiseoldman";
import { TeamsTable } from "~/components/competitions/TeamsTable";
import { ParticipantsTable } from "~/components/competitions/ParticipantsTable";
import { CompetitionWidgets } from "~/components/competitions/CompetitionWidgets";
import { CompetitionStatusWarning } from "~/components/competitions/CompetitionStatusWarning";
import { LEAGUE_RELEASE_DATE_UTC } from "~/league";
import { Alert, AlertDescription, AlertTitle } from "~/components/Alert";
import { ClientOnly } from "~/components/ClientOnly";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: {
    id: number;
  };
  searchParams: {
    preview?: string;
  };
}

function getPreviewMetric(previewParam: string | undefined) {
  return previewParam && isMetric(previewParam) ? previewParam : undefined;
}

export async function generateMetadata(props: PageProps) {
  const { id } = props.params;
  const { preview } = props.searchParams;

  const previewMetric = getPreviewMetric(preview);

  const competition = await getCompetitionDetails(id, previewMetric);

  return {
    title: competition.title,
  };
}

function LeagueStartCompetitionWarning({ startsAt }: { startsAt: Date }) {
  const leagueLaunchDate = new Date(LEAGUE_RELEASE_DATE_UTC);
  const recommendedLaunchDateRangeStart = new Date(leagueLaunchDate.getTime() - 1000 * 60 * 60);
  const recommendedLaunchDateRangeEnd = new Date(leagueLaunchDate.getTime() - 1000 * 60);

  const timeDiff = startsAt.getTime() - leagueLaunchDate.getTime();

  if (timeDiff < 0 || timeDiff > 1000 * 60 * 60 * 6) {
    return null;
  }

  const hasStarted = startsAt.getTime() < Date.now();

  return (
    <Alert className="border-yellow-600 bg-yellow-900/10">
      <AlertTitle>
        {hasStarted
          ? "Warning: This competition started shortly after the League launch."
          : "Warning: This competition is starting shortly after the League launch."}
      </AlertTitle>
      <AlertDescription>
        {hasStarted
          ? "We highly recommend editing the start date of this competition to "
          : "We highly recommend starting this competition "}
        <b className="text-white">before</b> the League launch time to ensure all participants get their
        data tracked correctly.
        <br />
        <br />
        Current start time: <ClientOnly>{startsAt.toLocaleTimeString()}</ClientOnly>
        <br />
        We recommend:{" "}
        <ClientOnly>
          {recommendedLaunchDateRangeStart.toLocaleTimeString()} -{" "}
          {recommendedLaunchDateRangeEnd.toLocaleTimeString()}
        </ClientOnly>
      </AlertDescription>
    </Alert>
  );
}

export default async function CompetitionOverviewPage(props: PageProps) {
  const { id } = props.params;
  const { preview } = props.searchParams;

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
      <LeagueStartCompetitionWarning startsAt={competition.startsAt} />

      <CompetitionWidgets metric={metric} competition={competition} />

      {competition.type === CompetitionType.TEAM ? (
        <TeamsTable metric={metric} competition={competition} />
      ) : (
        <ParticipantsTable metric={metric} competition={competition} />
      )}
    </div>
  );
}
