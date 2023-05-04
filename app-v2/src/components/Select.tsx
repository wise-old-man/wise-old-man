"use client";

import { useState, forwardRef, PropsWithChildren } from "react";
import { Command as CommandPrimitive } from "cmdk";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "~/utils/styling";
import { Button } from "./Button";

import CheckIcon from "~/assets/check.svg";
import SearchIcon from "~/assets/search.svg";
import ChevronDownIcon from "~/assets/chevron_down.svg";

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverContent = forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "start", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-10 min-w-[12rem] translate-y-1 overflow-hidden rounded-md border border-gray-500 bg-gray-700 shadow-md outline-none",
        "animate-in data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        align !== "center" && "min-w-[--radix-popper-anchor-width]",
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

const Command = forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn("flex h-full w-full flex-col overflow-hidden", className)}
    {...props}
  />
));
Command.displayName = CommandPrimitive.displayName;

const CommandGroup = forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group> & { label?: string }
>(({ className, label, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    heading={label}
    className={cn(
      "p-1",
      "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-gray-200",
      className
    )}
    {...props}
  />
));
CommandGroup.displayName = CommandPrimitive.Group.displayName;

const CommandItem = forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item> & { selected?: boolean }
>(({ className, selected, children, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-pointer select-none items-center gap-x-2 rounded p-2 text-sm text-gray-100 outline-none aria-selected:bg-gray-600 aria-selected:text-white",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      selected && "!bg-gray-800 font-medium !text-white",
      className
    )}
    {...props}
  >
    {children}
    {selected && (
      <div className="flex grow justify-end">
        <CheckIcon className="h-4 w-4" />
      </div>
    )}
  </CommandPrimitive.Item>
));
CommandItem.displayName = CommandPrimitive.Item.displayName;

const CommandSeparator = forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator ref={ref} className={cn("-mx-1 h-px bg-gray-500", className)} {...props} />
));
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

export function Select(props: PopoverPrimitive.PopoverProps & PropsWithChildren) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen} {...props}>
      {props.children}
    </Popover>
  );
}

export const SelectTrigger = PopoverTrigger;
export const SelectItemGroup = CommandGroup;
export const SelectItem = CommandItem;
export const SelectSeparator = CommandSeparator;

export function SelectItemsContainer(props: { className?: string } & PropsWithChildren) {
  return (
    <div
      className={cn("custom-scroll max-h-[20rem] overflow-y-auto overflow-x-hidden", props.className)}
    >
      {props.children}
    </div>
  );
}

export function SelectContent(props: PropsWithChildren & PopoverPrimitive.PopoverContentProps) {
  const { children, ...popoverProps } = props;

  return (
    <PopoverContent {...popoverProps}>
      <Command>{props.children}</Command>
    </PopoverContent>
  );
}

export function SelectButton(props: { className?: string } & PropsWithChildren) {
  return (
    <SelectTrigger asChild>
      <Button
        className={cn("flex w-auto justify-between px-3 font-normal text-gray-100", props.className)}
      >
        {props.children}
        <ChevronDownIcon className="ml-5 h-4 w-4" />
      </Button>
    </SelectTrigger>
  );
}
