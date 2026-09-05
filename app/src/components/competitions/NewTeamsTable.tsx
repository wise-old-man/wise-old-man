"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CompetitionDetailsResponse, Metric } from "@wise-old-man/utils";
import Link from "next/link";
import { Button } from "../Button";
import { DataTable } from "../DataTable";
import { FormattedNumber } from "../FormattedNumber";
import { MetricDeltasTooltip } from "../MetricDeltasTooltip";
import { PlayerIdentityTooltip } from "../PlayerIdentity";
import { QueryLink } from "../QueryLink";
import { TableTitle } from "../Table";
import { Tooltip, TooltipContent, TooltipTrigger } from "../Tooltip";
import { useCompetitionPageContext } from "./CompetitionPageContext";

import ExportIcon from "~/assets/export.svg";
import ArrowRightIcon from "~/assets/arrow_right.svg";

export function NewTeamsTable() {
  const { competition, selectedMetric } = useCompetitionPageContext();

  const teams = getTeams(competition, selectedMetric);

  return (
    <DataTable
      data={teams}
      columns={getColumnDefinitions(selectedMetric)}
      enablePagination
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

interface Team {
  name: string;
  participations: CompetitionDetailsResponse["participations"];
}

function getTeams(competition: CompetitionDetailsResponse, focusedMetric: Metric | undefined): Team[] {
  const teamMap = new Map<string, CompetitionDetailsResponse["participations"]>();

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
        b.participations.reduce(
          (acc, curr) =>
            acc + (curr.deltas.find((d) => d.metric === (focusedMetric ?? "total"))?.values.gained ?? 0),
          0,
        ) -
        a.participations.reduce(
          (acc, curr) =>
            acc + (curr.deltas.find((d) => d.metric === (focusedMetric ?? "total"))?.values.gained ?? 0),
          0,
        )
      );
    });
}

function getTeamAggregateDeltas(
  participations: CompetitionDetailsResponse["participations"],
  divisor = 1,
) {
  if (participations.length === 0) return [];

  return participations[0].deltas.map((_, metricIndex) => {
    const { metric } = participations[0].deltas[metricIndex];

    return {
      metric,
      values: {
        start: 0,
        end: 0,
        gained: Math.floor(
          participations.reduce((acc, p) => acc + p.deltas[metricIndex].values.gained, 0) / divisor,
        ),
      },
      levels: {
        start: 0,
        end: 0,
        gained: Math.floor(
          participations.reduce((acc, p) => acc + p.deltas[metricIndex].levels.gained, 0) / divisor,
        ),
      },
    };
  });
}

function getColumnDefinitions(focusedMetric: Metric | undefined): ColumnDef<Team>[] {
  const columns: ColumnDef<Team>[] = [
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
        return row.participations.reduce(
          (acc, curr) =>
            acc + (curr.deltas.find((d) => d.metric === (focusedMetric ?? "total"))?.values.gained ?? 0),
          0,
        );
      },
      cell: ({ row }) => {
        const total = Number(row.getValue("total"));
        if (total <= 0) return "0";

        return (
          <FormattedNumber
            value={total}
            colored
            tooltipContent={
              <MetricDeltasTooltip
                deltas={getTeamAggregateDeltas(row.original.participations)}
                focusedMetric={focusedMetric ?? "total"}
                type="values"
                field="gained"
              />
            }
          />
        );
      },
    },
    {
      id: "average",
      header: "Avg. gained",
      accessorFn: (row) => {
        return (
          row.participations.reduce(
            (acc, curr) =>
              acc +
              (curr.deltas.find((d) => d.metric === (focusedMetric ?? "total"))?.values.gained ?? 0),
            0,
          ) / row.participations.length
        );
      },
      cell: ({ row }) => {
        const avg = parseInt(row.getValue("average"));
        if (avg <= 0) return "0";

        return (
          <FormattedNumber
            value={avg}
            colored
            tooltipContent={
              <MetricDeltasTooltip
                deltas={getTeamAggregateDeltas(
                  row.original.participations,
                  row.original.participations.length,
                )}
                focusedMetric={focusedMetric ?? "total"}
                type="values"
                field="gained"
              />
            }
          />
        );
      },
    },
    {
      id: "mvp",
      header: "MVP",
      accessorFn: (row) => {
        return row.participations[0];
      },
      cell: ({ row }) => {
        const mvp = row.getValue("mvp") as CompetitionDetailsResponse["participations"][number];

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
            <FormattedNumber
              value={mvp.deltas.find((d) => d.metric === (focusedMetric ?? "total"))?.values.gained ?? 0}
              colored
            />
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
          <div className="-ml-2 flex justify-end">
            <QueryLink query={{ team: encodeURI(row.original.name) }}>
              <Tooltip>
                <TooltipTrigger>
                  <Button size="sm">
                    <ArrowRightIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View team details</TooltipContent>
              </Tooltip>
            </QueryLink>
          </div>
        );
      },
    },
  ];

  return columns;
}
