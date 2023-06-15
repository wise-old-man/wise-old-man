import { Metric } from "@wise-old-man/utils";
import Link from "next/link";
import { Pagination } from "~/components/Pagination";
import { ToggleTabs, ToggleTabsList, ToggleTabsTrigger } from "~/components/ToggleTabs";
import { GroupHiscoresTable } from "~/components/groups/GroupHiscoresTable";
import { fetchGroup, fetchGroupHiscores } from "~/services/wiseoldman";
import { getMetricParam, getPageParam } from "~/utils/params";

interface PageProps {
  params: {
    id: number;
  };
  searchParams: {
    page?: string;
    metric?: string;
  };
}

export default async function GroupHiscoresPage(props: PageProps) {
  const { id } = props.params;
  const { searchParams } = props;

  const page = getPageParam(searchParams.page) || 1;
  const metric = getMetricParam(searchParams.metric) || Metric.OVERALL;

  const RESULTS_PER_PAGE = 20;

  const [group, hiscores] = await Promise.all([
    fetchGroup(id),
    fetchGroupHiscores(id, metric, { limit: RESULTS_PER_PAGE, offset: (page - 1) * RESULTS_PER_PAGE }),
  ]);

  return (
    <>
      <ToggleTabs value="hiscores">
        <ToggleTabsList>
          <ToggleTabsTrigger value="hiscores">Hiscores</ToggleTabsTrigger>
          <Link href={`/groups/${id}/gained`} className="border-r border-gray-400">
            <ToggleTabsTrigger value="gained">Gained</ToggleTabsTrigger>
          </Link>
          <Link href={`/groups/${id}/records`}>
            <ToggleTabsTrigger value="records">Records</ToggleTabsTrigger>
          </Link>
        </ToggleTabsList>
      </ToggleTabs>
      <div className="mt-10">
        <GroupHiscoresTable group={group} metric={metric} hiscores={hiscores} />
        <div className="mt-4">
          <Pagination currentPage={page} hasMorePages={hiscores.length >= RESULTS_PER_PAGE} />
        </div>
      </div>
    </>
  );
}
