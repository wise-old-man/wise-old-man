"use client";

import { PropsWithChildren, useMemo, useTransition } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ActivityValue,
  Boss,
  BossValue,
  Metric,
  MetricProps,
  MetricType,
  PlayerDetails,
  Skill,
  SkillValue,
  getLevel,
} from "@wise-old-man/utils";
import { formatDatetime, timeago } from "~/utils/dates";
import { Label } from "../Label";
import { Button } from "../Button";
import { Checkbox } from "../Checkbox";
import { DataTable } from "../DataTable";
import { MetricIconSmall } from "../Icon";
import { FormattedNumber } from "../FormattedNumber";
import { TableSortButton, TableTitle } from "../Table";
import { Tooltip, TooltipContent, TooltipTrigger } from "../Tooltip";
import {
  Combobox,
  ComboboxButton,
  ComboboxContent,
  ComboboxItem,
  ComboboxItemGroup,
  ComboboxItemsContainer,
} from "../Combobox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../Dropdown";

import TableCogIcon from "~/assets/table_cog.svg";

interface PlayerStatsTableProps {
  player: PlayerDetails;
  metricType: MetricType;
  showVirtualLevels: boolean;
}

export function PlayerStatsTable(props: PlayerStatsTableProps) {
  const { player, metricType, showVirtualLevels } = props;

  const router = useRouter();
  const searchParams = useSearchParams();

  function handleMetricTypeChanged(metricType: MetricType) {
    const nextParams = new URLSearchParams(searchParams);

    nextParams.delete("levels");

    if (metricType === MetricType.SKILL) {
      nextParams.set("view", "skills");
    } else if (metricType === MetricType.BOSS) {
      nextParams.set("view", "bosses");
    } else if (metricType === MetricType.ACTIVITY) {
      nextParams.set("view", "activities");
    } else {
      nextParams.delete("view");
    }

    router.replace(`/players/${player.username}?${nextParams.toString()}`);
  }

  function handleShowVirtualLevelsChanged(value: boolean) {
    const nextParams = new URLSearchParams(searchParams);

    if (value === true) {
      nextParams.set("levels", "virtual");
    } else {
      nextParams.delete("levels");
    }

    router.replace(`/players/${player.username}?${nextParams.toString()}`);
  }

  const tableHeaderElement = (
    <div>
      <h3 className="text-h3 font-medium text-white">Current stats</h3>
      <p className="text-body text-gray-200">
        Last changed
        {player.lastChangedAt ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span> {timeago.format(player.lastChangedAt)}</span>
            </TooltipTrigger>
            <TooltipContent>{formatDatetime(player.lastChangedAt)}</TooltipContent>
          </Tooltip>
        ) : (
          <span>: unknown</span>
        )}
      </p>
    </div>
  );

  if (metricType === MetricType.BOSS) {
    return (
      <PlayerBossesTable player={player}>
        {tableHeaderElement}
        <div className="flex items-center gap-x-3">
          <MetricTypeSelect metricType={metricType} onMetricTypeSelected={handleMetricTypeChanged} />
        </div>
      </PlayerBossesTable>
    );
  }

  if (metricType === MetricType.ACTIVITY) {
    return (
      <PlayerActivitiesTable player={player}>
        {tableHeaderElement}
        <div className="flex items-center gap-x-3">
          <MetricTypeSelect metricType={metricType} onMetricTypeSelected={handleMetricTypeChanged} />
        </div>
      </PlayerActivitiesTable>
    );
  }

  return (
    <PlayerSkillsTable player={player} showVirtualLevels={showVirtualLevels}>
      {tableHeaderElement}
      <div className="flex items-center gap-x-3">
        <MetricTypeSelect metricType={metricType} onMetricTypeSelected={handleMetricTypeChanged} />
        <TableOptionsMenu
          showVirtualLevels={showVirtualLevels}
          onVirtualLevelsToggle={handleShowVirtualLevelsChanged}
        />
      </div>
    </PlayerSkillsTable>
  );
}

function PlayerSkillsTable(
  props: PropsWithChildren<{ player: PlayerDetails; showVirtualLevels: boolean }>
) {
  const { children, player, showVirtualLevels } = props;

  const rows = [
    {
      metric: Metric.EHP as Skill,
      experience: -1,
      level: -1,
      ehp: player.latestSnapshot.data.computed.ehp.value,
      rank: player.latestSnapshot.data.computed.ehp.rank,
    },
    ...Object.values(player.latestSnapshot.data.skills),
  ];

  const columnDefs = useMemo(() => getSkillColumnDefinitions(showVirtualLevels), [showVirtualLevels]);

  return <DataTable columns={columnDefs} data={rows} headerSlot={<TableTitle>{children}</TableTitle>} />;
}

