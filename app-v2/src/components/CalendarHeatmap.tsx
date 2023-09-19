"use client";

import React from "react";
import SVGTooltip from "@uiw/react-tooltip";
import { cn } from "~/utils/styling";
import { MONTHS, formatDate } from "~/utils/dates";
import { FormattedNumber } from "./FormattedNumber";

const SIZE = 10;
const GAP = 2;

type DataPoint = {
  date: Date;
  value: number;
};

interface CalendarHeatmapProps {
  data: DataPoint[];
}

export function CalendarHeatmap(props: CalendarHeatmapProps) {
  const { data } = props;

  const startDate = getMinDate(data);
  const startingMonth = startDate.getMonth();

  const endDate = new Date(startDate);
  endDate.setFullYear(endDate.getFullYear() + 1);

  const maxValue = getMaxValue(data);

  const dayDiff = (endDate.getTime() - startDate.getTime()) / 1000 / 60 / 60 / 24;

  const map = new Map<number, number>(data.map((d) => [d.date.getTime(), d.value]));

  for (let i = 0; i < dayDiff + 1; i++) {
    const timestamp = startDate.getTime() + 1000 * 60 * 60 * 24 * i;
    if (!map.has(timestamp)) map.set(timestamp, 0);
  }

  const rows: Array<DataPoint>[] = [[], [], [], [], [], [], []];

  for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
    for (let i = 0; i <= dayDiff; i += 7) {
      const timestamp = startDate.getTime() + 1000 * 60 * 60 * 24 * (i + dayIndex);
      const match = map.get(timestamp);

      if (match == null) continue;

      const date = new Date(timestamp);
      rows[dayIndex].push({ date, value: match });
    }
  }

  return (
    <div className="@container">
      <div className="mb-2 flex justify-between">
        {[...Array(13)].map((_, i) => {
          const monthIndex = (i + startingMonth) % 12;

          return (
            <span
              key={i}
              className={cn(
                "text-xs text-gray-200",
                monthIndex % 2 !== startingMonth % 2 && "invisible @lg:visible"
              )}
            >
              {MONTHS[monthIndex].slice(0, 3)}
            </span>
          );
        })}
      </div>
      <svg className="w-full" viewBox={`0 0 ${53 * SIZE + 52 * GAP} ${7 * SIZE + 6 * GAP}`}>
        {rows.map((column, rowIndex) => (
          <React.Fragment key={rowIndex}>
            {column.map((cell, columnIndex) => {
              const x = columnIndex * (SIZE + GAP);
              const y = rowIndex * (SIZE + GAP);

              return (
                <SVGTooltip
                  key={`${rowIndex}-${columnIndex}`}
                  placement="top"
                  visibleArrow={false}
                  content={
                    <div className="flex flex-col p-1">
                      <span className="text-xs text-gray-100">{formatDate(new Date(cell.date))}</span>
                      <span className="text-sm font-medium">
                        <FormattedNumber colored value={cell.value} />
                      </span>
                    </div>
                  }
                >
                  <g>
                    <rect x={x} y={y} width={SIZE} height={SIZE} rx={1} className="fill-gray-700" />
                    <rect
                      x={x}
                      y={y}
                      width={SIZE}
                      height={SIZE}
                      rx={1}
                      className="fill-blue-400"
                      style={{ opacity: cell.value / (maxValue / 3) }}
                    />
                  </g>
                </SVGTooltip>
              );
            })}
          </React.Fragment>
        ))}
      </svg>
    </div>
  );
}

function getMinDate(data: DataPoint[]) {
  let min = data[0].date;

  for (let i = 1; i < data.length; i++) {
    if (data[i].date < min) {
      min = data[i].date;
    }
  }

  return min;
}

function getMaxValue(data: DataPoint[]) {
  let max = data[0].value;

  for (let i = 1; i < data.length; i++) {
    if (data[i].value > max) {
      max = data[i].value;
    }
  }

  return max;
}
