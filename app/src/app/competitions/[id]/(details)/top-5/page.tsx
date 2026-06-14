import { isMetric } from "@wise-old-man/utils";
import { getCompetitionDetails, getCompetitionTopHistory } from "~/services/wiseoldman";
import { CompetitionTopParticipantsChart } from "~/components/competitions/CompetitionTopParticipantsChart";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getMetricParam(metricParam: string | undefined) {
  return metricParam && isMetric(metricParam) ? metricParam : undefined;
}

interface PageProps {
  params: {
    id: number;
  };
  searchParams: {
    metric?: string;
  };
}

export default async function TopParticipants(props: PageProps) {
  const { id } = props.params;

  const metricParam = getMetricParam(props.searchParams.metric);

  const competition = await getCompetitionDetails(id, metricParam);
  const top5Participants = await getCompetitionTopHistory(id, metricParam);

  let focusedMetric =
    metricParam ?? (competition.metrics.length > 1 ? ("total" as const) : competition.metrics[0].metric);

  if (focusedMetric === "total") {
    // TODO: top 5 chart doesn't support the "total" aggregation yet
    focusedMetric = competition.metrics[0].metric;
  }

  return (
    <div className="rounded-lg border border-gray-500 bg-gray-800 shadow-md">
      <div className="flex w-full items-center justify-between border-b border-gray-600 px-5 py-4">
        <h3 className="text-h3 font-medium">Top 5 participants</h3>
      </div>
      <div className="px-6 py-10">
        <CompetitionTopParticipantsChart focusedMetric={focusedMetric} data={top5Participants} />
      </div>
    </div>
  );
}
