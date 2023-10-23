"use client";

import { PropsWithChildren, useTransition } from "react";
import { ColumnDef, Row } from "@tanstack/react-table";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ACTIVITIES,
  ActivityDelta,
  BossDelta,
  Metric,
  MetricProps,
  MetricType,
  PERIODS,
  Period,
  PeriodProps,
  Player,
  PlayerDeltasMap,
  PlayerDetails,
  SkillDelta,
  isPeriod,
} from "@wise-old-man/utils";
import { formatDatetime } from "~/utils/dates";
import { TimeRangeFilter } from "~/services/wiseoldman";
import { getBuildHiddenMetrics } from "~/utils/metrics";
import {
  Combobox,
  ComboboxButton,
  ComboboxContent,
  ComboboxItem,
  ComboboxItemGroup,
  ComboboxItemsContainer,
} from "../Combobox";
import { DataTable } from "../DataTable";
import { FormattedNumber } from "../FormattedNumber";
import { MetricIconSmall } from "../Icon";
import { TableSortButton } from "../Table";
import { Tooltip, TooltipContent, TooltipTrigger } from "../Tooltip";

interface PlayerGainedTableProps {
  player: PlayerDetails;
  gains: PlayerDeltasMap;
  metric: Metric;
  timeRange: TimeRangeFilter;
}

