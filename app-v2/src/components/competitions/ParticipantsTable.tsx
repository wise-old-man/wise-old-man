"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  CompetitionDetails,
  Metric,
  MetricProps,
  ParticipationWithPlayerAndProgress,
  getLevel,
  isActivity,
  isBoss,
  isSkill,
} from "@wise-old-man/utils";
import { cn } from "~/utils/styling";
import { timeago } from "~/utils/dates";
import { Button } from "../Button";
import { TableHeader } from "../Table";
import { DataTable } from "../DataTable";
import { PlayerIdentity } from "../PlayerIdentity";
import { TableNewSortableHead } from "../TableNew";
import { FormattedNumber } from "../FormattedNumber";
import { Tooltip, TooltipContent, TooltipTrigger } from "../Tooltip";

interface ColumnMetadata {
  columnStyle: string;
}

interface ParticipantsTableProps {
  metric: Metric;
  competition: CompetitionDetails;
}

export function ParticipantsTable(props: ParticipantsTableProps) {
  const { competition, metric } = props;

  const columnDefs = useMemo(() => getColumnDefinitions(metric, competition), [metric, competition]);

  return (
    <DataTable
      columns={columnDefs}
      data={competition.participations}
      enablePagination
      headerSlot={
        <TableHeader>
          <div className="flex flex-col">
            <h3 className="text-h3 font-medium">Participants</h3>
            <p className="text-sm text-gray-200">
              Nisi ipsum aliqua velit labore culpa minim consectetur elit nulla.
            </p>
          </div>
          <Button>Export table</Button>
        </TableHeader>
      }
      colGroupSlot={
        <colgroup>
          {columnDefs.map((column) => (
            <col key={column.id} className={(column.meta as ColumnMetadata)?.columnStyle} />
          ))}
        </colgroup>
      }
    />
  );
}

function getColumnDefinitions(metric: Metric, competition: CompetitionDetails) {
  const showLevelsGained = isSkill(metric);
  const hasStarted = competition.startsAt <= new Date();

  const columns: ColumnDef<ParticipationWithPlayerAndProgress>[] = [
    {
      id: "rank",
      header: ({ column }) => {
        return <TableNewSortableHead column={column}>Rank</TableNewSortableHead>;
      },
      accessorFn: (_, index) => {
        return index + 1;
      },
      meta: {
        columnStyle: "min-w-[4rem]",
      },
    },
    {
      accessorKey: "player",
      header: ({ column }) => {
        return <TableNewSortableHead column={column}>Player</TableNewSortableHead>;
      },
      cell: ({ row }) => {
        return <PlayerIdentity player={row.original.player} />;
      },
      sortingFn: (rowA, rowB) => {
        return rowA.original.player.displayName.localeCompare(rowB.original.player.displayName);
      },
      meta: {
        columnStyle: "w-full",
      },
    },
    {
      id: "start",
      accessorFn: (row) => row.progress.start,
      header: ({ column }) => {
        return <TableNewSortableHead column={column}>Start</TableNewSortableHead>;
      },
      cell: ({ row }) => {
        return (
          <ParticipantStartCell metric={metric} competition={competition} participant={row.original} />
        );
      },
      meta: {
        columnStyle: "min-w-[9rem]",
      },
    },
    {
      id: "end",
      accessorFn: (row) => row.progress.end,
      header: ({ column }) => {
        return <TableNewSortableHead column={column}>End</TableNewSortableHead>;
      },
      cell: ({ row }) => {
        return (
          <ParticipantEndCell metric={metric} competition={competition} participant={row.original} />
        );
      },
      meta: {
        columnStyle: "min-w-[9rem]",
      },
    },
    {
      id: "gained",
      accessorFn: (row) => row.progress.gained,
      header: ({ column }) => {
        return <TableNewSortableHead column={column}>Gained</TableNewSortableHead>;
      },
      cell: ({ row }) => {
        const hasGains = row.original.progress.gained > 0;
        return (
          <span className={cn(hasGains && "text-green-500")}>
            {hasGains ? "+" : ""}
            <FormattedNumber value={row.original.progress.gained} />
          </span>
        );
      },
      meta: {
        columnStyle: "min-w-[9rem]",
      },
    },
    {
      id: "updatedAt",
      accessorFn: (row) => row.player.updatedAt,
      header: ({ column }) => {
        return <TableNewSortableHead column={column}>Updated</TableNewSortableHead>;
      },
      cell: ({ row }) => {
        const player = row.original.player;
        const hasStartingValue = player.updatedAt && player.updatedAt >= competition.startsAt;

        return (
          <div
            className={cn(
              "flex w-full items-center justify-between gap-x-3",
              !hasStartingValue && hasStarted && "text-red-500"
            )}
          >
            {player.updatedAt ? timeago.format(player.updatedAt) : "---"}
            <Button size="sm">Update</Button>
          </div>
        );
      },
      meta: {
        columnStyle: "min-w-[14rem]",
      },
    },
  ];

  if (showLevelsGained) {
    columns.splice(5, 0, {
      id: "levels",
      header: ({ column }) => {
        return <TableNewSortableHead column={column}>Levels</TableNewSortableHead>;
      },
      accessorFn: ({ progress }) => {
        // need to calculate it here as well for sorting
        const { start, end } = progress;
        if (start === -1 || end === -1) return 0;

        return getLevel(end) - getLevel(start);
      },
      cell: ({ row }) => {
        const { start, end } = row.original.progress;

        if (start === -1 || end === -1) return "---";

        const startLevel = getLevel(start);
        const endLevel = getLevel(end);

        const diff = endLevel - startLevel;

        return (
          <span className={cn(diff > 0 && "text-green-500")}>
            {diff > 0 ? "+" : ""}
            <Tooltip>
              <TooltipTrigger asChild>
                <span>{diff}</span>
              </TooltipTrigger>
              <TooltipContent>
                Gained {diff} levels {diff > 0 ? `(from ${startLevel} to ${endLevel})` : ""}
              </TooltipContent>
            </Tooltip>
          </span>
        );
      },
      meta: {
        columnStyle: "min-w-[8rem]",
      },
    });
  }

  return columns;
}

