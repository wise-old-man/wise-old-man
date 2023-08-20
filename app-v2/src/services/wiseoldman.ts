import {
  CompetitionDetails,
  CompetitionStatus,
  CompetitionListItem,
  Period,
  WOMClient,
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
