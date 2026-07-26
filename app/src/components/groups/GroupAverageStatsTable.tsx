"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  Activity,
  Boss,
  ComputedMetric,
  GroupStatisticsResponse,
  Metric,
  MetricProps,
  Skill,
  SnapshotResponse,
  isActivity,
  isBoss,
  isComputedMetric,
  isSkill,
} from "@wise-old-man/utils";
import { DataTable } from "../DataTable";
import { MetricIconSmall } from "../Icon";
import { FormattedNumber } from "../FormattedNumber";
import { Tooltip, TooltipContent, TooltipTrigger } from "../Tooltip";

type SkillValue = SnapshotResponse["data"]["skills"][Skill];
type BossValue = SnapshotResponse["data"]["bosses"][Boss];
type ActivityValue = SnapshotResponse["data"]["activities"][Activity];
type ComputedMetricValue = SnapshotResponse["data"]["computed"][ComputedMetric];

interface GroupAverageStatsTableProps {
  statistics: GroupStatisticsResponse;
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
      let value = -1;

      if (isSkill(row.original.metric) && "experience" in row.original) {
        value = row.original.experience;
      } else if (isBoss(row.original.metric) && "kills" in row.original) {
        value = row.original.kills;
      } else if (isActivity(row.original.metric) && "score" in row.original) {
        value = row.original.score;
      } else if (isComputedMetric(row.original.metric) && "value" in row.original) {
        value = row.original.value;
      }

      return value === -1 ? tooltip(row.original.metric) : <FormattedNumber value={value} />;
    },
  },
  {
    accessorKey: "rank",
    header: "Global Rank",
    cell: ({ row }) => {
      const rank = row.original.rank;
      if (rank === -1) {
        return tooltip(row.original.metric);
      }
      return <FormattedNumber value={rank} />;
    },
  },
];

function tooltip(metric: Metric) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="text-gray-300">---</span>
      </TooltipTrigger>
      <TooltipContent>This group is unranked in {MetricProps[metric].name}.</TooltipContent>
    </Tooltip>
  );
}
