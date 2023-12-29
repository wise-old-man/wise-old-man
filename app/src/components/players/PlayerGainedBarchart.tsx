"use client";

import dynamicImport from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleTimeRangeSelected(range: [Date, Date]) {
    const [startDate, endDate] = range;

    const nextParams = new URLSearchParams(searchParams);

    // Pad these dates by 1 second in each direction so that the next data set includes them
    nextParams.set("startDate", startDate.toISOString());
    nextParams.set("endDate", endDate.toISOString());
    nextParams.set("period", "custom");

    router.push(`${pathname}?${nextParams.toString()}`, { scroll: false });
  }

  const { name, measure } = MetricProps[metric];

  // If has no gains on any of the days of the week
  if (data.every((b) => b.value === 0)) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-md border border-gray-600 text-gray-200">
        No gains
      </div>
    );
  }

  return (
    <BarChartSSR
      name={`${name} ${view === "ranks" ? "ranks" : measure}`}
      data={data}
      onRangeSelected={handleTimeRangeSelected}
    />
  );
}

export function PlayerGainedBarchartSkeleton() {
  return (
    <div className="flex aspect-video w-full items-center justify-center bg-transparent text-gray-200">
      Loading...
    </div>
  );
}
