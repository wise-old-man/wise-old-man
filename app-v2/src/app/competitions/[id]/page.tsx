import { notFound } from "next/navigation";
import { apiClient } from "~/utils/api";

interface PageProps {
  params: {
    id: number;
  };
}

export default async function CompetitionPage(props: PageProps) {
  const { id } = props.params;

  const competition = await apiClient.competitions.getCompetitionDetails(id).catch((e) => {
    if (e instanceof Error && "statusCode" in e && e.statusCode === 404) {
      notFound();
    }
    throw e;
  });

  return (
    <>
      {id}
      {competition.title}
    </>
  );
}
