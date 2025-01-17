import { Metric } from "@wise-old-man/utils";
import { Pagination } from "~/components/Pagination";
import { GroupHiscoresTable } from "~/components/groups/GroupHiscoresTable";
import { GroupLeaderboardsNavigation } from "~/components/groups/GroupLeaderboardsNavigation";
import { getGroupDetails, getGroupHiscores } from "~/services/wiseoldman";
import { getMetricParam, getPageParam } from "~/utils/params";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{
    id: number;
  }>;
  searchParams: Promise<{
    page?: string;
    metric?: string;
  }>;
}

export async function generateMetadata(props: PageProps) {
  const { id } = await props.params;

  const group = await getGroupDetails(id);

  return {
    title: `Hiscores: ${group.name}`,
    description: group.description,
  };
}

export default async function GroupHiscoresPage(props: PageProps) {
  const { id } = await props.params;
  const searchParams = await props.searchParams;

  const page = getPageParam(searchParams.page) || 1;
  const metric = getMetricParam(searchParams.metric) || Metric.OVERALL;

  const RESULTS_PER_PAGE = 20;

  const [group, hiscores] = await Promise.all([
    getGroupDetails(id),
    getGroupHiscores(id, metric, RESULTS_PER_PAGE, (page - 1) * RESULTS_PER_PAGE),
  ]);

  return (
    <>
      <GroupLeaderboardsNavigation />
      <div className="mt-7">
        <GroupHiscoresTable group={group} metric={metric} hiscores={hiscores} />
        <div className="mt-4">
          <Pagination currentPage={page} hasMorePages={hiscores.length >= RESULTS_PER_PAGE} />
        </div>
      </div>
    </>
  );
}
