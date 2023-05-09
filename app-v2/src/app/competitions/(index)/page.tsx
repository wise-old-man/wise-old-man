import Link from "next/link";
import Image from "next/image";
import { CompetitionListItem, CompetitionTypeProps, Metric } from "@wise-old-man/utils";
import { apiClient } from "~/utils/api";
import { timeago } from "~/utils/dates";
import { Badge } from "~/components/Badge";
import { Pagination } from "~/components/Pagination";
import {
  getCompetitionStatusParam,
  getCompetitionTypeParam,
  getMetricParam,
  getPageParam,
  getSearchParam,
} from "~/utils/params";
import { ListTable, ListTableCell, ListTableRow } from "~/components/ListTable";

const RESULTS_PER_PAGE = 20;

interface PageProps {
  searchParams: {
    page?: string;
    search?: string;
    type?: string;
    status?: string;
    metric?: string;
  };
}

export function generateMetadata(props: PageProps) {
  const { searchParams } = props;

  const page = getPageParam(searchParams.page) || 1;
  const search = getSearchParam(searchParams.search);

  if (search && search.length > 0) {
    return { title: `Competition search results for "${search}" (Page ${page})` };
  }

  return { title: `Competitions (Page ${page})` };
}

export default async function CompetitionsPage(props: PageProps) {
  const { searchParams } = props;

  const page = getPageParam(searchParams.page) || 1;
  const search = getSearchParam(searchParams.search);
  const metric = getMetricParam(searchParams.metric);
  const type = getCompetitionTypeParam(searchParams.type);
  const status = getCompetitionStatusParam(searchParams.status);

  const data = await apiClient.competitions.searchCompetitions(
    { title: search, type, status, metric },
    {
      limit: RESULTS_PER_PAGE,
      offset: (page - 1) * RESULTS_PER_PAGE,
    }
  );

  return (
    <>
      {!data || data.length === 0 ? (
        <div className="w-full rounded border border-gray-700 py-10 text-center text-sm text-gray-300">
          No results were found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <ListTable className="border-spacing-y-3">
            {data.map((competition) => {
              const participantLabel = `${competition.participantCount} ${
                competition.participantCount === 1 ? "participant" : "participants"
              }`;

              return (
                <ListTableRow key={competition.id}>
                  <ListTableCell className="flex items-center gap-x-3">
                    <MetricIcon metric={competition.metric} />
                    <div className="flex flex-col">
                      <Link
                        href={`/competitions/${competition.id}`}
                        className="truncate text-base font-medium leading-7 text-white hover:underline"
                      >
                        {competition.title}
                      </Link>
                      <span className="truncate text-xs">
                        {competition.group ? (
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
        </div>
      )}
      <div className="mt-5">
        <Pagination currentPage={page} hasMorePages={data.length >= RESULTS_PER_PAGE} />
      </div>
    </>
  );
}

function MetricIcon(props: { metric: Metric }) {
  const { metric } = props;
  return <Image height={24} width={24} alt={metric} src={`/img/metrics/${metric}.png`} />;
}

function CompetitionTime(props: Pick<CompetitionListItem, "startsAt" | "endsAt">) {
  const { endsAt, startsAt } = props;

  const now = new Date();

  if (endsAt < now) {
    return (
      <div className="flex items-center gap-x-2">
        <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
        Ended {timeago.format(endsAt)}
      </div>
    );
  }

  if (startsAt < now) {
    return (
      <div className="flex items-center gap-x-2">
        <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
        Ends in {timeago.format(endsAt, { future: true, round: "floor" })}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-x-2">
      <div className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
      Starts in {timeago.format(startsAt, { future: true, round: "floor" })}
    </div>
  );
}
