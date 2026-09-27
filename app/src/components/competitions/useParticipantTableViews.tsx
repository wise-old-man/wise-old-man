"use client";

import {
  CompetitionDetailsResponse,
  formatNumber,
  Metric,
  MetricProps,
  MetricType,
} from "@wise-old-man/utils";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { sortParticipations } from "~/utils/competitions";
import { cn } from "~/utils/styling";
import { Button } from "../Button";
import {
  Combobox,
  ComboboxContent,
  ComboboxItem,
  ComboboxItemGroup,
  ComboboxItemsContainer,
  ComboboxTrigger,
} from "../Combobox";
import { FormattedNumber } from "../FormattedNumber";
import { MetricBreakdownTooltip, MetricDeltasTooltip } from "../MetricDeltasTooltip";
import { Tooltip, TooltipContent, TooltipTrigger } from "../Tooltip";
import { useCompetitionPageContext } from "./CompetitionPageContext";

import TableCogIcon from "~/assets/table_cog.svg";

/*
 * Resolves the optional table columns ("views") selected in the "view" search param.
 */
export function useParticipantTableViews() {
  const { competition, selectedMetric } = useCompetitionPageContext();
  const searchParams = useSearchParams();

  const isSkillingCompetition = MetricProps[competition.metrics[0].metric].type === MetricType.SKILL;

  // Gap and performance are relative to the whole competition, not to the filtered rows.
  // Calculated for every metric in the deltas, so that the tooltips can show the per-metric breakdown.
  const stats = useMemo(() => {
    const metrics = new Set([
      selectedMetric,
      ...(competition.participations[0]?.deltas ?? []).map((d) => d.metric),
    ]);

    return new Map(
      [...metrics].map((metric) => [
        metric,
        getViewStats(sortParticipations(competition.participations, metric), metric),
      ]),
    );
  }, [competition.participations, selectedMetric]);

  const definitions = getViewDefinitions(selectedMetric, competition, stats);

  const availableViews = VIEW_KEYS.filter((v) => v !== "levels" || isSkillingCompetition);
  const selectedViews = resolveViews(searchParams.getAll("view"), availableViews);

  return {
    selectedViews,
    views: selectedViews.map((key): ParticipantView => ({ key, ...definitions[key] })),
    options: availableViews.map((key) => ({ key, label: definitions[key].label })),
  };
}

type Participation = CompetitionDetailsResponse["participations"][number];

const VIEW_KEYS = ["gained", "levels", "gap", "projected", "performance", "start", "end"] as const;
type ViewKey = (typeof VIEW_KEYS)[number];

interface ViewDefinition {
  label: string;
  // Undefined values are rendered as "---" and always sorted last
  accessorFn: (row: Participation) => number | undefined;
  cell: (row: Participation, value: number) => React.ReactNode;
}

export type ParticipantView = ViewDefinition & { key: ViewKey };

export const EMPTY_CELL = <span className="text-gray-300">---</span>;

interface ViewStats {
  // Gap to the player one rank above (rank 1 and players with no gains have no gap)
  gaps: Map<number, number>;
  // Median gained of the participants with gained > 0
  median: number | undefined;
}

// Projections made too early in the competition are mostly noise
const MIN_PROJECTION_ELAPSED_MS = 6 * 60 * 60 * 1000;

function getGained(row: Participation, metric: Metric | "total") {
  return row.deltas.find((d) => d.metric === metric)?.values.gained ?? 0;
}

function getViewStats(sortedParticipations: Participation[], metric: Metric | "total"): ViewStats {
  const gained = sortedParticipations.map((p) => getGained(p, metric));

  const gaps: ViewStats["gaps"] = new Map();

  sortedParticipations.forEach((p, index) => {
    if (index > 0 && gained[index] > 0) gaps.set(p.player.id, gained[index - 1] - gained[index]);
  });

  const positiveGains = gained.filter((g) => g > 0).sort((a, b) => a - b);
  const mid = Math.floor(positiveGains.length / 2);

  let median: number | undefined;

  if (positiveGains.length > 0) {
    median =
      positiveGains.length % 2 === 0
        ? (positiveGains[mid - 1] + positiveGains[mid]) / 2
        : positiveGains[mid];
  }

  return { gaps, median };
}

