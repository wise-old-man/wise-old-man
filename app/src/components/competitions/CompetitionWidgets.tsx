"use client";

import { useState } from "react";
import {
  CompetitionDetailsResponse,
  MetricDelta,
  Metric,
  MetricProps,
  isActivity,
  isBoss,
  padNumber,
  formatNumber,
  MetricType,
} from "@wise-old-man/utils";
import { useTicker } from "~/hooks/useTicker";
import { convertToUTC, durationBetween } from "~/utils/dates";
import { useHasMounted } from "~/hooks/useHasMounted";
import { cn } from "~/utils/styling";
import {
  Combobox,
  ComboboxContent,
  ComboboxItem,
  ComboboxItemGroup,
  ComboboxItemsContainer,
  ComboboxTrigger,
} from "../Combobox";
import { Label } from "../Label";
import { Badge } from "../Badge";
import { MetricIcon } from "../Icon";
import { LocalDate } from "../LocalDate";

import ArrowUpIcon from "~/assets/arrow_up.svg";
import ChevronDownIcon from "~/assets/chevron_down.svg";
import ImageWithFallback from "../ImageWithFallback";

type TopParticipantSorting = "by_value" | "by_percent";
type TopParticipant = CompetitionDetailsResponse["participations"][number];

interface CompetitionWidgetsProps {
  focusedMetric: Metric | "total";
  competition: CompetitionDetailsResponse;
}

export function CompetitionWidgets(props: CompetitionWidgetsProps) {
  const { focusedMetric, competition } = props;
  const { startsAt, endsAt, participations } = competition;

  const [showUTC, setShowUTC] = useState(false);
  const [showAverage, setShowAverage] = useState(false);
  const [topParticipantSorting, setTopParticipantSorting] = useState<TopParticipantSorting>("by_value");

  const isUpcoming = startsAt.getTime() > Date.now();
  const topParticipant = getTopParticipant(topParticipantSorting, participations, focusedMetric);

  const metricType =
    focusedMetric === "total"
      ? MetricProps[competition.metrics[0].metric].type
      : MetricProps[focusedMetric].type;

  return (
    <div className="grid grid-cols-1 gap-x-3 gap-y-7 md:grid-cols-2 xl:grid-cols-4">
      <div>
        <TimezoneSelector showUTC={showUTC} onShowUTCChanged={setShowUTC} />
        <CompetitionDuration startsAt={startsAt} endsAt={endsAt} showUTC={showUTC} />
      </div>
      <div>
        <Label suppressHydrationWarning className="mb-2 block text-xs text-gray-200">
          {isUpcoming ? "Time until start" : "Time remaining"}
        </Label>
        <CompetitionCountdown startsAt={startsAt} endsAt={endsAt} />
      </div>
      <div>
        <TopParticipantSelector
          sorting={topParticipantSorting}
          onSortingChanged={setTopParticipantSorting}
        />
        <TopParticipantWidget
          focusedMetric={focusedMetric}
          metricType={metricType}
          topParticipant={topParticipant}
        />
      </div>
      <div>
        <AverageSelector showAverage={showAverage} onShowAverageChanged={setShowAverage} />
        <GainedWidget
          focusedMetric={focusedMetric}
          participations={participations}
          showAverage={showAverage}
        />
      </div>
    </div>
  );
}

interface TopParticipantWidgetrops {
  focusedMetric: Metric | "total";
  metricType: MetricType;
  topParticipant: TopParticipant | null;
}

function TopParticipantWidget(props: TopParticipantWidgetrops) {
  const { focusedMetric, metricType, topParticipant } = props;

  if (!topParticipant) {
    return (
      <div className="flex h-24 w-full items-center justify-center overflow-hidden rounded-lg border border-gray-500 px-5 text-gray-400">
        No participants
      </div>
    );
  }

  const { player, deltas } = topParticipant;

  const values = deltas.find((d) => d.metric === focusedMetric)?.values;
  const gained = values?.gained ?? 0;

  return (
    <div className="flex h-24 w-full items-center overflow-hidden rounded-lg border border-gray-500 bg-gray-800 px-5 shadow-md">
      <div className="flex w-full items-end justify-between">
        <div className="flex flex-col gap-y-px">
          <span className="text-base font-medium text-white">{player.displayName}</span>
          <span className={cn("text-sm font-medium", gained > 0 && "text-green-500")}>
            {gained > 0 ? "+" : ""}
            {formattedGained(gained, metricType)}
          </span>
        </div>
        {gained > 0 && (
          <Badge variant="success">
            <ArrowUpIcon className="-ml-1 h-5 w-5" />
            {Math.floor(getPercentGained(focusedMetric, values) * 100)}%
          </Badge>
        )}
      </div>
    </div>
  );
}

interface GainedWidgetProps {
  focusedMetric: Metric | "total";
  showAverage: boolean;
  participations: TopParticipant[];
}

