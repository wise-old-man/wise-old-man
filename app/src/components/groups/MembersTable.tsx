"use client";

import { ColumnDef } from "@tanstack/react-table";
import { GroupDetails, GroupRoleProps, MembershipWithPlayer, PlayerStatus } from "@wise-old-man/utils";
import { formatDatetime, timeago } from "~/utils/dates";
import { GroupRoleIcon } from "../Icon";
import { DataTable } from "../DataTable";
import { MembersFilter } from "./MembersFilter";
import { PlayerIdentity } from "../PlayerIdentity";
import { FormattedNumber } from "../FormattedNumber";
import { TableSortButton, TableTitle } from "../Table";
import { Tooltip, TooltipContent, TooltipTrigger } from "../Tooltip";
import { QueryLink } from "../QueryLink";
import { Button } from "../Button";

import ExportIcon from "~/assets/export.svg";

interface MembersTableProps {
  group: GroupDetails;
  filter?: string;
}

export function MembersTable(props: MembersTableProps) {
  const { group, filter } = props;

  const rows = filter ? filterMembers(group.memberships, filter) : group.memberships;

  return (
    <DataTable
      columns={COLUMN_DEFS}
      data={rows}
      enablePagination
      headerSlot={
        <TableTitle>
          <div className="w-full @container">
            <div className="flex flex-col justify-between gap-y-5 @lg:flex-row @lg:items-center">
              <div>
                <h3 className="text-h3 font-medium text-white">Members</h3>
                <p className="text-body text-gray-200">
                  {getCaptionLabel(group.name, rows.length, filter)}
                </p>
              </div>
              <div className="flex items-center gap-x-2">
                <div className="@lg:w-48">
                  <MembersFilter groupId={group.id} filter={filter} />
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <QueryLink query={{ dialog: "export" }}>
                      <Button className="flex w-9 justify-center" iconButton>
                        <ExportIcon className="h-4 w-4 text-gray-100" />
                      </Button>
                    </QueryLink>
                  </TooltipTrigger>
                  <TooltipContent>Export group members table.</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </TableTitle>
      }
    />
  );
}

const COLUMN_DEFS: ColumnDef<MembershipWithPlayer>[] = [
  {
    accessorKey: "player",
    header: ({ column }) => {
      return <TableSortButton column={column}>Player</TableSortButton>;
    },
    cell: ({ row }) => {
      return (
        <div>
          <PlayerIdentity
            player={row.original.player}
            caption={
              <div className="flex items-center gap-x-1 pr-5">
                <GroupRoleIcon role={row.original.role} />
                <span>{GroupRoleProps[row.original.role].name}</span>
              </div>
            }
          />
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      return rowA.original.player.displayName.localeCompare(rowB.original.player.displayName);
    },
  },
  {
    id: "exp",
    accessorFn: (row) => row.player.exp,
    header: ({ column }) => {
      return <TableSortButton column={column}>Experience</TableSortButton>;
    },
    cell: ({ row }) => {
      return <FormattedNumber value={row.original.player.exp} />;
    },
  },
  {
    id: "lastChangedAt",
    accessorFn: (row) => row.player.lastChangedAt,
    header: ({ column }) => {
      return <TableSortButton column={column}>Last progressed</TableSortButton>;
    },
    cell: ({ row }) => {
      if (!row.original.player.lastChangedAt) return "Unknown";

      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span>{timeago.format(row.original.player.lastChangedAt)}</span>
          </TooltipTrigger>
          <TooltipContent>{formatDatetime(row.original.player.lastChangedAt)}</TooltipContent>
        </Tooltip>
      );
    },
  },
  {
    id: "updatedAt",
    accessorFn: (row) => row.player.updatedAt,
    header: ({ column }) => {
      return <TableSortButton column={column}>Last updated</TableSortButton>;
    },
    cell: ({ row }) => {
      if (!row.original.player.updatedAt) return "Unknown";

      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span>{timeago.format(row.original.player.updatedAt)}</span>
          </TooltipTrigger>
          <TooltipContent>{formatDatetime(row.original.player.updatedAt)}</TooltipContent>
        </Tooltip>
      );
    },
  },
];

function getCaptionLabel(groupName: string, rowCount: number, filter?: string) {
  if (filter === "invalid_or_outdated") {
    return `Showing only ${rowCount} invalid or outdated members`;
  }

  if (filter === "inactive_7_days") {
    return `Showing only ${rowCount} players that haven't had gains in the last 7 days`;
  }

  if (filter === "inactive_30_days") {
    return `Showing only ${rowCount} players that haven't had gains in the last 30 days`;
  }

  if (filter === "inactive_90_days") {
    return `Showing only ${rowCount} players that haven't had gains in the last 90 days`;
  }

  return `Showing all ${rowCount} members of ${groupName}`;
}

function filterMembers(members: MembershipWithPlayer[], filter: string) {
  if (filter === "invalid_or_outdated") {
    return members.filter(
      (m) =>
        m.player.status !== PlayerStatus.ACTIVE ||
        !m.player.updatedAt ||
        m.player.updatedAt.getTime() < Date.now() - 1000 * 60 * 60 * 24 * 7
    );
  }

  if (filter === "inactive_7_days") {
    return members.filter(
      (m) =>
        !m.player.lastChangedAt ||
        m.player.lastChangedAt.getTime() < Date.now() - 1000 * 60 * 60 * 24 * 7
    );
  }

  if (filter === "inactive_30_days") {
    return members.filter(
      (m) =>
        !m.player.lastChangedAt ||
        m.player.lastChangedAt.getTime() < Date.now() - 1000 * 60 * 60 * 24 * 30
    );
  }

  if (filter === "inactive_90_days") {
    return members.filter(
      (m) =>
        !m.player.lastChangedAt ||
        m.player.lastChangedAt.getTime() < Date.now() - 1000 * 60 * 60 * 24 * 90
    );
  }

  return members;
}
