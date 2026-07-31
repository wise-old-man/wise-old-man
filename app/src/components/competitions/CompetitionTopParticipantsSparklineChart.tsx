"use client";

import { useQueries } from "@tanstack/react-query";
import { isActivity, isBoss, Metric, MetricProps } from "@wise-old-man/utils";
import { PropsWithChildren, useMemo } from "react";
import { useWOMClient } from "~/hooks/useWOMClient";
import SparklineChart from "../SparklineChart";
import { useCompetitionPageContext } from "./CompetitionPageContext";

function Chart({ metric }: { metric: Metric }) {
  const { competition } = useCompetitionPageContext();

  const topParticipantUsernames = competition.participations.slice(0, 3).map((p) => p.player.username);

  const { timelines, isPending, isError } = usePlayerSnapshotTimelines(
    topParticipantUsernames,
    metric,
    competition.startsAt,
    competition.endsAt,
  );

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

  const datasets = timelines.map((t) => ({
    name: t.username,
    data: convertToDiffTimeseries(metric, t.datapoints),
  }));

  if (!datasets.some((d) => d.data.length > 0)) {
    return <Message>No history yet</Message>;
  }

  return (
    <Card>
      <div className="-mt-3 min-h-0 grow">
        <SparklineChart className="h-full" datasets={datasets} />
      </div>
    </Card>
  );
}

function Card(props: PropsWithChildren) {
  return (
    <div className="flex h-20 flex-col gap-y-1 overflow-hidden rounded-lg border border-gray-500 bg-gray-800 px-3 py-2 shadow-md">
      <span className="text-sm font-medium text-white">Top participant history</span>
      {props.children}
    </div>
  );
}

function Message(props: PropsWithChildren) {
  return (
    <div className="flex h-20 items-center justify-center overflow-hidden rounded-lg border border-dashed border-gray-500">
      <span className="px-8 text-center text-sm text-gray-200">{props.children}</span>
    </div>
  );
}

export function CompetitionTopParticipantsSparklineChart() {
  const { competition, selectedMetric } = useCompetitionPageContext();

  if (selectedMetric === undefined) {
    return <Message>&quot;Total&quot; timelines are not available yet (WIP)</Message>;
  }

  if (competition.endsAt.getTime() - competition.startsAt.getTime() > 30 * 24 * 60 * 60 * 1000) {
    return <Message>Not available for competitions longer than a month</Message>;
  }

  return <Chart metric={selectedMetric} />;
}

function usePlayerSnapshotTimelines(
  usernames: string[],
  metric: Metric | undefined,
  startDate: Date,
  endDate: Date,
) {
  const client = useWOMClient();

  const results = useQueries({
    queries: usernames.map((username) => ({
      queryKey: [
        "playerSnapshotTimeline",
        username,
        metric,
        startDate.toISOString(),
        endDate.toISOString(),
      ],
      queryFn: () => {
        if (!metric) return [];
        return client.players.getPlayerSnapshotTimeline(username, metric, {
          startDate,
          endDate,
        });
      },
      enabled: metric !== undefined,
      staleTime: 60_000,
    })),
  });

  return useMemo(() => {
    // Keep one entry per username, in the same order they were requested in,
    // so that each player always maps to the same chart line/color.
    const timelines = usernames.map((username, index) => ({
      username,
      datapoints: results[index]?.data ?? [],
    }));

    return {
      timelines,
      isPending: results.some((r) => r.isPending),
      isError: results.some((r) => r.isError),
    };
  }, [results, usernames]);
}

function convertToDiffTimeseries(
  metric: Metric,
  history: Array<{
    value: number;
    date: Date;
  }>,
) {
  if (history.length === 0) return [];

  const sanitizedPoints = [...history]
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map((p) => {
      const value =
        p.value === -1 && (isBoss(metric) || isActivity(metric))
          ? MetricProps[metric].minimumValue - 1
          : p.value;

      return { time: p.date, value: value };
    });

  const diffPoints = sanitizedPoints.map((p) => ({
    time: p.time.getTime(),
    value: p.value - sanitizedPoints[0].value,
  }));

  return [...dedupeByValue(diffPoints.slice(0, -1)), diffPoints[diffPoints.length - 1]];
}

function dedupeByValue(points: Array<{ value: number; time: number }>) {
  const map = new Map<number, (typeof points)[number]>();

  points.forEach((p) => {
    if (!map.has(p.value)) {
      map.set(p.value, p);
    }
  });

  return Array.from(map.values());
}
