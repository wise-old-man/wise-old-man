import { GroupBestPlayersTable } from "~/components/groups/GroupBestPlayersTable";
import { apiClient } from "~/services/wiseoldman";

export const runtime = "edge";
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
    title: `Statistics (Best Players): ${group.name}`,
    description: group.description,
  };
}

export default async function GroupStatisticsPage(props: PageProps) {
  const { id } = props.params;

  const statistics = await apiClient.groups.getGroupStatistics(id);

  return <GroupBestPlayersTable statistics={statistics} />;
}
