import { Suspense } from "react";
import { NameChange, NameChangeStatus } from "@wise-old-man/utils";
import { Badge } from "~/components/Badge";
import { Pagination } from "~/components/Pagination";
import { ReviewContextTooltip } from "~/components/names/ReviewContextTooltip";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/Tooltip";
import { ListTable, ListTableCell, ListTableRow } from "~/components/ListTable";
import { capitalize } from "~/utils/strings";
import { formatDatetime, timeago } from "~/utils/dates";
import { fetchNameChanges } from "~/services/wiseoldman";
import { getNameChangeStatusParam, getPageParam, getSearchParam } from "~/utils/params";

export const runtime = "edge";
export const dynamic = "force-dynamic";

import InfoIcon from "~/assets/info.svg";
import ArrowRightIcon from "~/assets/arrow_right.svg";

const RESULTS_PER_PAGE = 20;

interface PageProps {
  searchParams: {
    page?: string;
    dialog?: string;
    search?: string;
    status?: string;
  };
}

export function generateMetadata(props: PageProps) {
  const { searchParams } = props;

  if (searchParams.dialog === "submit-name") {
    return { title: "Submit New Name Change" };
  }

  const page = getPageParam(searchParams.page) || 1;
  const status = getNameChangeStatusParam(searchParams.status);

  if (status) {
    return { title: `(${capitalize(status)}) Name Changes (Page ${page})` };
  }

  return { title: `Name Changes (Page ${page})` };
}

export default async function NameChangesPageWrapper(props: PageProps) {
  // As of Next.js 13.4.1, modifying searchParams doesn't trigger the page's file-based suspense boundary to re-fallback.
  // So to bypass that until there's a fix, we'll make our manage our own suspense boundary with params as a unique key.

  // The "dialog" search param shouldn't trigger a re-fetch
  const key = JSON.stringify({ ...props.searchParams, dialog: undefined });

  return (
    <Suspense key={key} fallback={<LoadingState />}>
      {/* @ts-expect-error - Server Component  */}
      <NameChangesPage {...props} />
    </Suspense>
  );
}

async function NameChangesPage(props: PageProps) {
  const { searchParams } = props;

  const page = getPageParam(searchParams.page) || 1;
  const search = getSearchParam(searchParams.search);
  const status = getNameChangeStatusParam(searchParams.status);

  const data = await fetchNameChanges(
    { username: search, status },
    { limit: RESULTS_PER_PAGE, offset: (page - 1) * RESULTS_PER_PAGE }
  );

  return (
    <>
      {!data || data.length === 0 ? (
        <div className="w-full rounded border border-gray-700 py-10 text-center text-sm text-gray-300">
          No results were found
        </div>
      ) : (
        <div className="custom-scroll overflow-x-auto">
          <ListTable>
            {data.map((nameChange) => (
              <ListTableRow key={nameChange.id}>
                <ListTableCell>{nameChange.id}</ListTableCell>
                <ListTableCell className="py-4 text-sm font-medium text-white">
                  {nameChange.oldName}
                </ListTableCell>
                <ListTableCell>
                  <ArrowRightIcon className="h-4 w-4 text-white" />
                </ListTableCell>
                <ListTableCell className="text-sm font-medium text-white">
                  {nameChange.newName}
                </ListTableCell>
                <ListTableCell>
                  <Tooltip>
                    <TooltipTrigger>Submitted {timeago.format(nameChange.createdAt)}</TooltipTrigger>
                    <TooltipContent>{formatDatetime(nameChange.createdAt)}</TooltipContent>
                  </Tooltip>
                </ListTableCell>
                <ListTableCell>
                  {nameChange.resolvedAt && (
                    <Tooltip>
                      <TooltipTrigger>{getResolvedTimeago(nameChange)}</TooltipTrigger>
                      <TooltipContent>{formatDatetime(nameChange.resolvedAt)}</TooltipContent>
                    </Tooltip>
                  )}
                  {!nameChange.resolvedAt && nameChange.reviewContext && (
                    <Tooltip>
                      <TooltipTrigger>{getResolvedTimeago(nameChange)}</TooltipTrigger>
                      <TooltipContent>{formatDatetime(nameChange.updatedAt)}</TooltipContent>
                    </Tooltip>
                  )}
                </ListTableCell>
                <ListTableCell className="w-20">
                  <StatusBadge status={nameChange.status} />
                </ListTableCell>
                <ListTableCell>
                  {nameChange.reviewContext && (
                    <ReviewContextTooltip {...nameChange}>
                      <InfoIcon className="h-4 w-4 text-gray-300" />
                    </ReviewContextTooltip>
                  )}
                </ListTableCell>
              </ListTableRow>
            ))}
          </ListTable>
        </div>
      )}
      <div className="mt-4">
        <Pagination currentPage={page} hasMorePages={data.length >= RESULTS_PER_PAGE} />
      </div>
    </>
  );
}

function StatusBadge(props: { status: NameChangeStatus }) {
  switch (props.status) {
    case NameChangeStatus.APPROVED:
      return <Badge variant="success">Approved</Badge>;
    case NameChangeStatus.DENIED:
      return <Badge variant="error">Denied</Badge>;
    default:
      return <Badge>Pending</Badge>;
  }
}

function LoadingState() {
  return (
    <div className="custom-scroll overflow-x-auto">
      <ListTable>
        {[...Array(20)].map((_, i) => (
          <ListTableRow key={`name_change_skeleton_${i}`}>
            <ListTableCell>
              <div className="h-4 w-12 animate-pulse rounded-xl bg-gray-600" />
            </ListTableCell>
            <ListTableCell className="py-[1.1rem]">
              <div className="h-[1.05rem] w-24 animate-pulse rounded-xl bg-gray-500" />
            </ListTableCell>
            <ListTableCell>
              <ArrowRightIcon className="h-4 w-4 animate-pulse text-gray-300" />
            </ListTableCell>
            <ListTableCell>
              <div className="h-[1.05rem] w-20 animate-pulse rounded-xl bg-gray-500" />
            </ListTableCell>
            <ListTableCell>
              <div className="h-4 w-36 animate-pulse rounded-xl bg-gray-600" />
            </ListTableCell>
            <ListTableCell>
              <div className="h-4 w-36 animate-pulse rounded-xl bg-gray-600" />
            </ListTableCell>
            <ListTableCell>
              <div className="h-6 w-24 animate-pulse rounded-xl bg-gray-600" />
            </ListTableCell>
          </ListTableRow>
        ))}
      </ListTable>
    </div>
  );
}

function getResolvedTimeago(nameChange: NameChange) {
  if (!nameChange.resolvedAt) {
    return `Auto-reviewed ${timeago.format(nameChange.updatedAt)} (skipped)`;
  }

  if (nameChange.status === NameChangeStatus.APPROVED && nameChange.resolvedAt) {
    return `Approved ${timeago.format(nameChange.resolvedAt)} `;
  }

  if (nameChange.status === NameChangeStatus.DENIED && nameChange.resolvedAt) {
    return `Denied ${timeago.format(nameChange.resolvedAt)} `;
  }

  return "";
}
