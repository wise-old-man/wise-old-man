"use client";

import React, { useState } from "react";
import { formatNumber } from "@wise-old-man/utils";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceArea,
} from "recharts";

const DEFAULT_BAR_COLOR = "#3b82f6";
const NEGATIVE_BAR_COLOR = "#dc2626";
const GRID_STYLE = { stroke: "#1f2937" };
const AXIS_TICK_STYLE = { fill: "#6b7280", fontSize: "0.75rem" };
const X_AXIS_TICK_LINE = { stroke: "#6b7280" };
const TOOLTIP_CURSOR_STYLE = { fill: "rgba(255,255,255, 0.05)" };
const TOOLTIP_WRAPPER_STYLE = { outline: "none" };

interface BarChartProps {
  data: Array<{ date: Date; value: number }>;
  name?: string;
  color?: string;
  onRangeSelected?: (range: [Date, Date]) => void;
  yAxisValueFormatter?: (value: number) => string;
  xAxisLabelFormatter?: (label: string) => string;
  tooltipLabelFormatter?: (label: string) => string;
  tooltipValueFormatter?: (value: number) => string;
}

export default function BarChart(props: BarChartProps) {
  const {
    data,
    name,
    color,
    onRangeSelected,
    xAxisLabelFormatter,
    yAxisValueFormatter,
    tooltipLabelFormatter,
    tooltipValueFormatter,
  } = props;

  const [selectedRangeStart, setSelectedRangeStart] = useState<Date | undefined>(undefined);
  const [selectedRangeEnd, setSelectedRangeEnd] = useState<Date | undefined>(undefined);

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

  return (
    <div className="aspect-video w-full">
      <ResponsiveContainer width="100%" aspect={16 / 9}>
        <RechartsBarChart
          data={data}
          margin={{ left: -15 }}
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
          className="select-none"
        >
          <CartesianGrid vertical={false} style={GRID_STYLE} />
          <XAxis
            dataKey="date"
            tickLine={false}
            tick={AXIS_TICK_STYLE}
            axisLine={X_AXIS_TICK_LINE}
            tickFormatter={xAxisLabelFormatter || defaultXAxisLabelFormatter}
          />
          <YAxis
            dataKey="value"
            axisLine={false}
            tickLine={false}
            tick={AXIS_TICK_STYLE}
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

              return (
                <ChartTooltip
                  name={name || "Value"}
                  value={valueFormatter(Number(payload[0].value))}
                  label={labelFormatter(label)}
                />
              );
            }}
          />
          <Bar dataKey="value" isAnimationActive={false}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.value < 0 ? NEGATIVE_BAR_COLOR : color || DEFAULT_BAR_COLOR}
              />
            ))}
          </Bar>
          {selectedRangeStart && selectedRangeEnd && (
            <ReferenceArea
              x1={selectedRangeStart.getTime()}
              x2={selectedRangeEnd.getTime()}
              fill={DEFAULT_BAR_COLOR}
              opacity={0.2}
            />
          )}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface ChartTooltipProps {
  name: string;
  label: string;
  value: string;
}

function ChartTooltip(props: ChartTooltipProps) {
  const { label, value, name } = props;

  return (
    <div className="flex flex-col overflow-hidden rounded border border-gray-500 bg-gray-700 shadow-lg outline-none">
      <div className="border-b border-gray-500 px-3 py-2 text-sm text-gray-200">{label}</div>
      <div className="flex px-3 py-2 text-sm">
        <span className="mr-2 text-gray-200">{name}:</span>
        <span>{value}</span>
      </div>
    </div>
  );
}

function defaultYAxisValueFormatter(value: number) {
  return String(formatNumber(value, true));
}

function defaultTooltipValueFormatter(value: number) {
  return String(formatNumber(value, false));
}

function defaultXAxisLabelFormatter(label: string) {
  return new Date(label).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function defaultTooltipLabelFormatter(label: string) {
  return new Date(label).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
