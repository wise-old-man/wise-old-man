import { isMetric, isPlayerType, isPlayerBuild, isCountry, isComputedMetric } from "@wise-old-man/utils";

export function getMetricParam(param: string | undefined | null) {
  if (!param) return undefined;
  if (!isMetric(param)) return undefined;
  return param;
}

export function getPlayerTypeParam(param: string | undefined | null) {
  if (!param) return undefined;
  if (!isPlayerType(param)) return undefined;
  return param;
}

export function getPlayerBuildParam(param: string | undefined | null) {
  if (!param) return undefined;
  if (!isPlayerBuild(param)) return undefined;
  return param;
}

export function getCountryParam(param: string | undefined | null) {
  if (!param) return undefined;
  if (!isCountry(param)) return undefined;
  return param;
}

export function getComputedMetricParam(param: string | undefined | null) {
  if (!param) return undefined;
  if (!isComputedMetric(param) && param !== "combined") return undefined;
  return param;
}
