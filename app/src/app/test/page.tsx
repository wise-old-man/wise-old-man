"use client";

import {
  CompetitionDetailsResponse,
  formatNumber,
  Metric,
  MetricProps,
  METRICS,
} from "@wise-old-man/utils";
import { PropsWithChildren, useState } from "react";
import { Button } from "~/components/Button";
import { Container } from "~/components/Container";
import { MetricIconSmall } from "~/components/Icon";
import { ProgressCircle } from "~/components/ProgressCircle";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/Tooltip";
import { cn } from "~/utils/styling";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import PlusIcon from "~/assets/plus.svg";
import CalendarIcon from "~/assets/calendar.svg";
import ArrowRightIcon from "~/assets/arrow_right.svg";
import ChevronDownIcon from "~/assets/chevron_down.svg";
import InfoIcon from "~/assets/info.svg";
import SyncIcon from "~/assets/sync.svg";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/Dropdown";
import { QueryLink } from "~/components/QueryLink";
import { ListTable, ListTableCell, ListTableRow } from "~/components/ListTable";
import { PlayerIdentity } from "~/components/PlayerIdentity";
import { FormattedNumber } from "~/components/FormattedNumber";

function getMetricPrimaryColor(metric: Metric) {
  switch (metric) {
    case Metric.HERBLORE:
      return "#00FF00";
    case Metric.WOODCUTTING:
      return "#AAFF00";
    case Metric.AGILITY:
      return "#AA00FF";
    default:
      return "#FFFFF";
  }
}

interface ActiveParticipantsWidgetProps {
  totalParticipants: number;
  activeParticipants: number;
}
function ActiveParticipantsWidget({
  totalParticipants,
  activeParticipants,
}: ActiveParticipantsWidgetProps) {
  return (
    <div className="relative flex h-20 w-full items-center justify-center rounded-lg border border-gray-500 bg-gray-800 shadow-md">
      <div className="relative h-[60px] w-[60px]">
        <div className="absolute inset-1 rounded-full bg-gray-900" />
        <div className="absolute">
          <ProgressCircle radius={30} percentage={0.21} strokeWidth={3} className="stroke-blue-400" />
        </div>
      </div>
      <div className="absolute flex flex-col items-center">
        <span className="text-sm">21</span>
        <span className="-mt-0.5 text-xs text-gray-200">active</span>
      </div>
    </div>
  );
}

interface ValueDistributionWidgetProps {
  entries: Array<{
    metric: Metric;
    value: number;
  }>;
}