function getSkillColumnDefinitions(showVirtualLevels: boolean): ColumnDef<SkillValue>[] {
  return [
    {
      accessorKey: "skill",
      header: ({ column }) => {
        return <TableSortButton column={column}>Skill</TableSortButton>;
      },
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-x-2">
            <MetricIconSmall metric={row.original.metric} />
            {MetricProps[row.original.metric].name}
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        return rowA.original.metric.localeCompare(rowB.original.metric);
      },
    },
    {
      accessorKey: "level",
      header: ({ column }) => {
        return <TableSortButton column={column}>Level</TableSortButton>;
      },
      cell: ({ row }) => {
        if ((row.original.metric as Metric) === Metric.EHP) return null;

        if (row.original.experience === -1) {
          return (
            <Tooltip>
              <TooltipTrigger asChild>
                <span>---</span>
              </TooltipTrigger>
              <TooltipContent>
                This player is unranked in {MetricProps[row.original.metric].name}.
              </TooltipContent>
            </Tooltip>
          );
        }

        if (showVirtualLevels && row.original.metric !== Metric.OVERALL) {
          return getLevel(row.original.experience, true);
        }

        return row.original.level;
      },
    },
    {
      accessorKey: "experience",
      header: ({ column }) => {
        return <TableSortButton column={column}>Experience</TableSortButton>;
      },
      cell: ({ row }) => {
        if ((row.original.metric as Metric) === Metric.EHP) return null;

        if (row.original.experience === -1) {
          return (
            <Tooltip>
              <TooltipTrigger asChild>
                <span>---</span>
              </TooltipTrigger>
              <TooltipContent>
                This player is unranked in {MetricProps[row.original.metric].name}.
              </TooltipContent>
            </Tooltip>
          );
        }

        return <FormattedNumber value={row.original.experience} />;
      },
    },
    {
      accessorKey: "rank",
      header: ({ column }) => {
        return <TableSortButton column={column}>Rank</TableSortButton>;
      },
      cell: ({ row }) => {
        if (row.original.experience === -1 && (row.original.metric as Metric) !== Metric.EHP) {
          return (
            <Tooltip>
              <TooltipTrigger asChild>
                <span>---</span>
              </TooltipTrigger>
              <TooltipContent>
                This player is unranked in {MetricProps[row.original.metric].name}.
              </TooltipContent>
            </Tooltip>
          );
        }

        return <FormattedNumber value={row.original.rank} />;
      },
    },
    {
      accessorKey: "ehp",
      header: ({ column }) => {
        return <TableSortButton column={column}>EHP</TableSortButton>;
      },
      cell: ({ row }) => {
        if (
          (row.original.experience === -1 && (row.original.metric as Metric) !== Metric.EHP) ||
          row.original.ehp === undefined
        ) {
          return (
            <Tooltip>
              <TooltipTrigger asChild>
                <span>---</span>
              </TooltipTrigger>
              <TooltipContent>
                This player is unranked in {MetricProps[row.original.metric].name}.
              </TooltipContent>
            </Tooltip>
          );
        }

        return row.original.ehp.toFixed(2);
      },
    },
  ];
}

function PlayerBossesTable(props: PropsWithChildren<{ player: PlayerDetails }>) {
  const { children, player } = props;

  const rows = [
    {
      metric: Metric.EHB as Boss,
      kills: -1,
      ehb: player.latestSnapshot.data.computed.ehb.value,
      rank: player.latestSnapshot.data.computed.ehb.rank,
    },
    ...Object.values(player.latestSnapshot.data.bosses),
  ];

  return (
    <DataTable
      columns={BOSS_COLUMN_DEFINITIONS}
      data={rows}
      headerSlot={<TableTitle>{children}</TableTitle>}
    />
  );
}

const BOSS_COLUMN_DEFINITIONS: ColumnDef<BossValue>[] = [
  {
    accessorKey: "boss",
    header: ({ column }) => {
      return <TableSortButton column={column}>Boss</TableSortButton>;
    },
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-x-2">
          <MetricIconSmall metric={row.original.metric} />
          {MetricProps[row.original.metric].name}
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      return rowA.original.metric.localeCompare(rowB.original.metric);
    },
  },
  {
    accessorKey: "kills",
    header: ({ column }) => {
      return <TableSortButton column={column}>Kills</TableSortButton>;
    },
    cell: ({ row }) => {
      if ((row.original.metric as Metric) === Metric.EHB) return null;

      if (row.original.kills === -1) {
        const minimum = MetricProps[row.original.metric].minimumValue;

        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <span>&lt; {minimum}</span>
            </TooltipTrigger>
            <TooltipContent>
              This player is unranked in {MetricProps[row.original.metric].name}. The Hiscores only start
              tracking kills at {minimum} kc.
            </TooltipContent>
          </Tooltip>
        );
      }

      return <FormattedNumber value={row.original.kills} />;
    },
  },
  {
    accessorKey: "rank",
    header: ({ column }) => {
      return <TableSortButton column={column}>Rank</TableSortButton>;
    },
    cell: ({ row }) => {
      if (row.original.kills === -1 && (row.original.metric as Metric) !== Metric.EHB) {
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <span>---</span>
            </TooltipTrigger>
            <TooltipContent>
              This player is unranked in {MetricProps[row.original.metric].name}.
            </TooltipContent>
          </Tooltip>
        );
      }

      return <FormattedNumber value={row.original.rank} />;
    },
  },
  {
    accessorKey: "ehb",
    header: ({ column }) => {
      return <TableSortButton column={column}>EHB</TableSortButton>;
    },
    cell: ({ row }) => {
      if (
        (row.original.kills === -1 && (row.original.metric as Metric) !== Metric.EHB) ||
        row.original.ehb === undefined
      ) {
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <span>---</span>
            </TooltipTrigger>
            <TooltipContent>
              This player is unranked in {MetricProps[row.original.metric].name}.
            </TooltipContent>
          </Tooltip>
        );
      }

      return row.original.ehb.toFixed(2);
    },
  },
];

