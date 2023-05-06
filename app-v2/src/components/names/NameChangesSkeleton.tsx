import { ListTable, ListTableRow, ListTableCell } from "~/components/ListTable";

import ArrowRightIcon from "~/assets/arrow_right.svg";

export function NameChangesSkeleton() {
  return (
    <ListTable>
      {[...Array(20)].map((_, i) => (
        <ListTableRow key={`name_change_skeleton_${i}`}>
          <ListTableCell>
            <div className="h-4 w-12 animate-pulse rounded-xl bg-gray-600" />
          </ListTableCell>
          <ListTableCell className="py-[1.1rem]">
            <div className="h-4 w-24 animate-pulse rounded-xl bg-gray-500" />
          </ListTableCell>
          <ListTableCell>
            <ArrowRightIcon className="h-4 w-4 animate-pulse text-gray-300" />
          </ListTableCell>
          <ListTableCell>
            <div className="h-4 w-20 animate-pulse rounded-xl bg-gray-500" />
          </ListTableCell>
          <ListTableCell>
            <div className="h-4 w-36 animate-pulse rounded-xl bg-gray-600" />
          </ListTableCell>
          <ListTableCell>
            <div className="h-4 w-36 animate-pulse rounded-xl bg-gray-600" />
          </ListTableCell>
          <ListTableCell>
            <div className="h-6 w-24 animate-pulse rounded-xl bg-gray-600" />
          </ListTableCell>
        </ListTableRow>
      ))}
    </ListTable>
  );
}
