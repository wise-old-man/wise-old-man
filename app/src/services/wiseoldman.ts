import { cache } from "react";
import {
  CompetitionDetails,
  CompetitionStatus,
  CompetitionListItem,
  Period,
  WOMClient,
  Metric,
  Country,
  PlayerType,
  PlayerBuild,
  EfficiencyLeaderboardsFilter,
  CompetitionType,
  NameChangeStatus,
} from "@wise-old-man/utils";
import { notFound } from "next/navigation";
import * as Sentry from "@sentry/nextjs";

/**
 * The WOM client used to make requests to the API from server components.
 *
 * **NOTE**: Do not import into client components due to API key leakage.
 *
 * See the `useWOMClient` hook for client components.
 */
export const apiClient = new WOMClient({
  userAgent: "Wise Old Man App (v2)",
  apiKey: process.env.APP_API_KEY,
  baseAPIUrl: process.env.NEXT_PUBLIC_BASE_API_URL ?? "https://api.wiseoldman.net/v2",
});

export type TimeRangeFilter = { period: Period } | { startDate: Date; endDate: Date };

async function handleNotFound<T>(promise: Promise<T>): Promise<T> {
  return promise.catch((e) => {
    Sentry.captureException(e);
    console.log("Sentry Captured Error", e);

    if ("statusCode" in e && e.statusCode === 404) notFound();
    throw e;
  });
}

export function getCompetitionStatus(competition: CompetitionDetails | CompetitionListItem) {
  const now = new Date();

  if (competition.endsAt.getTime() < now.getTime()) {
    return CompetitionStatus.FINISHED;
  }

  if (competition.startsAt.getTime() < now.getTime()) {
    return CompetitionStatus.ONGOING;
  }

  return CompetitionStatus.UPCOMING;
}

// Cached functions

export const getCompetitionDetails = cache((id: number, previewMetric?: Metric) => {
  return handleNotFound(apiClient.competitions.getCompetitionDetails(id, previewMetric));
});

export const getCompetitionTopHistory = cache((id: number, previewMetric?: Metric) => {
  return handleNotFound(apiClient.competitions.getCompetitionTopHistory(id, previewMetric));
});

export const getDeltaLeaderboard = cache(
  (
    metric: Metric,
    period: Period,
    country?: Country,
    playerType?: PlayerType,
    playerBuild?: PlayerBuild
  ) => {
    return apiClient.deltas.getDeltaLeaderboard({ metric, period, country, playerType, playerBuild });
  }
);

export const getEfficiencyLeaderboards = cache(
  (
    metric: EfficiencyLeaderboardsFilter["metric"],
    country: Country | undefined,
    playerType: PlayerType | undefined,
    playerBuild: PlayerBuild | undefined,
    limit: number,
    offset: number
  ) => {
    return apiClient.efficiency.getEfficiencyLeaderboards(
      { metric, country, playerType, playerBuild },
      { limit, offset }
    );
  }
);

export const getGroupAchievements = cache((id: number, limit: number, offset: number) => {
  return handleNotFound(apiClient.groups.getGroupAchievements(id, { limit, offset }));
});

export const getGroupCompetitions = cache((id: number, limit?: number, offset?: number) => {
  return handleNotFound(apiClient.groups.getGroupCompetitions(id, { limit, offset }));
});

export const getGroupDetails = cache((id: number) => {
  return handleNotFound(apiClient.groups.getGroupDetails(id));
});

export const getGroupGainsByPeriod = cache(
  (id: number, metric: Metric, period: Period, limit: number, offset: number) => {
    return handleNotFound(apiClient.groups.getGroupGains(id, { period, metric }, { limit, offset }));
  }
);

export const getGroupGainsByDates = cache(
  (id: number, metric: Metric, startDate: Date, endDate: Date, limit: number, offset: number) => {
    return handleNotFound(
      apiClient.groups.getGroupGains(id, { startDate, endDate, metric }, { limit, offset })
    );
  }
);

export const getGroupHiscores = cache((id: number, metric: Metric, limit: number, offset: number) => {
  return handleNotFound(apiClient.groups.getGroupHiscores(id, metric, { limit, offset }));
});

export const getGroupNameChanges = cache((id: number, limit: number, offset: number) => {
  return handleNotFound(apiClient.groups.getGroupNameChanges(id, { limit, offset }));
});

export const getGroupRecords = cache(
  (id: number, metric: Metric, period: Period, limit: number, offset: number) => {
    return handleNotFound(apiClient.groups.getGroupRecords(id, { metric, period }, { limit, offset }));
  }
);

export const getGroupActivity = cache((id: number, limit?: number, offset?: number) => {
  return handleNotFound(apiClient.groups.getGroupActivity(id, { limit, offset }));
});

export const getGroupStatistics = cache((id: number) => {
  return handleNotFound(apiClient.groups.getGroupStatistics(id));
});

export const getPlayerAchievementProgress = cache((username: string) => {
  return handleNotFound(apiClient.players.getPlayerAchievementProgress(username));
});

export const getPlayerCompetitions = cache((username: string) => {
  return handleNotFound(apiClient.players.getPlayerCompetitions(username));
});

export const getPlayerDetails = cache((username: string) => {
  return handleNotFound(apiClient.players.getPlayerDetails(username));
});

export const getPlayerGainsByPeriod = cache((username: string, period: Period) => {
  return handleNotFound(apiClient.players.getPlayerGains(username, { period }));
});

export const getPlayerGainsByDates = cache((username: string, startDate: Date, endDate: Date) => {
  return handleNotFound(apiClient.players.getPlayerGains(username, { startDate, endDate }));
});

export const getPlayerGroups = cache((username: string, limit?: number, offset?: number) => {
  return handleNotFound(apiClient.players.getPlayerGroups(username, { limit, offset }));
});

export const getPlayerNames = cache((username: string) => {
  return handleNotFound(apiClient.players.getPlayerNames(username));
});

export const getPlayerArchives = cache((username: string) => {
  return handleNotFound(apiClient.players.getPlayerArchives(username));
});

export const getPlayerRecords = cache((username: string) => {
  return handleNotFound(apiClient.players.getPlayerRecords(username));
});

export const getSnapshotTimelineByPeriod = cache((username: string, metric: Metric, period: Period) => {
  return handleNotFound(apiClient.players.getPlayerSnapshotTimeline(username, metric, { period }));
});

export const getSnapshotTimelineByDate = cache(
  (username: string, metric: Metric, startDate: Date, endDate: Date) => {
    return handleNotFound(
      apiClient.players.getPlayerSnapshotTimeline(username, metric, { startDate, endDate })
    );
  }
);

export const getRecordLeaderboard = cache(
  (
    metric: Metric,
    period: Period,
    country?: Country,
    playerType?: PlayerType,
    playerBuild?: PlayerBuild
  ) => {
    return apiClient.records.getRecordLeaderboard({ metric, period, country, playerType, playerBuild });
  }
);

export const searchCompetitions = cache(
  (
    title: string | undefined,
    metric: Metric | undefined,
    type: CompetitionType | undefined,
    status: CompetitionStatus | undefined,
    limit: number,
    offset: number
  ) => {
    return apiClient.competitions.searchCompetitions({ title, metric, type, status }, { limit, offset });
  }
);

export const searchGroups = cache((name: string, limit: number, offset: number) => {
  return apiClient.groups.searchGroups(name, { limit, offset });
});

export const searchNameChanges = cache(
  (username: string, status: NameChangeStatus | undefined, limit: number, offset: number) => {
    return apiClient.nameChanges.searchNameChanges({ username, status }, { limit, offset });
  }
);
