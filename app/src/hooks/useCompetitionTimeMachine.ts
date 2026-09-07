import { useQuery } from "@tanstack/react-query";
import { CompetitionDetailsResponse, Metric } from "@wise-old-man/utils";
import { useCallback, useMemo } from "react";
import { useCompetitionPageContext } from "~/components/competitions/CompetitionPageContext";
import { sortParticipations } from "~/utils/competitions";
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

  // The 24h-ago snapshot only covers a subset of the participants, so rank movement has to be
  // measured within that subset. Comparing a rank among 50 players against a rank among all of
  // them would invent movement that never happened.
  const rankDiffs = useMemo(() => {
    if (previousStandings === undefined) {
      return undefined;
    }

    const map = new Map<Metric | "total", Map<string, number>>();

    for (const [metric, previousMap] of previousStandings) {
      const currentMap = currentStandings.get(metric);

      if (currentMap === undefined) {
        continue;
      }

      const currentSubsetRanks = buildSubsetRanks(currentMap, previousMap);
      const previousSubsetRanks = buildSubsetRanks(previousMap, currentMap);

      const diffs = new Map<string, number>();

      for (const [username, currentRank] of currentSubsetRanks) {
        const previousRank = previousSubsetRanks.get(username);

        if (previousRank !== undefined) {
          diffs.set(username, previousRank - currentRank);
        }
      }

      map.set(metric, diffs);
    }

    return map;
  }, [currentStandings, previousStandings]);

  const getPlayerRankDiff = useCallback(
    (username: string, metric: Metric | "total") => {
      return rankDiffs?.get(metric)?.get(username);
    },
    [rankDiffs],
  );

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
    getPlayerRankDiff,
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

  // A competition that is younger than 24h has gained nothing in that window, so its
  // current data is also its 24h-ago snapshot. There is nothing to compare against.
  const startedWithinLast24h = Date.now() - competition.startsAt.getTime() < 24 * 60 * 60 * 1000;

  const isEnabled = !startedWithinLast24h && activeParticipantUsernames.length > 0;

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
    staleTime: 300_000,
  });
}

/**
 * Ranks the players that both snapshots hold, in the order of the first one.
 *
 * Both maps are built in rank order, so keeping only the shared usernames and re-numbering
 * them gives each player their rank within the group that can actually be compared.
 */
function buildSubsetRanks(source: Map<string, PlayerStanding>, restrictTo: Map<string, PlayerStanding>) {
  const ranks = new Map<string, number>();

  for (const username of source.keys()) {
    if (restrictTo.has(username)) {
      ranks.set(username, ranks.size + 1);
    }
  }

  return ranks;
}

/**
 * Map of metric => Map of username => PlayerStanding
 */
function buildStandingsCache(metrics: Metric[], competition: CompetitionDetailsResponse) {
  const map = new Map<Metric | "total", Map<string, PlayerStanding>>();

  for (const metric of [...metrics, "total" as const]) {
    const standings = sortParticipations(competition.participations, metric)
      .map((p) => ({
        username: p.player.username,
        delta: p.deltas.find((d) => d.metric === metric),
      }))
      .filter((s) => s.delta !== undefined);

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
