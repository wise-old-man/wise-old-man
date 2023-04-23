"use client";

import { useState } from "react";

interface TableSortingOptions {
  value: string;
  direction: TableSortingDirection | undefined;
}

type TableSortingDirection = "asc" | "desc";

function useTableSorting() {
  const [sortingOptions, setSortingOptions] = useState<TableSortingOptions | undefined>();

  function sortColumn(value: string) {
    if (!sortingOptions) {
      setSortingOptions({ value, direction: "asc" });
      return;
    }

    let nextDirection: TableSortingDirection | undefined;

    if (!sortingOptions.direction || sortingOptions.value !== value) {
      nextDirection = "asc";
    } else if (sortingOptions.direction === "asc") {
      nextDirection = "desc";
    }

    setSortingOptions({ value, direction: nextDirection });
  }

  function getDirection(value: string) {
    if (!sortingOptions || sortingOptions.value !== value) return undefined;
    return sortingOptions.direction;
  }

  return { sortColumn, getDirection, sortingOptions };
}

export { useTableSorting };
export type { TableSortingOptions, TableSortingDirection };
