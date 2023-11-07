"use client";

import dynamicImport from "next/dynamic";
import { Metric, MetricProps } from "@wise-old-man/utils";

const BarChartSSR = dynamicImport(() => import("../BarChart"), {
  ssr: false,
  loading: () => <PlayerGainedBarchartSkeleton />,
});

interface PlayerGainedBarchartProps {
  metric: Metric;
  view: "values" | "ranks";
  data: Array<{ date: Date; value: number }>;
}

export async function PlayerGainedBarchart(props: PlayerGainedBarchartProps) {
  const { data, view, metric } = props;

  const { name, measure } = MetricProps[metric];

  // If has no gains on any of the days of the week
  if (data.every((b) => b.value === 0)) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-md border border-gray-600 text-gray-200">
        No gains
      </div>
    );
  }

  return <BarChartSSR name={`${name} ${view === "ranks" ? "ranks" : measure}`} data={data} />;
}

export function PlayerGainedBarchartSkeleton() {
  return (
    <div className="flex aspect-video w-full items-center justify-center bg-transparent text-gray-200">
      Loading...
    </div>
  );
}
