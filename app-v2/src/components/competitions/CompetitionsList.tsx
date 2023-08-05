import { CompetitionListItem, CompetitionTypeProps } from "@wise-old-man/utils";
import Link from "next/link";
import { Badge } from "../Badge";
import { MetricIcon } from "../Icon";
import { ListTable, ListTableCell, ListTableRow } from "../ListTable";
import { timeago } from "~/utils/dates";

interface CompetitionsListProps {
  showHost?: boolean;
  data: CompetitionListItem[];
}

export function CompetitionsList(props: CompetitionsListProps) {
  return (
    <ListTable className="border-spacing-y-3">
      {props.data.map((competition) => {
        const participantLabel = `${competition.participantCount} ${
          competition.participantCount === 1 ? "participant" : "participants"
        }`;

        return (
          <ListTableRow key={competition.id}>
            <ListTableCell className="flex items-center gap-x-4">
              <MetricIcon metric={competition.metric} />
              <div className="flex flex-col">
                <Link
                  prefetch={false}
                  href={`/competitions/${competition.id}`}
                  className="truncate text-base font-medium leading-7 text-white hover:underline"
                >
                  {competition.title}
                </Link>
                <span className="truncate text-xs">
                  {competition.group && props.showHost ? (
                    <>
                      Hosted by&nbsp;
                      <Link
                        prefetch={false}
                        href={`/groups/${competition.group.id}`}
                        className="font-medium text-blue-400 hover:underline"
                      >
                        {competition.group.name}
                      </Link>
                      <span> · {participantLabel}</span>
                    </>
                  ) : (
                    <>{participantLabel}</>
                  )}
                </span>
              </div>
            </ListTableCell>
            <ListTableCell className="w-40 pr-4">
              <CompetitionTime startsAt={competition.startsAt} endsAt={competition.endsAt} />
            </ListTableCell>
            <ListTableCell className="w-28 pl-0 text-right">
              <Badge>{CompetitionTypeProps[competition.type].name}</Badge>
            </ListTableCell>
          </ListTableRow>
        );
      })}
    </ListTable>
  );
}

function CompetitionTime(props: Pick<CompetitionListItem, "startsAt" | "endsAt">) {
  const { endsAt, startsAt } = props;

  const now = new Date();

  if (endsAt < now) {
    return (
      <div className="flex items-center gap-x-2">
        <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
        Finished · Ended {timeago.format(endsAt)}
      </div>
    );
  }

  if (startsAt < now) {
    return (
      <div className="flex items-center gap-x-2">
        <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
        Ongoing · Ends {timeago.format(endsAt, { future: true, round: "floor" })}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-x-2">
      <div className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
      Upcoming · Starts {timeago.format(startsAt, { future: true, round: "floor" })}
    </div>
  );
}
