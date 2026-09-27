import { Metric, MetricDelta, MetricProps } from "@wise-old-man/utils";
import { cn } from "~/utils/styling";
import { FormattedNumber } from "./FormattedNumber";
import { MetricIconSmall } from "./Icon";

interface MetricDeltasTooltipProps {
  deltas: Array<{
    metric: Metric | "total";
    values: MetricDelta;
    levels: MetricDelta;
  }>;
  type: "values" | "levels";
  field: "start" | "end" | "gained";
}

export function MetricDeltasTooltip(props: MetricDeltasTooltipProps) {
  const { deltas, type, field } = props;

  return (
    <MetricBreakdownTooltip
      items={deltas.map((delta) => ({
        metric: delta.metric,
        value: <FormattedNumber value={delta[type][field]} colored={field === "gained"} />,
      }))}
    />
  );
}

interface MetricBreakdownTooltipProps {
  items: Array<{
    metric: Metric | "total";
    value: React.ReactNode;
  }>;
  title?: React.ReactNode;
}

/*
 * Lists one value per metric (with "total" first, as a header row).
 */
export function MetricBreakdownTooltip(props: MetricBreakdownTooltipProps) {
  const { items, title } = props;

  return (
    <div className="flex min-w-[10rem] flex-col gap-y-1.5 text-xs tabular-nums">
      {title && <span className="mb-1 border-b border-gray-600 pb-2 text-gray-200">{title}</span>}
      {items.map((item) => (
        <div
          key={item.metric}
          className={cn(
            "flex items-center justify-between gap-x-4 text-white",
            item.metric === "total" && "mb-1 border-b border-gray-600 pb-1.5",
          )}
        >
          {item.metric === "total" ? (
            <span>Total</span>
          ) : (
            <div className="flex items-center gap-x-2">
              <MetricIconSmall metric={item.metric} />
              <span>{MetricProps[item.metric].name}</span>
            </div>
          )}
          {item.value}
        </div>
      ))}
    </div>
  );
}
