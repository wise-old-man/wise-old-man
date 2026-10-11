"use client";

import { PropsWithChildren } from "react";
import { useCompetitionTopHistory } from "~/hooks/useCompetitionTopHistory";
import SparklineChart from "../SparklineChart";
import { useCompetitionPageContext } from "./CompetitionPageContext";
import { Button } from "../Button";
import { QueryLink } from "../QueryLink";

import ExpandIcon from "~/assets/expand.svg";

function Chart() {
  const { data: datasets, isPending, isError } = useCompetitionTopHistory({ limit: 3 });

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
    <div className="flex h-20 items-center justify-center overflow-hidden rounded-lg border border-dashed border-gray-500 px-4">
      <span className="max-w-[16rem] text-center text-sm text-gray-200 [text-wrap:balance]">
        {props.children}
      </span>
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