function getProjectedGain(
  row: Participation,
  competition: CompetitionDetailsResponse,
  metric: Metric | "total",
) {
  const now = Date.now();
  const startsAt = competition.startsAt.getTime();
  const endsAt = competition.endsAt.getTime();
  const updatedAt = row.player.updatedAt?.getTime();

  if (now < startsAt || updatedAt === undefined || updatedAt < startsAt) return undefined;

  const gained = getGained(row, metric);
  if (gained <= 0) return undefined;

  if (now >= endsAt) return gained;

  const elapsed = updatedAt - startsAt;
  if (elapsed < MIN_PROJECTION_ELAPSED_MS) return undefined;

  return Math.round((gained / elapsed) * (endsAt - startsAt));
}

function isViewKey(value: string): value is ViewKey {
  return (VIEW_KEYS as readonly string[]).includes(value);
}

function getViewDefinitions(
  selectedMetric: Metric | "total",
  competition: CompetitionDetailsResponse,
  stats: Map<Metric | "total", ViewStats>,
): Record<ViewKey, ViewDefinition> {
  function getDelta(row: Participation) {
    return row.deltas.find((d) => d.metric === selectedMetric);
  }

  function getGap(row: Participation, metric: Metric | "total") {
    return stats.get(metric)?.gaps.get(row.player.id);
  }

  function getPerformance(row: Participation, metric: Metric | "total") {
    const median = stats.get(metric)?.median;
    const gained = getGained(row, metric);

    if (median === undefined || gained <= 0) return undefined;

    return { diff: Math.round(gained - median), ratio: gained / median };
  }

  function renderBreakdown(
    row: Participation,
    title: string,
    renderValue: (metric: Metric | "total") => React.ReactNode,
  ) {
    return (
      <MetricBreakdownTooltip
        title={title}
        items={row.deltas.map((d) => ({ metric: d.metric, value: renderValue(d.metric) }))}
      />
    );
  }

  // -1 means the player was unranked in this metric
  function getValue(row: Participation, field: "start" | "end") {
    const value = getDelta(row)?.values[field];
    return value === undefined || value === -1 ? undefined : value;
  }

  function renderValueCell(row: Participation, value: number, field: "start" | "end") {
    return (
      <FormattedNumber
        value={value}
        tooltipContent={<MetricDeltasTooltip deltas={row.deltas} type="values" field={field} />}
      />
    );
  }

  return {
    gained: {
      label: "Gained",
      accessorFn: (row) => getGained(row, selectedMetric),
      cell: (row, gained) => (
        <FormattedNumber
          value={gained}
          colored
          tooltipContent={<MetricDeltasTooltip deltas={row.deltas} type="values" field="gained" />}
        />
      ),
    },
    levels: {
      label: "Levels",
      accessorFn: (row) => {
        const levels = getDelta(row)?.levels;
        if (levels === undefined || levels.start === -1 || levels.end === -1) return undefined;
        return levels.gained;
      },
      cell: (row, gained) => {
        return (
          <span className={cn(gained > 0 && "text-green-500")}>
            {gained > 0 ? "+" : ""}
            <Tooltip>
              <TooltipTrigger asChild>
                <span>{gained}</span>
              </TooltipTrigger>
              <TooltipContent>
                <MetricDeltasTooltip deltas={row.deltas} type="levels" field="gained" />
              </TooltipContent>
            </Tooltip>
          </span>
        );
      },
    },
    gap: {
      label: "Gap",
      accessorFn: (row) => getGap(row, selectedMetric),
      cell: (row, gap) => {
        return (
          <FormattedNumber
            value={gap}
            tooltipContent={renderBreakdown(row, "Gap to the next rank", (metric) => {
              const value = getGap(row, metric);
              return value === undefined ? EMPTY_CELL : <FormattedNumber value={value} />;
            })}
          />
        );
      },
    },
    projected: {
      label: "Projected",
      accessorFn: (row) => getProjectedGain(row, competition, selectedMetric),
      cell: (row, projected) => {
        return (
          <FormattedNumber
            value={projected}
            colored
            tooltipContent={renderBreakdown(
              row,
              "Projected final gains at the current pace",
              (metric) => {
                const value = getProjectedGain(row, competition, metric);
                return value === undefined ? EMPTY_CELL : <FormattedNumber value={value} colored />;
              },
            )}
          />
        );
      },
    },
    performance: {
      label: "Performance",
      accessorFn: (row) => getPerformance(row, selectedMetric)?.diff,
      cell: (row, diff) => {
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className={cn(diff > 0 && "text-green-500", diff < 0 && "text-red-500")}>
                {diff > 0 ? "+" : ""}
                {formatNumber(diff, true)}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {renderBreakdown(row, "Compared to the median gain", (metric) => {
                const value = getPerformance(row, metric);
                if (value === undefined) return EMPTY_CELL;

                const multiplier =
                  value.ratio < 1
                    ? `${Math.round(value.ratio * 100)}%`
                    : `${value.ratio.toFixed(1).replace(/\.0$/, "")}×`;

                return (
                  <span className="flex items-center gap-x-1">
                    <FormattedNumber value={value.diff} colored />
                    <span className="text-gray-200">({multiplier})</span>
                  </span>
                );
              })}
            </TooltipContent>
          </Tooltip>
        );
      },
    },
    start: {
      label: "Start",
      accessorFn: (row) => getValue(row, "start"),
      cell: (row, value) => renderValueCell(row, value, "start"),
    },
    end: {
      label: "End",
      accessorFn: (row) => getValue(row, "end"),
      cell: (row, value) => renderValueCell(row, value, "end"),
    },
  };
}