function GainedWidget(props: GainedWidgetProps) {
  const { focusedMetric, showAverage, participations } = props;

  const sum = participations.reduce(
    (acc, p) => acc + (p.deltas.find((d) => d.metric === focusedMetric)?.values.gained ?? 0),
    0,
  );

  const value = showAverage ? Math.floor(sum / participations.length) : sum;

  return (
    <div
      className={cn(
        "relative flex h-24 w-full items-center gap-x-4 overflow-hidden rounded-lg border border-gray-500 px-6",
        focusedMetric === "total" && "bg-gray-800",
      )}
    >
      {focusedMetric !== "total" && (
        <>
          <ImageWithFallback
            alt={focusedMetric}
            fill
            className="pointer-events-none z-0 object-cover"
            src={`/img/backgrounds/${focusedMetric}.png`}
          />
          <div className="z-1 relative mr-2 scale-150">
            <MetricIcon metric={focusedMetric} />
          </div>
        </>
      )}
      <div className="z-1 relative flex flex-col gap-y-0.5">
        <span className="text-xs text-gray-100">
          {focusedMetric === "total" ? "Total" : MetricProps[focusedMetric].name}
        </span>
        <span className="text-xl font-medium">{formatNumber(value)}</span>
      </div>
    </div>
  );
}

interface CompetitionCountdownProps {
  startsAt: Date;
  endsAt: Date;
}

function CompetitionCountdown(props: CompetitionCountdownProps) {
  const { startsAt, endsAt } = props;

  const hasMounted = useHasMounted();

  const now = new Date();

  // Update this component every second (if the competition isn't over)
  useTicker(1000, hasMounted && endsAt > now);

  const isOngoing = startsAt < now && endsAt > now;

  const progress = getProgress(startsAt, endsAt);
  const { days, hours, minutes, seconds } = durationBetween(new Date(), isOngoing ? endsAt : startsAt);

  return (
    <div className="relative flex h-24 w-full items-center justify-around overflow-hidden rounded-lg border border-gray-500 bg-gray-800 px-3 shadow-md">
      <div className="flex flex-col items-center">
        <span className="text-2xl font-medium">{padNumber(days)}</span>
        <span className="text-xs text-gray-200">days</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-2xl font-medium">{padNumber(hours)}</span>
        <span className="text-xs text-gray-200">hours</span>
      </div>
      <div className="flex flex-col items-center">
        <span suppressHydrationWarning className="text-2xl font-medium">
          {padNumber(minutes)}
        </span>
        <span className="text-xs text-gray-200">mins</span>
      </div>
      <div className="flex flex-col items-center">
        <span suppressHydrationWarning className="text-2xl font-medium">
          {padNumber(seconds)}
        </span>
        <span className="text-xs text-gray-200">secs</span>
      </div>
      {hasMounted && isOngoing && progress > 0 && (
        <div className="absolute bottom-0 left-0 right-0">
          <div className="h-[2px] bg-green-500" style={{ width: `${Math.floor(progress * 100)}%` }} />
        </div>
      )}
    </div>
  );
}

interface CompetitionDurationProps {
  startsAt: Date;
  endsAt: Date;
  showUTC: boolean;
}

function CompetitionDuration(props: CompetitionDurationProps) {
  const { showUTC } = props;

  const duration = durationBetween(props.startsAt, props.endsAt);
  const shouldShortenDuration = duration.days > 0 && duration.hours > 0 && duration.minutes > 0;

  const durationSegments = [];
  if (duration.days > 0)
    durationSegments.push(`${duration.days}${shouldShortenDuration ? "d" : " days"}`);
  if (duration.hours > 0)
    durationSegments.push(`${duration.hours}${shouldShortenDuration ? "h" : " hours"}`);
  if (duration.minutes > 0)
    durationSegments.push(`${duration.minutes}${shouldShortenDuration ? "m" : " minutes"}`);

  return (
    <div className="flex h-24 w-full flex-col items-center overflow-hidden rounded-lg border border-gray-500 bg-gray-800 shadow-md">
      <div className="grid w-full grow grid-cols-2 items-center divide-x divide-gray-500">
        <div className="flex flex-col py-3 pl-3">
          <span className="text-xs text-gray-200">Start</span>
          <span className="line-clamp-1 text-sm">
            <LocalDate
              locale="UTC"
              isoDate={(showUTC ? convertToUTC(props.startsAt) : props.startsAt).toISOString()}
              formatOptions={{ month: "short", day: "numeric", hour: "numeric", minute: "numeric" }}
            />
          </span>
        </div>
        <div className="flex flex-col py-3 pl-3">
          <span className="text-xs text-gray-200">End</span>
          <span className="line-clamp-1 text-sm">
            <LocalDate
              locale="UTC"
              isoDate={(showUTC ? convertToUTC(props.endsAt) : props.endsAt).toISOString()}
              formatOptions={{ month: "short", day: "numeric", hour: "numeric", minute: "numeric" }}
            />
          </span>
        </div>
      </div>
      <div className="line-clamp-1 w-full overflow-hidden truncate border-t border-gray-500 py-2 pl-3 text-xs text-gray-200">
        Duration: {durationSegments.join(", ")}
      </div>
    </div>
  );
}

