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
  Row,
} from "@tanstack/react-table";
import { cn } from "~/utils/styling";
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
  selectedRowId?: string | null;
  onRowClick?: (row: Row<TData>) => void;
  renderSubRow?: (row: Row<TData>) => React.ReactNode;
  containerClassName?: string;
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
    initialState: { pagination: { pageIndex: 0, pageSize: enablePagination ? pageSize : 10_000 } },
  });

  return (
    <div>
      <TableContainer className={props.containerClassName}>
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
                <React.Fragment key={row.id}>
                  <TableRow
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() => {
                      if (props.onRowClick) props.onRowClick(row);
                    }}
                    className={cn(
                      props.onRowClick && "relative cursor-pointer hover:bg-gray-800",
                      props.selectedRowId === row.id && "bg-gray-800 text-white"
                    )}
                  >
                    {row.getVisibleCells().map((cell, idx) => (
                      <TableCell key={cell.id}>
                        {row.id === props.selectedRowId && idx === 0 && (
                          <div className="absolute bottom-0 left-0 top-0 h-full w-0.5 bg-blue-500" />
                        )}
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                  {row.getIsExpanded() && props.renderSubRow !== undefined && (
                    <TableRow>
                      <TableCell className="m-0 p-0" colSpan={columns.length}>
                        {props.renderSubRow(row)}
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
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
      {enablePagination && table.getPageCount() > 1 && (
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
    </div>
  );
}
