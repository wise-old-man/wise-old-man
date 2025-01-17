import { isMetric } from "@wise-old-man/utils";
import { getCompetitionDetails, getCompetitionTopHistory } from "~/services/wiseoldman";
import { CompetitionTopParticipantsChart } from "~/components/competitions/CompetitionTopParticipantsChart";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{
    id: number;
  }>;
  searchParams: Promise<{
    preview?: string;
  }>;
}

export default async function TopParticipants(props: PageProps) {
  const { id } = (await props.params);
  const { preview } = (await props.searchParams);

  const previewMetric = preview && isMetric(preview) ? preview : undefined;

  const competition = await getCompetitionDetails(id, previewMetric);
  const top5Participants = await getCompetitionTopHistory(id, previewMetric);

  const metric = previewMetric || competition.metric;

  return (
    <div className="rounded-lg border border-gray-500 bg-gray-800 shadow-md">
      <div className="flex w-full items-center justify-between border-b border-gray-600 px-5 py-4">
        <h3 className="text-h3 font-medium">Top 5 participants</h3>
      </div>
      <div className="px-6 py-10">
        <CompetitionTopParticipantsChart metric={metric} data={top5Participants} />
      </div>
    </div>
  );
}
