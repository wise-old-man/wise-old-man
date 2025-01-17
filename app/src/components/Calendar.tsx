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
        months: "flex flex-col sm:flex-row space-y-4 sm:space-y-0",
        month: "space-y-4",
        month_caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "z-50 absolute top-12 bg-red-500 left-8 right-8 space-x-1 flex items-center",
        button_previous:
          "p-1 rounded border border-gray-500 hover:bg-gray-600 hover:text-white absolute left-1",
        button_next:
          "p-1 rounded border border-gray-500 hover:bg-gray-600 hover:text-white absolute right-1",
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday: "text-gray-100 rounded-md w-9 font-normal text-[0.8rem]",
        week: "flex w-full mt-2",
        day: "text-gray-50 rounded hover:bg-gray-600 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
        day_button: "h-9 w-9 opacity-50 rounded aria-selected:opacity-100",
        selected: "opacity-100 bg-blue-500 text-white font-medium",
        today: "opacity-100 border border-gray-400",
        outside: "text-gray-300 opacity-50",
        disabled: "text-gray-300 opacity-50",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: (props) => {
          if (props.orientation === "left") {
            return <ChevronDownIcon className="h-4 w-4 rotate-90" />;
          }

          return <ChevronDownIcon className="h-4 w-4 -rotate-90" />;
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";
