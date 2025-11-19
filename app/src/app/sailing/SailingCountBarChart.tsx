"use client";
import { formatNumber } from "@wise-old-man/utils";
import dynamic from "next/dynamic";
import { useState } from "react";
import { ToggleTabs, ToggleTabsList, ToggleTabsTrigger } from "~/components/ToggleTabs";
import { calculateGainBuckets } from "~/utils/calcs";

const BartChartSSR = dynamic(() => import("../../components/BarChart"), {
  ssr: false,
  loading: () => (
    <div className="flex aspect-video w-full items-center justify-center bg-transparent text-gray-200">
      Loading...
    </div>
  ),
});

interface Props {
  timeseries: Array<{
    date: Date;
    sum: number;
    count: number;
    sampleSize: number;
  }>;
}

export function SailingCountBarChart(props: Props) {
  const bucketedData = calculateGainBuckets(
    props.timeseries.map((t) => ({
      date: t.date,
      value: t.count,
    })),
    props.timeseries[0].date,
    props.timeseries[props.timeseries.length - 1].date,
  );

  return (
    <div className="flex flex-col gap-y-5 rounded-lg border border-gray-500 px-5 py-4">
      <h4 className="text-h4 font-medium text-white">Daily Sailors Gain</h4>
      <div className="pl-1">
        <BartChartSSR
          data={bucketedData.map((bucket) => ({
            date: bucket.date,
            value: bucket.gained ?? 0,
          }))}
          tooltipValueFormatter={(value) => {
            if (value === 0) return "0";
            if (value < 0) return String(formatNumber(value, false));
            return `+${formatNumber(value, false)}`;
          }}
        />
      </div>
    </div>
  );
}
