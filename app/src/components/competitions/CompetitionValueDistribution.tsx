"use client";

import { formatNumber, Metric, MetricProps, MetricType } from "@wise-old-man/utils";
import { MetricIconSmall } from "~/components/Icon";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/Tooltip";
import { useCompetitionPageContext } from "./CompetitionPageContext";

export function CompetitionValueDistribution() {
  const { competition } = useCompetitionPageContext();

  if (competition.metrics.length === 1) {
    return null;
  }

  const metricType = MetricProps[competition.metrics[0].metric].type;

  let total = 0;
  const aggregates = new Map<Metric, number>();

  for (const participant of competition.participations) {
    for (const delta of participant.deltas) {
      const gained = delta.values.gained;

      if (delta.metric === "total") {
        total += gained;
      } else {
        aggregates.set(delta.metric, (aggregates.get(delta.metric) ?? 0) + gained);
      }
    }
  }

  const mappedEntries = Array.from(aggregates.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([metric, value]) => ({
      percent: Math.round((value / total) * 100),
      metric,
      value,
    }));

  const labels = getLabels(metricType);

  return (
    <div className="relative flex w-full flex-col gap-3 rounded-lg border border-gray-500 bg-gray-800 p-3 shadow-md">
      <span className="text-sm font-medium text-white">{labels.title}</span>
      <Tooltip>
        <TooltipTrigger className="-my-1 w-full py-1">
          <div className="flex h-1.5 w-full gap-x-0.5 overflow-hidden rounded bg-gray-500">
            {mappedEntries.map((e) => (
              <div
                key={e.metric}
                style={{
                  background: getMetricPrimaryColor(e.metric),
                  height: `100%`,
                  width: `${e.percent}%`,
                }}
              />
            ))}
          </div>
        </TooltipTrigger>
        <TooltipContent align="start" className="min-w-[15rem] p-0">
          <div className="flex flex-col p-2">
            {mappedEntries.map((e) => (
              <div
                key={e.metric}
                className="flex h-7 flex-row items-center justify-between gap-x-6 rounded px-1.5"
              >
                <div className="flex min-w-0 flex-row items-center gap-x-1.5">
                  <MetricIconSmall metric={e.metric} />
                  <span className="truncate text-xs text-gray-100">{MetricProps[e.metric].name}</span>
                </div>
                <span className="shrink-0 text-xs font-medium tabular-nums text-white">
                  {formatNumber(e.value, true)}
                  <span className="ml-1.5 font-normal text-gray-200">
                    ({((e.value / total) * 100).toFixed(1)}%)
                  </span>
                </span>
              </div>
            ))}
          </div>
          <div className="flex h-9 flex-row items-center justify-between gap-x-6 border-t border-gray-500 px-3.5 text-xs">
            <span className="text-gray-200">Total</span>
            <span className="font-medium tabular-nums text-white">{formatNumber(total, true)}</span>
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

function getLabels(metricType: MetricType) {
  switch (metricType) {
    case MetricType.SKILL:
      return {
        title: "Exp distribution",
        description: "Which skills the gains came from.",
      };
    case MetricType.BOSS:
      return {
        title: "Kills distribution",
        description: "Which bosses the gains came from.",
      };
    case MetricType.ACTIVITY:
      return {
        title: "Score distribution",
        description: "Which activities the gains came from.",
      };
    case MetricType.COMPUTED:
      return {
        title: "Value distribution",
        description: "Which metrics the gains came from.",
      };
  }
}

/**
 * We need to expand this and move it somewhere else?
 */
function getMetricPrimaryColor(metric: Metric) {
  switch (metric) {
    case Metric.HERBLORE:
      return "#00FF00";
    case Metric.WOODCUTTING:
      return "#AAFF00";
    case Metric.AGILITY:
      return "#AA00FF";
    case Metric.MAGIC:
      return "#0000FF";
    case Metric.FIREMAKING:
      return "#FFAA00";
    default:
      return "#FFFFF";
  }
}
