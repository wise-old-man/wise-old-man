import {
  CompetitionDetailsResponse,
  CompetitionStatus,
  CompetitionStatusProps,
  CompetitionType,
  Metric,
} from "@wise-old-man/utils";
import Link from "next/link";
import { Button } from "~/components/Button";
import { Container } from "~/components/Container";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/Dropdown";
import { MetricAvatarGroup } from "~/components/MetricAvatarGroup";
import { QueryLink } from "~/components/QueryLink";
import { CompetitionValueDistribution } from "~/components/competitions/CompetitionValueDistribution";
import { getCompetitionDetails, getCompetitionStatus } from "~/services/wiseoldman";
import { getMetricParam } from "~/utils/params";
import { naivePluralize } from "~/utils/strings";
import { cn } from "~/utils/styling";

import { Alert, AlertDescription, AlertTitle } from "~/components/Alert";
import { CompetitionActivePlayers } from "~/components/competitions/CompetitionActivePlayers";
import { CompetitionCountdown } from "~/components/competitions/CompetitionCountdown";
import { CompetitionLimitedVisibilityAlert } from "~/components/competitions/CompetitionLimitedVisibilityAlert";
import { CompetitionMetricTabs } from "~/components/competitions/CompetitionMetricTabs";
import { CompetitionMomentum } from "~/components/competitions/CompetitionMomentum";
import { CompetitionPageProvider } from "~/components/competitions/CompetitionPageContext";
import { CompetitionPreviewMetricDialog } from "~/components/competitions/CompetitionPreviewMetricDialog";
import { CompetitionStandings } from "~/components/competitions/CompetitionStandings";
import { CompetitionStatusWarning } from "~/components/competitions/CompetitionStatusWarning";
import { CompetitionTimeRangePicker } from "~/components/competitions/CompetitionTimeRangePicker";
import { CompetitionTopHistoryChartDialog } from "~/components/competitions/CompetitionTopHistoryChartDialog";
import { CompetitionTopParticipantsSparklineChart } from "~/components/competitions/CompetitionTopParticipantsSparklineChart";
import { CompetitionTotalGained } from "~/components/competitions/CompetitionTotalGained";
import { DeleteCompetitionDialog } from "~/components/competitions/DeleteCompetitionDialog";
import { ExportCompetitionDialog } from "~/components/competitions/ExportCompetitionDialog";
import { UpdateAllParticipantsDialog } from "~/components/competitions/UpdateAllParticipantsDialog";

import OverflowIcon from "~/assets/overflow.svg";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: {
    id: number;
  };
  searchParams: {
    metric?: string;
    preview?: string;
  };
}

function getPreviewMetric(param: string | undefined, competitionMetrics: Array<Metric>) {
  const metric = getMetricParam(param);
  return metric && !competitionMetrics.includes(metric) ? metric : undefined;
}

export async function generateMetadata(props: PageProps) {
  const { id } = props.params;

  const competition = await getCompetitionDetails(id, getMetricParam(props.searchParams.preview));

  return {
    title: competition.title,
  };
}