interface TopParticipantSelectorProps {
  sorting: TopParticipantSorting;
  onSortingChanged: (val: TopParticipantSorting) => void;
}

function TopParticipantSelector(props: TopParticipantSelectorProps) {
  const { sorting, onSortingChanged } = props;

  return (
    <Combobox
      value={sorting}
      onValueChanged={(val) => {
        onSortingChanged(val as TopParticipantSorting);
      }}
    >
      <ComboboxTrigger className="mb-2 flex items-center gap-x-1 text-xs text-gray-200">
        {sorting === "by_value" ? "Top participant" : "Top participant (%)"}
        <ChevronDownIcon className="h-4 w-4" />
      </ComboboxTrigger>
      <ComboboxContent align="start">
        <ComboboxItemsContainer>
          <ComboboxItemGroup>
            <ComboboxItem value="by_value">By value</ComboboxItem>
            <ComboboxItem value="by_percent">By percent</ComboboxItem>
          </ComboboxItemGroup>
        </ComboboxItemsContainer>
      </ComboboxContent>
    </Combobox>
  );
}

interface AverageSelectorProps {
  showAverage: boolean;
  onShowAverageChanged: (val: boolean) => void;
}

function AverageSelector(props: AverageSelectorProps) {
  const { showAverage, onShowAverageChanged } = props;

  return (
    <Combobox
      value={String(showAverage)}
      onValueChanged={(val) => {
        onShowAverageChanged(val === "true");
      }}
    >
      <ComboboxTrigger className="mb-2 flex items-center gap-x-1 text-xs text-gray-200">
        {!showAverage ? "Total gained" : "Average gained"}
        <ChevronDownIcon className="h-4 w-4" />
      </ComboboxTrigger>
      <ComboboxContent align="start">
        <ComboboxItemsContainer>
          <ComboboxItemGroup>
            <ComboboxItem value="false">Total gained</ComboboxItem>
            <ComboboxItem value="true">Average gained</ComboboxItem>
          </ComboboxItemGroup>
        </ComboboxItemsContainer>
      </ComboboxContent>
    </Combobox>
  );
}

interface TimezoneSelectorProps {
  showUTC: boolean;
  onShowUTCChanged: (val: boolean) => void;
}

function TimezoneSelector(props: TimezoneSelectorProps) {
  const { showUTC, onShowUTCChanged } = props;
  const hasMounted = useHasMounted();

  return (
    <Combobox
      value={showUTC ? "utc" : "local"}
      onValueChanged={(val) => {
        onShowUTCChanged(val === "utc");
      }}
    >
      <ComboboxTrigger className="mb-2 flex items-center gap-x-1 text-xs text-gray-200">
        Duration ({showUTC ? "UTC" : "local timezone"})
        <ChevronDownIcon className="h-4 w-4" />
      </ComboboxTrigger>
      <ComboboxContent align="start">
        <ComboboxItemsContainer>
          <ComboboxItemGroup>
            <ComboboxItem value="local">
              {`Local timezone (${hasMounted ? Intl.DateTimeFormat().resolvedOptions().timeZone : "local timezone"})`}
            </ComboboxItem>
            <ComboboxItem value="utc">UTC</ComboboxItem>
          </ComboboxItemGroup>
        </ComboboxItemsContainer>
      </ComboboxContent>
    </Combobox>
  );
}

function getTopParticipant(
  sorting: TopParticipantSorting,
  participations: TopParticipant[],
  focusedMetric: Metric | "total",
) {
  if (participations.length === 0) return null;
  if (sorting === "by_value") return participations[0];

  return [...participations].sort(
    (a, b) =>
      getPercentGained(focusedMetric, b.deltas.find((d) => d.metric === focusedMetric)?.values) -
      getPercentGained(focusedMetric, a.deltas.find((d) => d.metric === focusedMetric)?.values),
  )[0];
}

function formattedGained(value: number, metricType: MetricType) {
  if (metricType === MetricType.SKILL) {
    return `${formatNumber(value, true)} exp.`;
  }

  if (metricType === MetricType.BOSS) {
    return `${formatNumber(value)} kills`;
  }

  return formatNumber(value);
}

function getPercentGained(metric: Metric | "total", delta: MetricDelta | undefined) {
  if (delta === undefined || delta.gained === 0) return 0;

  let minimum = 0;

  if (isBoss(metric) || isActivity(metric)) {
    minimum = MetricProps[metric].minimumValue - 1;
  }

  const start = delta.start === -1 ? Math.max(minimum, delta.start) : delta.start;

  if (start === 0) return 1;

  return (delta.end - start) / start;
}

function getProgress(startsAt: Date, endsAt: Date) {
  const total = endsAt.getTime() - startsAt.getTime();
  const elapsed = Date.now() - startsAt.getTime();

  return elapsed / total;
}
