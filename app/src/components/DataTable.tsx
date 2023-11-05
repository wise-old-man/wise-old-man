"use client";

import { Fragment, useState } from "react";
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
import {
  Combobox,
  ComboboxButton,
  ComboboxContent,
  ComboboxItem,
  ComboboxItemsContainer,
} from "./Combobox";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from "./Table";

import ChevronDownIcon from "~/assets/chevron_down.svg";
import ChevronFirstIcon from "~/assets/chevron_first.svg";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  meta?: unknown;
  data: TData[];

  defaultPageSize?: number;
  enablePagination?: boolean;
  headerSlot?: React.ReactNode;
  colGroupSlot?: React.ReactNode;
  selectedRowId?: string | null;
  onRowClick?: (row: Row<TData>) => void;
  renderSubRow?: (row: Row<TData>) => React.ReactNode;
  containerClassName?: string;
}

export function DataTable<TData, TValue>(props: DataTableProps<TData, TValue>) {
  const {
    columns,
    meta,
    data,
    headerSlot,
    colGroupSlot,
    defaultPageSize = 20,
    enablePagination,
  } = props;

  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [pageIndex, setPageIndex] = useState(0);

  const table = useReactTable({
    meta: meta as any,
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    onSortingChange: setSorting,
    state: {
      sorting,
      pagination: {
        pageIndex,
        pageSize: enablePagination ? pageSize : 10_000,
      },
    },
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: enablePagination ? pageSize : 10_000,
      },
    },
  });

  function nextPage() {
    const nextIndex = pageIndex + 1;

    if (nextIndex >= table.getPageCount()) {
      return;
    }

    setPageIndex(nextIndex);
  }

  function previousPage() {
    const nextIndex = pageIndex - 1;

    if (nextIndex < 0) {
      return;
    }

    setPageIndex(nextIndex);
  }

  function getCanPreviousPage() {
    return pageIndex > 0;
  }

  function getCanNextPage() {
    return pageIndex < table.getPageCount() - 1;
  }

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
                <Fragment key={row.id}>
                  <TableRow
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() => {
                      if (props.onRowClick) props.onRowClick(row);
                    }}
                    className={cn(
                      props.onRowClick && "relative cursor-pointer hover:bg-gray-700",
                      props.selectedRowId === row.id && "bg-gray-700 text-white"
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
                </Fragment>
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
      {enablePagination && (pageSize !== defaultPageSize || table.getPageCount() > 1) && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 py-4">
            <span className="mr-1 text-xs text-gray-200">Rows per page</span>
            <Combobox value={String(pageSize)} onValueChanged={(val) => setPageSize(Number(val))}>
              <ComboboxButton className="gap-x-0">{pageSize}</ComboboxButton>
              <ComboboxContent align="start">
                <ComboboxItemsContainer>
                  <ComboboxItem value="20">20</ComboboxItem>
                  <ComboboxItem value="50">50</ComboboxItem>
                  <ComboboxItem value="100">100</ComboboxItem>
                  <ComboboxItem value="500">500</ComboboxItem>
                  <ComboboxItem value="1000">1000</ComboboxItem>
                </ComboboxItemsContainer>
              </ComboboxContent>
            </Combobox>
          </div>
          <div className="flex items-center justify-end space-x-3 py-4">
            <span className="mr-3 text-xs text-gray-200">
              Page {pageIndex + 1} of {table.getPageCount()}
            </span>
            <Button
              className="px-1"
              size="sm"
              onClick={() => setPageIndex(0)}
              disabled={!getCanPreviousPage()}
            >
              <ChevronFirstIcon className="h-4 w-4" />
            </Button>
            <Button
              className="px-1"
              size="sm"
              onClick={() => previousPage()}
              disabled={!getCanPreviousPage()}
            >
              <ChevronDownIcon className="h-4 w-4 rotate-90" />
            </Button>
            <Button className="px-1" size="sm" onClick={() => nextPage()} disabled={!getCanNextPage()}>
              <ChevronDownIcon className="h-4 w-4 -rotate-90" />
            </Button>
            <Button
              className="px-1"
              size="sm"
              onClick={() => setPageIndex(table.getPageCount() - 1)}
              disabled={!getCanNextPage()}
            >
              <ChevronFirstIcon className="h-4 w-4 -rotate-180" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