interface ParticipantStartCellProps {
  metric: Metric;
  competition: CompetitionDetails;
  participant: ParticipationWithPlayerAndProgress;
}

function ParticipantStartCell(props: ParticipantStartCellProps) {
  const { metric, competition, participant } = props;
  const { player, progress } = participant;

  const hasStartingValue = player.updatedAt && player.updatedAt >= competition.startsAt;

  if (!hasStartingValue) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span>---</span>
        </TooltipTrigger>
        <TooltipContent>
          This player hasn&apos;t yet been updated since the competition started.
        </TooltipContent>
      </Tooltip>
    );
  }

  if (isBoss(metric) && MetricProps[metric].minimumValue > progress.start) {
    const { name, minimumValue } = MetricProps[metric];

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span>&lt; {minimumValue}</span>
        </TooltipTrigger>
        <TooltipContent>
          The Hiscores only start showing {name} kills at {minimumValue} kc.
        </TooltipContent>
      </Tooltip>
    );
  }

  if (isActivity(metric) && MetricProps[metric].minimumValue > progress.start) {
    const { name, minimumValue } = MetricProps[metric];

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span>&lt; {minimumValue}</span>
        </TooltipTrigger>
        <TooltipContent>
          The Hiscores only start showing {name} after {minimumValue}+ score.
        </TooltipContent>
      </Tooltip>
    );
  }

  if (progress.start === -1) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span>---</span>
        </TooltipTrigger>
        <TooltipContent>This player started out unranked in {MetricProps[metric].name}.</TooltipContent>
      </Tooltip>
    );
  }

  return <FormattedNumber value={progress.start} />;
}

interface ParticipantEndCellProps {
  metric: Metric;
  competition: CompetitionDetails;
  participant: ParticipationWithPlayerAndProgress;
}

function ParticipantEndCell(props: ParticipantEndCellProps) {
  const { metric, competition, participant } = props;

  if (competition.startsAt > new Date()) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span>---</span>
        </TooltipTrigger>
        <TooltipContent>This competition hasn&apos;t started yet.</TooltipContent>
      </Tooltip>
    );
  }

  const { player, progress } = participant;

  const hasStartingValue = player.updatedAt && player.updatedAt >= competition.startsAt;

  if (!hasStartingValue) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span>---</span>
        </TooltipTrigger>
        <TooltipContent>
          This player hasn&apos;t yet been updated since the competition started.
        </TooltipContent>
      </Tooltip>
    );
  }

  if (isBoss(metric) && MetricProps[metric].minimumValue > progress.end) {
    const { name, minimumValue } = MetricProps[metric];

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span>&lt; {minimumValue}</span>
        </TooltipTrigger>
        <TooltipContent>
          The Hiscores only start showing {name} kills at {minimumValue} kc.
        </TooltipContent>
      </Tooltip>
    );
  }

  if (isActivity(metric) && MetricProps[metric].minimumValue > progress.end) {
    const { name, minimumValue } = MetricProps[metric];

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span>&lt; {minimumValue}</span>
        </TooltipTrigger>
        <TooltipContent>
          The Hiscores only start showing {name} after {minimumValue}+ score.
        </TooltipContent>
      </Tooltip>
    );
  }

  if (progress.end === -1) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span>---</span>
        </TooltipTrigger>
        <TooltipContent>This player is unranked in {MetricProps[metric].name}.</TooltipContent>
      </Tooltip>
    );
  }

  return <FormattedNumber value={progress.end} />;
}
