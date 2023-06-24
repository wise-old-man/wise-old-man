"use client";

import { PropsWithChildren, useTransition } from "react";
import { ColumnDef, Row } from "@tanstack/react-table";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ACTIVITIES,
  ActivityDelta,
  BOSSES,
  BossDelta,
  Metric,
  MetricProps,
  MetricType,
  PERIODS,
  Period,
  PeriodProps,
  PlayerDeltasMap,
  PlayerDetails,
  SKILLS,
  SkillDelta,
  isPeriod,
} from "@wise-old-man/utils";
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

interface PlayerGainedTableProps {
  player: PlayerDetails;
  gains: PlayerDeltasMap;
  metric: Metric;
  period: Period;
}

export function PlayerGainedTable(props: PropsWithChildren<PlayerGainedTableProps>) {
  const { player, gains, metric, period, children } = props;

  const router = useRouter();
  const searchParams = useSearchParams();

  const metricType = MetricProps[metric].type;

  function handleMetricTypeChanged(newMetricType: MetricType) {
    if (newMetricType === MetricType.BOSS) {
      handleMetricSelected(BOSSES[0]);
    } else if (newMetricType === MetricType.ACTIVITY) {
      handleMetricSelected(ACTIVITIES[0]);
    } else {
      handleMetricSelected(SKILLS[0]);
    }
  }

  function handleMetricSelected(newMetric: Metric) {
    const nextParams = new URLSearchParams(searchParams);

    if (newMetric === Metric.OVERALL) {
      nextParams.delete("metric");
    } else {
      nextParams.set("metric", newMetric);
    }

    router.replace(`/players/${player.displayName}/gained?${nextParams.toString()}`);
  }

  function handlePeriodSelected(newPeriod: Period) {
    const nextParams = new URLSearchParams(searchParams);

    if (newPeriod === Period.WEEK) {
      nextParams.delete("period");
    } else {
      nextParams.set("period", newPeriod);
    }

    router.replace(`/players/${player.displayName}/gained?${nextParams.toString()}`);
  }

  return (
    <div className="flex flex-col">
      <div className="flex w-full items-center justify-between rounded-lg rounded-b-none border border-b-0 border-gray-500 px-5 py-4">
        <div>
          <h3 className="text-h3 font-medium text-white">Gained</h3>
          <p className="text-body text-gray-200">
            {`${player.displayName}'s exp. gains in the last `}
            <span className="text-white">{PeriodProps[period].name.toLowerCase()}</span>
          </p>
        </div>
        <div className="flex items-center gap-x-3">
          <PeriodSelect period={period} onPeriodSelected={handlePeriodSelected} />
          <MetricTypeSelect metricType={metricType} onMetricTypeSelected={handleMetricTypeChanged} />
        </div>
      </div>
      <div className="grid grid-cols-12">
        <div className="col-span-6">
          <PlayerGainsTable gains={gains} onRowSelected={handleMetricSelected} selectedMetric={metric} />
        </div>
        <div className="col-span-6 -ml-px mb-1.5 rounded-b-lg border border-gray-500">{children}</div>
      </div>
    </div>
  );
}

interface PlayerGainsTableProps {
  gains: PlayerDeltasMap;
  selectedMetric: Metric;
  onRowSelected: (metric: Metric) => void;
}

function PlayerGainsTable(props: PlayerGainsTableProps) {
  const { gains, onRowSelected, selectedMetric } = props;
  const metricType = MetricProps[selectedMetric].type;

  function handleRowSelected(row: Row<SkillDelta | BossDelta | ActivityDelta>) {
    onRowSelected(row.original.metric);
  }

  if (metricType === MetricType.BOSS) {
    const rows = Object.values(gains.bosses);
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

  const rows = Object.values(gains.skills);
  const selectedRowId = String(rows.findIndex((g) => g.metric === selectedMetric));

  return (
    <DataTable
      columns={SKILL_COLUMN_DEFS}
      data={rows}
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
      return <TableSortButton column={column}>Experience</TableSortButton>;
    },
    cell: ({ row }) => {
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

interface PeriodSelectProps {
  period: Period;
  onPeriodSelected: (period: Period) => void;
}

function PeriodSelect(props: PeriodSelectProps) {
  const { period, onPeriodSelected } = props;

  const [isPending, startTransition] = useTransition();

  return (
    <Combobox
      value={period}
      onValueChanged={(val) => {
        startTransition(() => {
          if (val === undefined) {
            onPeriodSelected(Period.WEEK);
          } else if (isPeriod(val)) {
            onPeriodSelected(val);
          }
        });
      }}
    >
      <ComboboxButton className="w-32" isPending={isPending}>
        <div className="flex items-center gap-x-2">{PeriodProps[period].name}</div>
      </ComboboxButton>
      <ComboboxContent>
        <ComboboxItemsContainer>
          <ComboboxItemGroup label="Period">
            {PERIODS.map((period) => (
              <ComboboxItem value={period} key={period}>
                {PeriodProps[period].name}
              </ComboboxItem>
            ))}
          </ComboboxItemGroup>
        </ComboboxItemsContainer>
      </ComboboxContent>
    </Combobox>
  );
}
