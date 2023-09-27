"use client";

import { cn } from "~/utils/styling";
import { useHasMounted } from "~/hooks/useHasMounted";

interface LocalDateProps {
  isoDate: string;
  mode?: "date" | "datetime";
  locale?: Intl.LocalesArgument;
  formatOptions?: Intl.DateTimeFormatOptions;
}

const DEFAULT_DATE_FORMATTING: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
};

const DEFAULT_DATETIME_FORMATTING: Intl.DateTimeFormatOptions = {
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  day: "numeric",
  month: "short",
  year: "numeric",
};

export function LocalDate(props: LocalDateProps) {
  const { isoDate, locale, mode, formatOptions } = props;

  const date = new Date(isoDate);
  const hasMounted = useHasMounted();

  const formattedDate =
    mode === "date"
      ? date.toLocaleString(locale, formatOptions || DEFAULT_DATE_FORMATTING)
      : date.toLocaleString(locale, formatOptions || DEFAULT_DATETIME_FORMATTING);

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
