"use client";

import { durationBetween } from "~/utils/dates";
import { LocalDate } from "../LocalDate";
import { Tooltip, TooltipContent, TooltipTrigger } from "../Tooltip";
import { useCompetitionPageContext } from "./CompetitionPageContext";

import ArrowRightIcon from "~/assets/arrow_right.svg";
import CalendarIcon from "~/assets/calendar.svg";

export function CompetitionTimeRangePicker() {
  const { competition } = useCompetitionPageContext();

  const duration = durationBetween(competition.startsAt, competition.endsAt);
  const shouldShortenDuration = duration.days > 0 && duration.hours > 0 && duration.minutes > 0;

  const durationSegments = [];
  if (duration.days > 0) {
    durationSegments.push(`${duration.days}${shouldShortenDuration ? "d" : " days"}`);
  }
  if (duration.hours > 0) {
    durationSegments.push(`${duration.hours}${shouldShortenDuration ? "h" : " hours"}`);
  }
  if (duration.minutes > 0) {
    durationSegments.push(`${duration.minutes}${shouldShortenDuration ? "m" : " minutes"}`);
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-x-3 rounded-lg border border-gray-500 bg-gray-800 px-4 py-3 shadow-md">
          <div className="rounded border border-gray-600 p-1.5">
            <CalendarIcon className="h-4 w-4 text-gray-200" />
          </div>
          <div className="flex flex-col">
            <div className="flex flex-row items-center gap-x-1.5">
              <span className="text-sm text-white">
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
              <span className="text-sm text-white">
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
            </div>
            <span className="text-xs text-gray-200">{durationSegments.join(", ")}</span>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent align="start" className="p-0 text-xs">
        <div className="border-b border-gray-500 px-3 py-2 font-medium text-white">Times in UTC</div>
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
      </TooltipContent>
    </Tooltip>
  );
}
