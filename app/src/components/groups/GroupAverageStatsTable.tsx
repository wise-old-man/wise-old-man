"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  ActivityValue,
  BossValue,
  ComputedMetricValue,
  GroupStatistics,
  MetricProps,
  SkillValue,
  isActivity,
  isBoss,
  isSkill,
} from "@wise-old-man/utils";
import { DataTable } from "../DataTable";
import { MetricIconSmall } from "../Icon";
import { FormattedNumber } from "../FormattedNumber";

interface GroupAverageStatsTableProps {
  statistics: GroupStatistics;
}

export function GroupAverageStatsTable(props: GroupAverageStatsTableProps) {
  const { statistics } = props;

  const rows = [
    ...Object.values(statistics.averageStats.data.skills),
    ...Object.values(statistics.averageStats.data.bosses),
    ...Object.values(statistics.averageStats.data.activities),
    ...Object.values(statistics.averageStats.data.computed),
  ];

  return <DataTable columns={COLUMN_DEFS} data={rows} />;
}

const COLUMN_DEFS: ColumnDef<SkillValue | BossValue | ActivityValue | ComputedMetricValue>[] = [
  {
    accessorKey: "metric",
    header: "Metric",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-x-2">
          <MetricIconSmall metric={row.original.metric} />
          {MetricProps[row.original.metric].name}
        </div>
      );
    },
  },
  {
    accessorKey: "level",
    header: "Level",
    cell: ({ row }) => {
      if (isSkill(row.original.metric)) {
        return (row.original as SkillValue).level;
      }

      return null;
    },
  },
  {
    accessorKey: "value",
    header: "Value",
    cell: ({ row }) => {
      if (isSkill(row.original.metric)) {
        return <FormattedNumber value={(row.original as SkillValue).experience} />;
      } else if (isBoss(row.original.metric)) {
        return <FormattedNumber value={(row.original as BossValue).kills} />;
      } else if (isActivity(row.original.metric)) {
        return <FormattedNumber value={(row.original as ActivityValue).score} />;
      }

      return <FormattedNumber value={(row.original as ComputedMetricValue).value} />;
    },
  },
  {
    accessorKey: "rank",
    header: "Global Rank",
    cell: ({ row }) => {
      return <FormattedNumber value={row.original.rank} />;
    },
  },
];
