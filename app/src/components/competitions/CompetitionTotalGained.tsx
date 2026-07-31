"use client";

import { formatNumber, MetricProps } from "@wise-old-man/utils";
import { MetricIcon } from "../Icon";
import ImageWithFallback from "../ImageWithFallback";
import { useCompetitionPageContext } from "./CompetitionPageContext";
import { cn } from "~/utils/styling";

export function CompetitionTotalGained() {
  const { competition, selectedMetric } = useCompetitionPageContext();

  const sum = competition.participations.reduce(
    (acc, p) =>
      acc + (p.deltas.find((d) => d.metric === (selectedMetric ?? "total"))?.values.gained ?? 0),
    0,
  );

  return (
    <div
      className={cn(
        "relative flex h-20 w-full items-center gap-x-3 overflow-hidden rounded-lg border border-gray-500 px-6 @container",
        selectedMetric === undefined && "bg-gray-800",
      )}
    >
      <ImageWithFallback
        alt={selectedMetric ?? "Total"}
        fill
        className="pointer-events-none z-0 object-cover"
        src={`/img/backgrounds/${selectedMetric ?? "overall"}.png`}
      />
      {selectedMetric !== undefined && (
        <div className="z-1 relative mr-2 hidden shrink-0 scale-125 @[10rem]:block">
          <MetricIcon metric={selectedMetric} />
        </div>
      )}
      <div className="z-1 relative flex flex-col gap-y-0.5">
        <span className="line-clamp-1 text-xs text-gray-100">
          {selectedMetric === undefined ? "Total gained" : MetricProps[selectedMetric].name}
        </span>
        <span className="line-clamp-1 text-xl font-medium">{formatNumber(sum)}</span>
      </div>
    </div>
  );
}
