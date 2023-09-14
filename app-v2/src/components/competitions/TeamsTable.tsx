"use client";

import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { CompetitionDetails, Metric, ParticipationWithPlayerAndProgress } from "@wise-old-man/utils";
import { cn } from "~/utils/styling";
import { Button } from "../Button";
import { DataTable } from "../DataTable";
import { QueryLink } from "../QueryLink";
import { FormattedNumber } from "../FormattedNumber";
import { TableTitle } from "../Table";
import { ParticipantsTable } from "./ParticipantsTable";
import { PlayerIdentityTooltip } from "../PlayerIdentity";
import { Tooltip, TooltipContent, TooltipTrigger } from "../Tooltip";

import ExportIcon from "~/assets/export.svg";
import ChevronDownIcon from "~/assets/chevron_down.svg";

const COLUMN_DEFINITIONS: ColumnDef<Team>[] = [
  {
    id: "rank",
    header: "Rank",
    accessorFn: (_, index) => {
      return index + 1;
    },
  },
  {
    id: "name",
    header: "Name",
    accessorFn: (row) => {
      return row.name;
    },
  },
  {
    id: "count",
    header: "Players",
    accessorFn: (row) => {
      return row.participations.length;
    },
  },
  {
    id: "total",
    header: "Total gained",
    accessorFn: (row) => {
      return row.participations.reduce((acc, curr) => acc + curr.progress.gained, 0);
    },
    cell: ({ row }) => {
      const total = Number(row.getValue("total"));
      if (total <= 0) return "0";

      return <FormattedNumber value={total} colored />;
    },
  },
  {
    id: "average",
    header: "Avg. gained",
    accessorFn: (row) => {
      return (
        row.participations.reduce((acc, curr) => acc + curr.progress.gained, 0) /
        row.participations.length
      );
    },
    cell: ({ row }) => {
      const avg = parseInt(row.getValue("average"));
      if (avg <= 0) return "0";

      return <FormattedNumber value={avg} colored />;
    },
  },
  {
    id: "mvp",
    header: "MVP",
    accessorFn: (row) => {
      return row.participations[0];
    },
    cell: ({ row }) => {
      const mvp = row.getValue("mvp") as ParticipationWithPlayerAndProgress;

      return (
        <span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
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
          (<FormattedNumber value={mvp.progress.gained} colored />)
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
          <Button size="sm" onClick={() => row.toggleExpanded()} className="px-1">
            <ChevronDownIcon
              className={cn(
                "h-4 w-4 transition-transform",
                row.getIsExpanded() ? "rotate-180" : "rotate-0"
              )}
            />
          </Button>
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
  const { metric, competition } = props;

  const teams = getTeams(competition);

  return (
    <DataTable
      data={teams}
      columns={COLUMN_DEFINITIONS}
      enablePagination
      renderSubRow={(row) => (
        <TeamDetails teamName={row.original.name} competition={competition} metric={metric} />
      )}
      headerSlot={
        <TableTitle>
          <div className="flex flex-col">
            <h3 className="text-h3 font-medium">Teams</h3>
          </div>
          <QueryLink query={{ dialog: "export", table: "teams" }}>
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

interface TeamDetailsProps {
  metric: Metric;
  teamName: string;
  competition: CompetitionDetails;
}

function TeamDetails(props: TeamDetailsProps) {
  const { teamName, metric, competition } = props;

  return (
    <div className="flex flex-col gap-y-4 bg-gray-800 px-5 py-4">
      <ParticipantsTable metric={metric} competition={competition} teamName={teamName} />
    </div>
  );
}

interface Team {
  name: string;
  participations: ParticipationWithPlayerAndProgress[];
}

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

  return Array.from(teamMap.entries())
    .map(([name, participations]) => ({ name, participations }))
    .sort((a, b) => {
      return (
        b.participations.reduce((acc, curr) => acc + curr.progress.gained, 0) -
        a.participations.reduce((acc, curr) => acc + curr.progress.gained, 0)
      );
    });
}
