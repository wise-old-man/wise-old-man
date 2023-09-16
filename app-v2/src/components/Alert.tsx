import * as React from "react";
import { VariantProps, cva } from "class-variance-authority";

import { cn } from "~/utils/styling";

const alertVariants = cva("relative w-full rounded-lg border p-5 border-gray-400 [&>svg]:shrink-0", {
  variants: {
    variant: {
      default: "bg-gray-800 text-white",
      warn: `bg-yellow-900/10 border-yellow-800 [&>svg]:text-yellow-400`,
      error: `bg-red-900/10 border-red-800 [&>svg]:text-red-400`,
      success: `bg-green-900/10 border-green-700 [&>svg]:text-green-400`,
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5
      ref={ref}
      className={cn("mb-2 flex items-center font-medium leading-none tracking-tight", className)}
      {...props}
    />
  )
);
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-sm text-white/60 [&_p]:leading-6", className)} {...props} />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
