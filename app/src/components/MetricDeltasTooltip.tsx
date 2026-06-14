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
    <div className="flex min-w-[10rem] flex-col gap-y-1.5 text-xs tabular-nums">
      {deltas.map((delta) => (
        <div
          key={delta.metric}
          className={cn(
            "flex items-center justify-between gap-x-4 text-white",
            delta.metric === "total" && "mb-1 mt-0.5 border-b border-gray-600 pb-1.5",
          )}
        >
          {delta.metric === "total" ? (
            <span>Total</span>
          ) : (
            <div className="flex items-center gap-x-2 text-gray-200">
              <MetricIconSmall metric={delta.metric} />
              <span>{MetricProps[delta.metric].name}</span>
            </div>
          )}
          <FormattedNumber value={delta[type][field]} colored={field === "gained"} />
        </div>
      ))}
    </div>
  );
}
