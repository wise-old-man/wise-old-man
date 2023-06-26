import { DayPicker } from "react-day-picker";
import { cn } from "~/utils/styling";

import ChevronDownIcon from "~/assets/chevron_down.svg";

type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
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
