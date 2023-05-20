import Link from "next/link";
import { notFound } from "next/navigation";
import { PropsWithChildren } from "react";
import {
  CompetitionDetails,
  CompetitionStatus,
  CompetitionStatusProps,
  MetricProps,
} from "@wise-old-man/utils";
import { cn } from "~/utils/styling";
import { apiClient } from "~/utils/api";
import { Button } from "~/components/Button";
import { MetricIcon } from "~/components/Icon";
import { Container } from "~/components/Container";
import { Tabs, TabsList, TabsTrigger } from "~/components/Tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/Dropdown";
import { PreviewMetricDialog } from "~/components/competitions/PreviewMetricDialog";
import { CompetitionDialogLink } from "~/components/competitions/CompetitionDialogLink";
import { DeleteCompetitionDialog } from "~/components/competitions/DeleteCompetitionDialog";
import { CompetitionPreviewWarning } from "~/components/competitions/CompetitionPreviewWarning";
import { UpdateAllParticipantsDialog } from "~/components/competitions/UpdateAllParticipantsDialog";

import OverflowIcon from "~/assets/overflow.svg";

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

  const competition = await apiClient.competitions.getCompetitionDetails(id).catch((e) => {
    if (e instanceof Error && "statusCode" in e && e.statusCode === 404) {
      notFound();
    }
    throw e;
  });

  return (
    <Container className="mt-0 pt-0">
      <div className="sticky top-12 z-10 bg-gray-900 pb-5 pt-12">
        <Header {...competition} />
      </div>
      <div className="sticky top-56 z-10 pt-3 md:top-40">
        <div className="relative pb-8">
          <Navigation id={id} routeSegment={routeSegment} />
          <div className="absolute -bottom-2 left-0 right-0 h-10 bg-gradient-to-b from-gray-900 to-gray-900/0" />
        </div>
      </div>
      <CompetitionPreviewWarning trueMetric={competition.metric} />
      {children}

      {/* Dialogs */}
      <DeleteCompetitionDialog competitionId={id} />
      <UpdateAllParticipantsDialog competitionId={id} />
      <PreviewMetricDialog trueMetric={competition.metric} />
    </Container>
  );
}

interface NavigationProps {
  id: number;
  routeSegment: string;
}

function Navigation(props: NavigationProps) {
  const { id, routeSegment } = props;

  return (
    <div className="bg-gray-900">
      <Tabs defaultValue={routeSegment}>
        <TabsList aria-label="Competition Navigation">
          <Link href={`/competitions/${id}`} aria-label="Navigate to competition's participants">
            <TabsTrigger value="__PAGE__">Overview</TabsTrigger>
          </Link>
          <Link
            href={`/competitions/${id}/top-5`}
            aria-label="Navigate to competition's top 5 participants chart"
          >
            <TabsTrigger value="top-5">Top 5 chart</TabsTrigger>
          </Link>
        </TabsList>
      </Tabs>
    </div>
  );
}

function Header(props: CompetitionDetails) {
  const { id, metric, title, participantCount, group } = props;

  const status = getCompetitionStatus(props);

  const partipants = participantCount === 1 ? "1 participant" : `${participantCount} participants`;

  return (
    <div className="flex flex-col-reverse items-end justify-between gap-x-5 gap-y-7 md:flex-row">
      <div className="flex items-center gap-x-3">
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
            {partipants}
            {group && (
              <span>
                {` · Hosted by `}
                <Link href={`/groups/${group.id}`} className="font-medium text-blue-400 hover:underline">
                  {group.name}
                </Link>
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-x-2">
        <CompetitionDialogLink dialog="update-all">
          <Button variant="blue">Update all</Button>
        </CompetitionDialogLink>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button iconButton>
              <OverflowIcon className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <Link href={`/competitions/${id}/edit`}>
              <DropdownMenuItem>Edit</DropdownMenuItem>
            </Link>
            <CompetitionDialogLink dialog="delete">
              <DropdownMenuItem>Delete</DropdownMenuItem>
            </CompetitionDialogLink>
            <CompetitionDialogLink dialog="preview">
              <DropdownMenuItem>Preview as...</DropdownMenuItem>
            </CompetitionDialogLink>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export function getCompetitionStatus(competition: CompetitionDetails) {
  const now = new Date();

  if (competition.endsAt.getTime() < now.getTime()) {
    return CompetitionStatus.FINISHED;
  }

  if (competition.startsAt.getTime() < now.getTime()) {
    return CompetitionStatus.ONGOING;
  }

  return CompetitionStatus.UPCOMING;
}
