import { Metric, MetricProps } from "@wise-old-man/utils";
import { MetricIcon, MetricIconSmall } from "./Icon";
import { cn } from "~/utils/styling";
import { Tooltip, TooltipContent, TooltipTrigger } from "./Tooltip";

export function MetricAvatarGroup({
  metrics,
  maxCount = 3,
  size = "md",
  avatarClassname,
}: {
  metrics: Metric[];
  maxCount?: number;
  size?: "sm" | "md" | "lg";
  avatarClassname?: string;
}) {
  const showOverflow = metrics.length > maxCount;
  const displayCount = showOverflow ? maxCount - 1 : metrics.length;
  const overflowCount = showOverflow ? metrics.length - displayCount : 0;

  const singleSize = { sm: 24, md: 48, lg: 56 }[size];
  const multipleSize = { sm: 24, md: 36, lg: 48 }[size];

  const itemOffset = { sm: 16, md: 24, lg: 32 }[size];
  const itemSize = metrics.length > 1 ? multipleSize : singleSize;
  const itemCount = displayCount + (showOverflow ? 1 : 0);

  const width = itemCount * itemSize - (itemCount - 1) * (itemSize - itemOffset);

  return (
    <div style={{ width, height: itemSize }} className="relative flex shrink-0 flex-row">
      {metrics.slice(0, displayCount).map((metric, index) => (
        <div
          key={metric}
          className={cn(
            "absolute flex shrink-0 items-center justify-center rounded-full border border-gray-600 bg-gray-900",
            avatarClassname,
          )}
          style={{
            zIndex: index,
            width: itemSize,
            height: itemSize,
            left: index * itemOffset,
          }}
        >
          {size === "sm" ? <MetricIconSmall metric={metric} /> : <MetricIcon metric={metric} />}
        </div>
      ))}
      {overflowCount > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "absolute flex shrink-0 items-center justify-center rounded-full border border-gray-600 bg-gray-900 text-gray-200",
                size === "sm" ? "text-[0.625rem]" : "text-xs",
                avatarClassname,
              )}
              style={{
                zIndex: itemCount - 1,
                width: itemSize,
                height: itemSize,
                left: (itemCount - 1) * itemOffset,
              }}
            >
              +{overflowCount}
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <div className="flex flex-col gap-y-1.5">
              {metrics.slice(displayCount).map((metric) => (
                <div key={metric} className="flex items-center gap-x-2">
                  <MetricIconSmall metric={metric} />
                  <span>{MetricProps[metric].name}</span>
                </div>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
