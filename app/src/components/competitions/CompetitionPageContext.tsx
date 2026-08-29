"use client";

import { createContext, PropsWithChildren, useContext, useMemo } from "react";
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

  const metrics = useMemo(() => {
    const competitionMetrics = competition.metrics.map((m) => m.metric);
    return [...competitionMetrics, ...(previewMetric ? [previewMetric] : [])];
  }, [competition.metrics, previewMetric]);

  const metricParam = getMetricParam(searchParams.get("metric"));

  const selectedMetric =
    metricParam && metrics.includes(metricParam)
      ? metricParam
      : competition.metrics.length > 1
        ? undefined
        : competition.metrics[0].metric;

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
