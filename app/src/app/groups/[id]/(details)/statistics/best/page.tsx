import type { Metadata } from "next";
import { GroupBestPlayersTable } from "~/components/groups/GroupBestPlayersTable";
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
    title: `${group.name} Statistics - Best Players`,
    description: `${group.name}'s top players in every OSRS skill, boss and activity`,
    alternates: {
      canonical: `/groups/${id}/statistics/best`,
    },
  };
}

export default async function GroupStatisticsPage(props: PageProps) {
  const { id } = props.params;

  const statistics = await getGroupStatistics(id);

  return <GroupBestPlayersTable statistics={statistics} />;
}
