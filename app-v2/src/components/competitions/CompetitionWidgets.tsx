"use client";

import { useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
  CompetitionDetails,
  Metric,
  MetricProps,
  ParticipationWithPlayerAndProgress,
  formatNumber,
  isBoss,
  isSkill,
} from "@wise-old-man/utils";
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

import ArrowUpIcon from "~/assets/arrow_up.svg";
import ChevronDownIcon from "~/assets/chevron_down.svg";

type TopParticipantSorting = "by_value" | "by_percent";

// Can't be server rendered - requires browser APIs (setInterval)
const CompetitionCountdown = dynamic(() => import("./CompetitionCountdown"), {
  loading: () => <PlaceholderWidget />,
  ssr: false,
});

// Can't be server rendered - requires the browser's locale to show local time
const CompetitionDuration = dynamic(() => import("./CompetitionDuration"), {
  loading: () => <PlaceholderWidget />,
  ssr: false,
});

export function CompetitionWidgets(props: CompetitionDetails) {
  const { startsAt, endsAt, participations, metric } = props;

  const [showUTC, setShowUTC] = useState(false);
  const [showAverage, setShowAverage] = useState(false);
  const [topParticipantSorting, setTopParticipantSorting] = useState<TopParticipantSorting>("by_value");

  const isUpcoming = startsAt.getTime() > Date.now();
  const topParticipant = getTopParticipant(topParticipantSorting, participations);

  return (
    <div className="mt-5 grid grid-cols-1 gap-x-3 gap-y-5 md:grid-cols-2 xl:grid-cols-4">
      <div>
        <TimezoneSelector showUTC={showUTC} onShowUTCChanged={setShowUTC} />
        <CompetitionDuration startsAt={startsAt} endsAt={endsAt} showUTC={showUTC} />
      </div>
      <div>
        <Label className="mb-2 block text-xs text-gray-300">
          {isUpcoming ? "Time until start" : "Time remaining"}
        </Label>
        <CompetitionCountdown startsAt={startsAt} endsAt={endsAt} />
      </div>
      <div>
        <TopParticipantSelector
          sorting={topParticipantSorting}
          onSortingChanged={setTopParticipantSorting}
        />
        <TopParticipant metric={metric} topParticipant={topParticipant} />
      </div>
      <div>
        <AverageSelector showAverage={showAverage} onShowAverageChanged={setShowAverage} />
        <Gained metric={metric} participations={participations} showAverage={showAverage} />
      </div>
    </div>
  );
}

function PlaceholderWidget() {
  return <div className="h-24 w-full overflow-hidden rounded-lg border border-gray-500 px-3" />;
}

interface TopParticipantProps {
  metric: Metric;
  topParticipant: ParticipationWithPlayerAndProgress | null;
}

function TopParticipant(props: TopParticipantProps) {
  const { metric, topParticipant } = props;

  if (!topParticipant) {
    return (
      <div className="flex h-24 w-full items-center justify-center overflow-hidden rounded-lg border border-gray-500 px-5 text-gray-400">
        No participants
      </div>
    );
  }

  const { player, progress } = topParticipant;
  const percent = 1 - progress.start / progress.end;

  return (
    <div className="flex h-24 w-full items-center overflow-hidden rounded-lg border border-gray-500 px-5">
      <div className="flex w-full items-end justify-between">
        <div className="flex flex-col gap-y-px">
          <span className="text-base font-medium text-white">{player.displayName}</span>
          <span className="text-sm font-medium text-green-400">
            +{formattedGained(progress.gained, metric)}
          </span>
        </div>
        <Badge variant="success">
          <ArrowUpIcon className="-ml-1 h-5 w-5" />
          {Math.floor(percent * 100)}%
        </Badge>
      </div>
    </div>
  );
}

interface GainedProps {
  metric: Metric;
  showAverage: boolean;
  participations: ParticipationWithPlayerAndProgress[];
}

function Gained(props: GainedProps) {
  const { metric, showAverage, participations } = props;

  const total = participations.reduce((acc, p) => acc + p.progress.gained, 0);
  const value = showAverage ? Math.floor(total / participations.length) : total;

  return (
    <div className="relative flex h-24 w-full items-center gap-x-4 overflow-hidden rounded-lg border border-gray-500 px-6">
      <Image
        fill
        alt={metric}
        className="pointer-events-none z-0"
        src={`/img/backgrounds/${metric}.png`}
      />
      <div className="z-1 relative mr-2 scale-150">
        <MetricIcon metric={metric} />
      </div>
      <div className="z-1 relative flex flex-col gap-y-0.5">
        <span className="text-xs text-gray-100">{MetricProps[metric].name}</span>
        <span className="text-xl font-medium">{formatNumber(value)}</span>
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
    <Combobox value={sorting} onValueChanged={(val) => onSortingChanged(val as TopParticipantSorting)}>
      <ComboboxTrigger className="mb-2 flex items-center gap-x-1 text-xs text-gray-300">
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
    <Combobox value={String(showAverage)} onValueChanged={(val) => onShowAverageChanged(val === "true")}>
      <ComboboxTrigger className="mb-2 flex items-center gap-x-1 text-xs text-gray-300">
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

  return (
    <Combobox
      value={showUTC ? "utc" : "local"}
      onValueChanged={(val) => {
        onShowUTCChanged(val === "utc");
      }}
    >
      <ComboboxTrigger className="mb-2 flex items-center gap-x-1 text-xs text-gray-300">
        Duration ({showUTC ? "UTC" : "local timezone"})
        <ChevronDownIcon className="h-4 w-4" />
      </ComboboxTrigger>
      <ComboboxContent align="start">
        <ComboboxItemsContainer>
          <ComboboxItemGroup>
            <ComboboxItem value="local">
              Local timezone ({Intl.DateTimeFormat().resolvedOptions().timeZone})
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
  participations: ParticipationWithPlayerAndProgress[]
) {
  if (participations.length === 0) return null;
  if (sorting === "by_value") return participations[0];

  return participations
    .filter((p) => p.progress.start > -1 && p.progress.end > -1)
    .sort((a, b) => {
      const percentA = 1 - a.progress.start / a.progress.end;
      const percentB = 1 - b.progress.start / b.progress.end;

      return percentB - percentA;
    })[0];
}

function formattedGained(value: number, metric: Metric) {
  if (isSkill(metric)) {
    return `${formatNumber(value, true)} exp.`;
  }

  if (isBoss(metric)) {
    return `${formatNumber(value)} kills`;
  }

  return formatNumber(value);
}
