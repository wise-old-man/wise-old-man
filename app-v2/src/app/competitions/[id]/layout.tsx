import Link from "next/link";

import { notFound } from "next/navigation";
import { CompetitionDetails, MetricProps } from "@wise-old-man/utils";
import { apiClient } from "~/utils/api";
import { Button } from "~/components/Button";
import { MetricIcon } from "~/components/Icon";
import { Container } from "~/components/Container";
import { CompetitionWidgets } from "~/components/competitions/CompetitionWidgets";

import OverflowIcon from "~/assets/overflow.svg";

interface PageProps {
  params: {
    id: number;
  };
}

export default async function CompetitionLayout(props: PageProps) {
  const { id } = props.params;

  const competition = await apiClient.competitions.getCompetitionDetails(id).catch((e) => {
    if (e instanceof Error && "statusCode" in e && e.statusCode === 404) {
      notFound();
    }
    throw e;
  });

  return (
    <Container>
      <Header {...competition} />
      <CompetitionWidgets {...competition} />
    </Container>
  );
}

function Header(props: CompetitionDetails) {
  const { metric, title, participantCount, group } = props;

  const partipants = participantCount === 1 ? "1 participant" : `${participantCount} participants`;

  return (
    <div className="flex flex-col-reverse items-start justify-between gap-5 md:flex-row">
      <div className="flex items-center gap-x-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-gray-500 bg-gray-800">
          <MetricIcon metric={metric} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <span className="text-body text-gray-200">
            {MetricProps[metric].name}
            {" · "}
            {partipants}
            {group && (
              <span>
                {` · Hosted by `}
                <Link href={`/groups/${group.id}`} className="font-medium text-blue-400 hover:underline">
                  {group.name}
                </Link>
              </span>
            )}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-x-2">
        <Button variant="blue">Update all</Button>
        <Button iconButton>
          <OverflowIcon className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