export function PlayerGainedTable(props: PropsWithChildren<PlayerGainedTableProps>) {
  const { player, gains, metric, timeRange, children } = props;

  const router = useRouter();
  const searchParams = useSearchParams();

  const metricType = MetricProps[metric].type;

  function handleMetricTypeChanged(newMetricType: MetricType) {
    if (newMetricType === MetricType.BOSS) {
      handleMetricSelected(Metric.EHB);
    } else if (newMetricType === MetricType.ACTIVITY) {
      handleMetricSelected(ACTIVITIES[0]);
    } else {
      handleMetricSelected(Metric.EHP);
    }
  }

  function handleMetricSelected(newMetric: Metric) {
    const nextParams = new URLSearchParams(searchParams);

    if (newMetric === Metric.OVERALL) {
      nextParams.delete("metric");
    } else {
      nextParams.set("metric", newMetric);
    }

    router.replace(`/players/${player.username}/gained?${nextParams.toString()}`, { scroll: false });
  }

  function handlePeriodSelected(newPeriod: Period | "custom") {
    const nextParams = new URLSearchParams(searchParams);

    if (newPeriod === "custom") {
      nextParams.set("dialog", "custom_period");
    } else if (newPeriod === Period.WEEK) {
      nextParams.delete("period");
      nextParams.delete("startDate");
      nextParams.delete("endDate");
    } else {
      nextParams.set("period", newPeriod);
      nextParams.delete("startDate");
      nextParams.delete("endDate");
    }

    router.replace(`/players/${player.username}/gained?${nextParams.toString()}`, { scroll: false });
  }

  return (
    <div className="flex flex-col">
      <div className="flex w-full flex-col justify-between gap-y-3 rounded-lg rounded-b-none border border-b-0 border-gray-500 bg-gray-800 px-5 py-4 md:flex-row md:items-center">
        <div>
          <h3 className="text-h3 font-medium text-white">Gained</h3>
          <p className="text-body text-gray-200">
            {"period" in timeRange ? (
              <>
                {player.displayName}&apos;s exp. gains in the last&nbsp;
                <span className="text-white">{PeriodProps[timeRange.period].name.toLowerCase()}</span>
              </>
            ) : (
              <>
                {player.displayName}&apos;s exp. gains during:&nbsp;
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-white underline">custom period</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    Start: {formatDatetime(timeRange.startDate)}
                    <br />
                    End: {formatDatetime(timeRange.endDate)}
                  </TooltipContent>
                </Tooltip>
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-x-3">
          <PeriodSelect
            period={"period" in timeRange ? timeRange.period : undefined}
            onPeriodSelected={handlePeriodSelected}
          />
          <MetricTypeSelect
            metric={metric}
            metricType={metricType}
            onMetricTypeSelected={handleMetricTypeChanged}
          />
        </div>
      </div>
      <div className="grid grid-cols-12 gap-y-5">
        <div className="col-span-12 -mb-1.5 xl:col-span-6">
          <PlayerGainsTable
            player={player}
            gains={gains}
            onRowSelected={handleMetricSelected}
            selectedMetric={metric}
          />
        </div>
        <div className="col-span-12 -ml-px rounded-lg border border-gray-500 bg-gray-800 xl:col-span-6 xl:rounded-t-none">
          {children}
        </div>
      </div>
    </div>
  );
}

interface PlayerGainsTableProps {
  player: Player;
  gains: PlayerDeltasMap;
  selectedMetric: Metric;
  onRowSelected: (metric: Metric) => void;
}

function PlayerGainsTable(props: PlayerGainsTableProps) {
  const { player, gains, onRowSelected, selectedMetric } = props;
  const metricType = MetricProps[selectedMetric].type;

  function handleRowSelected(row: Row<SkillDelta | BossDelta | ActivityDelta>) {
    onRowSelected(row.original.metric);
  }

  if (metricType === MetricType.BOSS || selectedMetric === Metric.EHB) {
    // Force-add the EHB row
    const rows = [
      {
        metric: Metric.EHB,
        ehb: gains.computed.ehb.value,
        rank: gains.computed.ehb.rank,
        kills: 0,
      } as unknown as BossDelta,
      ...Object.values(gains.bosses),
    ];

    const selectedRowId = String(rows.findIndex((g) => g.metric === selectedMetric));

    return (
      <DataTable
        columns={BOSS_COLUMN_DEFS}
        data={rows}
        containerClassName="rounded-t-none"
        onRowClick={handleRowSelected}
        selectedRowId={selectedRowId}
      />
    );
  }

  if (metricType === MetricType.ACTIVITY) {
    const rows = Object.values(gains.activities);
    const selectedRowId = String(rows.findIndex((g) => g.metric === selectedMetric));

    return (
      <DataTable
        columns={ACTIVITY_COLUMN_DEFS}
        data={rows}
        containerClassName="rounded-t-none"
        onRowClick={handleRowSelected}
        selectedRowId={selectedRowId}
      />
    );
  }

  // Force-add the EHP row
  const rows = [
    {
      metric: Metric.EHP,
      ehp: gains.computed.ehp.value,
      rank: gains.computed.ehp.rank,
      experience: 0,
      level: 0,
    } as unknown as SkillDelta,
    ...Object.values(gains.skills),
  ];

  const hiddenMetrics = getBuildHiddenMetrics(player.build);
  const filteredRows = rows.filter((row) => !hiddenMetrics.includes(row.metric));

  const selectedRowId = String(filteredRows.findIndex((g) => g.metric === selectedMetric));

  return (
    <DataTable
      columns={SKILL_COLUMN_DEFS}
      data={filteredRows}
      containerClassName="rounded-t-none"
      onRowClick={handleRowSelected}
      selectedRowId={selectedRowId}
    />
  );
}

const SKILL_COLUMN_DEFS: ColumnDef<SkillDelta>[] = [
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
    id: "experience",
    accessorFn: (row) => row.experience.gained,
    header: ({ column }) => {
      return <TableSortButton column={column}>Exp.</TableSortButton>;
    },
    cell: ({ row }) => {
      if ((row.original.metric as unknown) === Metric.EHP) return null;
      return <FormattedNumber value={row.original.experience.gained} lowThreshold={10_000} colored />;
    },
  },
  {
    id: "levels",
    accessorFn: (row) => row.level.gained,
    header: ({ column }) => {
      return <TableSortButton column={column}>Levels</TableSortButton>;
    },
    cell: ({ row }) => {
      if ((row.original.metric as unknown) === Metric.EHP) return null;
      return <FormattedNumber value={row.original.level.gained} colored />;
    },
  },
  {
    id: "ranks",
    accessorFn: (row) => row.rank.gained,
    header: ({ column }) => {
      return <TableSortButton column={column}>Rank</TableSortButton>;
    },
    cell: ({ row }) => {
      return <FormattedNumber lowThreshold={10} value={row.original.rank.gained * -1} colored />;
    },
  },
  {
    id: "ehp",
    accessorFn: (row) => row.ehp.gained,
    header: ({ column }) => {
      return <TableSortButton column={column}>EHP</TableSortButton>;
    },
    cell: ({ row }) => {
      if (Math.abs(row.original.ehp.gained) < 0.005) {
        return "0";
      }

      return <FormattedNumber lowThreshold={3} value={row.original.ehp.gained} colored />;
    },
  },
];

const BOSS_COLUMN_DEFS: ColumnDef<BossDelta>[] = [
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
    id: "kills",
    accessorFn: (row) => row.kills.gained,
    header: ({ column }) => {
      return <TableSortButton column={column}>Kills</TableSortButton>;
    },
    cell: ({ row }) => {
      if ((row.original.metric as unknown) === Metric.EHB) return null;
      return <FormattedNumber value={row.original.kills.gained} lowThreshold={20} colored />;
    },
  },
  {
    id: "ranks",
    accessorFn: (row) => row.rank.gained,
    header: ({ column }) => {
      return <TableSortButton column={column}>Rank</TableSortButton>;
    },
    cell: ({ row }) => {
      return <FormattedNumber lowThreshold={10} value={row.original.rank.gained * -1} colored />;
    },
  },
  {
    id: "ehb",
    accessorFn: (row) => row.ehb.gained,
    header: ({ column }) => {
      return <TableSortButton column={column}>EHB</TableSortButton>;
    },
    cell: ({ row }) => {
      if (Math.abs(row.original.ehb.gained) < 0.005) {
        return "0";
      }

      return <FormattedNumber lowThreshold={3} value={row.original.ehb.gained} colored />;
    },
  },
];

