import { Metric, Period } from "@wise-old-man/utils";
import Link from "next/link";
import { Pagination } from "~/components/Pagination";
import { ToggleTabs, ToggleTabsList, ToggleTabsTrigger } from "~/components/ToggleTabs";
import { GroupGainedTable } from "~/components/groups/GroupGainedTable";
import { apiClient } from "~/services/wiseoldman";
import { getMetricParam, getPageParam, getPeriodParam } from "~/utils/params";

export const runtime = "edge";
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

  const group = await apiClient.groups.getGroupDetails(id);

  return {
    title: `Gained Leaderboards: ${group.name}`,
    description: group.description,
  };
}

export default async function GroupGainedPage(props: PageProps) {
  const { id } = props.params;
  const { searchParams } = props;

  const page = getPageParam(searchParams.page) || 1;
  const metric = getMetricParam(searchParams.metric) || Metric.OVERALL;
  const period = getPeriodParam(searchParams.period) || Period.WEEK;

  const RESULTS_PER_PAGE = 20;

  const [group, gains] = await Promise.all([
    apiClient.groups.getGroupDetails(id),
    apiClient.groups.getGroupGains(
      id,
      { metric, period },
      { limit: RESULTS_PER_PAGE, offset: (page - 1) * RESULTS_PER_PAGE }
    ),
  ]);

  return (
    <>
      <ToggleTabs value="gained">
        <ToggleTabsList>
          <Link href={`/groups/${id}/hiscores`} className="border-r border-gray-400">
            <ToggleTabsTrigger value="hiscores">Hiscores</ToggleTabsTrigger>
          </Link>
          <ToggleTabsTrigger value="gained">Gained</ToggleTabsTrigger>
          <Link href={`/groups/${id}/records`}>
            <ToggleTabsTrigger value="records">Records</ToggleTabsTrigger>
          </Link>
        </ToggleTabsList>
      </ToggleTabs>
      <div className="mt-10">
        <GroupGainedTable group={group} metric={metric} period={period} gains={gains} />
        <div className="mt-4">
          <Pagination currentPage={page} hasMorePages={gains.length >= RESULTS_PER_PAGE} />
        </div>
      </div>
    </>
  );
}
