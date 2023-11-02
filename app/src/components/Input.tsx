import * as React from "react";
import { cn } from "~/utils/styling";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
  leftElement?: React.ReactElement;
  rightElement?: React.ReactElement;
  rightElementClickable?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const {
    className,
    containerClassName,
    leftElement,
    rightElement,
    rightElementClickable,
    type,
    ...otherProps
  } = props;

  return (
    <div className={cn("relative", containerClassName)}>
      <input
        type={type}
        className={cn(
          "flex h-10 w-full items-center rounded-md border border-gray-700 bg-gray-950 px-3 text-sm leading-7 shadow-inner shadow-black/50 placeholder:text-gray-300",
          "focus-visible:bg-black focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-500 focus-visible:ring-offset-0",
          "disabled:cursor-not-allowed disabled:opacity-50",
          !!leftElement && "pl-10",
          !!rightElement && "pr-10",
          className
        )}
        ref={ref}
        {...otherProps}
      />
      <div className="pointer-events-none absolute bottom-0 left-3 top-0 flex items-center">
        {leftElement}
      </div>
      <div
        className={cn(
          "absolute bottom-0 right-3 top-0 flex items-center",
          !rightElementClickable && "pointer-events-none"
        )}
      >
        {rightElement}
      </div>
    </div>
  );
});
Input.displayName = "Input";

export { Input };
