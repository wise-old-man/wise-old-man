"use client";

import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useMutation } from "@tanstack/react-query";
import {
  CompetitionDetails,
  CompetitionType,
  Metric,
  MetricProps,
  ParticipationWithPlayerAndProgress,
  Player,
  PlayerStatus,
  getLevel,
  isActivity,
  isBoss,
  isSkill,
} from "@wise-old-man/utils";
import { cn } from "~/utils/styling";
import { timeago } from "~/utils/dates";
import { useToast } from "~/hooks/useToast";
import { useWOMClient } from "~/hooks/useWOMClient";
import { Button } from "../Button";
import { DataTable } from "../DataTable";
import { QueryLink } from "../QueryLink";
import { PlayerIdentity } from "../PlayerIdentity";
import { FormattedNumber } from "../FormattedNumber";
import { TableSortButton, TableTitle } from "../Table";
import { Tooltip, TooltipContent, TooltipTrigger } from "../Tooltip";

import CheckIcon from "~/assets/check.svg";
import ExportIcon from "~/assets/export.svg";
import LoadingIcon from "~/assets/loading.svg";

interface ParticipantsTableProps {
  metric: Metric;
  competition: CompetitionDetails;
  teamName?: string;
  filter?: string;
}

export function ParticipantsTable(props: ParticipantsTableProps) {
  const { competition, teamName, metric, filter } = props;

  const columnDefs = useMemo(() => getColumnDefinitions(metric, competition), [metric, competition]);

  const rows = competition.participations.filter((p) => !teamName || p.teamName === teamName);

  const isOngoing = competition.startsAt <= new Date() && competition.endsAt >= new Date();

  const outdatedParticipants = rows.filter(
    (p) => !p.player.updatedAt || p.player.updatedAt < competition.startsAt
  );

  const showOnlyOutdated = filter === "outdated";

  return (
    <DataTable
      columns={columnDefs}
      data={showOnlyOutdated ? outdatedParticipants : rows}
      enablePagination
      pageSize={teamName ? 10 : 20}
      headerSlot={
        <TableTitle className="flex-col p-0">
          <div className="flex w-full items-center justify-between px-5 py-4">
            <h3 className="text-h3 font-medium text-white">{teamName || "Participants"}</h3>
            <QueryLink query={{ dialog: "export", team: teamName ? encodeURI(teamName) : undefined }}>
              <Button>
                <ExportIcon className="-ml-1 h-4 w-4" />
                Export table
              </Button>
            </QueryLink>
          </div>
          {showOnlyOutdated ? (
            <div className="flex w-full gap-x-1 border-t border-gray-500 px-5 py-3">
              <span className="text-xs text-gray-200">
                Showing only outdated or invalid participants.
              </span>
              <QueryLink
                query={{ filter: null }}
                className="text-xs font-medium text-white hover:underline"
              >
                Show all
              </QueryLink>
            </div>
          ) : (
            <>
              {isOngoing && outdatedParticipants && outdatedParticipants.length > 0 && (
                <div className="flex w-full border-t border-gray-500 px-5 py-3">
                  <QueryLink
                    query={{ filter: "outdated" }}
                    className="text-xs font-medium text-gray-200 hover:underline"
                  >
                    {outdatedParticipants.length} outdated or invalid participants.
                  </QueryLink>
                </div>
              )}
            </>
          )}
        </TableTitle>
      }
    />
  );
}

function getColumnDefinitions(metric: Metric, competition: CompetitionDetails) {
  const columns: ColumnDef<ParticipationWithPlayerAndProgress>[] = [
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
        params.set("metric", metric);
        params.set("startDate", competition.startsAt.toISOString());
        params.set("endDate", competition.endsAt.toISOString());

        return (
          <div className="pr-5">
            <PlayerIdentity
              player={row.original.player}
              caption={
                competition.type === CompetitionType.TEAM && !!row.original.teamName
                  ? row.original.teamName
                  : undefined
              }
              href={`/players/${row.original.player.username}/gained?${params.toString()}`}
            />
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        return rowA.original.player.displayName.localeCompare(rowB.original.player.displayName);
      },
    },
    {
      id: "gained",
      accessorFn: (row) => row.progress.gained,
      header: ({ column }) => {
        return <TableSortButton column={column}>Gained</TableSortButton>;
      },
      cell: ({ row }) => {
        return <FormattedNumber value={row.original.progress.gained} colored />;
      },
    },
    {
      id: "start",
      accessorFn: (row) => row.progress.start,
      header: ({ column }) => {
        return <TableSortButton column={column}>Start</TableSortButton>;
      },
      cell: ({ row }) => {
        return (
          <ParticipantStartCell metric={metric} competition={competition} participant={row.original} />
        );
      },
    },
    {
      id: "end",
      accessorFn: (row) => row.progress.end,
      header: ({ column }) => {
        return <TableSortButton column={column}>End</TableSortButton>;
      },
      cell: ({ row }) => {
        return (
          <ParticipantEndCell metric={metric} competition={competition} participant={row.original} />
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

  if (isSkill(metric) && metric !== Metric.OVERALL) {
    columns.splice(3, 0, {
      id: "levels",
      header: ({ column }) => {
        return <TableSortButton column={column}>Levels</TableSortButton>;
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
    });
  }

  return columns;
}

function ParticipantStartCell(props: {
  metric: Metric;
  competition: CompetitionDetails;
  participant: ParticipationWithPlayerAndProgress;
}) {
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

function ParticipantEndCell(props: {
  metric: Metric;
  competition: CompetitionDetails;
  participant: ParticipationWithPlayerAndProgress;
}) {
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

function UpdateParticipantCell(props: { player: Player; competition: CompetitionDetails }) {
  const { player, competition } = props;

  const toast = useToast();
  const client = useWOMClient();
  const [hasUpdated, setHasUpdated] = useState(false);

  const updateMutation = useMutation({
    mutationFn: () => {
      return client.players.updatePlayer(player.username);
    },
    onSuccess: () => {
      toast.toast({ variant: "success", title: `Updated ${player.displayName}` });
      setHasUpdated(true);
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.toast({ variant: "error", title: error.message });
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
        !hasUpdated && !hasStartingValue && hasStarted && "text-red-500"
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
