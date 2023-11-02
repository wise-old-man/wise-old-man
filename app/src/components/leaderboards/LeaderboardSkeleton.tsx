import { Period, PeriodProps } from "@wise-old-man/utils";
import { ListTable, ListTableRow, ListTableCell } from "~/components/ListTable";

interface LeaderboardSkeletonProps {
  period?: Period;
  hasCaption?: boolean;
}

export function LeaderboardSkeleton(props: LeaderboardSkeletonProps) {
  const { period, hasCaption } = props;

  return (
    <div>
      {period && <h3 className="pb-3 text-h3 font-bold">{PeriodProps[period].name}</h3>}
      <ListTable>
        {[...Array(20)].map((_, i) => (
          <ListTableRow key={`${period}_skeleton_${i}`}>
            <ListTableCell className="w-1 pr-1">
              <div className="h-4 w-4 animate-pulse rounded-xl bg-gray-600" />
            </ListTableCell>
            <ListTableCell className="flex items-center text-sm text-white">
              <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-gray-600" />
              <div className="ml-2 flex flex-col gap-y-1.5">
                <div className="h-4 w-24 animate-pulse rounded-xl bg-gray-600" />
                {hasCaption && <div className="h-3.5 w-32 animate-pulse rounded-xl bg-gray-600" />}
              </div>
            </ListTableCell>
            <ListTableCell className="w-5 text-right font-medium">
              <div className="h-5 w-12 animate-pulse rounded-xl bg-gray-600" />
            </ListTableCell>
          </ListTableRow>
        ))}
      </ListTable>
    </div>
  );
}
