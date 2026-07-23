import type { Metadata } from "next";
import { Metric } from "@wise-old-man/utils";
import { GroupHiscoresTable } from "~/components/groups/GroupHiscoresTable";
import { GroupLeaderboardsNavigation } from "~/components/groups/GroupLeaderboardsNavigation";
import { getGroupDetails, getGroupHiscores } from "~/services/wiseoldman";
import { getMetricParam } from "~/utils/params";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: {
    id: number;
  };
  searchParams: {
    metric?: string;
  };
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { id } = props.params;

  const group = await getGroupDetails(id);

  return {
    title: `${group.name} Hiscores`,
    description: `${group.name}'s hiscores, ranked across every OSRS skill, boss and activity`,
    alternates: {
      canonical: `/groups/${id}/hiscores`,
    },
  };
}

export default async function GroupHiscoresPage(props: PageProps) {
  const { id } = props.params;
  const { searchParams } = props;

  const metric = getMetricParam(searchParams.metric) || Metric.OVERALL;

  const [group, hiscores] = await Promise.all([getGroupDetails(id), getGroupHiscores(id, metric)]);

  return (
    <>
      <GroupLeaderboardsNavigation />
      <div className="mt-7">
        <GroupHiscoresTable group={group} metric={metric} hiscores={hiscores} />
      </div>
    </>
  );
}
