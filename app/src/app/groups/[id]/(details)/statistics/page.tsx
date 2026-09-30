import type { Metadata } from "next";
import { GroupAverageStatsTable } from "~/components/groups/GroupAverageStatsTable";
import { getGroupDetails, getGroupStatistics } from "~/services/wiseoldman";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: {
    id: number;
  };
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { id } = props.params;

  const group = await getGroupDetails(id);

  return {
    title: `${group.name} Statistics`,
    description: `${group.name}'s average member stats and other statistics`,
    alternates: {
      canonical: `/groups/${id}/statistics`,
    },
  };
}

export default async function GroupStatisticsPage(props: PageProps) {
  const { id } = props.params;

  const statistics = await getGroupStatistics(id);

  return <GroupAverageStatsTable statistics={statistics} />;
}
