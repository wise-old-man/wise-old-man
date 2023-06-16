import { getPageParam } from "~/utils/params";
import { Pagination } from "~/components/Pagination";
import { fetchGroup, fetchGroupAchievements } from "~/services/wiseoldman";
import { GroupAchievementsTable } from "~/components/groups/GroupAchievementsTable";

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
    title: `Recent achievements: ${group.name}`,
    description: group.description,
  };
}

export default async function GroupRecordsPage(props: PageProps) {
  const { id } = props.params;
  const { searchParams } = props;

  const page = getPageParam(searchParams.page) || 1;

  const RESULTS_PER_PAGE = 20;

  const achievements = await fetchGroupAchievements(id, {
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
