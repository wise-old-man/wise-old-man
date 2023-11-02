import * as React from "react";
import { cn } from "~/utils/styling";

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  containerClassName?: string;
  leftElement?: React.ReactElement;
  rightElement?: React.ReactElement;
}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>((props, ref) => {
  const { className, containerClassName, leftElement, rightElement, ...otherProps } = props;

  return (
    <div className={cn("relative", containerClassName)}>
      <textarea
        className={cn(
          "custom-scroll flex min-h-[5rem] w-full items-center rounded-md border border-gray-700 bg-gray-950 px-3 py-1 text-sm leading-7 shadow-inner shadow-black/50 placeholder:text-gray-300",
          "focus-visible:bg-black focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-500 focus-visible:ring-offset-0",
          "disabled:cursor-not-allowed disabled:opacity-50",
          !!leftElement && "pl-10",
          !!rightElement && "pr-10",
          className
        )}
        ref={ref}
        {...otherProps}
      />
      <div className="pointer-events-none absolute left-3 top-3 flex items-center">{leftElement}</div>
      <div className="absolute right-3 top-3 flex items-center">{rightElement}</div>
    </div>
  );
});
TextArea.displayName = "TextArea";

export { TextArea };
