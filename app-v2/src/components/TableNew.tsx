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

const TableNew = forwardRef<HTMLTableElement, HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="custom-scroll w-full overflow-auto">
      <table
        ref={ref}
        className={cn("w-full caption-bottom text-xs font-normal tabular-nums text-gray-200", className)}
        {...props}
      />
    </div>
  )
);
TableNew.displayName = "TableNew";

const TableNewHeader = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
  )
);
TableNewHeader.displayName = "TableNewHeader";

const TableNewBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />
  )
);
TableNewBody.displayName = "TableNewBody";

const TableNewRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(
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
TableNewRow.displayName = "TableNewRow";

const TableNewHead = forwardRef<HTMLTableCellElement, ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        "h-12 px-4 text-left align-middle text-xs font-normal tabular-nums text-gray-200 [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
);
TableNewHead.displayName = "TableNewHead";

const TableNewCell = forwardRef<HTMLTableCellElement, TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
      {...props}
    />
  )
);
TableNewCell.displayName = "TableNewCell";

function TableNewTitle(props: PropsWithChildren) {
  return <div className="flex w-full items-center justify-between px-5 py-4">{props.children}</div>;
}

function TableNewContainer(props: PropsWithChildren) {
  return (
    <div className="inline-block w-full">
      <div className="overflow-hidden rounded-xl border border-gray-500 bg-gray-900">
        {props.children}
      </div>
    </div>
  );
}

interface TableNewSortableHeadProps<TData, TValue> extends PropsWithChildren {
  column: Column<TData, TValue>;
}

function TableNewSortableHead<TData, TValue>(props: TableNewSortableHeadProps<TData, TValue>) {
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
  TableNew,
  TableNewContainer,
  TableNewHeader,
  TableNewTitle,
  TableNewBody,
  TableNewHead,
  TableNewRow,
  TableNewCell,
  TableNewSortableHead,
};
