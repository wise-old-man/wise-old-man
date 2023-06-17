import { Metric, Period } from "@wise-old-man/utils";
import Link from "next/link";
import { Pagination } from "~/components/Pagination";
import { ToggleTabs, ToggleTabsList, ToggleTabsTrigger } from "~/components/ToggleTabs";
import { GroupRecordsTable } from "~/components/groups/GroupRecordsTable";
import { fetchGroup, fetchGroupRecords } from "~/services/wiseoldman";
import { getMetricParam, getPageParam, getPeriodParam } from "~/utils/params";

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

  const group = await fetchGroup(id);

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
    fetchGroup(id),
    fetchGroupRecords(id, metric, period, {
      limit: RESULTS_PER_PAGE,
      offset: (page - 1) * RESULTS_PER_PAGE,
    }),
  ]);

  return (
    <>
      <ToggleTabs value="records">
        <ToggleTabsList>
          <Link href={`/groups/${id}/hiscores`} className="border-r border-gray-400">
            <ToggleTabsTrigger value="hiscores">Hiscores</ToggleTabsTrigger>
          </Link>
          <Link href={`/groups/${id}/gained`}>
            <ToggleTabsTrigger value="gained">Gained</ToggleTabsTrigger>
          </Link>
          <ToggleTabsTrigger value="records">Records</ToggleTabsTrigger>
        </ToggleTabsList>
      </ToggleTabs>
      <div className="mt-10">
        <GroupRecordsTable group={group} metric={metric} period={period} records={records} />
        <div className="mt-4">
          <Pagination currentPage={page} hasMorePages={records.length >= RESULTS_PER_PAGE} />
        </div>
      </div>
    </>
  );
}
