import Link from "next/link";
import { PropsWithChildren } from "react";
import {
  CompetitionDetails,
  CompetitionStatus,
  CompetitionStatusProps,
  CompetitionType,
  MetricProps,
} from "@wise-old-man/utils";
import { cn } from "~/utils/styling";
import { getCompetitionDetails, getCompetitionStatus } from "~/services/wiseoldman";
import { Button } from "~/components/Button";
import { Container } from "~/components/Container";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/Dropdown";
import { MetricIcon } from "~/components/Icon";
import { QueryLink } from "~/components/QueryLink";
import { CompetitionPreviewWarning } from "~/components/competitions/CompetitionPreviewWarning";
import { DeleteCompetitionDialog } from "~/components/competitions/DeleteCompetitionDialog";
import { ExportCompetitionDialog } from "~/components/competitions/ExportCompetitionDialog";
import { PreviewMetricDialog } from "~/components/competitions/PreviewMetricDialog";
import { UpdateAllParticipantsDialog } from "~/components/competitions/UpdateAllParticipantsDialog";
import { CompetitionDetailsNavigation } from "~/components/competitions/CompetitionDetailsNavigation";

import OverflowIcon from "~/assets/overflow.svg";

export const dynamic = "force-dynamic";

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
      <Header {...competition} />
      <div className="mt-7">
        <CompetitionDetailsNavigation competition={competition} />
      </div>
      <CompetitionPreviewWarning trueMetric={competition.metric} />
      {children}

      {/* Dialogs */}
      <DeleteCompetitionDialog competitionId={id} />
      <ExportCompetitionDialog competitionId={id} />
      <UpdateAllParticipantsDialog competitionId={id} />
      <PreviewMetricDialog trueMetric={competition.metric} />
    </Container>
  );
}

function Header(props: CompetitionDetails) {
  const { id, metric, title, type, group } = props;

  const status = getCompetitionStatus(props);

  return (
    <div className="flex flex-col-reverse items-start justify-between gap-x-5 gap-y-7 md:flex-row">
      <div className="flex w-full grow items-center gap-x-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-gray-500 bg-gray-800">
          <MetricIcon metric={metric} />
        </div>
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
            {" · "}
            {MetricProps[metric].name}
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
            <Button iconButton>
              <OverflowIcon className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <Link prefetch={false} href={`/competitions/${id}/edit`}>
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

function getParticipantsLabel(competition: CompetitionDetails) {
  return competition.participantCount === 1
    ? "1 participant"
    : `${competition.participantCount} participants`;
}

function getTeamsLabel(competition: CompetitionDetails) {
  const teams = new Set<string>();

  competition.participations.forEach((p) => {
    if (!p.teamName || teams.has(p.teamName)) return;
    teams.add(p.teamName);
  });

  if (teams.size === 1) return "1 team";

  return `${teams.size} teams`;
}
