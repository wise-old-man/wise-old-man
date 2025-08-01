"use client";

import { Bonus, MAX_SKILL_EXP, MetricProps, SKILL_EXP_AT_99, getLevel } from "@wise-old-man/utils";
import { ColumnDef } from "@tanstack/react-table";
import { TableTitle } from "../Table";
import { DataTable } from "../DataTable";
import { MetricIconSmall } from "../Icon";
import { FormattedNumber } from "../FormattedNumber";

const COLUMN_DEFINITIONS: ColumnDef<Bonus>[] = [
  {
    id: "startExp",
    header: () => "Starting exp.",
    cell: ({ row }) => (
      <>
        <FormattedNumber value={row.original.startExp} />{" "}
        {` (Lv. ${getLevel(row.original.startExp, true)})`}
      </>
    ),
  },
  {
    id: "endExp",
    header: () => "Ending exp.",
    cell: ({ row }) => (
      <>
        <FormattedNumber value={row.original.endExp} />
        {` (Lv. ${
          (row.original.endExp as number) > SKILL_EXP_AT_99 ? "99+" : getLevel(row.getValue("endExp"))
        })`}
      </>
    ),
  },
  {
    id: "skill",
    header: () => "Skill",
    cell: ({ row }) => (
      <div className="flex items-center gap-x-2">
        <MetricIconSmall metric={row.original.bonusSkill} />
        <span>{MetricProps[row.original.bonusSkill].name}</span>
      </div>
    ),
  },
  {
    id: "ratio",
    header: () => "Bonus ratio",
    cell: ({ row }) => Math.floor(row.original.ratio * 10000) / 10000,
  },
  {
    id: "ratio",
    header: () => "Bonus exp.",
    cell: ({ row }) => {
      const { ratio, startExp, endExp, maxBonus } = row.original;

      if (maxBonus) {
        return (
          <>
            <FormattedNumber value={maxBonus} />
            &nbsp;(max)
          </>
        );
      }

      return (
        <FormattedNumber value={Math.min(MAX_SKILL_EXP, Math.floor((endExp - startExp) * ratio))} />
      );
    },
  },
];

export function ExperienceBonusesTable(props: { bonuses: Bonus[] }) {
  const { bonuses } = props;

  return (
    <DataTable
      data={bonuses}
      columns={COLUMN_DEFINITIONS}
      headerSlot={
        <TableTitle>
          <span className="text-base font-medium">Bonuses</span>
        </TableTitle>
      }
    />
  );
}
