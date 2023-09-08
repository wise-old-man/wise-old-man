import { GroupBestPlayersTable } from "~/components/groups/GroupBestPlayersTable";
import { getGroupDetails, getGroupStatistics } from "~/services/wiseoldman";

export const dynamic = "force-dynamic";

interface PageProps {
  params: {
    id: number;
  };
}

export async function generateMetadata(props: PageProps) {
  const { id } = props.params;

  const group = await getGroupDetails(id);

  return {
    title: `Statistics (Best Players): ${group.name}`,
    description: group.description,
  };
}

export default async function GroupStatisticsPage(props: PageProps) {
  const { id } = props.params;

  const statistics = await getGroupStatistics(id);

  return <GroupBestPlayersTable statistics={statistics} />;
}
