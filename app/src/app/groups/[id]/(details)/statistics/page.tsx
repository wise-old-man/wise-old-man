import { GroupAverageStatsTable } from "~/components/groups/GroupAverageStatsTable";
import { getGroupDetails, getGroupStatistics } from "~/services/wiseoldman";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{
    id: number;
  }>;
}

export async function generateMetadata(props: PageProps) {
  const { id } = (await props.params);

  const group = await getGroupDetails(id);

  return {
    title: `Statistics: ${group.name}`,
    description: group.description,
  };
}

export default async function GroupStatisticsPage(props: PageProps) {
  const { id } = (await props.params);

  const statistics = await getGroupStatistics(id);

  return <GroupAverageStatsTable statistics={statistics} />;
}
