import {
  HTMLAttributes,
  PropsWithChildren,
  TdHTMLAttributes,
  ThHTMLAttributes,
  forwardRef,
} from "react";
import { Column } from "@tanstack/react-table";
import { cn } from "~/utils/styling";

import ChevronDownIcon from "~/assets/chevron_down.svg";

const Table = forwardRef<HTMLTableElement, HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="custom-scroll w-full overflow-auto">
      <table
        ref={ref}
        className={cn("w-full caption-bottom text-xs font-normal tabular-nums text-gray-100", className)}
        {...props}
      />
    </div>
  )
);
Table.displayName = "Table";

function TableTitle(props: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={cn(
        "flex w-full items-center justify-between border-b border-gray-500 px-5 py-4",
        props.className
      )}
    >
      {props.children}
    </div>
  );
}

const TableHeader = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
  )
);
TableHeader.displayName = "TableHeader";

const TableBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />
  )
);
TableBody.displayName = "TableBody";

const TableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        "border-b border-gray-600 transition-colors data-[state=selected]:bg-gray-500",
        className
      )}
      {...props}
    />
  )
);
TableRow.displayName = "TableRow";

const TableHead = forwardRef<HTMLTableCellElement, ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        "h-10 whitespace-nowrap px-4 text-left align-middle text-xs font-medium tabular-nums text-gray-200 [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
);
TableHead.displayName = "TableHead";

const TableCell = forwardRef<HTMLTableCellElement, TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      className={cn("whitespace-nowrap p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
      {...props}
    />
  )
);
TableCell.displayName = "TableCell";

function TableContainer(props: PropsWithChildren<{ className?: string }>) {
  return (
    <div className="inline-block w-full">
      <div
        className={cn("overflow-hidden rounded-lg border border-gray-500 bg-gray-800", props.className)}
      >
        {props.children}
      </div>
    </div>
  );
}

interface TableSortButtonProps<TData, TValue> extends PropsWithChildren {
  column: Column<TData, TValue>;
}

function TableSortButton<TData, TValue>(props: TableSortButtonProps<TData, TValue>) {
  const { children, column } = props;

  const direction = column.getIsSorted();

  let rotation = -90;
  if (direction === "asc") rotation = 180;
  else if (direction === "desc") rotation = 0;

  function handleClick() {
    column.toggleSorting(column.getIsSorted() === "asc");
  }

  return (
    <button
      className={cn("flex items-center gap-x-1 rounded hover:text-white", !!direction && "text-white")}
      onClick={handleClick}
    >
      {children}
      <ChevronDownIcon className="h-4 w-4" style={{ transform: `rotate(${rotation}deg)` }} />
    </button>
  );
}

export {
  Table,
  TableTitle,
  TableContainer,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableSortButton,
};
