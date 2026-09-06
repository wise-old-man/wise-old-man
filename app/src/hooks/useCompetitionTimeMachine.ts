import { useQuery } from "@tanstack/react-query";
import { CompetitionDetailsResponse, Metric } from "@wise-old-man/utils";
import { useCallback, useMemo } from "react";
import { useCompetitionPageContext } from "~/components/competitions/CompetitionPageContext";
import { useWOMClient } from "./useWOMClient";

interface PlayerStanding {
  rank: number;
  delta: CompetitionDetailsResponse["participations"][number]["deltas"][number];
}

export function useCompetitionTimeMachine() {
  const { competition, previewMetric } = useCompetitionPageContext();
  const competitionDetails24hAgo = useCompetitionDetails24hAgo(competition, previewMetric);

  const metrics = useMemo(() => {
    const competitionMetrics = competition.metrics.map((m) => m.metric);
    return [...competitionMetrics, ...(previewMetric ? [previewMetric] : [])];
  }, [competition.metrics, previewMetric]);

  const currentStandings = useMemo(
    () => buildStandingsCache(metrics, competition),
    [metrics, competition],
  );

  const previousStandings = useMemo(() => {
    if (!competitionDetails24hAgo.isSuccess) {
      return undefined;
    }

    return buildStandingsCache(metrics, competitionDetails24hAgo.data);
  }, [metrics, competitionDetails24hAgo]);

  const getPlayerStandings = useCallback(
    (username: string, metric: Metric | "total") => {
      return {
        current: currentStandings.get(metric)?.get(username),
        previous: previousStandings?.get(metric)?.get(username),
      };
    },
    [currentStandings, previousStandings],
  );

  return {
    isLoading: competitionDetails24hAgo.isLoading,
    isError: competitionDetails24hAgo.isError,
    getPlayerStandings,
    currentStandings,
    previousStandings,
  };
}

function useCompetitionDetails24hAgo(competition: CompetitionDetailsResponse, previewMetric?: Metric) {
  const client = useWOMClient();

  const activeParticipantUsernames = useMemo(() => {
    return competition.participations
      .filter((p) => p.deltas[0].values.gained > 0)
      .map((p) => p.player.username);
  }, [competition]);

  const isEnabled = activeParticipantUsernames.length > 0;

  return useQuery({
    queryKey: ["competition-time-machine", competition.id, previewMetric],
    queryFn: async () => {
      const params = new URLSearchParams();

      params.set("maxDate", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      for (const username of activeParticipantUsernames.slice(0, 50)) {
        params.append("usernames", username);
      }

      if (previewMetric) {
        params.set("metric", previewMetric);
      }

      return client.getRequest<CompetitionDetailsResponse>(
        `/competitions/${competition.id}?${params.toString()}`,
      );
    },
    enabled: isEnabled,
    staleTime: 3600_000,
  });
}

/**
 * Map of metric => Map of username => PlayerStanding
 */
function buildStandingsCache(metrics: Metric[], competition: CompetitionDetailsResponse) {
  const map = new Map<Metric | "total", Map<string, PlayerStanding>>();

  for (const metric of [...metrics, "total" as const]) {
    const standings = competition.participations
      .map((p) => ({
        username: p.player.username,
        delta: p.deltas.find((d) => d.metric === metric),
      }))
      .filter((s) => s.delta !== undefined)
      .sort((a, b) => b.delta!.values.gained - a.delta!.values.gained);

    map.set(
      metric,
      new Map(
        standings.map((s, index) => [
          s.username,
          {
            rank: index + 1,
            delta: s.delta!,
          },
        ]),
      ),
    );
  }

  return map;
}
