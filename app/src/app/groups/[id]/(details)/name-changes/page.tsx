import { getPageParam } from "~/utils/params";
import { Pagination } from "~/components/Pagination";
import { getGroupDetails, getGroupNameChanges } from "~/services/wiseoldman";
import { GroupNameChangesTable } from "~/components/groups/GroupNameChangesTable";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const RESULTS_PER_PAGE = 20;

interface PageProps {
  params: Promise<{
    id: number;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
}

export async function generateMetadata(props: PageProps) {
  const { id } = await props.params;

  const group = await getGroupDetails(id);

  return {
    title: `Recent name changes: ${group.name}`,
    description: group.description,
  };
}

export default async function GroupNameChangesOage(props: PageProps) {
  const { id } = await props.params;
  const searchParams = await props.searchParams;

  const page = getPageParam(searchParams.page) || 1;

  const nameChanges = await getGroupNameChanges(id, RESULTS_PER_PAGE, (page - 1) * RESULTS_PER_PAGE);

  return (
    <>
      <GroupNameChangesTable nameChanges={nameChanges} />
      <div className="mt-4">
        <Pagination currentPage={page} hasMorePages={nameChanges.length >= RESULTS_PER_PAGE} />
      </div>
    </>
  );
}
