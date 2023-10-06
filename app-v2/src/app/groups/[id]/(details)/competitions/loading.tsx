import { ListTable, ListTableCell, ListTableRow } from "~/components/ListTable";

export default function Loading() {
  return (
    <div>
      <div className="mb-1 h-3 w-32 animate-pulse rounded-full bg-gray-700" />
      <div className="custom-scroll overflow-x-auto">
        <ListTable className="border-spacing-y-3">
          {[...Array(3)].map((_, i) => (
            <ListTableRow
              key={`competition_skeleton_${i}`}
              className="animate-pulse"
              style={{ opacity: 1 - i * 0.3333 }}
            >
              <ListTableCell className="flex items-center gap-x-3">
                <div className="h-6 w-6 animate-pulse rounded-full bg-gray-700" />
                <div className="flex flex-col gap-y-2 py-1">
                  <div className="h-4 w-60 animate-pulse rounded-lg bg-gray-700" />
                  <div className="h-3 w-28 animate-pulse rounded-lg bg-gray-700" />
                </div>
              </ListTableCell>
              <ListTableCell className="w-40 pr-4">
                <div className="h-3 w-28 animate-pulse rounded-lg bg-gray-700" />
              </ListTableCell>
              <ListTableCell className="w-28 pl-0">
                <div className="flex justify-end">
                  <div className="h-5 w-16 animate-pulse rounded-full bg-gray-700" />
                </div>
              </ListTableCell>
            </ListTableRow>
          ))}
        </ListTable>
      </div>
    </div>
  );
}
