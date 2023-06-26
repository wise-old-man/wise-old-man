"use client";

import { PeriodProps, Player } from "@wise-old-man/utils";
import { useTicker } from "~/hooks/useTicker";
import { durationBetween, formatDatetime, timeago } from "~/utils/dates";
import { Tooltip, TooltipContent, TooltipTrigger } from "../Tooltip";
import { TimeRangeFilter } from "~/services/wiseoldman";

interface PlayerGainedTimeCardsProps {
  player: Player;
  timeRange: TimeRangeFilter;
  earliestDataDate: Date | null;
}

export function PlayerGainedTimeCards(props: PlayerGainedTimeCardsProps) {
  const { player, timeRange, earliestDataDate } = props;

  useTicker(1000, "period" in timeRange);

  if ("period" in timeRange) {
    const expDropDate = earliestDataDate
      ? new Date(earliestDataDate.getTime() + PeriodProps[timeRange.period].milliseconds)
      : null;

    return (
      <>
        <InfoPanel label="Last updated" date={player.updatedAt || new Date()} />
        <InfoPanel label="Last progressed" date={player.lastChangedAt || new Date()} />
        <InfoPanel label="Earliest snapshot in period" date={earliestDataDate} />
        <InfoPanel label="Exp drop in" date={expDropDate} />
      </>
    );
  }

  const { startDate, endDate } = timeRange;

  const duration = durationBetween(startDate, endDate);
  const durationSegments = [];

  if (duration.days > 0) durationSegments.push(`${duration.days} days`);
  if (duration.hours > 0) durationSegments.push(`${duration.hours} hours`);
  if (duration.minutes > 0) durationSegments.push(`${duration.minutes} minutes`);

  return (
    <>
      <InfoPanel label="Last updated" date={player.updatedAt || new Date()} />
      <InfoPanel label="Last progressed" date={player.lastChangedAt || new Date()} />
      <InfoPanel label="Earliest snapshot in period" date={earliestDataDate} />
      <InfoPanel label="Custom period duration" stringValue={durationSegments.join(", ")} />
    </>
  );
}

interface InfoPanelProps {
  label: string;
  date?: Date | null;
  stringValue?: string;
}

function InfoPanel(props: InfoPanelProps) {
  return (
    <div className="flex flex-col items-start gap-y-1 rounded-lg border border-gray-600 p-4">
      <span className="text-xs text-gray-200">{props.label}</span>
      {props.stringValue ? (
        <span className="text-xs text-white">{props.stringValue}</span>
      ) : (
        <>
          {!props.date ? (
            "---"
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-xs text-white">{timeago.format(props.date)}</span>
              </TooltipTrigger>
              <TooltipContent>{formatDatetime(props.date)}</TooltipContent>
            </Tooltip>
          )}
        </>
      )}
    </div>
  );
}
