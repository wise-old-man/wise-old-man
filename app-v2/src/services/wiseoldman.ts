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
  NameChange,
  Player,
  CompetitionType,
  NameChangeStatus,
} from "@wise-old-man/utils";

export const apiClient = new WOMClient({
  userAgent: "Wise Old Man App (v2)",
  apiKey: process.env.APP_API_KEY,
});

export type TimeRangeFilter = { period: Period } | { startDate: Date; endDate: Date };

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
  return apiClient.competitions.getCompetitionDetails(id, previewMetric);
});

export const getCompetitionTopHistory = cache((id: number, previewMetric?: Metric) => {
  return apiClient.competitions.getCompetitionTopHistory(id, previewMetric);
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
    country?: Country,
    playerType?: PlayerType,
    playerBuild?: PlayerBuild
  ) => {
    return apiClient.efficiency.getEfficiencyLeaderboards({ metric, country, playerType, playerBuild });
  }
);

export const getGroupAchievements = cache((id: number, limit: number, offset: number) => {
  return apiClient.groups.getGroupAchievements(id, { limit, offset });
});

export const getGroupCompetitions = cache((id: number, limit?: number, offset?: number) => {
  return apiClient.groups.getGroupCompetitions(id, { limit, offset });
});

export const getGroupDetails = cache((id: number) => {
  return apiClient.groups.getGroupDetails(id);
});

export const getGroupGains = cache(
  (id: number, period: Period, metric: Metric, limit: number, offset: number) => {
    return apiClient.groups.getGroupGains(id, { period, metric }, { limit, offset });
  }
);

export const getGroupHiscores = cache((id: number, metric: Metric, limit: number, offset: number) => {
  return apiClient.groups.getGroupHiscores(id, metric, { limit, offset });
});

export const getGroupNameChanges = cache((id: number, limit: number, offset: number) => {
  return apiClient.groups.getGroupNameChanges(id, { limit, offset }) as Promise<
    Array<NameChange & Player> // TODO: this type should come correct from the API
  >;
});

export const getGroupRecords = cache(
  (id: number, metric: Metric, period: Period, limit: number, offset: number) => {
    return apiClient.groups.getGroupRecords(id, { metric, period }, { limit, offset });
  }
);

export const getGroupStatistics = cache((id: number) => {
  return apiClient.groups.getGroupStatistics(id);
});

export const getPlayerAchievementProgress = cache((username: string) => {
  return apiClient.players.getPlayerAchievementProgress(username);
});

export const getPlayerCompetitions = cache((username: string) => {
  return apiClient.players.getPlayerCompetitions(username);
});

export const getPlayerDetails = cache((usernane: string) => {
  return apiClient.players.getPlayerDetails(usernane);
});

export const getPlayerGains = cache(
  (
    username: string,
    period: Period | undefined,
    startDate: Date | undefined,
    endDate: Date | undefined
  ) => {
    if (period) {
      return apiClient.players.getPlayerGains(username, { period });
    }

    if (!startDate || !endDate) {
      throw new Error("Bad Request: Missing startDate or endDate");
    }

    return apiClient.players.getPlayerGains(username, { startDate, endDate });
  }
);

export const getPlayerGroups = cache((username: string, limit?: number, offset?: number) => {
  return apiClient.players.getPlayerGroups(username, { limit, offset });
});

export const getPlayerNames = cache((username: string) => {
  return apiClient.players.getPlayerNames(username);
});

export const getPlayerRecords = cache((username: string) => {
  return apiClient.players.getPlayerRecords(username);
});

export const getPlayerSnapshotTimeline = cache(
  (
    username: string,
    metric: Metric,
    period: Period | undefined,
    startDate: Date | undefined,
    endDate: Date | undefined
  ) => {
    if (period) {
      return apiClient.players.getPlayerSnapshotTimeline(username, metric, { period });
    }

    if (!startDate || !endDate) {
      throw new Error("Bad Request: Missing startDate or endDate");
    }

    return apiClient.players.getPlayerSnapshotTimeline(username, metric, { startDate, endDate });
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
