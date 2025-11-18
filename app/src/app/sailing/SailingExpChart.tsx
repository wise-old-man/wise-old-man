"use client";
import { formatNumber } from "@wise-old-man/utils";
import dynamic from "next/dynamic";
import { useState } from "react";
import { ToggleTabs, ToggleTabsList, ToggleTabsTrigger } from "~/components/ToggleTabs";

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

export function SailingExpChart(props: Props) {
  const [mode, setMode] = useState<"sum" | "avg">("sum");

  const datasets = [
    {
      name: "Sailing exp",
      data: props.timeseries.map((t) => ({
        time: t.date.getTime(),
        value: t.sum === 0 ? 0 : mode === "sum" ? t.sum : t.sum / t.count,
      })),
    },
  ];

  return (
    <div className="flex flex-col gap-y-5 rounded-lg border border-gray-500 px-5 py-4">
      <div className="flex flex-row justify-between">
        <h4 className="text-h4 font-medium text-white">
          {mode === "sum" ? "Total Sailing Exp." : "Average Sailing Exp."}
        </h4>
        <ToggleTabs value={mode}>
          <ToggleTabsList>
            <ToggleTabsTrigger value="sum" onClick={() => setMode("sum")}>
              Sum
            </ToggleTabsTrigger>
            <ToggleTabsTrigger value="avg" onClick={() => setMode("avg")}>
              Avg
            </ToggleTabsTrigger>
          </ToggleTabsList>
        </ToggleTabs>
      </div>
      <div className="pl-1">
        <LineChartSSR
          datasets={datasets}
          tooltipValueFormatter={(value) => {
            if (value === 0) return "0";
            return `+${formatNumber(value, true)}`;
          }}
          yAxisValueFormatter={(value) => {
            if (value === 0) return "0";
            return `+${formatNumber(value, true)}`;
          }}
        />
      </div>
    </div>
  );
}
