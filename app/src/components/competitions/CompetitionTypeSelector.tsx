"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cn } from "~/utils/styling";
import { Label } from "../Label";
import { CompetitionType, isCompetitionType } from "@wise-old-man/utils";

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return <RadioGroupPrimitive.Root className={cn("grid gap-2", className)} {...props} ref={ref} />;
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, children, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-gray-400 bg-gray-800 text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&[data-state=checked]]:bg-blue-700",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <div className="h-2 w-2 rounded-full bg-current" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

interface CompetitionTypeSelectorProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> {
  type: CompetitionType;
  onTypeChanged: (type: CompetitionType) => void;
}

export function CompetitionTypeSelector(props: CompetitionTypeSelectorProps) {
  const { type, onTypeChanged, ...radioGroupProps } = props;

  return (
    <RadioGroup
      {...radioGroupProps}
      value={type}
      onValueChange={(e) => {
        if (isCompetitionType(e)) onTypeChanged(e);
      }}
      className="flex flex-col gap-x-4 sm:flex-row"
    >
      <Label
        htmlFor="classic"
        className="flex cursor-pointer gap-x-2 space-x-2 rounded-md border border-gray-500 bg-gray-800 p-5 shadow-sm transition-colors hover:border-gray-400 hover:bg-gray-700"
      >
        <RadioGroupItem value="classic" id="classic" />
        <div className="-mt-1">
          <span className="text-sm font-medium">Classic competition</span>
          <p className="mt-1 text-xs font-normal text-gray-200">
            All participants compete against eachother.
          </p>
        </div>
      </Label>

      <Label
        htmlFor="team"
        className="flex cursor-pointer gap-x-2 space-x-2 rounded-md border border-gray-500 bg-gray-800 p-5 shadow-sm transition-colors hover:border-gray-400 hover:bg-gray-700"
      >
        <RadioGroupItem value="team" id="team" />
        <div className="-mt-1">
          <span className="text-sm font-medium">Team competition</span>
          <p className="mt-1 text-xs font-normal text-gray-200">
            Participants are divided into competing teams.
          </p>
        </div>
      </Label>
    </RadioGroup>
  );
}

export { RadioGroup, RadioGroupItem };