function PlayerActivitiesTable(props: PropsWithChildren<{ player: PlayerDetails }>) {
  const { children, player } = props;

  const rows = Object.values(player.latestSnapshot.data.activities);

  return (
    <DataTable
      columns={ACTIVITY_COLUMN_DEFINITIONS}
      data={rows}
      headerSlot={<TableTitle>{children}</TableTitle>}
    />
  );
}

const ACTIVITY_COLUMN_DEFINITIONS: ColumnDef<ActivityValue>[] = [
  {
    accessorKey: "activity",
    header: ({ column }) => {
      return <TableSortButton column={column}>Activity</TableSortButton>;
    },
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-x-2">
          <MetricIconSmall metric={row.original.metric} />
          {MetricProps[row.original.metric].name}
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      return rowA.original.metric.localeCompare(rowB.original.metric);
    },
  },
  {
    accessorKey: "score",
    header: ({ column }) => {
      return <TableSortButton column={column}>Score</TableSortButton>;
    },
    cell: ({ row }) => {
      if (row.original.score === -1) {
        const minimum = MetricProps[row.original.metric].minimumValue;

        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <span>&lt; {minimum}</span>
            </TooltipTrigger>
            <TooltipContent>
              This player is unranked in {MetricProps[row.original.metric].name}. The Hiscores only start
              tracking at {minimum} score.
            </TooltipContent>
          </Tooltip>
        );
      }

      return <FormattedNumber value={row.original.score} />;
    },
  },
  {
    accessorKey: "rank",
    header: ({ column }) => {
      return <TableSortButton column={column}>Rank</TableSortButton>;
    },
    cell: ({ row }) => {
      if (row.original.score === -1) {
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <span>---</span>
            </TooltipTrigger>
            <TooltipContent>
              This player is unranked in {MetricProps[row.original.metric].name}.
            </TooltipContent>
          </Tooltip>
        );
      }

      return <FormattedNumber value={row.original.rank} />;
    },
  },
];

interface MetricTypeSelectProps {
  metricType: MetricType;
  onMetricTypeSelected: (metricType: MetricType) => void;
}

function MetricTypeSelect(props: MetricTypeSelectProps) {
  const { metricType, onMetricTypeSelected } = props;

  const [isPending, startTransition] = useTransition();

  return (
    <Combobox
      value={metricType}
      onValueChanged={(val) => {
        startTransition(() => {
          if (val === undefined) {
            onMetricTypeSelected(MetricType.SKILL);
          } else if (val === "skill" || val === "boss" || val === "activity") {
            onMetricTypeSelected(val as MetricType);
          }
        });
      }}
    >
      <ComboboxButton className="w-32" isPending={isPending}>
        <div className="flex items-center gap-x-2">
          {metricType === MetricType.SKILL && "Skills"}
          {metricType === MetricType.BOSS && "Bosses"}
          {metricType === MetricType.ACTIVITY && "Activities"}
        </div>
      </ComboboxButton>
      <ComboboxContent align="end">
        <ComboboxItemsContainer>
          <ComboboxItemGroup>
            <ComboboxItem value="skill">Skills</ComboboxItem>
            <ComboboxItem value="boss">Bosses</ComboboxItem>
            <ComboboxItem value="activity">Activities</ComboboxItem>
          </ComboboxItemGroup>
        </ComboboxItemsContainer>
      </ComboboxContent>
    </Combobox>
  );
}

interface TableOptionsMenuProps {
  showVirtualLevels: boolean;
  onVirtualLevelsToggle: (value: boolean) => void;
}

function TableOptionsMenu(props: TableOptionsMenuProps) {
  const { showVirtualLevels, onVirtualLevelsToggle } = props;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button iconButton className="relative">
          <TableCogIcon className="h-5 w-5" />
          {showVirtualLevels && (
            <div className="absolute -right-px -top-px h-2 w-2 rounded-full bg-blue-500" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Options</DropdownMenuLabel>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="focus:bg-transparent">
          <Checkbox
            id="virtual_levels"
            checked={showVirtualLevels}
            onCheckedChange={(val) => onVirtualLevelsToggle(Boolean(val))}
          />
          <Label htmlFor="virtual_levels" className="ml-2 block w-full">
            Show virtual levels
          </Label>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
