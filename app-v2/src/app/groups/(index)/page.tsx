import { Suspense } from "react";
import { Pagination } from "~/components/Pagination";
import { GroupCard } from "~/components/groups/GroupCard";
import { fetchGroups } from "~/services/wiseoldman";
import { getPageParam, getSearchParam } from "~/utils/params";

const RESULTS_PER_PAGE = 15;

export const runtime = "edge";
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: {
    page?: string;
    search?: string;
  };
}

export function generateMetadata(props: PageProps) {
  const { searchParams } = props;

  const page = getPageParam(searchParams.page) || 1;
  const search = getSearchParam(searchParams.search);

  if (search && search.length > 0) {
    return { title: `Group search results for "${search}" (Page ${page})` };
  }

  return { title: `Groups (Page ${page})` };
}

export default async function GroupsPageWrapper(props: PageProps) {
  // As of Next.js 13.4.1, modifying searchParams doesn't trigger the page's file-based suspense boundary to re-fallback.
  // So to bypass that until there's a fix, we'll make our manage our own suspense boundary with params as a unique key.
  return (
    <Suspense key={JSON.stringify(props.searchParams)} fallback={<LoadingState />}>
      {/* @ts-expect-error - Server Component  */}
      <GroupsPage {...props} />
    </Suspense>
  );
}

async function GroupsPage(props: PageProps) {
  const { searchParams } = props;

  const page = getPageParam(searchParams.page) || 1;
  const search = getSearchParam(searchParams.search);

  const data = await fetchGroups(search || "", {
    limit: RESULTS_PER_PAGE,
    offset: (page - 1) * RESULTS_PER_PAGE,
  });

  return (
    <>
      {!data || data.length === 0 ? (
        <div className="w-full rounded border border-gray-700 py-10 text-center text-sm text-gray-300">
          No results were found
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((group) => (
            <GroupCard key={group.id} {...group} />
          ))}
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
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(15)].map((_, i) => (
        <div
          key={`group_skeleton_${i}`}
          className="rounded-lg border border-gray-700 bg-gray-800 p-5 shadow-md"
        >
          <div className="h-4 w-40 animate-pulse rounded-lg bg-gray-500" />
          <div className="mt-2.5 h-3 w-24 animate-pulse rounded-lg bg-gray-500" />
          <div className="mt-7 h-3.5 w-full animate-pulse rounded-lg bg-gray-500" />
        </div>
      ))}
    </div>
  );
}
