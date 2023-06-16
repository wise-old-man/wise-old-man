import { getPageParam } from "~/utils/params";
import { Pagination } from "~/components/Pagination";
import { fetchGroup, fetchGroupNameChanges } from "~/services/wiseoldman";
import { GroupNameChangesTable } from "~/components/groups/GroupNameChangesTable";

interface PageProps {
  params: {
    id: number;
  };
  searchParams: {
    page?: string;
  };
}

export async function generateMetadata(props: PageProps) {
  const { id } = props.params;

  const group = await fetchGroup(id);

  return {
    title: `Recent name changes: ${group.name}`,
    description: group.description,
  };
}

export default async function GroupNameChangesOage(props: PageProps) {
  const { id } = props.params;
  const { searchParams } = props;

  const page = getPageParam(searchParams.page) || 1;

  const RESULTS_PER_PAGE = 20;

  const nameChanges = await fetchGroupNameChanges(id, {
    limit: RESULTS_PER_PAGE,
    offset: (page - 1) * RESULTS_PER_PAGE,
  });

  return (
    <>
      <div className="mt-7">
        <GroupNameChangesTable nameChanges={nameChanges} />
        name changes!
        <div className="mt-4">
          <Pagination currentPage={page} hasMorePages={nameChanges.length >= RESULTS_PER_PAGE} />
        </div>
      </div>
    </>
  );
}
