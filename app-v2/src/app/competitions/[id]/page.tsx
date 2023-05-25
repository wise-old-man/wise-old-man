import { isMetric } from "@wise-old-man/utils";
import { notFound } from "next/navigation";
import { apiClient } from "~/utils/api";
import { CompetitionWidgets } from "~/components/competitions/CompetitionWidgets";
import { ParticipantsTable } from "~/components/competitions/ParticipantsTable";

interface PageProps {
  params: {
    id: number;
  };
  searchParams: {
    preview?: string;
  };
}

export default async function CompetitionPage(props: PageProps) {
  const { id } = props.params;
  const { preview } = props.searchParams;

  const isValidMetric = preview && isMetric(preview);

  const competition = await apiClient.competitions
    .getCompetitionDetails(id, isValidMetric ? preview : undefined)
    .catch((e) => {
      if (e instanceof Error && "statusCode" in e && e.statusCode === 404) {
        notFound();
      }
      throw e;
    });

  const metric = isValidMetric ? preview : competition.metric;

  return (
    <>
      <CompetitionWidgets metric={metric} competition={competition} />
      <div className="mt-7">
        <ParticipantsTable metric={metric} competition={competition} />
      </div>
    </>
  );
}
