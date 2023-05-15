import Link from "next/link";
import { notFound } from "next/navigation";
import { PropsWithChildren } from "react";
import { CompetitionDetails, MetricProps } from "@wise-old-man/utils";
import { apiClient } from "~/utils/api";
import { Button } from "~/components/Button";
import { MetricIcon } from "~/components/Icon";
import { Container } from "~/components/Container";
import { Tabs, TabsList, TabsTrigger } from "~/components/Tabs";
import { CompetitionWidgets } from "~/components/competitions/CompetitionWidgets";

import OverflowIcon from "~/assets/overflow.svg";

interface PageProps {
  params: {
    id: number;
  };
}

export default async function CompetitionLayout(props: PropsWithChildren<PageProps>) {
  const { children, params } = props;
  const { id } = params;

  // @ts-ignore - There's no decent API from Next.js yet (as of 13.4.0)
  const routeSegment = children.props.childProp.segment;

  const competition = await apiClient.competitions.getCompetitionDetails(id).catch((e) => {
    if (e instanceof Error && "statusCode" in e && e.statusCode === 404) {
      notFound();
    }
    throw e;
  });

  return (
    <Container className="mt-0 pt-0">
      <div className="sticky top-12 z-10 bg-gray-900 pb-5 pt-12">
        <Header {...competition} />
      </div>
      <CompetitionWidgets {...competition} />
      <div className="sticky top-40 z-10 mt-5 pt-3">
        <div className="relative pb-8">
          <div className="bg-gray-900">
            <Tabs defaultValue={routeSegment}>
              <TabsList aria-label="Competition Navigation">
                <Link href={`/competitions/${id}`} aria-label="Navigate to competition's participants">
                  <TabsTrigger value="__PAGE__">Participants</TabsTrigger>
                </Link>
                <Link
                  href={`/competitions/${id}/top-5`}
                  aria-label="Navigate to competition's top 5 participants chart"
                >
                  <TabsTrigger value="top-5">Top 5 chart</TabsTrigger>
                </Link>
              </TabsList>
            </Tabs>
          </div>
          <div className="absolute -bottom-2 left-0 right-0 h-10 bg-gradient-to-b from-gray-900 to-gray-900/0" />
        </div>
      </div>
      <div className="mt-2">{children}</div>
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
