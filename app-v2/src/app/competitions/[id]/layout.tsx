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
import { apiClient, getCompetitionStatus } from "~/services/wiseoldman";
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
import { Tabs, TabsList, TabsTrigger } from "~/components/Tabs";
import { CompetitionPreviewWarning } from "~/components/competitions/CompetitionPreviewWarning";
import { DeleteCompetitionDialog } from "~/components/competitions/DeleteCompetitionDialog";
import { ExportCompetitionDialog } from "~/components/competitions/ExportCompetitionDialog";
import { PreviewMetricDialog } from "~/components/competitions/PreviewMetricDialog";
import { UpdateAllParticipantsDialog } from "~/components/competitions/UpdateAllParticipantsDialog";

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

  // @ts-ignore - There's no decent API from Next.js yet (as of 13.4.0)
  const routeSegment = children.props.childProp.segment;

  const competition = await apiClient.competitions.getCompetitionDetails(id);

  return (
    <Container>
      <Header {...competition} />
      <div className="mt-7">
        <Navigation id={id} routeSegment={routeSegment} competition={competition} />
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

interface NavigationProps {
  id: number;
  routeSegment: string;
  competition: CompetitionDetails;
}

function Navigation(props: NavigationProps) {
  const { id, routeSegment, competition } = props;

  let selectedSegment: string | undefined;

  if (routeSegment === "top-5") {
    selectedSegment = "top-5";
  } else if (routeSegment === "participants" && competition.type === CompetitionType.TEAM) {
    selectedSegment = "participants";
  } else {
    selectedSegment = "overview";
  }

  return (
    <div className="pointer-events-none relative pb-8">
      <div className="pointer-events-auto bg-gray-900">
        <Tabs defaultValue={selectedSegment}>
          <TabsList aria-label="Competition Navigation">
            <Link href={`/competitions/${id}`} aria-label="Navigate to the competition's overview">
              <TabsTrigger value="overview">Overview</TabsTrigger>
            </Link>
            {competition.type === CompetitionType.TEAM && (
              <Link
                href={`/competitions/${id}/participants`}
                aria-label="Navigate to the competition's participants"
              >
                <TabsTrigger value="participants">Participants</TabsTrigger>
              </Link>
            )}
            <Link
              href={`/competitions/${id}/top-5`}
              aria-label="Navigate to competition's top 5 participants chart"
            >
              <TabsTrigger value="top-5">Top 5 chart</TabsTrigger>
            </Link>
          </TabsList>
        </Tabs>
      </div>
      <div className="absolute -bottom-2 left-0 right-0 h-10 bg-gradient-to-b from-gray-900 to-gray-900/0" />
    </div>
  );
}

function Header(props: CompetitionDetails) {
  const { id, metric, title, type, group } = props;

  const status = getCompetitionStatus(props);

  return (
    <div className="flex flex-col-reverse items-end justify-between gap-x-5 gap-y-7 md:flex-row">
      <div className="flex w-full grow items-center gap-x-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-gray-500 bg-gray-800">
          <MetricIcon metric={metric} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <div className="line-clamp-1 text-body text-gray-200">
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
