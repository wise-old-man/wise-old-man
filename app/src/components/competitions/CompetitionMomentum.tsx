"use client";

import {
  CompetitionDetailsResponse,
  formatNumber,
  MetricDelta,
  PlayerResponse,
} from "@wise-old-man/utils";
import { useCompetitionTimeMachine } from "~/hooks/useCompetitionTimeMachine";
import { FormattedNumber } from "../FormattedNumber";
import { MetricDeltasTooltip } from "../MetricDeltasTooltip";
import { PlayerIdentity } from "../PlayerIdentity";
import { useCompetitionPageContext } from "./CompetitionPageContext";

type TimeMachine = ReturnType<typeof useCompetitionTimeMachine>;

const MAX_ENTRIES = 5;

interface MomentumEntry {
  player: PlayerResponse;
  gained: number;
  // The gains of the past 24h, for every metric, so they can be shown as a tooltip breakdown.
  deltas: CompetitionDetailsResponse["participations"][number]["deltas"];
  currentStanding: number;
  currentGap: number;
  previousGap: number;
}

export function Inner() {
  const { competition, selectedMetric } = useCompetitionPageContext();
  const { currentStandings, previousStandings, isLoading, isError } = useCompetitionTimeMachine();

  if (isError) {
    return (
      <div className="mx-3 mb-3 flex h-20 items-center justify-center rounded-lg border border-dashed border-gray-500 px-6 text-center text-sm text-gray-200">
        Failed to load momentum data. Please try again later.
      </div>
    );
  }

  if (isLoading) {
    return (
      <ul>
        {Array.from({ length: MAX_ENTRIES }).map((_, index) => (
          <li
            key={index}
            className="flex items-center justify-between border-t border-gray-700 px-4 py-3 shadow-none"
          >
            <div className="flex gap-x-3">
              <div className="h-8 w-8 animate-pulse rounded-full bg-gray-600" />
              <div className="flex flex-col justify-center gap-y-2">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-600" />
                <div className="h-3 w-36 animate-pulse rounded bg-gray-600" />
              </div>
            </div>
            <div className="h-3 w-10 animate-pulse rounded bg-gray-600" />
          </li>
        ))}
      </ul>
    );
  }

  const entries = calculateMomentumEntries(
    competition,
    selectedMetric ?? "total",
    currentStandings,
    previousStandings,
  );

  if (entries.length === 0) {
    return (
      <div className="mx-3 mb-3 flex h-20 items-center justify-center rounded-lg border border-dashed border-gray-500 px-6 text-center text-sm text-gray-200">
        No gains to show.
      </div>
    );
  }

  return (
    <ul>
      {entries.map((entry) => (
        <li
          key={entry.player.id}
          className="flex items-center justify-between border-t border-gray-700 px-4 py-3 shadow-none"
        >
          <PlayerIdentity player={entry.player} caption={getGapCaption(entry)} />
          <FormattedNumber
            value={entry.gained}
            colored
            className="text-xs font-semibold tabular-nums"
            tooltipContent={
              <MetricDeltasTooltip
                deltas={entry.deltas}
                focusedMetric={selectedMetric ?? "total"}
                type="values"
                field="gained"
              />
            }
          />
        </li>
      ))}
    </ul>
  );
}

export function CompetitionMomentum() {
  return (
    <div className="rounded-lg border border-gray-600 bg-gray-800">
      <div className="flex flex-col gap-x-1 px-4 py-3">
        <span className="text-base text-white">Momentum</span>
        <span className="text-xs text-gray-200">
          Highest gains in the <span className="text-white">past 24h</span>
        </span>
      </div>
      <Inner />
    </div>
  );
}

function calculateMomentumEntries(
  competition: ReturnType<typeof useCompetitionPageContext>["competition"],
  metric: Parameters<TimeMachine["getPlayerStandings"]>[1],
  currentStandings: TimeMachine["currentStandings"],
  previousStandings: TimeMachine["previousStandings"],
): MomentumEntry[] {
  const currentMap = currentStandings.get(metric);
  const previousMap = previousStandings?.get(metric);

  if (!currentMap || !previousMap) {
    return [];
  }

  // Standings are inserted in rank order, so these arrays let us look up
  // whoever holds a given rank, on either snapshot.
  const currentByRank = Array.from(currentMap.values());
  const previousByRank = Array.from(previousMap.values());

  const playersByUsername = new Map(
    competition.participations.map((p) => [p.player.username, p.player]),
  );

  // Every participation holds the same metrics, in the same order (with "total" first, if present).
  const metrics = competition.participations[0]?.deltas.map((d) => d.metric) ?? [];

  return Array.from(currentMap.entries())
    .flatMap(([username, current]) => {
      const previous = previousMap.get(username);
      const player = playersByUsername.get(username);

      if (!previous || !player) {
        return [];
      }

      const gained = current.delta.values.gained - previous.delta.values.gained;

      if (gained <= 0) {
        return [];
      }

      const deltas = metrics.flatMap((metricKey) => {
        const metricCurrent = currentStandings.get(metricKey)?.get(username);
        const metricPrevious = previousStandings?.get(metricKey)?.get(username);

        if (!metricCurrent || !metricPrevious) {
          return [];
        }

        // Both snapshots hold gains since the start of the competition, so the gains of the
        // past 24h are the difference between them.
        return [
          {
            metric: metricKey,
            values: buildPastDayDelta(metricPrevious.delta.values, metricCurrent.delta.values),
            levels: buildPastDayDelta(metricPrevious.delta.levels, metricCurrent.delta.levels),
          },
        ];
      });

      // Everyone measures themselves against 1st place, except 1st place themselves,
      // who measure their lead over 2nd.
      const targetStanding = current.rank === 1 ? 2 : 1;

      // Measured against the same rank on both snapshots, so the "before" reflects how
      // far off that rank they were then, not how far off the player who now holds it.
      const currentGap =
        (currentByRank[targetStanding - 1]?.delta.values.gained ?? 0) - current.delta.values.gained;

      const previousGap =
        (previousByRank[targetStanding - 1]?.delta.values.gained ?? 0) - previous.delta.values.gained;

      return [
        {
          player,
          gained,
          deltas,
          currentStanding: current.rank,
          currentGap,
          previousGap,
        },
      ];
    })
    .sort((a, b) => b.gained - a.gained)
    .slice(0, MAX_ENTRIES);
}

function buildPastDayDelta(previous: MetricDelta, current: MetricDelta): MetricDelta {
  return {
    start: previous.gained,
    end: current.gained,
    gained: current.gained - previous.gained,
  };
}

function getGapCaption(entry: MomentumEntry) {
  if (entry.currentStanding === 1) {
    return `Lead over 2nd place: ${formatNumber(-entry.currentGap, true)}`;
  }

  // A player who has since dropped out of first place was ahead of it before, which would
  // render as a negative "before", so only show the trend when it reads as a gap on both ends.
  if (entry.previousGap <= 0) {
    return `Gap to 1st place: ${formatNumber(entry.currentGap, true)}`;
  }

  return `Gap to 1st: ${formatNumber(entry.previousGap, true)} → ${formatNumber(entry.currentGap, true)}`;
}
