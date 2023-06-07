"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { MAX_SKILL_EXP, SkillMetaMethod } from "@wise-old-man/utils";
import { TableTitle } from "../Table";
import { DataTable } from "../DataTable";
import { FormattedNumber } from "../FormattedNumber";

function getColumnDefinitions(methods: SkillMetaMethod[]): ColumnDef<SkillMetaMethod>[] {
  return [
    {
      id: "startExp",
      header: () => "Starting exp.",
      cell: ({ row }) => <FormattedNumber value={row.original.startExp} />,
    },
    {
      id: "endExp",
      header: () => "Ending exp.",
      accessorFn: (_, index) => {
        return index < methods.length - 1 ? methods[index + 1].startExp : MAX_SKILL_EXP;
      },
      cell: ({ row }) => <FormattedNumber value={row.getValue("endExp")} />,
    },
    {
      id: "rate",
      header: () => "Rate",
      cell: ({ row }) => <MethodRate {...row.original} />,
    },
    {
      id: "duration",
      header: () => "Estimated duration",
      cell: ({ row }) => {
        const endExp = Number(row.getValue("endExp"));
        const { startExp, rate } = row.original;

        return `${Math.floor(((endExp - startExp) / rate) * 100) / 100} hours`;
      },
    },
    {
      accessorKey: "description",
      header: () => "Description",
    },
  ];
}

export function ExpRatesTable(props: { methods: SkillMetaMethod[] }) {
  const { methods } = props;

  const columnDefs = useMemo(() => getColumnDefinitions(methods), [methods]);

  return (
    <DataTable
      data={methods}
      columns={columnDefs}
      headerSlot={
        <TableTitle>
          <span className="text-base font-medium">Experience rates</span>
        </TableTitle>
      }
    />
  );
}

function MethodRate(props: SkillMetaMethod) {
  if (props.rate === 0) return <>---</>;

  if (props.realRate) {
    return (
      <div>
        <span>
          <FormattedNumber value={props.rate} />
          &nbsp;per hour
        </span>
        <span>
          &nbsp;(actually&nbsp;
          <FormattedNumber value={props.realRate} />)
        </span>
      </div>
    );
  }

  return (
    <>
      <FormattedNumber value={props.rate} />
      &nbsp;per hour
    </>
  );
}
