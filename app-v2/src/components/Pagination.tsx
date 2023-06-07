"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "~/utils/styling";

import ChevronIcon from "~/assets/chevron_down.svg";

const PAGES_COUNT = 5;

interface PaginationProps {
  currentPage?: number;
  hasMorePages?: boolean;
}

export function Pagination(props: PaginationProps) {
  const { currentPage = 1, hasMorePages = true } = props;

  const hasPrevious = currentPage > 1;
  const numbers = getPageNumbers(currentPage, hasMorePages);

  const pathname = usePathname();
  const searchParams = useSearchParams();

  function getPaginatedHref(page: number) {
    const params = new URLSearchParams(searchParams);

    if (page > 1) {
      params.set("page", page.toString());
    } else if (params.has("page")) {
      params.delete("page");
    }

    return `${pathname}?${params.toString()}`;
  }

  if (!hasMorePages && currentPage === 1) {
    return null;
  }

  return (
    <div className="flex justify-center lg:justify-end">
      <nav
        aria-label="Pagination"
        className="flex justify-center -space-x-px rounded-md bg-gray-800 shadow-button"
      >
        <Link
          prefetch={false}
          aria-disabled={!hasPrevious}
          href={getPaginatedHref(currentPage - 1)}
          className={cn(
            "relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-200 ring-1 ring-inset ring-gray-500 hover:bg-gray-700 hover:text-white focus:z-20 focus:outline-offset-0",
            "aria-disabled:pointer-events-none aria-disabled:opacity-30"
          )}
        >
          <span className="sr-only">Previous</span>
          <ChevronIcon className="h-5 w-5 rotate-90" aria-hidden="true" />
        </Link>
        {currentPage > (PAGES_COUNT - 1) / 2 + 1 && (
          <>
            <Link
              prefetch={false}
              href={getPaginatedHref(1)}
              className="relative hidden items-center px-4 py-2 text-sm font-semibold text-gray-200 ring-1 ring-inset ring-gray-500 hover:bg-gray-700 hover:text-white focus:z-20 focus:outline-offset-0 sm:inline-flex"
            >
              1
            </Link>
            <div className="relative hidden items-center px-4 py-2 text-sm font-semibold text-gray-200 ring-1 ring-inset ring-gray-500 focus:z-20 focus:outline-offset-0 sm:inline-flex">
              ...
            </div>
          </>
        )}
        {numbers.map((number) => (
          <Link
            key={`page_${number}`}
            prefetch={false}
            href={getPaginatedHref(number)}
            aria-current={currentPage === number ? "page" : undefined}
            className={cn(
              "relative inline-flex w-12 items-center justify-center px-4 py-2 text-sm font-semibold tabular-nums text-gray-200 ring-1 ring-inset ring-gray-500 focus:z-20 focus:outline-offset-0",
              currentPage === number ? "bg-gray-600 text-blue-400" : "hover:bg-gray-700 hover:text-white"
            )}
          >
            {number}
          </Link>
        ))}
        <Link
          prefetch={false}
          aria-disabled={!hasMorePages}
          href={getPaginatedHref(currentPage + 1)}
          className={cn(
            "relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-200 ring-1 ring-inset ring-gray-500 hover:bg-gray-700 hover:text-white focus:z-20 focus:outline-offset-0",
            "aria-disabled:pointer-events-none aria-disabled:opacity-30"
          )}
        >
          <span className="sr-only">Next</span>
          <ChevronIcon className="h-5 w-5 -rotate-90 text-white" aria-hidden="true" />
        </Link>
      </nav>
    </div>
  );
}

function getPageNumbers(currentPage: number, hasMorePages: boolean) {
  const pageNumbers = [currentPage];

  const buffer = (PAGES_COUNT - 1) / 2;

  for (let i = 1; i <= buffer && currentPage - i > 0; i++) {
    pageNumbers.push(currentPage - i);
  }

  if (hasMorePages) {
    const leftover = PAGES_COUNT - pageNumbers.length;

    for (let i = 1; i <= leftover; i++) {
      pageNumbers.push(currentPage + i);
    }
  }

  return pageNumbers.sort((a, b) => a - b);
}
