"use client";

import { LineChart as LineChartPrimitive, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { cn } from "~/utils/styling";
import { COLORS, type LineChartDataset } from "./LineChart";

interface SparklineChartProps {
  datasets: Array<LineChartDataset>;
  className?: string;
}

/**
 * A stripped down version of <LineChart/>, with no axis, grid, tooltip, dots or interactions.
 * Meant to be rendered at small sizes, as a preview of the full chart.
 */
export default function SparklineChart(props: SparklineChartProps) {
  const { datasets, className } = props;
  const domain = ["dataMin", "dataMax"];

  return (
    <div className={cn("pointer-events-none h-16 w-full", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChartPrimitive margin={{ top: 3, right: 3, bottom: 3, left: 3 }}>
          <XAxis hide dataKey="time" domain={domain} type="number" allowDuplicatedCategory={false} />
          <YAxis hide dataKey="value" domain={domain} />
          {datasets.map((d, index) => (
            <Line
              key={d.name}
              data={d.data}
              name={d.name}
              type="linear"
              dataKey="value"
              stroke={COLORS[index % COLORS.length]}
              strokeWidth="1.5"
              dot={false}
              activeDot={false}
              isAnimationActive={false}
            />
          ))}
        </LineChartPrimitive>
      </ResponsiveContainer>
    </div>
  );
}
