import { apiClient } from "~/utils/api";
import { Pagination } from "~/components/Pagination";
import { getPageParam, getSearchParam } from "~/utils/params";
import { GroupCard } from "~/components/groups/GroupCard";

const RESULTS_PER_PAGE = 15;

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

export default async function GroupsPage(props: PageProps) {
  const { searchParams } = props;

  const page = getPageParam(searchParams.page) || 1;
  const search = getSearchParam(searchParams.search);

  const data = await apiClient.groups.searchGroups(search || "", {
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
        <div className="grid grid-cols-3 gap-5">
          {data.map((group) => (
            <GroupCard key={group.id} {...group} />
          ))}
        </div>
      )}
      <div className="mt-5">
        <Pagination currentPage={page} hasMorePages={data.length >= RESULTS_PER_PAGE} />
      </div>
    </>
  );
}
