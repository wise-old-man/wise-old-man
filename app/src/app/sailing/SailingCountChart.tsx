"use client";
import { formatNumber } from "@wise-old-man/utils";
import dynamic from "next/dynamic";

const LineChartSSR = dynamic(() => import("../../components/LineChart"), {
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

export function SailingCountChart(props: Props) {
  const datasets = [
    {
      name: "Total sailors",
      data: props.timeseries.map((t) => ({
        time: t.date.getTime(),
        value: t.count,
      })),
    },
  ];

  return (
    <div className="flex flex-col gap-y-5 rounded-lg border border-gray-500 px-5 py-4">
      <h4 className="text-h4 font-medium text-white">Total sailors</h4>
      <div className="pl-1">
        <LineChartSSR
          datasets={datasets}
          tooltipValueFormatter={(value) => {
            if (value === 0) return "0";
            return String(formatNumber(value, false));
          }}
          yAxisValueFormatter={(value) => {
            if (value === 0) return "0";
            return String(formatNumber(value, false));
          }}
        />
      </div>
    </div>
  );
}