const ACTIVITY_COLUMN_DEFS: ColumnDef<ActivityDelta>[] = [
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
    id: "score",
    accessorFn: (row) => row.score.gained,
    header: ({ column }) => {
      return <TableSortButton column={column}>Score</TableSortButton>;
    },
    cell: ({ row }) => {
      return <FormattedNumber value={row.original.score.gained} lowThreshold={20} colored />;
    },
  },
  {
    id: "ranks",
    accessorFn: (row) => row.rank.gained,
    header: ({ column }) => {
      return <TableSortButton column={column}>Rank</TableSortButton>;
    },
    cell: ({ row }) => {
      return <FormattedNumber lowThreshold={10} value={row.original.rank.gained * -1} colored />;
    },
  },
];

interface MetricTypeSelectProps {
  metric: Metric;
  metricType: MetricType;
  onMetricTypeSelected: (metricType: MetricType) => void;
}

function MetricTypeSelect(props: MetricTypeSelectProps) {
  const { metric, metricType, onMetricTypeSelected } = props;

  const [isTransitioning, startTransition] = useTransition();

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
      <ComboboxButton className="w-32" isPending={isTransitioning}>
        <div className="flex items-center gap-x-2">
          {(metricType === MetricType.SKILL || metric === Metric.EHP) && "Skills"}
          {(metricType === MetricType.BOSS || metric === Metric.EHB) && "Bosses"}
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

interface PeriodSelectProps {
  period?: Period;
  onPeriodSelected: (period: Period | "custom") => void;
}

function PeriodSelect(props: PeriodSelectProps) {
  const { period, onPeriodSelected } = props;

  const [isTransitioning, startTransition] = useTransition();

  return (
    <Combobox
      value={period}
      onValueChanged={(val) => {
        startTransition(() => {
          if (val === undefined) {
            onPeriodSelected(Period.WEEK);
          } else if (isPeriod(val) || val === "custom") {
            onPeriodSelected(val);
          }
        });
      }}
    >
      <ComboboxButton className={period ? "w-32" : "w-44"} isPending={isTransitioning}>
        <div className="flex items-center gap-x-2">
          {period ? PeriodProps[period].name : "Custom period"}
        </div>
      </ComboboxButton>
      <ComboboxContent>
        <ComboboxItemsContainer>
          <ComboboxItemGroup label="Period">
            {PERIODS.map((period) => (
              <ComboboxItem value={period} key={period}>
                {PeriodProps[period].name}
              </ComboboxItem>
            ))}
            <ComboboxItem value="custom">Select custom period...</ComboboxItem>
          </ComboboxItemGroup>
        </ComboboxItemsContainer>
      </ComboboxContent>
    </Combobox>
  );
}
