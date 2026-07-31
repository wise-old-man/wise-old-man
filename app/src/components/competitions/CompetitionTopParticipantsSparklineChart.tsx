"use client";

import { useQuery } from "@tanstack/react-query";
import { PropsWithChildren } from "react";
import { useWOMClient } from "~/hooks/useWOMClient";
import { convertToDiffTimeseries } from "~/utils/calcs";
import SparklineChart from "../SparklineChart";
import { useCompetitionPageContext } from "./CompetitionPageContext";
import { Button } from "../Button";
import { QueryLink } from "../QueryLink";

import ExpandIcon from "~/assets/expand.svg";

function Chart() {
  const { selectedMetric, competition } = useCompetitionPageContext();

  const client = useWOMClient();

  const {
    data: topHistory,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["competition-top-history", competition.id, selectedMetric ?? "total"],
    queryFn: () => client.competitions.getCompetitionTopHistory(competition.id, selectedMetric),
    staleTime: 60_000,
  });

  if (isPending) {
    return (
      <Card>
        <div className="my-1 min-h-0 grow animate-pulse rounded-md bg-gray-700" />
      </Card>
    );
  }

  if (isError) {
    return <Message>Failed to load history</Message>;
  }

  const datasets = topHistory.slice(0, 3).map((p) => ({
    name: p.player.displayName,
    data: convertToDiffTimeseries(selectedMetric, p.history),
  }));

  if (!datasets.some((d) => d.data.length > 0)) {
    return <Message>No history yet</Message>;
  }

  return (
    <Card>
      <div className="-mt-1 min-h-0 grow">
        <SparklineChart className="h-full" datasets={datasets} />
      </div>
    </Card>
  );
}

function Card(props: PropsWithChildren<{ expandable?: boolean }>) {
  return (
    <div className="relative flex h-20 flex-col gap-y-1 overflow-hidden rounded-lg border border-gray-500 bg-gray-800 px-3 py-2 shadow-md">
      <span className="line-clamp-2 pr-4 text-sm font-medium text-white">Top participant history</span>
      {props.children}

      <div className="absolute right-2 top-2">
        <QueryLink query={{ dialog: "history" }}>
          <Button iconButton className="flex h-5 w-5 items-center justify-center p-0">
            <ExpandIcon className="h-3 w-3 text-gray-200" />
          </Button>
        </QueryLink>
      </div>
    </div>
  );
}

function Message(props: PropsWithChildren) {
  return (
    <div className="flex h-20 items-center justify-center overflow-hidden rounded-lg border border-dashed border-gray-500 px-8">
      <span className="line-clamp-3 text-center text-sm text-gray-200">{props.children}</span>
    </div>
  );
}

export function CompetitionTopParticipantsSparklineChart() {
  const { competition } = useCompetitionPageContext();

  if (competition.endsAt.getTime() - competition.startsAt.getTime() > 30 * 24 * 60 * 60 * 1000) {
    return <Message>Not available for competitions longer than a month</Message>;
  }

  return <Chart />;
}
