import { GroupBestPlayersTable } from "~/components/groups/GroupBestPlayersTable";
import { fetchGroup, fetchGroupStatistics } from "~/services/wiseoldman";

interface PageProps {
  params: {
    id: number;
  };
}

export async function generateMetadata(props: PageProps) {
  const { id } = props.params;

  const group = await fetchGroup(id);

  return {
    title: `Statistics (Best Players): ${group.name}`,
    description: group.description,
  };
}

export default async function GroupStatisticsPage(props: PageProps) {
  const { id } = props.params;

  const statistics = await fetchGroupStatistics(id);

  return <GroupBestPlayersTable statistics={statistics} />;
}
