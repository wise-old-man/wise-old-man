"use client";

import { Period, PeriodProps, Player } from "@wise-old-man/utils";
import { useTicker } from "~/hooks/useTicker";
import { formatDatetime, timeago } from "~/utils/dates";
import { Tooltip, TooltipContent, TooltipTrigger } from "../Tooltip";

interface PlayerGainedTimeCardsProps {
  player: Player;
  period: Period;
  startDate: Date | null;
}

export function PlayerGainedTimeCards(props: PlayerGainedTimeCardsProps) {
  const { player, period, startDate } = props;

  useTicker(1000);

  const expDropDate = startDate
    ? new Date(startDate.getTime() + PeriodProps[period].milliseconds)
    : null;

  return (
    <>
      <InfoPanel label="Last updated" date={player.updatedAt || new Date()} />
      <InfoPanel label="Last progressed" date={player.lastChangedAt || new Date()} />
      <InfoPanel label="Earliest snapshot in period" date={startDate} />
      <InfoPanel label="Exp drop in" date={expDropDate} />
    </>
  );
}

interface InfoPanelProps {
  label: string;
  date: Date | null;
}

function InfoPanel(props: InfoPanelProps) {
  return (
    <div className="flex flex-col items-start gap-y-1 rounded-lg border border-gray-600 p-4">
      <span className="text-xs text-gray-200">{props.label}</span>
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
    </div>
  );
}
