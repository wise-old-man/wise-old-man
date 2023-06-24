import { formatNumber } from "@wise-old-man/utils";
import { Tooltip, TooltipTrigger, TooltipContent } from "./Tooltip";
import { cn } from "~/utils/styling";

interface FormattedNumberProps {
  value: number;
  colored?: boolean;
  lowThreshold?: number;
  className?: string;
}

export function FormattedNumber(props: FormattedNumberProps) {
  const { className, value, colored, lowThreshold } = props;

  if (value === 0) {
    return <span className={className}>0</span>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            className,

            {
              "text-green-500": value > 0 && (!lowThreshold || value > lowThreshold) && colored,
              "text-lime-300": value > 0 && lowThreshold && value <= lowThreshold && colored,
              "text-red-500": value < 0 && colored,
            }
          )}
        >
          {value > 0 && colored ? "+" : ""}
          {formatNumber(value, true)}
        </span>
      </TooltipTrigger>
      <TooltipContent>{formatNumber(value, false)}</TooltipContent>
    </Tooltip>
  );
}
