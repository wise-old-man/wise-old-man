"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/Dropdown";
import { Metric, MetricProps } from "@wise-old-man/utils";
import { cn } from "~/utils/styling";
import { MetricIconSmall } from "../Icon";
import { QueryLink } from "../QueryLink";

import PlusIcon from "~/assets/plus.svg";
import { useSearchParams } from "next/navigation";

interface MetricTabsProps {
  metrics: Array<Metric>;
  selectedMetric: Metric | "total";
  onMetricSelected: (metric: Metric | "total") => void;
}

function MetricTabButton({
  isSelected,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { isSelected: boolean }) {
  return (
    <button
      className={cn(
        "inline-flex h-8 items-center justify-between gap-x-1.5 whitespace-nowrap rounded-md border border-gray-500 bg-gray-800 px-3 text-sm font-medium transition-colors duration-75",
        isSelected ? "border-gray-400 bg-gray-600 text-white" : "text-gray-100 hover:bg-gray-700",
      )}
      {...props}
    />
  );
}

export function CompetitionMetricTabs({ metrics, onMetricSelected, selectedMetric }: MetricTabsProps) {
  return (
    <div className="flex flex-row gap-x-2">
      <MetricTabButton isSelected={selectedMetric === "total"} onClick={() => onMetricSelected("total")}>
        Total
      </MetricTabButton>
      {metrics.map((metric) => (
        <MetricTabButton
          key={metric}
          isSelected={selectedMetric === metric}
          onClick={() => onMetricSelected(metric)}
        >
          <div className="-ml-1.5 shrink-0">
            <MetricIconSmall metric={metric} />
          </div>
          {MetricProps[metric].name}
        </MetricTabButton>
      ))}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            aria-label="Add metric"
            className="flex h-7 w-7 items-center justify-center rounded-md border border-dashed border-gray-500 text-gray-200 outline-none hover:border-gray-300 hover:text-gray-100"
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <QueryLink query={{ dialog: "preview-metric" }}>
            <DropdownMenuItem>Preview metric</DropdownMenuItem>
          </QueryLink>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
