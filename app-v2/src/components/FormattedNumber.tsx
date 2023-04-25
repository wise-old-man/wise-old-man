import { formatNumber } from "@wise-old-man/utils";
import { Tooltip, TooltipTrigger, TooltipContent } from "./Tooltip";

interface FormattedNumberProps {
  value: number;
  className?: string;
}

export function FormattedNumber(props: FormattedNumberProps) {
  const { className, value } = props;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={className}>{formatNumber(value, true)}</span>
      </TooltipTrigger>
      <TooltipContent>{formatNumber(value, false)}</TooltipContent>
    </Tooltip>
  );
}
