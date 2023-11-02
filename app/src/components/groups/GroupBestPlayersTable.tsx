"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  ActivityValue,
  ActivityValueWithPlayer,
  BossValue,
  BossValueWithPlayer,
  ComputedMetricValue,
  ComputedMetricValueWithPlayer,
  GroupStatistics,
  MetricProps,
  SkillValue,
  SkillValueWithPlayer,
  isActivity,
  isBoss,
  isSkill,
} from "@wise-old-man/utils";
import { DataTable } from "../DataTable";
import { MetricIconSmall } from "../Icon";
import { FormattedNumber } from "../FormattedNumber";
import { PlayerIdentity } from "../PlayerIdentity";

interface GroupBestPlayersTableProps {
  statistics: GroupStatistics;
}

export function GroupBestPlayersTable(props: GroupBestPlayersTableProps) {
  const { statistics } = props;

  const rows = [
    ...Object.values(statistics.metricLeaders.skills),
    ...Object.values(statistics.metricLeaders.bosses),
    ...Object.values(statistics.metricLeaders.activities),
    ...Object.values(statistics.metricLeaders.computed),
  ];

  return <DataTable columns={COLUMN_DEFS} data={rows} />;
}

const COLUMN_DEFS: ColumnDef<
  SkillValueWithPlayer | BossValueWithPlayer | ActivityValueWithPlayer | ComputedMetricValueWithPlayer
>[] = [
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
    accessorKey: "player",
    header: "Player",
    cell: ({ row }) => {
      if (!row.original.player) return "none";
      return <PlayerIdentity player={row.original.player} />;
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

      if (isSkill(row.original.metric)) {
        value = (row.original as SkillValue).experience;
      } else if (isBoss(row.original.metric)) {
        value = (row.original as BossValue).kills;
      } else if (isActivity(row.original.metric)) {
        value = (row.original as ActivityValue).score;
      } else {
        value = (row.original as ComputedMetricValue).value;
      }

      return value === -1 ? "---" : <FormattedNumber value={value} />;
    },
  },
  {
    accessorKey: "rank",
    header: "Global Rank",
    cell: ({ row }) => {
      if (row.original.rank === -1) return "---";
      return <FormattedNumber value={row.original.rank} />;
    },
  },
];
