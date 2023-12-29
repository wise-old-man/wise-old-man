"use client";

import { formatNumber } from "@wise-old-man/utils";
import React, { useEffect, useState } from "react";
import {
  LineChart as LineChartPrimitive,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea,
} from "recharts";
import { cn } from "~/utils/styling";

const GRID_STYLE = { stroke: "#1f2937" };
const X_AXIS_TICK_LINE = { stroke: "#1f2937" };
const AXIS_TICK_STYLE = { fill: "#6b7280", fontSize: "0.75rem" };
const TOOLTIP_CURSOR_STYLE = { stroke: "#6b7280", strokeDasharray: "4 4" };
const TOOLTIP_WRAPPER_STYLE = { outline: "none" };

interface LineChartDataset {
  name: string;
  data: Array<{
    time: number;
    value: number;
  }>;
}

const COLORS = ["#3b82f6", "#f87171", "#fbbf24", "#a3e635", "#c084fc"];

interface LineChartProps {
  datasets: Array<LineChartDataset>;
  showLegend?: boolean;
  minDate?: Date;
  maxDate?: Date;
  reversed?: boolean;
  onRangeSelected?: (range: [Date, Date]) => void;
  yAxisValueFormatter?: (value: number) => string;
  xAxisLabelFormatter?: (label: string, index: number) => string;
  tooltipLabelFormatter?: (label: string) => string;
  tooltipValueFormatter?: (value: number) => string;
}

export default function LineChart(props: LineChartProps) {
  const {
    datasets,
    showLegend,
    minDate,
    maxDate,
    reversed,
    onRangeSelected,
    xAxisLabelFormatter,
    yAxisValueFormatter,
    tooltipLabelFormatter,
    tooltipValueFormatter,
  } = props;

  const [hasMounted, setHasMounted] = useState(false);

  const [selectedRangeStart, setSelectedRangeStart] = useState<Date | undefined>(undefined);
  const [selectedRangeEnd, setSelectedRangeEnd] = useState<Date | undefined>(undefined);

  const [selectedDataset, setSelectedDataset] = useState<string | undefined>(undefined);

  const domain = minDate && maxDate ? [minDate.getTime(), maxDate.getTime()] : ["dataMin", "dataMax"];

  function toggleSelectedDataset(name: string) {
    if (selectedDataset && selectedDataset === name) {
      setSelectedDataset(undefined);
    } else {
      setSelectedDataset(name);
    }
  }

  function handleRangeSelected() {
    if (!selectedRangeStart || !selectedRangeEnd || !onRangeSelected) return;

    if (selectedRangeStart.getTime() !== selectedRangeEnd.getTime()) {
      let range = [selectedRangeStart, selectedRangeEnd];

      if (selectedRangeStart.getTime() > selectedRangeEnd.getTime()) {
        range = [selectedRangeEnd, selectedRangeStart];
      }

      onRangeSelected(range as [Date, Date]);
    }

    setSelectedRangeStart(undefined);
    setSelectedRangeEnd(undefined);
  }

  useEffect(() => {
    // I want the line to animate whenever the data changes, but I don't want it to animate
    // on the first render, so I need to track when it becomes mounted. So it becomes "mounted"
    // 500ms after the first render is done.

    const timeout = setTimeout(() => {
      setHasMounted(true);
    }, 500);

    return () => {
      clearTimeout(timeout);
    };
  }, [setHasMounted]);

  return (
    <div className="aspect-video w-full">
      <ResponsiveContainer width="100%" aspect={16 / 9}>
        <LineChartPrimitive
          className="select-none"
          margin={{ bottom: 20, left: 5, right: 5, top: 5 }}
          onMouseDown={(e) => {
            if (!e || !e.activeLabel || !onRangeSelected) return;
            setSelectedRangeStart(new Date(e.activeLabel));
          }}
          onMouseMove={(e) => {
            if (!e || !e.activeLabel || !selectedRangeStart || !onRangeSelected) return;
            setSelectedRangeEnd(new Date(e.activeLabel));
          }}
          onMouseUp={() => {
            handleRangeSelected();
          }}
        >
          <CartesianGrid vertical={false} style={GRID_STYLE} />
          <XAxis
            dataKey="time"
            type="number"
            domain={domain}
            tickLine={false}
            tick={AXIS_TICK_STYLE}
            axisLine={X_AXIS_TICK_LINE}
            allowDuplicatedCategory={false}
            tickMargin={10}
            tickFormatter={xAxisLabelFormatter || defaultXAxisLabelFormatter}
          />
          <YAxis
            dataKey="value"
            axisLine={false}
            tickLine={false}
            reversed={reversed}
            tick={<LeftAlignedYTick tickFormatter={yAxisValueFormatter || defaultYAxisValueFormatter} />}
            tickMargin={10}
            domain={["dataMin", "dataMax"]}
            tickFormatter={yAxisValueFormatter || defaultYAxisValueFormatter}
          />
          <Tooltip
            animationDuration={200}
            cursor={TOOLTIP_CURSOR_STYLE}
            wrapperStyle={TOOLTIP_WRAPPER_STYLE}
            content={({ payload, label }) => {
              if (!payload || payload.length === 0) return null;

              const labelFormatter = tooltipLabelFormatter || defaultTooltipLabelFormatter;
              const valueFormatter = tooltipValueFormatter || defaultTooltipValueFormatter;

              const { name, value, stroke } = payload[0];

              return (
                <ChartTooltip
                  stroke={stroke}
                  name={String(name) || "Value"}
                  value={valueFormatter(Number(value))}
                  label={labelFormatter(label)}
                />
              );
            }}
          />
          {showLegend && (
            <Legend
              content={() => {
                if (!datasets || datasets.length === 0) return null;

                const legendItems = datasets.map((d, idx) => ({
                  name: d.name,
                  stroke: COLORS[idx],
                }));

                return (
                  <div className="flex translate-y-5 flex-wrap items-center justify-center gap-x-4">
                    {legendItems.map((a) => (
                      <button
                        key={a.name}
                        className={cn(
                          "flex items-center gap-x-2 rounded px-2 py-1 text-gray-200 hover:bg-gray-700",
                          !!selectedDataset && a.name !== selectedDataset && "opacity-50",
                          !!selectedDataset && a.name === selectedDataset && "bg-gray-800 text-white"
                        )}
                        onClick={() => toggleSelectedDataset(a.name)}
                      >
                        <div className="h-2 w-2 rounded-full" style={{ background: a.stroke }} />
                        <span className="text-sm">{a.name}</span>
                      </button>
                    ))}
                  </div>
                );
              }}
            />
          )}
          {datasets
            .filter((d) => {
              return !selectedDataset || selectedDataset === d.name;
            })
            .map((d) => {
              const index = datasets.findIndex((a) => a.name === d.name);

              return (
                <Line
                  key={d.name}
                  data={d.data}
                  name={d.name}
                  hide={!!selectedDataset && selectedDataset !== d.name}
                  type="linear"
                  dataKey="value"
                  stroke={COLORS[index]}
                  strokeWidth="2"
                  dot={<ChartDot />}
                  activeDot={<ChartDot stroke={COLORS[index]} active />}
                  animationDuration={200}
                  isAnimationActive={hasMounted}
                />
              );
            })}
          {selectedRangeStart && selectedRangeEnd && (
            <ReferenceArea
              x1={selectedRangeStart.getTime()}
              x2={selectedRangeEnd.getTime()}
              fill={COLORS[0]}
              opacity={0.2}
            />
          )}
        </LineChartPrimitive>
      </ResponsiveContainer>
    </div>
  );
}

