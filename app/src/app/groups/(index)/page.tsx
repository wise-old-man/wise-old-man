import { Pagination } from "~/components/Pagination";
import { GroupCard } from "~/components/groups/GroupCard";
import { searchGroups } from "~/services/wiseoldman";
import { getPageParam, getSearchParam } from "~/utils/params";

const RESULTS_PER_PAGE = 15;

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
  }>;
}

export async function generateMetadata(props: PageProps) {
  const searchParams = await props.searchParams;

  const page = getPageParam(searchParams.page) || 1;
  const search = getSearchParam(searchParams.search);

  if (search && search.length > 0) {
    return { title: `Group search results for "${search}" (Page ${page})` };
  }

  return { title: `Groups (Page ${page})` };
}

export default async function GroupsPage(props: PageProps) {
  const searchParams = await props.searchParams;

  const page = getPageParam(searchParams.page) || 1;
  const search = getSearchParam(searchParams.search);

  const data = await searchGroups(search || "", RESULTS_PER_PAGE, (page - 1) * RESULTS_PER_PAGE);

  return (
    <>
      {!data || data.length === 0 ? (
        <div className="w-full rounded border border-gray-700 py-10 text-center text-sm text-gray-200">
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
