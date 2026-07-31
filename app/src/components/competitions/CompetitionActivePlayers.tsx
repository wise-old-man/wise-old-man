"use client";

import { ProgressCircle } from "../ProgressCircle";
import { Tooltip, TooltipContent, TooltipTrigger } from "../Tooltip";
import { useCompetitionPageContext } from "./CompetitionPageContext";

export function CompetitionActivePlayers() {
  const { competition } = useCompetitionPageContext();

  const activePlayerCount = competition.participations.filter(
    (p) => p.deltas[0].values.gained > 0,
  ).length;

  const ratio = activePlayerCount / competition.participations.length;

  return (
    <div className="relative flex h-20 w-full items-center justify-center rounded-lg border border-gray-500 bg-gray-800 px-4 shadow-md">
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative h-[64px] w-[64px]">
            <div className="absolute inset-1 rounded-full bg-gray-900" />
            <div className="absolute">
              <ProgressCircle
                radius={32}
                percentage={ratio}
                strokeWidth={3}
                className="stroke-blue-400"
              />
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[16rem]">
          {activePlayerCount} / {competition.participations.length} players have &gt; 0 gains during the
          competition.
        </TooltipContent>
      </Tooltip>
      <div className="pointer-events-none absolute flex flex-col items-center">
        <span className="text-sm">{activePlayerCount}</span>
        <span className="-mt-0.5 text-xs text-gray-200">active</span>
      </div>
    </div>
  );
}