function ValueDistributionWidget({ entries }: ValueDistributionWidgetProps) {
  const total = entries.reduce((acc, cur) => (acc += cur.value), 0);

  const mappedEntries = entries
    .sort((a, b) => b.value - a.value)
    .map((entry) => {
      const percent = Math.round((entry.value / total) * 100);

      return {
        percent,
        ...entry,
      };
    });

  return (
    <div className="relative flex w-full flex-col gap-4 rounded-lg border border-gray-500 bg-gray-800 p-3 shadow-md">
      <div className="flex flex-col gap-y-0.5">
        <span className="text-sm font-medium text-white">Exp distribution</span>
        <span className="text-xs text-gray-200">Velit reprehenderit est nostrud proident esse</span>
      </div>
      <Tooltip>
        <TooltipTrigger className="-my-1 w-full py-1">
          <div className="flex h-1.5 w-full gap-x-[2px] overflow-hidden rounded bg-gray-500">
            {mappedEntries.map((e) => (
              <div
                key={e.metric}
                style={{
                  background: getMetricPrimaryColor(e.metric),
                  height: `100%`,
                  width: `${e.percent}%`,
                }}
              />
            ))}
          </div>
        </TooltipTrigger>
        <TooltipContent align="start" className="min-w-[15rem] p-0">
          <div className="flex flex-col p-2">
            {mappedEntries.map((e) => (
              <div
                key={e.metric}
                className="flex h-7 flex-row items-center justify-between gap-x-6 rounded px-1.5"
              >
                <div className="flex min-w-0 flex-row items-center gap-x-1.5">
                  <MetricIconSmall metric={e.metric} />
                  <span className="truncate text-xs text-gray-100">{MetricProps[e.metric].name}</span>
                </div>
                <span className="shrink-0 text-xs font-medium tabular-nums text-white">
                  {formatNumber(e.value, true)}
                  <span className="ml-1.5 font-normal text-gray-200">
                    ({((e.value / total) * 100).toFixed(1)}%)
                  </span>
                </span>
              </div>
            ))}
          </div>
          <div className="flex h-9 flex-row items-center justify-between gap-x-6 border-t border-gray-500 px-3.5 text-xs">
            <span className="text-gray-200">Total</span>
            <span className="font-medium tabular-nums text-white">{formatNumber(total, true)}</span>
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

interface MomentumWidgetProps {
  metric: Metric | "total";
  previous: CompetitionDetailsResponse["participations"];
  current: CompetitionDetailsResponse["participations"];
  maxCount?: number;
}

/**
 * Indexes a snapshot by player, ranking them by gained value (descending).
 *
 * The API already returns participations in this order, but only for the competition's
 * sorting metric, so we re-sort to stay correct for any metric we're asked to show.
 */
function indexSnapshot(
  participations: CompetitionDetailsResponse["participations"],
  metric: Metric | "total",
) {
  const ranked = participations
    .flatMap((p) => {
      const values = p.deltas.find((d) => d.metric === metric)?.values;
      return values === undefined ? [] : [{ playerId: p.playerId, player: p.player, values }];
    })
    .sort((a, b) => b.values.gained - a.values.gained);

  return {
    byPlayerId: new Map(ranked.map((e, index) => [e.playerId, { ...e, standing: index + 1 }])),
    // Indexed by standing - 1, so we can look up whoever holds a given position.
    gainedByStanding: ranked.map((e) => e.values.gained),
  };
}

function calculateMomentumEntries(
  metric: Metric | "total",
  previous: CompetitionDetailsResponse["participations"],
  current: CompetitionDetailsResponse["participations"],
  maxCount: number,
) {
  const previousSnapshot = indexSnapshot(previous, metric);
  const currentSnapshot = indexSnapshot(current, metric);

  return Array.from(currentSnapshot.byPlayerId.values())
    .flatMap((currentEntry) => {
      const previousEntry = previousSnapshot.byPlayerId.get(currentEntry.playerId);

      if (previousEntry === undefined) {
        return [];
      }

      // -1 means the player was unranked (or had no snapshot) at that point in time,
      // so there's no baseline to measure a gain against.
      if (previousEntry.values.end === -1 || currentEntry.values.end === -1) {
        return [];
      }

      const gained = currentEntry.values.end - previousEntry.values.end;

      if (gained <= 0) {
        return [];
      }

      // Everyone measures themselves against 1st place, except 1st place themselves,
      // who measure their lead over 2nd.
      const targetStanding = currentEntry.standing === 1 ? 2 : 1;

      // Measured against the same position on both snapshots, so the "before" reflects how
      // far off that position they were then, not how far off the player who now holds it.
      const currentGap = (currentSnapshot.gainedByStanding[targetStanding - 1] ?? 0) - currentEntry.values.gained; // prettier-ignore
      const previousGap = (previousSnapshot.gainedByStanding[targetStanding - 1] ?? 0) - previousEntry.values.gained; // prettier-ignore

      return [
        {
          player: currentEntry.player,
          gained,
          previousValue: previousEntry.values.end,
          currentValue: currentEntry.values.end,
          previousStanding: previousEntry.standing,
          currentStanding: currentEntry.standing,
          // Positive means the player climbed the leaderboard.
          standingsGained: previousEntry.standing - currentEntry.standing,
          targetStanding,
          currentGap,
          previousGap,
        },
      ];
    })
    .sort((a, b) => b.gained - a.gained)
    .slice(0, maxCount);
}

function getGapCaption(entry: ReturnType<typeof calculateMomentumEntries>[number]) {
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

function MomentumWidget({ metric, previous, current, maxCount = 5 }: MomentumWidgetProps) {
  const entries = calculateMomentumEntries(metric, previous, current, maxCount);

  console.log(entries);

  return (
    <div className="rounded-lg border border-gray-600 bg-gray-800 px-4 py-3">
      <div className="mb-3 flex flex-col gap-x-1">
        <span className="text-base text-white">Momentum</span>
        <span className="text-xs text-gray-200">
          Highest gains in the <span className="text-white">past 24h</span>
        </span>
      </div>
      <ListTable>
        {entries.map((entry, index) => (
          <ListTableRow key={entry.player.id} className="shadow-none">
            {/* w-full + max-w-0 lets this column absorb the slack and clip, instead of
                growing the auto-layout table past its container */}
            <ListTableCell className="w-full max-w-0 first:pl-4">
              <PlayerIdentity player={entry.player} caption={getGapCaption(entry)} />
            </ListTableCell>
            <ListTableCell className="pl-0 last:pr-4">
              <div className="flex justify-end">
                <FormattedNumber value={entry.gained} colored />
              </div>
            </ListTableCell>
          </ListTableRow>
        ))}
      </ListTable>
    </div>
  );
}

interface MetricTabsProps {
  metrics: Array<Metric>;
  selectedMetric: Metric | "total";
  onMetricSelected: (metric: Metric | "total") => void;
}

function MetricTabButton({
  isSelected,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { isSelected: boolean }) {
  return (
    <button
      className={cn(
        "inline-flex h-8 items-center justify-between gap-x-1.5 whitespace-nowrap rounded-md border border-gray-500 bg-gray-800 px-3 text-sm font-medium transition-colors duration-75",
        isSelected ? "border-gray-400 bg-gray-600 text-white" : "text-gray-100 hover:bg-gray-700",
      )}
      {...props}
    />
  );
}

function MetricTabs({ metrics, onMetricSelected, selectedMetric }: MetricTabsProps) {
  return (
    <div className="flex flex-row gap-x-2">
      <MetricTabButton isSelected={selectedMetric === "total"} onClick={() => onMetricSelected("total")}>
        Total
      </MetricTabButton>
      {metrics.map((metric) => (
        <MetricTabButton
          key={metric}
          isSelected={selectedMetric === metric}
          onClick={() => onMetricSelected(metric)}
        >
          <div className="-ml-1.5 shrink-0">
            <MetricIconSmall metric={metric} />
          </div>
          {MetricProps[metric].name}
        </MetricTabButton>
      ))}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            aria-label="Add metric"
            className="flex h-7 w-7 items-center justify-center rounded-md border border-dashed border-gray-500 text-gray-200 outline-none hover:border-gray-300 hover:text-gray-100"
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <QueryLink query={{ dialog: "preview-metric" }}>
            <DropdownMenuItem>Preview metric</DropdownMenuItem>
          </QueryLink>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

type TimeRangePreset = "live" | "first-24h" | "last-24h" | "last-7d" | "custom";

const TIME_RANGE_PRESETS: Array<{
  id: TimeRangePreset;
  label: string;
  range?: string;
}> = [
  { id: "live", label: "Live (now)" },
  { id: "first-24h", label: "First 24 hours", range: "14 Jun, 17:00 – 15 Jun, 17:00" },
  { id: "last-24h", label: "Last 24 hours", range: "20 Jun, 17:00 – 21 Jun, 17:00" },
  { id: "last-7d", label: "Last 7 days", range: "14 Jun, 17:00 – 21 Jun, 17:00" },
  { id: "custom", label: "Custom range..." },
];

function TimeRangePicker() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center rounded-lg border border-gray-600 bg-gray-800">
      <div className="flex h-full items-center border-r border-gray-600 px-2">
        <CalendarIcon className="h-4 w-4 text-gray-200" />
      </div>
      <div className="flex grow items-center gap-x-1.5 px-2 py-1.5">
        <span className="text-sm text-white">14 Jun, 15:00</span>
        <ArrowRightIcon className="h-4 w-4 text-gray-200" />
        <span className="text-sm text-white">21 Jun, 15:00</span>
        {/* <span className="text-xs text-gray-200">· 7d</span> */}
        <div className="flex grow items-center justify-end">
          <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
            <PopoverPrimitive.Trigger asChild>
              <Button size="sm" className="bg-gray-600 px-1.5 py-0.5 text-green-500">
                Live
                <ChevronDownIcon className="-ml-0.5 -mr-0.5 h-3 w-3 text-white" />
              </Button>
            </PopoverPrimitive.Trigger>
            <PopoverPrimitive.Portal>
              <PopoverPrimitive.Content
                align="end"
                sideOffset={8}
                className={cn(
                  "z-10 w-[38rem] overflow-hidden rounded-lg border border-gray-500 bg-gray-800 text-gray-100 shadow-lg outline-none",
                  "animate-in data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
                )}
              >
                <TimeRangePopover onClose={() => setOpen(false)} />
              </PopoverPrimitive.Content>
            </PopoverPrimitive.Portal>
          </PopoverPrimitive.Root>
        </div>
      </div>
    </div>
  );
}

function TimeRangePopover(props: { onClose: () => void }) {
  const [selected, setSelected] = useState<TimeRangePreset>("live");

  return (
    <div className="flex">
      {/* Presets column */}
      <div className="flex w-56 shrink-0 flex-col border-r border-gray-600 p-2">
        <span className="px-2 py-1.5 text-xs font-medium text-gray-200">Presets</span>
        {TIME_RANGE_PRESETS.map((preset) => {
          const isSelected = preset.id === selected;
          const isLive = preset.id === "live";
          const isCustom = preset.id === "custom";

          return (
            <button
              key={preset.id}
              onClick={() => setSelected(preset.id)}
              className={cn(
                "flex items-start gap-x-2.5 rounded-md px-2 py-2 text-left transition-colors",
                isSelected ? "bg-gray-700 shadow-inner-border" : "hover:bg-gray-700/50",
              )}
            >
              <span className="flex h-4 w-4 shrink-0 items-center justify-center pt-0.5">
                {isLive ? (
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      isSelected ? "bg-green-500 shadow-[0_0_6px] shadow-green-500" : "bg-gray-400",
                    )}
                  />
                ) : (
                  <CalendarIcon
                    className={cn("h-3.5 w-3.5", isSelected ? "text-blue-400" : "text-gray-200")}
                  />
                )}
              </span>
              <span className="flex flex-col gap-y-0.5">
                <span className={cn("text-sm", isSelected ? "text-white" : "text-gray-100")}>
                  {preset.label}
                </span>
                {preset.range && <span className="text-xs text-gray-200">{preset.range}</span>}
              </span>
            </button>
          );
        })}
      </div>

      {/* Detail column */}
      <div className="flex grow flex-col p-4">
        {selected === "custom" ? (
          <CustomRangePanel onClose={props.onClose} />
        ) : (
          <LiveRangePanel onClose={props.onClose} />
        )}
      </div>
    </div>
  );
}

function LiveRangePanel(props: { onClose: () => void }) {
  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-base font-medium text-white">Live (now)</span>
        <span className="rounded border border-green-500/40 px-1.5 py-0.5 text-xs font-medium text-green-500">
          Live
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-6">
        <div className="flex flex-col gap-y-1">
          <span className="text-xs text-gray-200">Start</span>
          <span className="text-lg text-white">14 Jun, 17:00</span>
        </div>
        <div className="flex flex-col gap-y-1">
          <span className="text-xs text-gray-200">End</span>
          <span className="text-lg text-white">21 Jun, 17:00</span>
        </div>
      </div>

      {/* Track */}
      <div className="mt-6 px-1">
        <div className="relative h-1 rounded-full bg-green-500">
          <span className="absolute left-0 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-green-500 bg-white" />
          <span className="absolute left-1/2 top-1/2 h-4 w-0.5 -translate-x-1/2 -translate-y-1/2 bg-green-500" />
          <span className="absolute right-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 translate-x-1/2 rounded-full border-2 border-green-500 bg-white" />
        </div>
        <div className="mt-2 flex justify-between text-xs">
          <span className="text-gray-200">14 Jun</span>
          <span className="text-green-500">Now</span>
          <span className="text-gray-200">21 Jun</span>
        </div>
      </div>

      <div className="-mx-4 mt-4 border-t border-gray-600" />

      <div className="mt-3 flex items-center justify-between">
        <span className="flex items-center gap-x-1.5 text-xs text-gray-200">
          <InfoIcon className="h-4 w-4 text-gray-300" />
          Data updates automatically.
        </span>
        <button
          onClick={props.onClose}
          className="flex items-center gap-x-1.5 text-sm font-medium text-blue-400 hover:text-blue-300"
        >
          <SyncIcon className="h-4 w-4" />
          Reset to live
        </button>
      </div>
    </>
  );
}

function CustomRangePanel(props: { onClose: () => void }) {
  return (
    <>
      <span className="mb-4 text-base font-medium text-white">Custom range</span>

      <div className="grid grid-cols-2 gap-x-4">
        <div className="flex flex-col gap-y-1.5">
          <span className="text-xs text-gray-200">Start</span>
          <div className="flex items-center justify-between rounded-md border border-gray-600 bg-gray-900 px-3 py-2">
            <span className="text-sm text-white">16 Jun, 10:30</span>
            <CalendarIcon className="h-4 w-4 text-gray-200" />
          </div>
        </div>
        <div className="flex flex-col gap-y-1.5">
          <span className="text-xs text-gray-200">End</span>
          <div className="flex items-center justify-between rounded-md border border-gray-600 bg-gray-900 px-3 py-2">
            <span className="text-sm text-white">18 Jun, 14:22</span>
            <CalendarIcon className="h-4 w-4 text-gray-200" />
          </div>
        </div>
      </div>

      {/* Range track */}
      <div className="mt-6 px-1">
        <div className="relative h-1 rounded-full bg-gray-600">
          <span className="absolute left-0 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-500" />
          <span className="absolute left-[35%] right-[25%] top-1/2 h-1 -translate-y-1/2 rounded-full bg-blue-500" />
          <span className="absolute left-[35%] top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-blue-500 bg-white" />
          <span className="absolute right-[25%] top-1/2 h-4 w-4 -translate-y-1/2 translate-x-1/2 rounded-full border-2 border-blue-500 bg-white" />
          <span className="absolute right-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 translate-x-1/2 rounded-full bg-gray-500" />
        </div>
        <div className="mt-2 flex justify-between text-xs text-gray-200">
          <span>14 Jun</span>
          <span>21 Jun</span>
        </div>
      </div>

      <div className="-mx-4 mt-4 border-t border-gray-600" />

      <div className="mt-3 flex items-center justify-end gap-x-2">
        <Button size="md" variant="outline" onClick={props.onClose}>
          Cancel
        </Button>
        <Button size="md" variant="blue" onClick={props.onClose}>
          Apply
        </Button>
      </div>
    </>
  );
}

const MOCK_METRIC = Metric.AGILITY;

interface MockPlayer {
  id: number;
  displayName: string;
  type: string;
  country?: string;
  patron?: boolean;
  /** Their xp when the competition started. */
  start: number;
  /** Competition xp gained as of each snapshot. null = absent from that snapshot. */
  previousGained: number | null;
  currentGained: number | null;
  /** Had no snapshot yet 24h ago, so the API reports -1 for their values. */
  unrankedBefore?: boolean;
}

const MOCK_PLAYERS: MockPlayer[] = [
  // Held first place 24h ago, has since been overtaken.
  {
    id: 1,
    displayName: "Zezima",
    type: "regular",
    country: "NL",
    patron: true,
    start: 13_034_431,
    previousGained: 1_240_000,
    currentGained: 1_310_000,
  },
  // Took over first place in the last 24h.
  {
    id: 2,
    displayName: "B0aty",
    type: "regular",
    country: "IE",
    start: 8_120_004,
    previousGained: 1_180_000,
    currentGained: 1_405_000,
  },
  {
    id: 3,
    displayName: "Woox",
    type: "regular",
    country: "CZ",
    start: 24_500_000,
    previousGained: 980_000,
    currentGained: 1_150_000,
  },
  // Barely moved.
  {
    id: 4,
    displayName: "SoloMission",
    type: "ironman",
    country: "GB",
    start: 4_200_000,
    previousGained: 860_000,
    currentGained: 862_500,
  },
  {
    id: 5,
    displayName: "Framed",
    type: "regular",
    country: "CA",
    start: 6_750_000,
    previousGained: 720_000,
    currentGained: 990_000,
  },
  // Completely inactive in the window, should be filtered out.
  {
    id: 6,
    displayName: "Torvesta",
    type: "regular",
    country: "GB",
    start: 5_100_000,
    previousGained: 690_000,
    currentGained: 690_000,
  },
  {
    id: 7,
    displayName: "Sick Nerd",
    type: "hardcore",
    country: "US",
    start: 3_980_000,
    previousGained: 540_000,
    currentGained: 812_000,
  },
  {
    id: 8,
    displayName: "Odablock",
    type: "regular",
    country: "US",
    start: 9_340_000,
    previousGained: 500_000,
    currentGained: 500_000,
  },
  {
    id: 9,
    displayName: "Faux",
    type: "ultimate",
    country: "SE",
    start: 2_450_000,
    previousGained: 430_000,
    currentGained: 445_000,
  },
  // Biggest gainer of the window, huge climb up the leaderboard.
  {
    id: 10,
    displayName: "Settled",
    type: "ironman",
    country: "AU",
    start: 7_820_000,
    previousGained: 380_000,
    currentGained: 1_020_000,
  },
  {
    id: 11,
    displayName: "Verf",
    type: "regular",
    country: "NL",
    start: 1_100_000,
    previousGained: 350_000,
    currentGained: 351_200,
  },
  // Unranked 24h ago (no snapshot), so there's no baseline to measure against.
  {
    id: 12,
    displayName: "Skiddler",
    type: "regular",
    start: 640_000,
    previousGained: 0,
    currentGained: 310_000,
    unrankedBefore: true,
  },
  // Only joined the competition in the last 24h.
  {
    id: 13,
    displayName: "Rhys",
    type: "ironman",
    country: "GB",
    start: 890_000,
    previousGained: null,
    currentGained: 260_000,
  },
  {
    id: 14,
    displayName: "Purpp",
    type: "regular",
    country: "US",
    start: 3_310_000,
    previousGained: 300_000,
    currentGained: 318_000,
  },
  {
    id: 15,
    displayName: "C Engineer",
    type: "hardcore",
    country: "DE",
    start: 1_870_000,
    previousGained: 240_000,
    currentGained: 240_000,
  },
  {
    id: 16,
    displayName: "Iron Mammal",
    type: "ironman",
    country: "GB",
    start: 2_040_000,
    previousGained: 180_000,
    currentGained: 196_500,
  },
  {
    id: 17,
    displayName: "Tanzoo",
    type: "regular",
    country: "US",
    start: 760_000,
    previousGained: 150_000,
    currentGained: 150_000,
  },
  {
    id: 18,
    displayName: "Virtoso",
    type: "regular",
    country: "BR",
    start: 980_000,
    previousGained: 120_000,
    currentGained: 132_000,
  },
  {
    id: 19,
    displayName: "Alfie",
    type: "ultimate",
    country: "GB",
    start: 430_000,
    previousGained: 90_000,
    currentGained: 90_000,
  },
  {
    id: 20,
    displayName: "Mr Mammal",
    type: "regular",
    country: "FI",
    start: 1_520_000,
    previousGained: 60_000,
    currentGained: 74_000,
  },
  // Tiny gain, to check the low end of the formatting.
  {
    id: 21,
    displayName: "Gnomonkey",
    type: "regular",
    country: "PT",
    start: 210_000,
    previousGained: 25_000,
    currentGained: 25_300,
  },
  // Left the competition since the last snapshot.
  {
    id: 22,
    displayName: "Kempq",
    type: "regular",
    country: "PL",
    start: 95_000,
    previousGained: 8_000,
    currentGained: null,
  },
];

function mockParticipation(player: MockPlayer, values: { start: number; end: number; gained: number }) {
  return {
    playerId: player.id,
    player: {
      id: player.id,
      username: player.displayName.toLowerCase(),
      displayName: player.displayName,
      type: player.type,
      status: "active",
      country: player.country ?? null,
      patron: player.patron ?? false,
    },
    deltas: [{ metric: MOCK_METRIC, values, levels: { start: 0, end: 0, gained: 0 } }],
  } as unknown as CompetitionDetailsResponse["participations"][number];
}

/** Builds a snapshot the way the API returns one: sorted by gained, descending. */
function buildMockSnapshot(key: "previousGained" | "currentGained") {
  return MOCK_PLAYERS.flatMap((player) => {
    const gained = player[key];

    if (gained === null) {
      return [];
    }

    if (key === "previousGained" && player.unrankedBefore) {
      return [{ player, values: { start: -1, end: -1, gained: 0 } }];
    }

    return [{ player, values: { start: player.start, end: player.start + gained, gained } }];
  })
    .sort((a, b) => b.values.gained - a.values.gained)
    .map(({ player, values }) => mockParticipation(player, values));
}

const MOCK_PREVIOUS = buildMockSnapshot("previousGained");
const MOCK_CURRENT = buildMockSnapshot("currentGained");

export default function TestPage() {
  const [selectedMetric, setSelectedMetric] = useState<Metric | "total">(Metric.AGILITY);

  return (
    <Container className="flex flex-col gap-5">
      <div className="w-[115px]">
        <ActiveParticipantsWidget totalParticipants={498} activeParticipants={21} />
      </div>
      <div className="w-[353px]">
        <ValueDistributionWidget
          entries={[
            {
              metric: Metric.AGILITY,
              value: 12465,
            },
            {
              metric: Metric.HERBLORE,
              value: 23485,
            },
            {
              metric: Metric.WOODCUTTING,
              value: 84940,
            },
          ]}
        />
      </div>

      <div className="flex w-full gap-x-5">
        <div className="flex w-[360px] flex-col gap-y-4">
          <TimeRangePicker />
          <MomentumWidget
            metric={MOCK_METRIC}
            previous={MOCK_PREVIOUS}
            current={MOCK_CURRENT}
            maxCount={5}
          />
        </div>
        <MetricTabs
          metrics={[Metric.AGILITY, Metric.HERBLORE, Metric.MAGIC]}
          selectedMetric={selectedMetric}
          onMetricSelected={setSelectedMetric}
        />
      </div>
    </Container>
  );
}
