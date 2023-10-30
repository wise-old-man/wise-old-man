import * as React from "react";
import { VariantProps, cva } from "class-variance-authority";

import { cn } from "~/utils/styling";

const badgeVariants = cva(
  "inline-flex items-center border rounded-full shrink-0 px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-0",
  {
    variants: {
      variant: {
        default: "bg-gray-600 border-transparent text-gray-100",
        outline: "text-gray-200 border-gray-200",
        success: "bg-green-900/30 border-transparent text-green-400",
        error: "bg-red-900/40 border-transparent text-red-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
