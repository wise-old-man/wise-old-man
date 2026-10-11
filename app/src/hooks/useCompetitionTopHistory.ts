import { useQuery } from "@tanstack/react-query";
import { useCompetitionPageContext } from "~/components/competitions/CompetitionPageContext";
import { convertToDiffTimeseries } from "~/utils/calcs";
import { useWOMClient } from "./useWOMClient";

export function useCompetitionTopHistory(options: { limit: number; enabled?: boolean }) {
  const { competition, selectedMetric, effectiveMetrics } = useCompetitionPageContext();

  const client = useWOMClient();

  const metrics = selectedMetric === "total" ? effectiveMetrics : [selectedMetric];

  return useQuery({
    queryKey: ["competition-top-history", competition.id, metrics, options.limit],
    queryFn: () => client.competitions.getCompetitionTopHistory(competition.id, metrics, options.limit),
    select: (topHistory) =>
      topHistory.map((p) => ({
        name: p.player.displayName,
        data: convertToDiffTimeseries(
          selectedMetric === "total" ? undefined : selectedMetric,
          p.history,
        ),
      })),
    enabled: options.enabled === undefined || options.enabled,
    staleTime: 60_000,
  });
}
