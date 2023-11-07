import {
  isMetric,
  isPlayerBuild,
  isCountry,
  isComputedMetric,
  NameChangeStatus,
  EfficiencyAlgorithmType,
  isCompetitionStatus,
  isCompetitionType,
  isPeriod,
  Period,
} from "@wise-old-man/utils";
import { TimeRangeFilter } from "~/services/wiseoldman";
import { isValidDate } from "./dates";

export function getMetricParam(param: string | undefined | null) {
  if (!param || !isMetric(param)) return undefined;
  return param;
}

export function getPlayerBuildParam(param: string | undefined | null) {
  if (!param || !isPlayerBuild(param)) return undefined;
  return param;
}

export function getPeriodParam(param: string | undefined | null) {
  if (!param || !isPeriod(param)) return undefined;
  return param;
}

export function getTimeRangeFilterParams(params: URLSearchParams): TimeRangeFilter {
  const startDate = decodeURIComponent(params.get("startDate") || "");
  const endDate = decodeURIComponent(params.get("endDate") || "");

  if (!!startDate && !!endDate && isValidDate(startDate) && isValidDate(endDate)) {
    return {
      startDate: new Date(startDate as string),
      endDate: new Date(endDate as string),
    };
  }

  return { period: getPeriodParam(params.get("period")) || Period.WEEK };
}

export function getCountryParam(param: string | undefined | null) {
  if (!param || !isCountry(param)) return undefined;
  return param;
}

export function getComputedMetricParam(param: string | undefined | null) {
  if (!param || (!isComputedMetric(param) && param !== "combined")) return undefined;
  return param;
}

export function getNameChangeStatusParam(param: string | undefined | null) {
  if (!param || !Object.values(NameChangeStatus).includes(param as any)) return undefined;
  return param as NameChangeStatus;
}

export function getSearchParam(param: string | undefined | null) {
  if (!param || typeof param !== "string") return undefined;
  return param;
}

export function getPageParam(param: string | undefined | null) {
  if (!param || typeof param !== "string" || !Number.isInteger(Number(param)) || Number(param) < 1) {
    return undefined;
  }

  return parseInt(param);
}

export function getAlgorithmTypeParam(param: string | undefined | null) {
  if (!param || !Object.values(EfficiencyAlgorithmType).includes(param as any)) return undefined;
  return param as EfficiencyAlgorithmType;
}

export function getCompetitionStatusParam(param: string | undefined | null) {
  if (!param || !isCompetitionStatus(param)) return undefined;
  return param;
}

export function getCompetitionTypeParam(param: string | undefined | null) {
  if (!param || !isCompetitionType(param)) return undefined;
  return param;
}
