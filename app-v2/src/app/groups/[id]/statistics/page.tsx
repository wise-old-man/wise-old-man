import { GroupAverageStatsTable } from "~/components/groups/GroupAverageStatsTable";
import { apiClient } from "~/services/wiseoldman";

export const dynamic = "force-dynamic";

interface PageProps {
  params: {
    id: number;
  };
}

export async function generateMetadata(props: PageProps) {
  const { id } = props.params;

  const group = await apiClient.groups.getGroupDetails(id);

  return {
    title: `Statistics: ${group.name}`,
    description: group.description,
  };
}

export default async function GroupStatisticsPage(props: PageProps) {
  const { id } = props.params;

  const statistics = await apiClient.groups.getGroupStatistics(id);

  return <GroupAverageStatsTable statistics={statistics} />;
}
