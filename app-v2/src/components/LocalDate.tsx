"use client";

import { useHasMounted } from "~/hooks/useHasMounted";
import { cn } from "~/utils/styling";
import { formatDate, formatDatetime } from "~/utils/dates";

interface LocalDateProps {
  isoDate: string;
  mode?: "date" | "datetime";
  formatOptions?: Intl.DateTimeFormatOptions;
}

export function LocalDate(props: LocalDateProps) {
  const { isoDate, mode, formatOptions } = props;

  const hasMounted = useHasMounted();

  const formattedDate =
    mode === "date"
      ? formatDate(new Date(isoDate), formatOptions)
      : formatDatetime(new Date(isoDate), formatOptions);

  return (
    <div className="relative inline-block min-w-[10ch]">
      {hasMounted ? <span>{formattedDate}</span> : null}
      {/* Add a space here just to ensure that the component keeps its vertical height before being fully rendered  */}
      &nbsp;
      <div
        className={cn(
          "absolute inset-0 bottom-[0.2em] top-[0.2em] animate-pulse rounded-full bg-gray-600",
          hasMounted && "hidden"
        )}
      />
    </div>
  );
}
