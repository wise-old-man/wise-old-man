import {
  Metric,
  CompetitionDetails,
  CompetitionStatus,
  Top5ProgressResult,
  CompetitionListItem,
  CompetitionsSearchFilter,
  GroupListItem,
  GroupDetails,
  GroupHiscoresEntry,
  Period,
  DeltaGroupLeaderboardEntry,
  RecordLeaderboardEntry,
} from "@wise-old-man/utils";
import { notFound } from "next/navigation";
import { transformDates } from "~/utils/dates";

const BASE_API_URL = "https://api.wiseoldman.net/v2";

interface PaginationOptions {
  limit?: number;
  offset?: number;
}

export async function fetchGroups(search: string, pagination: PaginationOptions) {
  const params = new URLSearchParams();
  params.set("search", search);

  if (pagination.limit) params.set("limit", pagination.limit.toString());
  if (pagination.offset) params.set("offset", pagination.offset.toString());

  try {
    const res = await fetch(`${BASE_API_URL}/groups?${params.toString()}`);
    if (!res.ok) throw new Error();

    return transformDates(await res.json()) as GroupListItem[];
  } catch (error) {
    notFound();
  }
}

export async function fetchCompetitions(
  filter: CompetitionsSearchFilter,
  pagination: PaginationOptions
) {
  const params = new URLSearchParams();
  if (filter.type) params.set("type", filter.type);
  if (filter.title) params.set("title", filter.title);
  if (filter.metric) params.set("metric", filter.metric);
  if (filter.status) params.set("status", filter.status);

  if (pagination.limit) params.set("limit", pagination.limit.toString());
  if (pagination.offset) params.set("offset", pagination.offset.toString());

  try {
    const res = await fetch(`${BASE_API_URL}/competitions?${params.toString()}`);
    if (!res.ok) throw new Error();

    return transformDates(await res.json()) as CompetitionListItem[];
  } catch (error) {
    notFound();
  }
}

export async function fetchGroupHiscores(
  groupId: number,
  metric: Metric,
  pagination: PaginationOptions
) {
  const params = new URLSearchParams();
  params.set("metric", metric);

  if (pagination.limit) params.set("limit", pagination.limit.toString());
  if (pagination.offset) params.set("offset", pagination.offset.toString());

  try {
    const res = await fetch(`${BASE_API_URL}/groups/${groupId}/hiscores?${params.toString()}`);
    if (!res.ok) throw new Error();

    return transformDates(await res.json()) as GroupHiscoresEntry[];
  } catch (error) {
    notFound();
  }
}

export async function fetchGroupGained(
  groupId: number,
  metric: Metric,
  period: Period,
  pagination: PaginationOptions
) {
  const params = new URLSearchParams();
  params.set("metric", metric);
  params.set("period", period);

  if (pagination.limit) params.set("limit", pagination.limit.toString());
  if (pagination.offset) params.set("offset", pagination.offset.toString());

  try {
    const res = await fetch(`${BASE_API_URL}/groups/${groupId}/gained?${params.toString()}`);
    if (!res.ok) throw new Error();

    return transformDates(await res.json()) as DeltaGroupLeaderboardEntry[];
  } catch (error) {
    notFound();
  }
}

export async function fetchGroupRecords(
  groupId: number,
  metric: Metric,
  period: Period,
  pagination: PaginationOptions
) {
  const params = new URLSearchParams();
  params.set("metric", metric);
  params.set("period", period);

  if (pagination.limit) params.set("limit", pagination.limit.toString());
  if (pagination.offset) params.set("offset", pagination.offset.toString());

  try {
    const res = await fetch(`${BASE_API_URL}/groups/${groupId}/records?${params.toString()}`);
    if (!res.ok) throw new Error();

    return transformDates(await res.json()) as RecordLeaderboardEntry[];
  } catch (error) {
    notFound();
  }
}

export async function fetchGroupCompetitions(groupId: number) {
  try {
    const res = await fetch(`${BASE_API_URL}/groups/${groupId}/competitions`);
    if (!res.ok) throw new Error();

    return transformDates(await res.json()) as CompetitionListItem[];
  } catch (error) {
    notFound();
  }
}

export async function fetchGroup(id: number) {
  try {
    const res = await fetch(`${BASE_API_URL}/groups/${id}`);
    if (!res.ok) throw new Error();

    return transformDates(await res.json()) as GroupDetails;
  } catch (error) {
    notFound();
  }
}

export async function fetchCompetition(id: number, preview?: Metric) {
  const params = new URLSearchParams();
  if (preview) params.set("metric", preview);

  try {
    const res = await fetch(`${BASE_API_URL}/competitions/${id}?${params.toString()}`);
    if (!res.ok) throw new Error();

    return transformDates(await res.json()) as CompetitionDetails;
  } catch (error) {
    notFound();
  }
}

export async function fetchTop5History(id: number, preview?: Metric) {
  const params = new URLSearchParams();
  if (preview) params.set("metric", preview);

  try {
    const res = await fetch(`${BASE_API_URL}/competitions/${id}/top-history?${params.toString()}`);
    if (!res.ok) throw new Error();

    return transformDates(await res.json()) as Top5ProgressResult;
  } catch (error) {
    notFound();
  }
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
