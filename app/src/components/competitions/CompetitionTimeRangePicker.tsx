"use client";

import { durationBetween } from "~/utils/dates";
import { LocalDate } from "../LocalDate";
import { Tooltip, TooltipContent, TooltipTrigger } from "../Tooltip";
import { useCompetitionPageContext } from "./CompetitionPageContext";

import ArrowRightIcon from "~/assets/arrow_right.svg";
import CalendarIcon from "~/assets/calendar.svg";

function getDurationSegments(startsAt: Date, endsAt: Date, short: boolean) {
  const duration = durationBetween(startsAt, endsAt);

  const durationSegments = [];
  if (duration.days > 0) {
    durationSegments.push(`${duration.days}${short ? "d" : " days"}`);
  }
  if (duration.hours > 0) {
    durationSegments.push(`${duration.hours}${short ? "h" : " hours"}`);
  }
  if (duration.minutes > 0) {
    durationSegments.push(`${duration.minutes}${short ? "m" : " minutes"}`);
  }

  return durationSegments;
}

export function CompetitionTimeRangePicker() {
  const { competition } = useCompetitionPageContext();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-x-2.5 rounded-lg border border-gray-500 bg-gray-800 px-3 py-2 shadow-md">
          <CalendarIcon className="h-4 w-4 text-gray-200" />
          <div className="flex flex-row items-center gap-x-1.5">
            <span className="whitespace-nowrap text-sm text-white">
              <LocalDate
                isoDate={competition.startsAt.toISOString()}
                formatOptions={{
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                }}
              />
            </span>
            <ArrowRightIcon className="h-4 w-4 text-gray-200" />
            <span className="whitespace-nowrap text-sm text-white">
              <LocalDate
                isoDate={competition.endsAt.toISOString()}
                formatOptions={{
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                }}
              />
            </span>
            <span className="line-clamp-1 text-xs text-gray-200">
              {" · "}&nbsp;
              {getDurationSegments(competition.startsAt, competition.endsAt, true)
                .slice(0, 2)
                .join(", ")}
            </span>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent align="start" className="p-0 text-xs">
        <div className="px-3 pt-2 font-medium text-white">Times in UTC</div>
        <div className="flex flex-col gap-y-1.5 px-3 py-2">
          <div className="flex flex-row justify-between gap-x-6">
            <span className="text-gray-200">Starts at</span>
            <LocalDate
              isoDate={competition.startsAt.toISOString()}
              formatOptions={{
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                timeZone: "UTC",
              }}
            />
          </div>
          <div className="flex flex-row justify-between gap-x-6">
            <span className="text-gray-200">Ends at</span>
            <LocalDate
              isoDate={competition.endsAt.toISOString()}
              formatOptions={{
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                timeZone: "UTC",
              }}
            />
          </div>
        </div>
        <div className="border-t border-gray-500 px-3 py-2 font-medium text-white">
          <div className="flex flex-row justify-between gap-x-6">
            <span className="text-gray-200">Duration</span>
            {getDurationSegments(competition.startsAt, competition.endsAt, false).join(", ")}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
