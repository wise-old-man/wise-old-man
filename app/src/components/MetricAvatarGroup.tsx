import { Metric } from "@wise-old-man/utils";
import { MetricIcon } from "./Icon";
import { cn } from "~/utils/styling";

export function MetricAvatarGroup({
  metrics,
  maxCount,
  size = "md",
  avatarClassname,
}: {
  metrics: Metric[];
  maxCount: number;
  size?: "md" | "lg";
  avatarClassname?: string;
}) {
  const overflowCount = Math.max(0, metrics.length - maxCount);

  const singleSize = size === "md" ? 48 : 56;
  const multipleSize = size === "md" ? 36 : 48;

  const itemOffset = size === "md" ? 24 : 32;
  const itemSize = metrics.length > 1 ? multipleSize : singleSize;
  const itemCount = Math.min(metrics.length, maxCount + 1);

  const width = itemCount * itemSize - (itemCount - 1) * (itemSize - itemOffset);

  return (
    <div style={{ width, height: itemSize }} className="relative flex flex-row">
      {metrics.slice(0, maxCount).map((metric, index) => (
        <div
          key={metric}
          className={cn(
            "absolute flex shrink-0 items-center justify-center rounded-full border border-gray-600 bg-gray-900",
            avatarClassname
          )}
          style={{
            zIndex: index,
            width: itemSize,
            height: itemSize,
            left: index * itemOffset,
          }}
        >
          <MetricIcon metric={metric} />
        </div>
      ))}
      {overflowCount > 0 && (
        <div
          className={cn(
            "absolute flex shrink-0 items-center justify-center rounded-full border border-gray-600 bg-gray-900 text-xs text-gray-200",
            avatarClassname
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
      )}
    </div>
  );
}
