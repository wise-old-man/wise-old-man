"use client";

import uniqBy from "lodash/uniqBy";
import {
  Metric,
  MetricProps,
  Top5ProgressResult,
  formatNumber,
  isActivity,
  isBoss,
} from "@wise-old-man/utils";
import dynamic from "next/dynamic";

const LineChartSSR = dynamic(() => import("../LineChart"), {
  ssr: false,
  loading: () => <div className="aspect-video w-full bg-transparent" />,
});

interface CompetitionTopParticipantsChartProps {
  metric: Metric;
  data: Top5ProgressResult;
}

export function CompetitionTopParticipantsChart(props: CompetitionTopParticipantsChartProps) {
  const { metric, data } = props;

  const datasets = data.map((t) => {
    return {
      name: t.player.displayName,
      data: convertToDiffTimeseries(metric, t.history),
    };
  });

  return (
    <LineChartSSR
      datasets={datasets}
      showLegend
      tooltipValueFormatter={(value) => {
        if (value === 0) return "0";
        return `+${formatNumber(value, false)}`;
      }}
    />
  );
}

function convertToDiffTimeseries(metric: Metric, history: Top5ProgressResult[number]["history"]) {
  if (history.length === 0) return [];

  const sanitizedPoints = [...history]
    .reverse()
    .sort()
    .map((p) => {
      const value =
        isBoss(metric) || isActivity(metric)
          ? Math.max(p.value, MetricProps[metric].minimumValue - 1)
          : p.value;

      return { time: p.date, value: value };
    });

  const diffPoints = sanitizedPoints.map((p) => ({
    time: p.time.getTime(),
    value: p.value - sanitizedPoints[0].value,
  }));

  return [...uniqBy(diffPoints.slice(0, -1), "value"), diffPoints[diffPoints.length - 1]];
}
