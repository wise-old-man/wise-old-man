import {
  CompetitionDetailsResponse,
  CompetitionStatus,
  CompetitionStatusProps,
  CompetitionType,
  MetricProps,
} from "@wise-old-man/utils";
import Link from "next/link";
import { PropsWithChildren } from "react";
import { Alert, AlertDescription, AlertTitle } from "~/components/Alert";
import { Button } from "~/components/Button";
import { CompetitionDetailsNavigation } from "~/components/competitions/CompetitionDetailsNavigation";
import { CompetitionPreviewWarning } from "~/components/competitions/CompetitionPreviewWarning";
import { DeleteCompetitionDialog } from "~/components/competitions/DeleteCompetitionDialog";
import { ExportCompetitionDialog } from "~/components/competitions/ExportCompetitionDialog";
import { PreviewMetricDialog } from "~/components/competitions/PreviewMetricDialog";
import { UpdateAllParticipantsDialog } from "~/components/competitions/UpdateAllParticipantsDialog";
import { Container } from "~/components/Container";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/Dropdown";
import { MetricAvatarGroup } from "~/components/MetricAvatarGroup";
import { QueryLink } from "~/components/QueryLink";
import { getCompetitionDetails, getCompetitionStatus } from "~/services/wiseoldman";
import { cn } from "~/utils/styling";

import OverflowIcon from "~/assets/overflow.svg";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: {
    id: number;
  };
}

export default async function CompetitionLayout(props: PropsWithChildren<PageProps>) {
  const { children, params } = props;
  const { id } = params;

  const competition = await getCompetitionDetails(id);

  return (
    <Container>
      {!competition.visible && (
        <Alert variant="warn" className="mb-10 border-orange-700 bg-orange-900/10">
          <div>
            <AlertTitle>This page has limited visibility</AlertTitle>
            <AlertDescription>
              <p>
                We are temporarily limiting visibility of all new groups and competitions to prevent
                harassment. Progress gained with the group or competition will still be tracked. If this
                message persists for several hours,{" "}
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://wiseoldman.net/discord"
                  className="text-white underline"
                >
                  contact us on Discord
                </a>
                {" for help."}
              </p>
            </AlertDescription>
          </div>
        </Alert>
      )}

      <Header {...competition} />
      <div className="mt-7">
        <CompetitionDetailsNavigation competition={competition} />
      </div>
      {/* TODO: Fix this */}
      <CompetitionPreviewWarning trueMetric={competition.metrics[0]} />
      {children}

      {/* Dialogs */}
      <DeleteCompetitionDialog competitionId={id} />
      <ExportCompetitionDialog competitionId={id} />
      <UpdateAllParticipantsDialog competitionId={id} />
      {/* TODO: Fix this */}
      <PreviewMetricDialog trueMetric={competition.metrics[0]} />
    </Container>
  );
}

function Header(props: CompetitionDetailsResponse) {
  const { id, metrics, title, type, group } = props;

  const status = getCompetitionStatus(props);

  return (
    <div className="flex flex-col-reverse items-start justify-between gap-x-5 gap-y-7 md:flex-row">
      <div className="flex w-full grow items-center gap-x-3">
        <MetricAvatarGroup metrics={metrics} maxCount={2} size="lg" avatarClassname="bg-gray-800" />
        <div>
          <h1 className="text-lg font-bold sm:text-2xl">{title}</h1>
          <div className="mt-1 text-xs text-gray-200 sm:mt-0 sm:text-body">
            <div
              className={cn("mb-px mr-1.5 inline-block h-2 w-2 rounded-full border", {
                "border-red-500 bg-red-600": status === CompetitionStatus.FINISHED,
                "border-green-500 bg-green-600": status === CompetitionStatus.ONGOING,
                "border-yellow-500 bg-yellow-600": status === CompetitionStatus.UPCOMING,
              })}
            />
            {CompetitionStatusProps[status].name}
            {metrics.length === 1 && (
              <>
                {" · "}
                {MetricProps[metrics[0]].name}
              </>
            )}
            {" · "}
            {type === CompetitionType.CLASSIC ? getParticipantsLabel(props) : getTeamsLabel(props)}
            {group && (
              <span>
                {` · Hosted by `}
                <Link
                  prefetch={false}
                  href={`/groups/${group.id}`}
                  className="font-medium text-blue-400 hover:underline"
                >
                  {group.name}
                </Link>
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-x-2">
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
            <Link prefetch={false} href={`/competitions/${id}/edit`} rel="nofollow">
              <DropdownMenuItem>Edit</DropdownMenuItem>
            </Link>
            <QueryLink query={{ dialog: "delete" }}>
              <DropdownMenuItem>Delete</DropdownMenuItem>
            </QueryLink>
            <QueryLink query={{ dialog: "preview" }}>
              <DropdownMenuItem>Preview as...</DropdownMenuItem>
            </QueryLink>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function getParticipantsLabel(competition: CompetitionDetailsResponse) {
  return competition.participantCount === 1
    ? "1 participant"
    : `${competition.participantCount} participants`;
}

function getTeamsLabel(competition: CompetitionDetailsResponse) {
  const teams = new Set<string>();

  competition.participations.forEach((p) => {
    if (!p.teamName || teams.has(p.teamName)) return;
    teams.add(p.teamName);
  });

  if (teams.size === 1) return "1 team";

  return `${teams.size} teams`;
}
