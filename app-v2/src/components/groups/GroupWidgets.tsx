import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CompetitionListItem,
  CompetitionStatus,
  CompetitionStatusProps,
  GroupDetails,
  Metric,
  formatNumber,
} from "@wise-old-man/utils";
import { cn } from "~/utils/styling";
import { timeago } from "~/utils/dates";
import { apiClient, getCompetitionStatus } from "~/services/wiseoldman";
import { MetricIcon, MetricIconSmall } from "~/components/Icon";
import { Label } from "../Label";
import { Badge } from "../Badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "../Tooltip";

export const runtime = "edge";
export const dynamic = "force-dynamic";

interface GroupWidgetsProps {
  group: GroupDetails;
}

export function GroupWidgets(props: GroupWidgetsProps) {
  const { group } = props;

  const totalExp = group.memberships.reduce((acc, cur) => (acc += cur.player.exp), 0);
  const totalEHP = group.memberships.reduce((acc, cur) => (acc += cur.player.ehp), 0);
  const totalEHB = group.memberships.reduce((acc, cur) => (acc += cur.player.ehb), 0);

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-5">
      <div className="col-span-1 md:col-span-2">
        <Suspense fallback={<FeaturedCompetitionWidgetSkeleton />}>
          <FeaturedCompetitionWidget groupId={group.id} />
        </Suspense>
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="group flex h-[5rem] w-full flex-col items-start justify-center gap-y-2 rounded-lg border border-gray-600 px-6">
            <div className="flex items-center gap-x-1">
              <MetricIconSmall metric={Metric.OVERALL} />
              <Label className="text-xs text-gray-200">Total Experience</Label>
            </div>
            <div className="flex items-end gap-x-2">
              <span className="line-clamp-1 text-lg leading-5 text-white">
                {formatNumber(totalExp, true)}
              </span>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {formatNumber(totalExp, false)} Total experience. (
          {formatNumber(Math.round(totalExp / group.memberships.length), false)} avg.)
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="group flex h-[5rem] w-full flex-col items-start justify-center gap-y-2 rounded-lg border border-gray-600 px-6">
            <div className="flex items-center gap-x-1">
              <MetricIconSmall metric={Metric.EHP} />
              <Label className="text-xs text-gray-200">Total EHP</Label>
            </div>
            <div className="flex items-end gap-x-2">
              <span className="line-clamp-1 text-lg leading-5 text-white">
                {formatNumber(totalEHP, true)}
              </span>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {formatNumber(totalEHP, false)} Total Efficient Hours Played. (
          {formatNumber(Math.round(totalEHP / group.memberships.length), false)} avg.)
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <div className="group flex h-[5rem] w-full flex-col items-start justify-center gap-y-2 rounded-lg border border-gray-600 px-6">
            <div className="flex items-center gap-x-1">
              <MetricIconSmall metric={Metric.EHB} />
              <Label className="text-xs text-gray-200">Total EHB</Label>
            </div>
            <div className="flex items-end gap-x-2">
              <span className="line-clamp-1 text-lg leading-5 text-white">
                {formatNumber(totalEHB, true)}
              </span>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {formatNumber(totalEHB, false)} Total Efficient Hours Bossed. (
          {formatNumber(Math.round(totalEHB / group.memberships.length), false)} avg.)
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

async function FeaturedCompetitionWidget(props: { groupId: number }) {
  const competitions = await apiClient.groups.getGroupCompetitions(props.groupId);

  let featured: CompetitionListItem | undefined;

  const ongoing = competitions.filter((c) => getCompetitionStatus(c) === CompetitionStatus.ONGOING);

  if (ongoing.length > 0) {
    featured = ongoing.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())[0];
  } else {
    const upcoming = competitions.filter((c) => getCompetitionStatus(c) === CompetitionStatus.UPCOMING);

    if (upcoming.length > 0) {
      featured = upcoming.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())[0];
    }
  }

  if (!featured) {
    return (
      <div className="flex h-[5rem] w-full items-center justify-center rounded-lg border border-gray-600 px-6">
        <span className="text-gray-400">No featured competitions</span>
      </div>
    );
  }

  const status = getCompetitionStatus(featured);

  let timeagoLabel: string | undefined;

  if (status === CompetitionStatus.FINISHED) {
    timeagoLabel = timeago.format(featured.endsAt);
  } else if (status === CompetitionStatus.ONGOING) {
    timeagoLabel = timeago.format(featured.endsAt, { future: true, round: "floor" });
  } else {
    timeagoLabel = timeago.format(featured.startsAt, { future: true, round: "floor" });
  }

  return (
    <Link href={`/competitions/${featured.id}`}>
      <div className="group relative flex h-[5rem] w-full items-center gap-x-4 overflow-hidden rounded-lg border border-gray-600 px-6 hover:border-gray-400">
        <Image
          alt={featured.metric}
          fill
          className="pointer-events-none z-0 object-cover transition-all duration-100 group-hover:brightness-110"
          src={`/img/backgrounds/${featured.metric}.png`}
        />
        <div className="z-1 relative mr-1">
          <MetricIcon metric={featured.metric} />
        </div>
        <div className="z-1 relative flex flex-col gap-y-1">
          <span className="line-clamp-1 text-base font-medium">{featured.title}</span>
          <span className="line-clamp-1 flex items-center text-xs text-gray-200">
            <div
              className={cn("mr-1.5 h-1.5 w-1.5 rounded-full", {
                "bg-red-500": status === CompetitionStatus.FINISHED,
                "bg-green-500": status === CompetitionStatus.ONGOING,
                "bg-yellow-500": status === CompetitionStatus.UPCOMING,
              })}
            />
            {CompetitionStatusProps[status].name} · {timeagoLabel}
          </span>
        </div>
        <Badge className="absolute bottom-3 right-3 border border-gray-400 bg-black/20">Featured</Badge>
      </div>
    </Link>
  );
}

function FeaturedCompetitionWidgetSkeleton() {
  return (
    <div className="relative flex h-[5rem] w-full animate-pulse items-center gap-x-4 overflow-hidden rounded-lg border border-gray-600 bg-gray-800 px-6">
      <div className="z-1 relative h-7 w-7 shrink-0 animate-pulse rounded-full bg-gray-500" />
      <div className="z-1 relative flex w-full flex-col gap-y-2">
        <div className="h-4 w-56 animate-pulse rounded-lg bg-gray-400" />
        <div className="h-3 w-32 animate-pulse rounded-lg bg-gray-500" />
      </div>
    </div>
  );
}
