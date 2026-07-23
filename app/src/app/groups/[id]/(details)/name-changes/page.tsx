import type { Metadata } from "next";
import { getPageParam } from "~/utils/params";
import { Pagination } from "~/components/Pagination";
import { getGroupDetails, getGroupNameChanges } from "~/services/wiseoldman";
import { GroupNameChangesTable } from "~/components/groups/GroupNameChangesTable";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const RESULTS_PER_PAGE = 20;

interface PageProps {
  params: {
    id: number;
  };
  searchParams: {
    page?: string;
  };
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { id } = props.params;

  const group = await getGroupDetails(id);

  return {
    title: `${group.name} Name Changes`,
    description: `Recent name changes for all ${group.name} members`,
    alternates: {
      canonical: `/groups/${id}/name-changes`,
    },
  };
}

export default async function GroupNameChangesOage(props: PageProps) {
  const { id } = props.params;
  const { searchParams } = props;

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
