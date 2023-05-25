"use client";

import * as React from "react";
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "./Button";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from "./Table";

import ChevronDownIcon from "~/assets/chevron_down.svg";
import ChevronFirstIcon from "~/assets/chevron_first.svg";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  meta?: unknown;
  data: TData[];

  pageSize?: number;
  enablePagination?: boolean;
  headerSlot?: React.ReactNode;
  colGroupSlot?: React.ReactNode;
}

export function DataTable<TData, TValue>(props: DataTableProps<TData, TValue>) {
  const { columns, meta, data, headerSlot, colGroupSlot, pageSize = 20, enablePagination } = props;

  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    meta: meta as any,
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    onSortingChange: setSorting,
    state: { sorting },
    initialState: { pagination: { pageIndex: 0, pageSize } },
  });

  return (
    <>
      <TableContainer>
        {headerSlot}
        <Table>
          {colGroupSlot}
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {enablePagination && (
        <div className="flex items-center justify-end space-x-3 py-4">
          <span className="mr-3 text-xs text-gray-200">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <Button
            className="px-1"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronFirstIcon className="h-4 w-4" />
          </Button>
          <Button
            className="px-1"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronDownIcon className="h-4 w-4 rotate-90" />
          </Button>
          <Button
            className="px-1"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronDownIcon className="h-4 w-4 -rotate-90" />
          </Button>
          <Button
            className="px-1"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronFirstIcon className="h-4 w-4 -rotate-180" />
          </Button>
        </div>
      )}
    </>
  );
}
