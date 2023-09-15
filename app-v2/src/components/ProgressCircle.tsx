import { cn } from "~/utils/styling";

interface ProgressCircleProps {
  radius: number;
  percentage: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}

export function ProgressCircle(props: ProgressCircleProps) {
  const { radius: outerRadius, strokeWidth = 3, percentage, className } = props;

  const innerRadius = outerRadius - strokeWidth;
  const c = 2 * innerRadius * Math.PI;
  const offset = c - percentage * c;

  return (
    <svg
      width={outerRadius * 2}
      height={outerRadius * 2}
      viewBox={`0 0 ${outerRadius * 2} ${outerRadius * 2}`}
      fill="none"
      strokeWidth={strokeWidth}
    >
      <circle
        role="presentation"
        cx={outerRadius}
        cy={outerRadius}
        r={innerRadius}
        className="stroke-gray-400"
      />
      <circle
        role="presentation"
        cx={outerRadius}
        cy={outerRadius}
        r={innerRadius}
        className={cn(getGradientStroke(percentage), className)}
        strokeDasharray={`${c} ${c}`}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${outerRadius} ${outerRadius})`}
      />
    </svg>
  );
}

function getGradientStroke(percentage: number) {
  if (percentage <= 0.25) {
    return "stroke-red-500";
  } else if (percentage <= 0.5) {
    return "stroke-orange-400";
  } else if (percentage <= 0.75) {
    return "stroke-yellow-500";
  } else {
    return "stroke-green-500";
  }
}