const DEFAULT_VIEWS: ViewKey[] = ["gained"];

// Columns are always rendered in the registry order, regardless of the order in the URL
function resolveViews(requestedViews: string[], availableViews: ViewKey[]): ViewKey[] {
  const selected = availableViews.filter((v) => requestedViews.includes(v));
  return selected.length > 0 ? selected : DEFAULT_VIEWS;
}

export function ColumnsSelector(props: {
  selectedViews: ViewKey[];
  options: Array<{
    key: ViewKey;
    label: string;
  }>;
}) {
  const { selectedViews, options } = props;

  const searchParams = useSearchParams();

  function handleViewsChanged(views: ViewKey[]) {
    // At least one column must stay visible
    if (views.length === 0) return;

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("view");

    // The default doesn't need to be in the URL
    const isDefault =
      views.length === DEFAULT_VIEWS.length && views.every((v) => DEFAULT_VIEWS.includes(v));

    if (!isDefault) {
      views.forEach((v) => nextParams.append("view", v));
    }

    // Shallow update: the columns are computed client-side, so there's no need to refetch the page
    const query = nextParams.toString();
    window.history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
  }

  return (
    <Combobox
      multiple
      value={selectedViews}
      onValueChanged={(values) => handleViewsChanged(values.filter(isViewKey))}
    >
      <ComboboxTrigger asChild>
        <Button iconButton>
          <TableCogIcon className="h-5 w-5 pl-px pt-px text-gray-100" />
        </Button>
      </ComboboxTrigger>
      <ComboboxContent align="end" className="min-w-[11rem]">
        <ComboboxItemsContainer>
          <ComboboxItemGroup>
            {options.map(({ key, label }) => (
              <ComboboxItem key={key} value={key}>
                {label}
              </ComboboxItem>
            ))}
          </ComboboxItemGroup>
        </ComboboxItemsContainer>
      </ComboboxContent>
    </Combobox>
  );
}
