import type { Metadata } from "next";
import { Metric } from "@wise-old-man/utils";
import { GroupGainedCustomPeriodDialog } from "~/components/groups/GroupGainedCustomPeriodDialog";
import { GroupGainedTable } from "~/components/groups/GroupGainedTable";
import { GroupLeaderboardsNavigation } from "~/components/groups/GroupLeaderboardsNavigation";
import { getGroupDetails, getGroupGainsByDates, getGroupGainsByPeriod } from "~/services/wiseoldman";
import { getMetricParam, getTimeRangeFilterParams } from "~/utils/params";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: {
    id: number;
  };
  searchParams: {
    metric?: string;
    period?: string;
  };
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { id } = props.params;

  const group = await getGroupDetails(id);

  return {
    title: `${group.name} Gains Leaderboard`,
    description: `${group.name}'s current gain leaderboards for every skill, boss and activity`,
    alternates: {
      canonical: `/groups/${id}/gained`,
    },
  };
}

export default async function GroupGainedPage(props: PageProps) {
  const { id } = props.params;
  const { searchParams } = props;

  const metric = getMetricParam(searchParams.metric) || Metric.OVERALL;
  const timeRange = getTimeRangeFilterParams(new URLSearchParams(searchParams));

  const [group, gains] = await Promise.all([
    getGroupDetails(id),
    "period" in timeRange
      ? getGroupGainsByPeriod(id, metric, timeRange.period)
      : getGroupGainsByDates(id, metric, timeRange.startDate, timeRange.endDate),
  ]);

  return (
    <>
      <GroupLeaderboardsNavigation />
      <div className="mt-7">
        <GroupGainedTable group={group} metric={metric} timeRange={timeRange} gains={gains} />
      </div>
      <GroupGainedCustomPeriodDialog groupId={id} />
    </>
  );
}
