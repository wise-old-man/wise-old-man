import { getPageParam } from "~/utils/params";
import { Pagination } from "~/components/Pagination";
import { getGroupAchievements, getGroupDetails } from "~/services/wiseoldman";
import { GroupAchievementsTable } from "~/components/groups/GroupAchievementsTable";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

  const group = await getGroupDetails(id);

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

  const achievements = await getGroupAchievements(id, RESULTS_PER_PAGE, (page - 1) * RESULTS_PER_PAGE);

  return (
    <>
      <GroupAchievementsTable achievements={achievements} />
      <div className="mt-4">
        <Pagination currentPage={page} hasMorePages={achievements.length >= RESULTS_PER_PAGE} />
      </div>
    </>
  );
}
