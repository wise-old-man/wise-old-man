import { CompetitionListItem, CompetitionTypeProps } from "@wise-old-man/utils";
import Link from "next/link";
import { timeago } from "~/utils/dates";
import { Badge } from "../Badge";
import { MetricIcon } from "../Icon";
import { ListTable, ListTableCell, ListTableRow } from "../ListTable";
import { getOrdinalSuffix } from "~/utils/strings";

interface CompetitionsListProps {
  showHost?: boolean;
  data: Array<CompetitionListItem & { rank?: number }>;
}

export function CompetitionsList(props: CompetitionsListProps) {
  const { data, showHost } = props;

  return (
    <>
      {/* Show a table on medium breakpoints and higher */}
      <div className="custom-scroll hidden overflow-x-auto md:block">
        <ListTable className="border-spacing-y-3">
          {data.map((competition) => (
            <CompetitionTableRow key={competition.id} competition={competition} showHost={showHost} />
          ))}
        </ListTable>
      </div>
      {/* Show a list of cards on small breakpoints and lower */}
      <div className="mt-3 flex flex-col gap-y-3 md:hidden">
        {data.map((competition) => (
          <CompetitionCard key={competition.id} competition={competition} showHost={showHost} />
        ))}
      </div>
    </>
  );
}

function CompetitionTime(props: Pick<CompetitionListItem, "startsAt" | "endsAt">) {
  const { endsAt, startsAt } = props;

  const now = new Date();

  if (endsAt < now) {
    return (
      <div className="flex items-center gap-x-2 text-xs text-gray-200">
        <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
        Finished · Ended {timeago.format(endsAt)}
      </div>
    );
  }

  if (startsAt < now) {
    return (
      <div className="flex items-center gap-x-2 text-xs text-gray-200">
        <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
        Ongoing · Ends {timeago.format(endsAt, { future: true, round: "floor" })}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-x-2 text-xs text-gray-200">
      <div className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
      Upcoming · Starts {timeago.format(startsAt, { future: true, round: "floor" })}
    </div>
  );
}

function CompetitionTableRow(props: { competition: CompetitionListItem; showHost?: boolean }) {
  const { competition } = props;

  return (
    <ListTableRow key={competition.id}>
      <ListTableCell>
        <div className="flex items-center gap-x-4">
          <MetricIcon metric={competition.metric} />
          <div className="flex flex-col">
            <Link
              prefetch={false}
              href={`/competitions/${competition.id}`}
              className="truncate text-base font-medium leading-7 text-white hover:underline"
            >
              {competition.title}
            </Link>
            <CompetitionAttributes competition={competition} showHost={props.showHost} />
          </div>
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
}

function CompetitionCard(props: { competition: CompetitionListItem; showHost?: boolean }) {
  const { competition } = props;

  return (
    <div className="flex flex-col gap-y-4 rounded-md border border-gray-500 bg-gray-800 px-4 py-3 shadow-sm">
      <div className="flex items-center gap-x-4">
        <MetricIcon metric={competition.metric} />
        <div className="flex flex-col overflow-hidden">
          <Link
            prefetch={false}
            href={`/competitions/${competition.id}`}
            className="truncate overflow-ellipsis text-sm font-medium leading-7 text-white hover:underline sm:text-base"
          >
            {competition.title}
          </Link>
          <CompetitionAttributes competition={competition} showHost={props.showHost} />
        </div>
      </div>

      <div className="flex items-center gap-x-3">
        <Badge>{CompetitionTypeProps[competition.type].name}</Badge>
        <CompetitionTime startsAt={competition.startsAt} endsAt={competition.endsAt} />
      </div>
    </div>
  );
}

function CompetitionAttributes(props: {
  competition: CompetitionListItem & { rank?: number };
  showHost?: boolean;
}) {
  const { competition, showHost } = props;

  const participantLabel = `${competition.participantCount} ${
    competition.participantCount === 1 ? "participant" : "participants"
  }`;

  const rankLabel = competition.rank
    ? ` · ${competition.rank}${getOrdinalSuffix(competition.rank)} place`
    : "";

  return (
    <span className="truncate text-xs text-gray-200">
      {competition.group && showHost ? (
        <>
          Hosted by&nbsp;
          <Link
            prefetch={false}
            href={`/groups/${competition.group.id}`}
            className="font-medium text-blue-400 hover:underline"
          >
            {competition.group.name}
          </Link>
          <span>
            {" "}
            · {participantLabel}
            {rankLabel}
          </span>
        </>
      ) : (
        <>{participantLabel}</>
      )}
    </span>
  );
}

export function CompetitionsListSkeleton(props: { count: number }) {
  const { count } = props;

  return (
    <>
      {/* Show a table on medium breakpoints and higher */}
      <div className="custom-scroll hidden overflow-x-auto md:block">
        <ListTable className="border-spacing-y-3">
          {[...Array(count)].map((_, i) => (
            <ListTableRow
              key={`competition_skeleton_row_${i}`}
              className="animate-pulse"
              style={{ opacity: 1 - i * (1 / count) }}
            >
              <ListTableCell className="flex items-center gap-x-3">
                <div className="h-6 w-6 animate-pulse rounded-full bg-gray-700" />
                <div className="flex flex-col gap-y-2 py-1">
                  <div className="h-4 w-60 animate-pulse rounded-lg bg-gray-700" />
                  <div className="h-3 w-28 animate-pulse rounded-lg bg-gray-700" />
                </div>
              </ListTableCell>
              <ListTableCell className="w-40 pr-4">
                <div className="h-3 w-28 animate-pulse rounded-lg bg-gray-700" />
              </ListTableCell>
              <ListTableCell className="w-28 pl-0">
                <div className="flex justify-end">
                  <div className="h-5 w-16 animate-pulse rounded-full bg-gray-700" />
                </div>
              </ListTableCell>
            </ListTableRow>
          ))}
        </ListTable>
      </div>
      {/* Show a list of cards on small breakpoints and lower */}
      <div className="mt-3 flex flex-col gap-y-3 md:hidden">
        {[...Array(3)].map((_, i) => (
          <div
            key={`competition_skeleton_card_${i}`}
            style={{ opacity: 1 - i * 0.3333 }}
            className="flex flex-col gap-y-3 rounded-md border border-gray-600 bg-gray-800 px-4 py-3 shadow-sm"
          >
            <div className="flex items-center gap-x-4">
              <div className="h-6 w-6 animate-pulse rounded-full bg-gray-700" />
              <div className="flex flex-col gap-y-2 py-1">
                <div className="h-4 w-60 animate-pulse rounded-lg bg-gray-700" />
                <div className="h-3 w-28 animate-pulse rounded-lg bg-gray-700" />
              </div>
            </div>
            <div className="flex items-center gap-x-3">
              <div className="h-[1.375rem] w-16 animate-pulse rounded-full bg-gray-700" />
              <div className="h-3 w-28 animate-pulse rounded-lg bg-gray-700" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
