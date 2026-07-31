"use client";

import { useQuery } from "@tanstack/react-query";
import {
  isActivity,
  isBoss,
  Metric,
  MetricProps,
  ParticipantHistoryResponse,
} from "@wise-old-man/utils";
import { PropsWithChildren } from "react";
import { useWOMClient } from "~/hooks/useWOMClient";
import SparklineChart from "../SparklineChart";
import { useCompetitionPageContext } from "./CompetitionPageContext";

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

function convertToDiffTimeseries(
  metric: Metric | undefined,
  history: ParticipantHistoryResponse["history"],
) {
  if (history.length === 0) return [];

  // The API returns -1 when the player was unranked in the metric (or in all of them, for "total").
  // For boss/activity metrics we approximate it as "just below the minimum", everything else uses 0.
  const unrankedValue =
    metric && (isBoss(metric) || isActivity(metric)) ? MetricProps[metric].minimumValue - 1 : 0;

  const sanitizedPoints = [...history]
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map((p) => {
      return { time: p.date, value: p.value === -1 ? unrankedValue : p.value };
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
