import { Suspense } from "react";
import { fetchCompetitions } from "~/services/wiseoldman";
import { ListTable, ListTableCell, ListTableRow } from "~/components/ListTable";
import { Pagination } from "~/components/Pagination";
import { CompetitionsList } from "~/components/competitions/CompetitionsList";
import {
  getCompetitionStatusParam,
  getCompetitionTypeParam,
  getMetricParam,
  getPageParam,
  getSearchParam,
} from "~/utils/params";

export const runtime = "edge";
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: {
    page?: string;
    search?: string;
    type?: string;
    status?: string;
    metric?: string;
  };
}

export function generateMetadata(props: PageProps) {
  const { searchParams } = props;

  const page = getPageParam(searchParams.page) || 1;
  const search = getSearchParam(searchParams.search);

  if (search && search.length > 0) {
    return { title: `Competition search results for "${search}" (Page ${page})` };
  }

  return { title: `Competitions (Page ${page})` };
}

export default async function CompetitionsPageWrapper(props: PageProps) {
  // As of Next.js 13.4.1, modifying searchParams doesn't trigger the page's file-based suspense boundary to re-fallback.
  // So to bypass that until there's a fix, we'll make our manage our own suspense boundary with params as a unique key.
  return (
    <Suspense key={JSON.stringify(props.searchParams)} fallback={<LoadingState />}>
      {/* @ts-expect-error - Server Component  */}
      <CompetitionsPage {...props} />
    </Suspense>
  );
}

async function CompetitionsPage(props: PageProps) {
  const { searchParams } = props;

  const page = getPageParam(searchParams.page) || 1;
  const search = getSearchParam(searchParams.search);
  const metric = getMetricParam(searchParams.metric);
  const type = getCompetitionTypeParam(searchParams.type);
  const status = getCompetitionStatusParam(searchParams.status);

  const RESULTS_PER_PAGE = 20;

  const data = await fetchCompetitions(
    { title: search, type, status, metric },
    { limit: RESULTS_PER_PAGE, offset: (page - 1) * RESULTS_PER_PAGE }
  );

  return (
    <>
      {!data || data.length === 0 ? (
        <div className="w-full rounded border border-gray-700 py-10 text-center text-sm text-gray-300">
          No results were found
        </div>
      ) : (
        <div className="custom-scroll overflow-x-auto">
          <CompetitionsList data={data} showHost />
        </div>
      )}
      <div className="mt-4">
        <Pagination currentPage={page} hasMorePages={data.length >= RESULTS_PER_PAGE} />
      </div>
    </>
  );
}

function LoadingState() {
  return (
    <div className="custom-scroll overflow-x-auto">
      <ListTable className="border-spacing-y-3">
        {[...Array(20)].map((_, i) => (
          <ListTableRow key={`competition_skeleton_${i}`}>
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
  );
}
