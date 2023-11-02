"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ExtendedAchievementWithPlayer } from "@wise-old-man/utils";
import { timeago } from "~/utils/dates";
import { TableTitle } from "../Table";
import { DataTable } from "../DataTable";
import { PlayerIdentity } from "../PlayerIdentity";
import { AchievementDate } from "../AchievementDate";
import { MetricIconSmall } from "../Icon";

interface GroupAchievementsTableProps {
  achievements: ExtendedAchievementWithPlayer[];
}

export function GroupAchievementsTable(props: GroupAchievementsTableProps) {
  const { achievements } = props;

  return (
    <DataTable
      columns={COLUMN_DEFS}
      data={achievements}
      enablePagination
      headerSlot={
        <TableTitle className="flex flex-col items-start">
          <h3 className="text-h3 font-medium text-white">Recent achievements</h3>
        </TableTitle>
      }
    />
  );
}

const COLUMN_DEFS: ColumnDef<ExtendedAchievementWithPlayer>[] = [
  {
    accessorKey: "player",
    header: "Player",
    cell: ({ row }) => {
      return (
        <div className="pr-5">
          <PlayerIdentity
            player={row.original.player}
            caption={
              row.original.player.updatedAt
                ? `Updated ${timeago.format(row.original.player.updatedAt)}`
                : undefined
            }
          />
        </div>
      );
    },
  },
  {
    accessorKey: "achievement",
    header: "Achievement",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-x-1">
          <MetricIconSmall metric={row.original.metric} />
          {row.original.name}
        </div>
      );
    },
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      return <AchievementDate {...row.original} />;
    },
  },
];
