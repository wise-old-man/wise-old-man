import * as React from "react";
import { VariantProps, cva } from "class-variance-authority";
import { cn } from "~/utils/styling";

export const buttonVariants = cva(
  "relative inline-flex gap-x-2 items-center whitespace-nowrap justify-between duration-75 font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none shadow-button",
  {
    variants: {
      variant: {
        default: `bg-gray-700 text-white shadow-inner-border hover:bg-gray-600 active:opacity-80`,
        blue: "bg-blue-600 hover:bg-blue-500 text-white active:opacity-80",
        red: "bg-red-700 hover:bg-red-600 text-white active:opacity-80",
      },
      size: {
        sm: "text-xs py-1 px-2 rounded",
        md: "text-sm h-9 px-5 rounded-md",
        lg: "text-base py-3 px-4 rounded-md",
      },
      iconButton: {
        true: "px-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, variant, iconButton, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, iconButton, size, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
