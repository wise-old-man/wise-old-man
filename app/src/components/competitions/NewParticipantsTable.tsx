"use client";

import { ColumnDef } from "@tanstack/react-table";
import { TableSortButton, TableTitle } from "../Table";
import { useCompetitionPageContext } from "./CompetitionPageContext";
import {
  CompetitionDetailsResponse,
  CompetitionType,
  Metric,
  MetricProps,
  MetricType,
  PlayerResponse,
  PlayerStatus,
} from "@wise-old-man/utils";
import { PlayerIdentity } from "../PlayerIdentity";
import { FormattedNumber } from "../FormattedNumber";
import { MetricDeltasTooltip } from "../MetricDeltasTooltip";
import { useToast } from "~/hooks/useToast";
import { useWOMClient } from "~/hooks/useWOMClient";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { cn } from "~/utils/styling";
import { Tooltip, TooltipContent, TooltipTrigger } from "../Tooltip";
import { Button } from "../Button";
import { timeago } from "~/utils/dates";

import CheckIcon from "~/assets/check.svg";
import LoadingIcon from "~/assets/loading.svg";
import { DataTable } from "../DataTable";
import { QueryLink } from "../QueryLink";

export function NewParticipantsTable() {
  const { competition, selectedMetric } = useCompetitionPageContext();

  const rows = competition.participations;
  const columns = getColumnDefinition(competition, selectedMetric);

  return (
    <DataTable
      columns={columns}
      data={rows}
      enablePagination
      defaultPageSize={20}
      headerSlot={
        <TableTitle className="flex-col p-0">
          <div className="flex w-full items-center justify-between px-5 py-4">
            <h3 className="text-h3 font-medium text-white">Participants</h3>
          </div>
        </TableTitle>
      }
    />
  );
}

function getColumnDefinition(
  competition: CompetitionDetailsResponse,
  selectedMetric: Metric | undefined,
) {
  const columns: ColumnDef<CompetitionDetailsResponse["participations"][number]>[] = [
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
      accessorKey: "player",
      header: ({ column }) => {
        return <TableSortButton column={column}>Player</TableSortButton>;
      },
      cell: ({ row }) => {
        const params = new URLSearchParams();

        if (selectedMetric !== undefined) {
          params.set("metric", selectedMetric);
        }

        params.set("startDate", competition.startsAt.toISOString());
        params.set("endDate", competition.endsAt.toISOString());

        return (
          <PlayerIdentity
            player={row.original.player}
            href={`/players/${row.original.player.username}/gained?${params.toString()}`}
          />
        );
      },
      sortingFn: (rowA, rowB) => {
        return rowA.original.player.displayName.localeCompare(rowB.original.player.displayName);
      },
    },
    {
      id: "gained",
      accessorFn: (row) => {
        return row.deltas.find((d) => d.metric === (selectedMetric ?? "total"))?.values.gained ?? 0;
      },
      header: ({ column }) => {
        return <TableSortButton column={column}>Gained</TableSortButton>;
      },
      cell: ({ row }) => {
        const gained =
          row.original.deltas.find((d) => d.metric === (selectedMetric ?? "total"))?.values.gained ?? 0;

        return (
          <FormattedNumber
            value={gained}
            colored
            tooltipContent={
              <MetricDeltasTooltip
                deltas={row.original.deltas}
                focusedMetric={selectedMetric ?? "total"}
                type="values"
                field="gained"
              />
            }
          />
        );
      },
    },
    {
      id: "updatedAt",
      accessorFn: (row) => row.player.updatedAt,
      header: ({ column }) => {
        return <TableSortButton column={column}>Updated</TableSortButton>;
      },
      cell: ({ row }) => {
        return <UpdateParticipantCell player={row.original.player} competition={competition} />;
      },
    },
  ];

  if (MetricProps[competition.metrics[0].metric].type === MetricType.SKILL) {
    columns.splice(3, 0, {
      id: "levels",
      header: ({ column }) => {
        return <TableSortButton column={column}>Levels</TableSortButton>;
      },
      accessorFn: (row) => {
        return row.deltas.find((d) => d.metric === (selectedMetric ?? "total"))?.levels.gained ?? 0;
      },
      cell: ({ row }) => {
        const levels = row.original.deltas.find((d) => d.metric === (selectedMetric ?? "total"))?.levels;

        if (levels === undefined) return null;
        const { start, end, gained } = levels;

        if (start === -1 || end === -1) return <span className="text-gray-300">---</span>;

        return (
          <span className={cn(gained > 0 && "text-green-500")}>
            {gained > 0 ? "+" : ""}
            <Tooltip>
              <TooltipTrigger asChild>
                <span>{gained}</span>
              </TooltipTrigger>
              <TooltipContent>
                <MetricDeltasTooltip
                  deltas={row.original.deltas}
                  focusedMetric={selectedMetric ?? "total"}
                  type="levels"
                  field="gained"
                />
              </TooltipContent>
            </Tooltip>
          </span>
        );
      },
    });
  }

  return columns;
}

function UpdateParticipantCell(props: {
  player: PlayerResponse;
  competition: CompetitionDetailsResponse;
}) {
  const { player, competition } = props;

  const toast = useToast();
  const client = useWOMClient();
  const [hasUpdated, setHasUpdated] = useState(false);

  const updateMutation = useMutation({
    mutationFn: () => {
      return client.players.updatePlayer(player.username);
    },
    onSuccess: () => {
      toast.toast({
        variant: "success",
        title: `Updated ${player.displayName}`,
      });

      setHasUpdated(true);
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.toast({
          variant: "error",
          title: error.message,
        });
      }
    },
  });

  const isUpdating = updateMutation.isPending;
  const hasEnded = competition.endsAt <= new Date();
  const hasStarted = competition.startsAt <= new Date();
  const hasStartingValue = player.updatedAt && player.updatedAt >= competition.startsAt;

  return (
    <div
      className={cn(
        "flex w-full items-center justify-between gap-x-3",
        !hasUpdated && !hasStartingValue && hasStarted && "text-red-500",
      )}
    >
      {!hasEnded && hasUpdated ? (
        <>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>Refresh to apply</span>
            </TooltipTrigger>
            <TooltipContent>Refresh the page to view the updated data.</TooltipContent>
          </Tooltip>
          <Button size="sm" disabled>
            <CheckIcon className="h-3 w-3" />
            Updated
          </Button>
        </>
      ) : (
        <>
          {player.updatedAt ? timeago.format(player.updatedAt) : "---"}
          {!hasEnded && player.status !== PlayerStatus.ARCHIVED && (
            <Button size="sm" disabled={isUpdating} onClick={() => updateMutation.mutate()}>
              {isUpdating && <LoadingIcon className="h-3 w-3 animate-spin" />}
              {isUpdating ? "Updating..." : "Update"}
            </Button>
          )}
        </>
      )}
    </div>
  );
}
