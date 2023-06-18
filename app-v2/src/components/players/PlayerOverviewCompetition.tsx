import Link from "next/link";
import Image from "next/image";
import {
  CompetitionListItem,
  CompetitionStatus,
  CompetitionStatusProps,
  ParticipationWithCompetition,
} from "@wise-old-man/utils";
import { cn } from "~/utils/styling";
import { timeago } from "~/utils/dates";
import { getCompetitionStatus } from "~/services/wiseoldman";
import { Label } from "../Label";
import { MetricIcon } from "../Icon";

interface PlayerOverviewCompetitionProps {
  username: string;
  participations: ParticipationWithCompetition[];
}

export function PlayerOverviewCompetition(props: PlayerOverviewCompetitionProps) {
  const { username, participations } = props;

  let featured: CompetitionListItem | undefined;

  const ongoing = participations
    .map((p) => p.competition)
    .filter((c) => getCompetitionStatus(c) === CompetitionStatus.ONGOING);

  if (ongoing.length > 0) {
    featured = ongoing.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())[0];
  } else {
    const upcoming = participations
      .map((p) => p.competition)
      .filter((c) => getCompetitionStatus(c) === CompetitionStatus.UPCOMING);

    if (upcoming.length > 0) {
      featured = upcoming.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())[0];
    }
  }

  if (!featured) return null;

  return (
    <div>
      <Label className="text-xs leading-4 text-gray-200">
        {featured.startsAt > new Date() ? "Upcoming competition" : "Ongoing competition"}
      </Label>
      <div className="mt-2">
        <CompetitionCard {...featured} />
      </div>
      <div className="mt-3 flex justify-end">
        <Link
          href={`/players/${username}/competitions`}
          className="text-xs font-medium text-gray-200 hover:underline"
        >
          View all
        </Link>
      </div>
    </div>
  );
}

function CompetitionCard(props: CompetitionListItem) {
  const status = getCompetitionStatus(props);

  let timeagoLabel: string | undefined;

  if (status === CompetitionStatus.FINISHED) {
    timeagoLabel = timeago.format(props.endsAt);
  } else if (status === CompetitionStatus.ONGOING) {
    timeagoLabel = timeago.format(props.endsAt, { future: true, round: "floor" });
  } else {
    timeagoLabel = timeago.format(props.startsAt, { future: true, round: "floor" });
  }

  return (
    <Link href={`/competitions/${props.id}`}>
      <div className="group relative flex h-[5rem] w-full items-center gap-x-4 overflow-hidden rounded-lg border border-gray-600 px-6 hover:border-gray-400">
        <Image
          alt={props.metric}
          fill
          className="pointer-events-none z-0 object-cover transition-all duration-100 group-hover:brightness-110"
          src={`/img/backgrounds/${props.metric}.png`}
        />
        <div className="z-1 relative mr-1">
          <MetricIcon metric={props.metric} />
        </div>
        <div className="z-1 relative flex flex-col gap-y-1">
          <span className="line-clamp-1 text-base font-medium">{props.title}</span>
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
      </div>
    </Link>
  );
}
