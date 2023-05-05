import { NameChange, NameChangeStatus } from "@wise-old-man/utils";
import { Badge } from "~/components/Badge";
import { ListTable, ListTableCell, ListTableRow } from "~/components/ListTable";
import { apiClient } from "~/utils/api";
import { timeago } from "~/utils/dates";
import { getNameChangeStatusParam, getSearchParam } from "~/utils/params";
import { capitalize } from "~/utils/strings";

import ArrowRightIcon from "~/assets/arrow_right.svg";

interface PageProps {
  searchParams: {
    search?: string;
    status?: string;
  };
}

export function generateMetadata(props: PageProps) {
  const { searchParams } = props;

  const status = getNameChangeStatusParam(searchParams.status);

  if (status) {
    return { title: `(${capitalize(status)}) Name Changes` };
  }

  return { title: "Name Changes" };
}

export default async function NameChangesPage(props: PageProps) {
  const { searchParams } = props;

  const search = getSearchParam(searchParams.search);
  const status = getNameChangeStatusParam(searchParams.status);

  const data = await apiClient.nameChanges.searchNameChanges({
    username: search,
    status,
  });

  if (!data || data.length === 0) {
    return (
      <div className="w-full rounded border border-gray-700 py-10 text-center text-sm text-gray-300">
        No results were found
      </div>
    );
  }

  return (
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
          <ListTableCell className="text-sm font-medium text-white">{nameChange.newName}</ListTableCell>
          <ListTableCell>Submitted {timeago.format(nameChange.createdAt)}</ListTableCell>
          <ListTableCell>{getResolvedTimeago(nameChange)}</ListTableCell>
          <ListTableCell>
            <StatusBadge status={nameChange.status} />
          </ListTableCell>
        </ListTableRow>
      ))}
    </ListTable>
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
