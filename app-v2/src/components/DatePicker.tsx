"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import { format } from "date-fns";
import { forwardRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import { cn } from "~/utils";
import { Button } from "./Button";

import CalendarIcon from "~/assets/calendar.svg";
import ChevronDownIcon from "~/assets/chevron_down.svg";

const PopoverContent = forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-10 mt-1 rounded-md border border-gray-500 bg-gray-700 p-4 text-gray-100 shadow-md outline-none",
        "animate-in data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: "p-1 rounded border border-gray-500 hover:bg-gray-600 hover:text-white",
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-gray-100 rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "text-gray-50 rounded hover:bg-gray-600 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
        day: "h-9 w-9 opacity-50 aria-selected:opacity-100 aria-selected:bg-blue-500 aria-selected:text-white aria-selected:font-medium rounded",
        day_today: "opacity-100 border border-gray-400",
        day_outside: "text-gray-300 opacity-50",
        day_disabled: "text-gray-300 opacity-50",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronDownIcon className="h-4 w-4 rotate-90" />,
        IconRight: () => <ChevronDownIcon className="h-4 w-4 -rotate-90" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export function DatePicker() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger asChild>
        <Button className={cn("w-full min-w-[12rem] px-3 font-normal", !date && "text-gray-200")}>
          {date ? format(date, "PPP") : <span>Pick a date</span>}
          <CalendarIcon className="ml-2 h-4 w-4" />
        </Button>
      </PopoverPrimitive.Trigger>
      <PopoverContent className="w-auto p-0">
        <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
      </PopoverContent>
    </PopoverPrimitive.Root>
  );
}
