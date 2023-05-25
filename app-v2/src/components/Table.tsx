import { PropsWithChildren, forwardRef } from "react";
import { cn } from "~/utils/styling";

import ChevronDownIcon from "~/assets/chevron_down.svg";
import { TableSortingDirection } from "~/hooks/useTableSorting";

function Table(props: PropsWithChildren) {
  return (
    <table className="min-w-full divide-y divide-gray-600 rounded-lg border border-l-0 border-r-0 border-gray-500">
      {props.children}
    </table>
  );
}

const TableBody = forwardRef<
  HTMLTableSectionElement,
  React.TableHTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => {
  return (
    <tbody className={cn("divide-y divide-gray-600", className)} ref={ref} {...props}>
      {props.children}
    </tbody>
  );
});
TableBody.displayName = "TableBody";

const TableColumns = forwardRef<
  HTMLTableSectionElement,
  React.TableHTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => {
  return (
    <thead className={cn("divide-y divide-gray-600", className)} ref={ref} {...props}>
      <TableRow>{props.children}</TableRow>
    </thead>
  );
});
TableColumns.displayName = "TableColumns";

const TableRow = forwardRef<HTMLTableRowElement, React.TableHTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => {
    return (
      <tr className={cn(className)} ref={ref} {...props}>
        {props.children}
      </tr>
    );
  }
);
TableRow.displayName = "TableRow";

const TableCell = forwardRef<HTMLTableCellElement, React.TableHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => {
    return (
      <td
        className={cn(
          "border-gray-500 bg-gray-900 px-5 py-3 text-xs font-normal tabular-nums text-gray-200",
          className
        )}
        ref={ref}
        {...props}
      >
        {props.children}
      </td>
    );
  }
);
TableCell.displayName = "TableCell";

const TableColumn = forwardRef<HTMLTableCellElement, React.TableHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => {
    return (
      <th
        className={cn(
          "whitespace-nowrap border-gray-500 bg-gray-900 px-5 py-3 text-left text-xs font-medium text-gray-200",
          className
        )}
        ref={ref}
        {...props}
      >
        <div className="flex items-center gap-x-2">{props.children}</div>
      </th>
    );
  }
);
TableColumn.displayName = "TableColumn";

function TableContainer(props: PropsWithChildren) {
  return (
    <div className="inline-block min-w-full">
      <div className="overflow-hidden rounded-xl border border-gray-500 bg-gray-900">
        {props.children}
      </div>
    </div>
  );
}

function TableHeader(props: PropsWithChildren) {
  return (
    <div className="flex w-full items-center justify-between border-b border-gray-500 px-5 py-4">
      {props.children}
    </div>
  );
}

interface TableSortingProps {
  value: string;
  sortColumn: (value: string) => void;
  getDirection: (value: string) => TableSortingDirection | undefined;
}

function TableSorting(props: TableSortingProps) {
  const { value, sortColumn, getDirection } = props;

  const direction = getDirection(value);

  let rotation = -90;
  if (direction === "asc") rotation = 180;
  if (direction === "desc") rotation = 0;

  return (
    <button className="rounded hover:bg-gray-700 hover:text-white" onClick={() => sortColumn(value)}>
      <ChevronDownIcon
        className={cn("h-4 w-4", direction && "text-white")}
        style={{ transform: `rotate(${rotation}deg)` }}
      />
    </button>
  );
}

export {
  TableContainer,
  Table,
  TableHeader,
  TableColumns,
  TableBody,
  TableRow,
  TableCell,
  TableColumn,
  TableSorting,
};
