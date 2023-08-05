"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Player, NameChange } from "@wise-old-man/utils";
import { formatDatetime, timeago } from "~/utils/dates";
import { TableTitle } from "../Table";
import { DataTable } from "../DataTable";
import { PlayerIdentity } from "../PlayerIdentity";
import { Tooltip, TooltipContent, TooltipTrigger } from "../Tooltip";

interface GroupNameChangesTableProps {
  nameChanges: Array<NameChange & { player: Player }>;
}

export function GroupNameChangesTable(props: GroupNameChangesTableProps) {
  const { nameChanges } = props;

  return (
    <DataTable
      columns={COLUMN_DEFS}
      data={nameChanges}
      enablePagination
      headerSlot={
        <TableTitle className="flex flex-col items-start">
          <h3 className="text-h3 font-medium text-white">Recent name changes</h3>
        </TableTitle>
      }
    />
  );
}

const COLUMN_DEFS: ColumnDef<NameChange & { player: Player }>[] = [
  {
    accessorKey: "player",
    header: "Player",
    cell: ({ row }) => {
      return <PlayerIdentity player={row.original.player} />;
    },
  },
  {
    accessorKey: "oldName",
    header: "Old Name",
  },
  {
    accessorKey: "newName",
    header: "New Name",
  },
  {
    accessorKey: "approvedAt",
    header: "Approved",
    cell: ({ row }) => {
      if (!row.original.resolvedAt) return null;

      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span>{timeago.format(row.original.resolvedAt)}</span>
          </TooltipTrigger>
          <TooltipContent>{formatDatetime(row.original.resolvedAt)}</TooltipContent>
        </Tooltip>
      );
    },
  },
];
