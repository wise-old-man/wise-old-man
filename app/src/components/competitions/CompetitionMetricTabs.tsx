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
import { useCompetitionPageContext } from "./CompetitionPageContext";
import { Children, cloneElement, forwardRef, useLayoutEffect, useRef, useState } from "react";

import PlusIcon from "~/assets/plus.svg";
import CloseIcon from "~/assets/close.svg";

// Matches the "gap-x-2" between tabs.
const TAB_GAP = 8;

// Only used until the overflow tab has rendered once and can be measured.
const ESTIMATED_OVERFLOW_TAB_WIDTH = 44;

export function CompetitionMetricTabs() {
  const { competition, previewMetric, selectedMetric } = useCompetitionPageContext();

  const metrics = [
    ...competition.metrics.map((m) => m.metric),
    ...(previewMetric ? [previewMetric] : []),
  ];

  const { containerRef, visibleMetrics } = useVisibleMetricTabs(metrics, selectedMetric);

  const overflowMetrics = metrics.filter((m) => !visibleMetrics.includes(m));

  return (
    <div ref={containerRef} className="flex flex-row gap-x-2">
      {competition.metrics.length > 1 && (
        <MetricTab asChild isSelected={selectedMetric === undefined} className="shrink-0">
          <QueryLink query={{ metric: null }}>Total</QueryLink>
        </MetricTab>
      )}
      {visibleMetrics.map((metric) =>
        metric === previewMetric ? (
          <MetricTab
            key={metric}
            data-metric-tab={metric}
            isSelected={selectedMetric === metric}
            className={cn("border-dashed pr-1", selectedMetric === metric && "border-gray-300")}
          >
            <QueryLink query={{ metric }} className="flex min-w-0 items-center gap-x-2">
              <div className="-ml-0.5 shrink-0">
                <MetricIconSmall metric={metric} />
              </div>
              <span data-tab-label className="truncate">
                {MetricProps[metric].name}
              </span>
            </QueryLink>
            <QueryLink
              shallow={false}
              query={{
                preview: null,
                metric: selectedMetric === metric ? null : undefined,
              }}
              aria-label="Stop previewing metric"
            >
              <CloseIcon className="-ml-1 h-5 w-5 rounded p-1 text-gray-200 hover:bg-gray-500" />
            </QueryLink>
          </MetricTab>
        ) : (
          <MetricTab key={metric} asChild isSelected={selectedMetric === metric}>
            <QueryLink query={{ metric }} data-metric-tab={metric}>
              <div className="-ml-0.5 shrink-0">
                <MetricIconSmall metric={metric} />
              </div>
              <span data-tab-label className="truncate">
                {MetricProps[metric].name}
              </span>
            </QueryLink>
          </MetricTab>
        ),
      )}
      {overflowMetrics.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <MetricTab asChild isSelected={false} className="shrink-0">
              <button data-overflow-tab aria-label={`Show ${overflowMetrics.length} more metrics`}>
                +{overflowMetrics.length}
              </button>
            </MetricTab>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {overflowMetrics.map((metric) => (
              <QueryLink key={metric} query={{ metric }}>
                <DropdownMenuItem className="gap-x-2">
                  <MetricIconSmall metric={metric} />
                  {MetricProps[metric].name}
                </DropdownMenuItem>
              </QueryLink>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {!previewMetric && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="Add preview metric"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-dashed border-gray-500 text-gray-200 outline-none hover:border-gray-300 hover:text-gray-100"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <QueryLink
              shallow={false}
              query={{
                preview: Metric.THIEVING,
                metric: Metric.THIEVING,
              }}
            >
              <DropdownMenuItem>Preview metric</DropdownMenuItem>
            </QueryLink>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

function useVisibleMetricTabs(metrics: Array<Metric>, selectedMetric: Metric | undefined) {
  const containerRef = useRef<HTMLDivElement>(null);
  const metricTabWidths = useRef(new Map<string, number>());
  const overflowTabWidth = useRef<number>();

  const [visibleMetrics, setVisibleMetrics] = useState(metrics);

  const propsRef = useRef({ metrics, selectedMetric });
  propsRef.current = { metrics, selectedMetric };

  const metricsKey = metrics.join(",");

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function recalculate() {
      if (!container) return;

      const { metrics, selectedMetric } = propsRef.current;

      let pinnedWidth = 0;

      for (const child of Array.from(container.children) as Array<HTMLElement>) {
        if (child.dataset.metricTab !== undefined) {
          // Tab labels are allowed to truncate, so the width we're after is the one the tab would
          // have had if its label wasn't cut off.
          const label = child.querySelector<HTMLElement>("[data-tab-label]");
          const truncatedBy = label ? label.scrollWidth - label.clientWidth : 0;

          metricTabWidths.current.set(child.dataset.metricTab, child.offsetWidth + truncatedBy);
        } else if (child.dataset.overflowTab !== undefined) {
          overflowTabWidth.current = child.offsetWidth;
        } else {
          pinnedWidth += child.offsetWidth + TAB_GAP;
        }
      }

      const getWidth = (metric: Metric) => (metricTabWidths.current.get(metric) ?? 0) + TAB_GAP;

      const available = container.clientWidth;
      const requiredWidth = metrics.reduce((sum, metric) => sum + getWidth(metric), pinnedWidth);

      let nextVisibleMetrics: Array<Metric>;

      if (requiredWidth <= available) {
        nextVisibleMetrics = metrics;
      } else {
        let usedWidth =
          pinnedWidth + (overflowTabWidth.current ?? ESTIMATED_OVERFLOW_TAB_WIDTH) + TAB_GAP;

        if (selectedMetric) {
          usedWidth += getWidth(selectedMetric);
        }

        nextVisibleMetrics = [];

        for (const metric of metrics) {
          if (metric === selectedMetric) continue;
          if (usedWidth + getWidth(metric) > available) break;

          usedWidth += getWidth(metric);
          nextVisibleMetrics.push(metric);
        }

        if (selectedMetric) {
          nextVisibleMetrics.push(selectedMetric);
          nextVisibleMetrics.sort((a, b) => metrics.indexOf(a) - metrics.indexOf(b));
        }
      }

      setVisibleMetrics((prev) =>
        prev.join(",") === nextVisibleMetrics.join(",") ? prev : nextVisibleMetrics,
      );
    }

    // Fires once on observe, which handles the initial measurement.
    const observer = new ResizeObserver(recalculate);
    observer.observe(container);

    return () => observer.disconnect();
  }, [metricsKey, selectedMetric]);

  return { containerRef, visibleMetrics };
}

interface MetricTabProps extends React.ComponentPropsWithoutRef<"div"> {
  isSelected: boolean;
  asChild?: boolean;
}

const MetricTab = forwardRef<HTMLElement, MetricTabProps>(function MetricTab(
  { isSelected, asChild, className, children, ...props },
  ref,
) {
  const tabClassName = cn(
    "inline-flex h-8 min-w-0 items-center justify-between gap-x-2 whitespace-nowrap rounded-md border border-gray-500 bg-gray-800 px-3 text-sm font-medium transition-colors duration-75",
    isSelected ? "border-gray-400 bg-gray-600 text-white" : "text-gray-100 hover:bg-gray-700",
    className,
  );

  if (asChild) {
    const child = Children.only(children) as React.ReactElement<
      React.HTMLAttributes<HTMLElement> & React.RefAttributes<HTMLElement>
    >;
    return cloneElement(child, { ...props, ref, className: cn(tabClassName, child.props.className) });
  }

  return (
    <div ref={ref as React.Ref<HTMLDivElement>} className={tabClassName} {...props}>
      {children}
    </div>
  );
});
