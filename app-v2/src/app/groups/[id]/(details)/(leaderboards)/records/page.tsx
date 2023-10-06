import { Metric, Period } from "@wise-old-man/utils";
import { Pagination } from "~/components/Pagination";
import { GroupLeaderboardsNavigation } from "~/components/groups/GroupLeaderboardsNavigation";
import { GroupRecordsTable } from "~/components/groups/GroupRecordsTable";
import { getGroupDetails, getGroupRecords } from "~/services/wiseoldman";
import { getMetricParam, getPageParam, getPeriodParam } from "~/utils/params";

export const dynamic = "force-dynamic";

interface PageProps {
  params: {
    id: number;
  };
  searchParams: {
    page?: string;
    metric?: string;
    period?: string;
  };
}

export async function generateMetadata(props: PageProps) {
  const { id } = props.params;

  const group = await getGroupDetails(id);

  return {
    title: `Record Leaderboards: ${group.name}`,
    description: group.description,
  };
}

export default async function GroupRecordsPage(props: PageProps) {
  const { id } = props.params;
  const { searchParams } = props;

  const page = getPageParam(searchParams.page) || 1;
  const metric = getMetricParam(searchParams.metric) || Metric.OVERALL;
  const period = getPeriodParam(searchParams.period) || Period.WEEK;

  const RESULTS_PER_PAGE = 20;

  const [group, records] = await Promise.all([
    getGroupDetails(id),
    getGroupRecords(id, metric, period, RESULTS_PER_PAGE, (page - 1) * RESULTS_PER_PAGE),
  ]);

  return (
    <>
      <GroupLeaderboardsNavigation />
      <div className="mt-7">
        <GroupRecordsTable group={group} metric={metric} period={period} records={records} />
        <div className="mt-4">
          <Pagination currentPage={page} hasMorePages={records.length >= RESULTS_PER_PAGE} />
        </div>
      </div>
    </>
  );
}
