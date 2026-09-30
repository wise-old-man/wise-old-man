"use client";

import { createContext, PropsWithChildren, useContext, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { CompetitionDetailsResponse, Metric } from "@wise-old-man/utils";
import { getMetricParam } from "~/utils/params";

interface CompetitionPageContextValue {
  competition: CompetitionDetailsResponse;
  previewMetrics?: Array<Metric>;
  effectiveMetrics: Array<Metric>;
  selectedMetric: Metric | "total";
}

const CompetitionPageContext = createContext<CompetitionPageContextValue | null>(null);

interface CompetitionPageProviderProps extends PropsWithChildren {
  competition: CompetitionDetailsResponse;
  previewMetrics?: Array<Metric>;
}

export function CompetitionPageProvider(props: CompetitionPageProviderProps) {
  const { competition, previewMetrics, children } = props;

  const searchParams = useSearchParams();

  const metricParam = getMetricParam(searchParams.get("metric"));

  const effectiveMetrics = useMemo(
    () => Array.from(new Set(previewMetrics ?? competition.metrics.map((m) => m.metric))),
    [competition.metrics, previewMetrics],
  );

  // With a single metric there's no "Total" tab to fall back to, so that metric is always selected.
  const selectedMetric =
    metricParam && effectiveMetrics.includes(metricParam)
      ? metricParam
      : effectiveMetrics.length > 1
        ? "total"
        : effectiveMetrics[0];

  return (
    <CompetitionPageContext.Provider
      value={{
        competition,
        previewMetrics,
        effectiveMetrics,
        selectedMetric,
      }}
    >
      {children}
    </CompetitionPageContext.Provider>
  );
}

export function useCompetitionPageContext() {
  const context = useContext(CompetitionPageContext);

  if (context === null) {
    throw new Error("useCompetitionPageContext must be used within a CompetitionPageProvider.");
  }

  return context;
}
