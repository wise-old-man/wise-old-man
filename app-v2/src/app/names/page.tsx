import { NameChange, NameChangeStatus } from "@wise-old-man/utils";
import { Badge } from "~/components/Badge";
import { Pagination } from "~/components/Pagination";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/Tooltip";
import { ListTable, ListTableCell, ListTableRow } from "~/components/ListTable";
import { apiClient } from "~/utils/api";
import { timeago } from "~/utils/dates";
import { getNameChangeStatusParam, getPageParam, getSearchParam } from "~/utils/params";
import { capitalize } from "~/utils/strings";

import ArrowRightIcon from "~/assets/arrow_right.svg";

const RESULTS_PER_PAGE = 20;

export const revalidate = 0;
export const dynamic = "force-dynamic";

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

  if (searchParams.dialog === "submit") {
    return { title: "Submit New Name Change" };
  }

  const page = getPageParam(searchParams.page) || 1;
  const status = getNameChangeStatusParam(searchParams.status);

  if (status) {
    return { title: `(${capitalize(status)}) Name Changes (Page ${page})` };
  }

  return { title: `Name Changes (Page ${page})` };
}

export default async function NameChangesPage(props: PageProps) {
  const { searchParams } = props;

  const page = getPageParam(searchParams.page) || 1;
  const search = getSearchParam(searchParams.search);
  const status = getNameChangeStatusParam(searchParams.status);

  const data = await apiClient.nameChanges.searchNameChanges(
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
        <div className="overflow-x-auto">
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
                    <TooltipContent>{formatDate(nameChange.createdAt)}</TooltipContent>
                  </Tooltip>
                </ListTableCell>
                <ListTableCell>
                  {nameChange.resolvedAt && (
                    <Tooltip>
                      <TooltipTrigger>{getResolvedTimeago(nameChange)}</TooltipTrigger>
                      <TooltipContent>{formatDate(nameChange.resolvedAt)}</TooltipContent>
                    </Tooltip>
                  )}
                </ListTableCell>
                <ListTableCell>
                  <StatusBadge status={nameChange.status} />
                </ListTableCell>
              </ListTableRow>
            ))}
          </ListTable>
        </div>
      )}
      <div className="mt-2">
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

function getResolvedTimeago(nameChange: NameChange) {
  if (nameChange.status === NameChangeStatus.APPROVED && nameChange.resolvedAt) {
    return `Approved ${timeago.format(nameChange.resolvedAt)} `;
  }

  if (nameChange.status === NameChangeStatus.DENIED && nameChange.resolvedAt) {
    return `Denied ${timeago.format(nameChange.resolvedAt)} `;
  }

  return "";
}

function formatDate(date: Date) {
  return date.toLocaleString(undefined, {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
