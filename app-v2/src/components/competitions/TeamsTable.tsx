"use client";

import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { CompetitionDetails, Metric, ParticipationWithPlayerAndProgress } from "@wise-old-man/utils";
import { Button } from "../Button";
import { DataTable } from "../DataTable";
import { QueryLink } from "../QueryLink";
import { FormattedNumber } from "../FormattedNumber";
import { TableSortButton, TableTitle } from "../Table";
import { PlayerIdentityTooltip } from "../PlayerIdentity";
import { Tooltip, TooltipContent, TooltipTrigger } from "../Tooltip";

import ExportIcon from "~/assets/export.svg";

const COLUMN_DEFINITIONS: ColumnDef<Team>[] = [
  {
    id: "rank",
    header: ({ column }) => {
      return <TableSortButton column={column}>Rank</TableSortButton>;
    },
    accessorFn: (_, index) => {
      return index + 1;
    },
  },
  {
    id: "name",
    header: ({ column }) => {
      return <TableSortButton column={column}>Name</TableSortButton>;
    },
    accessorFn: (row) => {
      return row.name;
    },
  },
  {
    id: "count",
    header: ({ column }) => {
      return <TableSortButton column={column}>Players</TableSortButton>;
    },
    accessorFn: (row) => {
      return row.participations.length;
    },
  },
  {
    id: "total",
    header: ({ column }) => {
      return <TableSortButton column={column}>Total gained</TableSortButton>;
    },
    accessorFn: (row) => {
      return row.participations.reduce((acc, curr) => acc + curr.progress.gained, 0);
    },
    cell: ({ row }) => {
      const total = Number(row.getValue("total"));
      if (total <= 0) return "0";

      return (
        <span className="text-green-500">
          +
          <FormattedNumber value={total} />
        </span>
      );
    },
  },
  {
    id: "average",
    header: ({ column }) => {
      return <TableSortButton column={column}>Avg. gained</TableSortButton>;
    },
    accessorFn: (row) => {
      return (
        row.participations.reduce((acc, curr) => acc + curr.progress.gained, 0) /
        row.participations.length
      );
    },
    cell: ({ row }) => {
      const avg = parseInt(row.getValue("average"));
      if (avg <= 0) return "0";

      return (
        <span className="text-green-500">
          +
          <FormattedNumber value={avg} />
        </span>
      );
    },
  },
  {
    id: "mvp",
    header: ({ column }) => {
      return <TableSortButton column={column}>MVP</TableSortButton>;
    },
    accessorFn: (row) => {
      return row.participations[0];
    },
    sortingFn: (rowA, rowB) => {
      return (
        rowA.original.participations[0].progress.gained - rowB.original.participations[1].progress.gained
      );
    },
    cell: ({ row }) => {
      const mvp = row.getValue("mvp") as ParticipationWithPlayerAndProgress;

      return (
        <span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                prefetch={false}
                href={`/players/${mvp.player.username}`}
                className="mr-1 text-gray-100 hover:text-white hover:underline"
              >
                {mvp.player.displayName}
              </Link>
            </TooltipTrigger>
            <TooltipContent className="min-w-[16rem] max-w-lg p-0">
              <PlayerIdentityTooltip player={mvp.player} />
            </TooltipContent>
          </Tooltip>
          (
          {mvp.progress.gained <= 0 ? (
            <>0</>
          ) : (
            <span className="text-green-500">
              +
              <FormattedNumber value={mvp.progress.gained} />
            </span>
          )}
          )
        </span>
      );
    },
  },
  {
    id: "expand",
    header: () => "",
    cell: ({ row }) => {
      return (
        <div className="flex justify-end">
          <QueryLink query={{ dialog: "team", team: encodeURI(row.original.name) }}>
            <Button size="sm">Show more</Button>
          </QueryLink>
        </div>
      );
    },
  },
];

interface TeamsTableProps {
  metric: Metric;
  competition: CompetitionDetails;
}

export function TeamsTable(props: TeamsTableProps) {
  const { competition } = props;

  const teams = getTeams(competition);

  return (
    <DataTable
      data={teams}
      columns={COLUMN_DEFINITIONS}
      enablePagination
      headerSlot={
        <TableTitle>
          <div className="flex flex-col">
            <h3 className="text-h3 font-medium">Teams</h3>
            <p className="text-sm text-gray-200">
              Nisi ipsum aliqua velit labore culpa minim consectetur elit nulla.
            </p>
          </div>
          <QueryLink query={{ dialog: "export" }}>
            <Button>
              <ExportIcon className="-ml-1 h-4 w-4" />
              Export table
            </Button>
          </QueryLink>
        </TableTitle>
      }
    />
  );
}

type Team = {
  name: string;
  participations: ParticipationWithPlayerAndProgress[];
};

function getTeams(competition: CompetitionDetails): Team[] {
  const teamMap = new Map<string, ParticipationWithPlayerAndProgress[]>();

  competition.participations.forEach((participation) => {
    if (!participation.teamName) return;

    const team = teamMap.get(participation.teamName);

    if (team) {
      team.push(participation);
    } else {
      teamMap.set(participation.teamName, [participation]);
    }
  });

  return Array.from(teamMap.entries()).map(([name, participations]) => ({
    name,
    participations,
  }));
}
