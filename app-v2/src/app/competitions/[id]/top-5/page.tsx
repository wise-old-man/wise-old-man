import { isMetric } from "@wise-old-man/utils";
import { fetchCompetition, fetchTop5History } from "~/services/wiseoldman";
import { CompetitionTopParticipantsChart } from "~/components/competitions/CompetitionTopParticipantsChart";

export const runtime = "edge";
export const dynamic = "force-dynamic";

interface PageProps {
  params: {
    id: number;
  };
  searchParams: {
    preview?: string;
  };
}

export default async function TopParticipants(props: PageProps) {
  const { id } = props.params;
  const { preview } = props.searchParams;

  const previewMetric = preview && isMetric(preview) ? preview : undefined;

  const competition = await fetchCompetition(id, previewMetric);
  const top5Participants = await fetchTop5History(id, previewMetric);

  const metric = previewMetric || competition.metric;

  return (
    <div className="rounded-xl border border-gray-600">
      <div className="flex w-full items-center justify-between border-b border-gray-600 px-5 py-4">
        <h3 className="text-h3 font-medium">Top 5 participants</h3>
      </div>
      <div className="px-4 py-10">
        <CompetitionTopParticipantsChart metric={metric} data={top5Participants} />
      </div>
    </div>
  );
}
