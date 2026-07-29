"use client";

import { createContext, PropsWithChildren, useContext } from "react";
import { useSearchParams } from "next/navigation";
import { CompetitionDetailsResponse, Metric } from "@wise-old-man/utils";
import { getMetricParam } from "~/utils/params";

interface CompetitionPageContextValue {
  competition: CompetitionDetailsResponse;
  previewMetric: Metric | undefined;
  selectedMetric: Metric | undefined;
}

const CompetitionPageContext = createContext<CompetitionPageContextValue | null>(null);

interface CompetitionPageProviderProps extends PropsWithChildren {
  competition: CompetitionDetailsResponse;
  previewMetric?: Metric;
}

export function CompetitionPageProvider(props: CompetitionPageProviderProps) {
  const { competition, previewMetric, children } = props;

  const searchParams = useSearchParams();
  const competitionMetrics = competition.metrics.map((m) => m.metric);

  const metrics = [...competitionMetrics, ...(previewMetric ? [previewMetric] : [])];

  const metricParam = getMetricParam(searchParams.get("metric"));
  const selectedMetric = metricParam && metrics.includes(metricParam) ? metricParam : undefined;

  return (
    <CompetitionPageContext.Provider value={{ competition, previewMetric, selectedMetric }}>
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
