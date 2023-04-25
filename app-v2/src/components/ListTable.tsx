import { PropsWithChildren, forwardRef } from "react";
import { cn } from "~/utils";

function ListTable(props: PropsWithChildren) {
  return (
    <table className="w-full border-separate border-spacing-y-2">
      <tbody>{props.children}</tbody>
    </table>
  );
}

const ListTableRow = forwardRef<HTMLTableRowElement, React.TableHTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => {
    return (
      <tr className={cn("rounded-lg shadow-sm shadow-black/50", className)} ref={ref} {...props}>
        {props.children}
      </tr>
    );
  }
);
ListTableRow.displayName = "ListTableRow";

const ListTableCell = forwardRef<HTMLTableCellElement, React.TableHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => {
    return (
      <td
        className={cn(
          "border border-l-0 border-r-0 border-gray-600 bg-gray-800 px-2 py-3 text-xs tabular-nums text-gray-200",
          "last:rounded-br-lg last:rounded-tr-lg last:border-r last:pr-5",
          "first:rounded-bl-lg first:rounded-tl-lg first:border-l first:pl-5",
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
ListTableCell.displayName = "ListTableCell";

export { ListTable, ListTableRow, ListTableCell };
