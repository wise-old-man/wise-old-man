import {
  CompetitionDetailsResponse,
  CompetitionResponse,
  CompetitionStatus,
  CompetitionStatusProps,
  isMetric,
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
import { cn } from "~/utils/styling";

import OverflowIcon from "~/assets/overflow.svg";
import { CompetitionMetricTabs } from "~/components/competitions/CompetitionMetricTabs";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: {
    id: number;
  };
  searchParams: {
    metric?: string;
  };
}

function getMetricParam(metricParam: string | undefined) {
  return metricParam && isMetric(metricParam) ? metricParam : undefined;
}

export async function generateMetadata(props: PageProps) {
  const { id } = props.params;

  const metric = getMetricParam(props.searchParams.metric);
  const competition = await getCompetitionDetails(id, metric);

  return {
    title: competition.title,
  };
}

export default async function CompetitionPage(props: PageProps) {
  const { id } = props.params;

  const metric = getMetricParam(props.searchParams.metric);
  const competitionDetails = await getCompetitionDetails(id, metric);

  return (
    <Container>
      <div className="flex flex-col gap-y-10 border-b border-gray-600 pb-8">
        <Header competitionDetails={competitionDetails} />
      </div>
      <div className="mt-6 flex flex-col gap-6 md:flex-row">
        <div className="flex w-full flex-col gap-y-5 border md:w-[360px]">
          <div>Time range picker</div>
          <div>Countdown & active count</div>
          <CompetitionValueDistribution competitionDetails={competitionDetails} />
          <div>Momentum</div>
        </div>
        <div className="flex grow flex-col gap-y-5 border">
          <CompetitionMetricTabs
            metrics={competitionDetails.metrics.map((m) => m.metric)}
            selectedMetric={competitionDetails.metric}
            onMetricSelected={() => {}}
          />
          <div>Total & chart</div>
          <div>Table</div>
        </div>
      </div>
    </Container>
  );
}

function Header({ competitionDetails }: { competitionDetails: CompetitionDetailsResponse }) {
  const status = getCompetitionStatus(competitionDetails);

  return (
    <div className="flex flex-grow flex-col items-end justify-between gap-y-5 sm:flex-row">
      <div className="flex w-full flex-col gap-3 sm:flex-row">
        <MetricAvatarGroup size="lg" metrics={competitionDetails.metrics.map((m) => m.metric)} />
        <div className="flex flex-col">
          <span className="line-clamp-1 text-lg font-medium text-white">{competitionDetails.title}</span>
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
            <span>{` · ${competitionDetails.participantCount} participants `}</span>
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
            <QueryLink query={{ dialog: "preview" }}>
              <DropdownMenuItem>Preview as...</DropdownMenuItem>
            </QueryLink>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
