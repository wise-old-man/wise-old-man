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
import { Children, cloneElement, forwardRef, useLayoutEffect, useMemo, useRef, useState } from "react";

import PlusIcon from "~/assets/plus.svg";
import CloseIcon from "~/assets/close.svg";

// Matches the "gap-x-2" between tabs.
const TAB_GAP = 8;

// Only used until the overflow tab has rendered once and can be measured.
const ESTIMATED_OVERFLOW_TAB_WIDTH = 44;

export function CompetitionMetricTabs() {
  const { competition, effectiveMetrics, selectedMetric } = useCompetitionPageContext();

  const ownMetrics = useMemo(
    () => new Set(competition.metrics.map((m) => m.metric)),
    [competition.metrics],
  );

  const { containerRef, visibleMetrics } = useVisibleMetricTabs(
    effectiveMetrics,
    selectedMetric === "total" ? undefined : selectedMetric,
  );

  const overflowMetrics = effectiveMetrics.filter((m) => !visibleMetrics.includes(m));

  // Without a "preview" param the page shows the competition's own metrics, so any list that
  // matches them is the default and doesn't need spelling out in the URL.
  function isDefaultMetricSet(metrics: Array<Metric>) {
    return metrics.length === ownMetrics.size && metrics.every((m) => ownMetrics.has(m));
  }

  // Removing the last tab drops the param, which brings the own metrics back. That's the state
  // already on screen when the default is a single metric, so the button would do nothing.
  const canRemoveMetrics = effectiveMetrics.length > 1 || !isDefaultMetricSet(effectiveMetrics);

  // The "preview" param spells out the full metric list, so removing one tab means rewriting it -
  // unless what's left is the default, or nothing at all, in which case the param can just go.
  function getPreviewQueryWithout(removedMetric: Metric) {
    const nextMetrics = effectiveMetrics.filter((m) => m !== removedMetric);

    return nextMetrics.length === 0 || isDefaultMetricSet(nextMetrics) ? null : nextMetrics;
  }

  return (
    <div ref={containerRef} className="flex flex-row gap-x-2">
      {effectiveMetrics.length > 1 && (
        <MetricTab asChild isSelected={selectedMetric === "total"} className="shrink-0">
          <QueryLink query={{ metric: null }}>Total</QueryLink>
        </MetricTab>
      )}
      {visibleMetrics.map((metric) => (
        <MetricTab
          key={metric}
          data-metric-tab={metric}
          isSelected={selectedMetric === metric}
          className={cn(
            "gap-x-0 px-0",
            canRemoveMetrics && "pr-1",
            !ownMetrics.has(metric) && "border-dashed border-gray-300",
          )}
        >
          <QueryLink
            query={{ metric }}
            className={cn(
              "flex h-full min-w-0 items-center gap-x-2 pl-3.5",
              canRemoveMetrics ? "pr-2" : "pr-3.5",
            )}
          >
            <div className="-ml-0.5 shrink-0">
              <MetricIconSmall metric={metric} />
            </div>
            <span className="truncate">{MetricProps[metric].name}</span>
          </QueryLink>
          {canRemoveMetrics && (
            <QueryLink
              shallow={false}
              query={{
                preview: getPreviewQueryWithout(metric),
                metric: selectedMetric === metric ? null : undefined,
              }}
              aria-label={`Stop showing ${MetricProps[metric].name}`}
            >
              <CloseIcon className="-ml-1 h-5 w-5 rounded p-1 text-gray-200 hover:bg-gray-500" />
            </QueryLink>
          )}
        </MetricTab>
      ))}
      {overflowMetrics.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <MetricTab asChild isSelected={false} className="shrink-0">
              <button data-overflow-tab aria-label={`Show ${overflowMetrics.length} more metrics`}>
                +{overflowMetrics.length}
              </button>
            </MetricTab>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[16rem]">
            {overflowMetrics.map((metric) => (
              <QueryLink key={metric} query={{ metric }}>
                <DropdownMenuItem className="justify-between gap-x-4">
                  <div className="flex min-w-0 items-center gap-x-2">
                    <MetricIconSmall metric={metric} />
                    <span className="truncate">{MetricProps[metric].name}</span>
                  </div>
                  {!ownMetrics.has(metric) && (
                    <span className="shrink-0 rounded border border-dashed border-gray-400 px-1 py-px text-xs text-gray-200">
                      Preview
                    </span>
                  )}
                </DropdownMenuItem>
              </QueryLink>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            aria-label="Add preview metric"
            className="mb-px flex h-[37px] w-[37px] shrink-0 items-center justify-center rounded-md border border-dashed border-gray-500 text-gray-200 outline-none hover:border-gray-300 hover:text-gray-100"
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <QueryLink shallow={false} query={{ dialog: "preview" }}>
            <DropdownMenuItem>Preview metric</DropdownMenuItem>
          </QueryLink>
        </DropdownMenuContent>
      </DropdownMenu>
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

  // Previewing a metric changes this list without remounting the component, so the visible set
  // would stay stale. A tab that isn't rendered can't be measured, and an unmeasured tab counts
  // as zero wide - which is how a new tab ends up shown in a row that has no space for it.
  // Showing them all again lets the next pass size every tab before it decides what to hide.
  const [measuredKey, setMeasuredKey] = useState(metricsKey);

  if (measuredKey !== metricsKey) {
    setMeasuredKey(metricsKey);
    setVisibleMetrics(metrics);
  }

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function recalculate() {
      if (!container) return;

      const { metrics, selectedMetric } = propsRef.current;

      const available = container.clientWidth;

      // Tabs shrink and truncate their labels to fit the row, so their rendered widths are smaller
      // than the widths they actually need. Laying the row out unconstrained first gives every tab
      // its natural width. Nothing paints between the two writes, so this stays invisible.
      container.style.width = "max-content";

      let pinnedWidth = 0;

      for (const child of Array.from(container.children) as Array<HTMLElement>) {
        if (child.dataset.metricTab !== undefined) {
          metricTabWidths.current.set(child.dataset.metricTab, child.offsetWidth);
        } else if (child.dataset.overflowTab !== undefined) {
          overflowTabWidth.current = child.offsetWidth;
        } else {
          pinnedWidth += child.offsetWidth + TAB_GAP;
        }
      }

      container.style.width = "";

      const getWidth = (metric: Metric) => (metricTabWidths.current.get(metric) ?? 0) + TAB_GAP;
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

    // Tab widths are measured from rendered text, so they're wrong until the webfont has swapped
    // in. That swap doesn't resize the container, so the observer never hears about it.
    let cancelled = false;

    document.fonts.ready.then(() => {
      if (!cancelled) recalculate();
    });

    return () => {
      cancelled = true;
      observer.disconnect();
    };
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
    "inline-flex h-[37px] mb-px min-w-0 items-center justify-between gap-x-2 whitespace-nowrap rounded-md border border-gray-500 bg-gray-800 px-3.5 text-sm font-medium transition-colors duration-75",
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