const LeftAlignedYTick = (props: { tickFormatter: (value: number, index: number) => string }) => {
  const { y, payload, index } = props as any;
  const formattedValue = props.tickFormatter(payload.value, index);

  return (
    <g transform={`translate(${0},${y})`}>
      <text x={0} y={0} textAnchor="start" fontSize="0.75rem" fill="#6b7280">
        {formattedValue}
      </text>
    </g>
  );
};

interface ChartDotProps extends React.SVGProps<SVGCircleElement> {
  active?: boolean;
}

function ChartDot(props: ChartDotProps) {
  const { active, cx, cy, stroke } = props;

  if (active) {
    return (
      <g>
        <circle cx={cx} cy={cy} fill={stroke} stroke={stroke} r={4} strokeWidth={1} />
        <circle cx={cx} cy={cy} fill="transparent" stroke={stroke} r={7} />
      </g>
    );
  }

  return <circle cx={cx} cy={cy} r={3} fill={active ? "red" : stroke} />;
}

interface ChartTooltipProps {
  name: string;
  label: string;
  value: string;
  stroke?: string;
}

function ChartTooltip(props: ChartTooltipProps) {
  const { label, value, name, stroke } = props;

  return (
    <div className="flex flex-col overflow-hidden rounded border border-gray-500 bg-gray-700 shadow-lg outline-none">
      <div className="border-b border-gray-500 px-3 py-2 text-sm text-gray-200">{label}</div>
      <div className="flex px-3 py-2 text-sm">
        <div className="flex items-center gap-x-2">
          <div className="h-2 w-2 rounded-full" style={{ background: stroke }} />
          <span className="mr-2 text-gray-200">{name}:</span>
        </div>
        <span>{value}</span>
      </div>
    </div>
  );
}

function defaultYAxisValueFormatter(value: number) {
  return String(formatNumber(value, true));
}

function defaultXAxisLabelFormatter(label: string) {
  return new Date(label).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function defaultTooltipValueFormatter(value: number) {
  return String(formatNumber(value, false));
}

function defaultTooltipLabelFormatter(label: string) {
  return new Date(label).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
}
