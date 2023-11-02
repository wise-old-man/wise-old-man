"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "~/utils/styling";

const ToggleTabs = TabsPrimitive.Root;

const ToggleTabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center overflow-hidden rounded-lg border border-gray-400",
      className
    )}
    {...props}
  />
));
ToggleTabsList.displayName = TabsPrimitive.List.displayName;

const ToggleTabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap border-r border-gray-400 px-4 py-2 text-sm text-gray-100 transition-colors last:border-none hover:bg-gray-800 focus-visible:outline-none",
      "disabled:pointer-events-none disabled:opacity-50",
      "data-[state=active]:bg-gray-700 data-[state=active]:text-white",
      className
    )}
    {...props}
  />
));
ToggleTabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const ToggleTabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
));
ToggleTabsContent.displayName = TabsPrimitive.Content.displayName;

export { ToggleTabs, ToggleTabsList, ToggleTabsTrigger, ToggleTabsContent };