export default async function CompetitionPage(props: PageProps) {
  const { id } = props.params;

  const competition = await getCompetitionDetails(id, getMetricParam(props.searchParams.preview));

  const previewMetric = getPreviewMetric(
    props.searchParams.preview,
    competition.metrics.map((m) => m.metric),
  );

  // Starting in less than 3 hours
  const isStartingSoon =
    competition.startsAt.getTime() > Date.now() &&
    competition.startsAt.getTime() < Date.now() + 1000 * 60 * 60 * 3;

  // Ending in less than 3 hours
  const isEndingSoon =
    competition.endsAt.getTime() > Date.now() &&
    competition.endsAt.getTime() < Date.now() + 1000 * 60 * 60 * 3;

  return (
    <CompetitionPageProvider competition={competition} previewMetric={previewMetric}>
      <Container>
        <div className="mb-8">
          <Alert className="border-blue-700 bg-blue-900/10 px-4 py-3">
            <AlertTitle className="mb-0">
              You&apos;re looking at a half-baked new competition page!
            </AlertTitle>
            <AlertDescription>
              <p>
                Along with other smaller features, this new page layout will allow for &quot;multiple
                metric&quot; competitions{" "}
                {parseInt(String(id)) !== 104505 && (
                  <Link
                    rel="nofollow"
                    href={`/competitions/new/104505`}
                    className="text-white underline"
                  >
                    (example here)
                  </Link>
                )}{" "}
                which has been a highly requested feature for a long time - Still a work in progress,
                please share any feedback and bugs you find with us on{" "}
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://wiseoldman.net/discord"
                  className="text-white underline"
                >
                  our Discord
                </a>
                {". "}
              </p>
            </AlertDescription>
          </Alert>
        </div>
        {!competition.visible && (
          <div className="mb-7">
            <CompetitionLimitedVisibilityAlert />
          </div>
        )}
        {isEndingSoon && (
          <div className="mb-7">
            <CompetitionStatusWarning status="ending" />
          </div>
        )}
        {isStartingSoon && (
          <div className="mb-7">
            <CompetitionStatusWarning status="starting" />
          </div>
        )}
        <div className="flex flex-col gap-y-10 border-b border-gray-600 pb-6">
          <Header competitionDetails={competition} />
        </div>
        <div className="mt-6 flex flex-col gap-6 md:flex-row">
          <div className="flex w-full shrink-0 flex-col gap-y-5 md:w-[320px]">
            <CompetitionTimeRangePicker />
            <div className="flex gap-x-4">
              <CompetitionCountdown />
              <div>
                <CompetitionActivePlayers />
              </div>
            </div>
            <CompetitionValueDistribution />
            <CompetitionMomentum />
          </div>
          <div className="flex min-w-0 grow flex-col gap-y-5">
            <CompetitionMetricTabs />
            <div className="grid grid-cols-2 gap-x-4">
              <CompetitionTotalGained />
              <CompetitionTopParticipantsSparklineChart />
            </div>
            <CompetitionStandings />
          </div>
        </div>
      </Container>

      {/* Dialogs */}
      <CompetitionTopHistoryChartDialog />
      <CompetitionPreviewMetricDialog />
      <DeleteCompetitionDialog competitionId={id} />
      <ExportCompetitionDialog competitionId={id} />
      <UpdateAllParticipantsDialog competitionId={id} />
    </CompetitionPageProvider>
  );
}

function Header({ competitionDetails }: { competitionDetails: CompetitionDetailsResponse }) {
  const status = getCompetitionStatus(competitionDetails);
  const teamCount = new Set(competitionDetails.participations.map((p) => p.teamName)).size;

  return (
    <div className="flex flex-grow flex-col items-center justify-between gap-y-5 sm:flex-row">
      <div className="flex w-full flex-row items-center gap-3">
        <MetricAvatarGroup size="lg" metrics={competitionDetails.metrics.map((m) => m.metric)} />
        <div className="flex flex-col gap-y-0.5">
          <h1 className="line-clamp-1 text-xl font-semibold text-white xl:text-2xl">
            {competitionDetails.title}
          </h1>
          <div className="line-clamp-1 text-xs text-gray-200">
            <div
              className={cn("mb-px mr-1.5 inline-block h-2 w-2 rounded-full border", {
                "border-red-500 bg-red-600": status === CompetitionStatus.FINISHED,
                "border-green-500 bg-green-600": status === CompetitionStatus.ONGOING,
                "border-yellow-500 bg-yellow-600": status === CompetitionStatus.UPCOMING,
              })}
            />
            {CompetitionStatusProps[status].name}
            {competitionDetails.group && (
              <>
                <span>{` · Hosted by `}</span>
                <Link
                  prefetch={false}
                  href={`/groups/${competitionDetails.group.id}`}
                  className="font-medium text-blue-400 hover:underline"
                >
                  {competitionDetails.group.name}
                </Link>
              </>
            )}
            {competitionDetails.type === CompetitionType.TEAM && (
              <span>{` · ${naivePluralize(teamCount, "team")} `}</span>
            )}
            <span>{` · ${naivePluralize(competitionDetails.participantCount, "participant")} `}</span>
          </div>
        </div>
      </div>
      <div className="flex w-full items-center gap-x-2 sm:w-auto">
        <QueryLink query={{ dialog: "update-all" }}>
          <Button variant="blue">Update all</Button>
        </QueryLink>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button iconButton aria-label="Open competition actions menu">
              <OverflowIcon className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <Link prefetch={false} href={`/competitions/${competitionDetails.id}/edit`} rel="nofollow">
              <DropdownMenuItem>Edit</DropdownMenuItem>
            </Link>
            <QueryLink query={{ dialog: "delete" }}>
              <DropdownMenuItem>Delete</DropdownMenuItem>
            </QueryLink>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
