import { getPageParam } from "~/utils/params";
import { Pagination } from "~/components/Pagination";
import { apiClient } from "~/services/wiseoldman";
import { GroupAchievementsTable } from "~/components/groups/GroupAchievementsTable";

export const runtime = "edge";
export const dynamic = "force-dynamic";

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

  const group = await apiClient.groups.getGroupDetails(id);

  return {
    title: `Recent achievements: ${group.name}`,
    description: group.description,
  };
}

export default async function GroupAchievementsPage(props: PageProps) {
  const { id } = props.params;
  const { searchParams } = props;

  const page = getPageParam(searchParams.page) || 1;

  const RESULTS_PER_PAGE = 20;

  const achievements = await apiClient.groups.getGroupAchievements(id, {
    limit: RESULTS_PER_PAGE,
    offset: (page - 1) * RESULTS_PER_PAGE,
  });

  return (
    <>
      <div className="mt-7">
        <GroupAchievementsTable achievements={achievements} />
        <div className="mt-4">
          <Pagination currentPage={page} hasMorePages={achievements.length >= RESULTS_PER_PAGE} />
        </div>
      </div>
    </>
  );
}
