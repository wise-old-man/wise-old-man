"use client";

import { useState, forwardRef, PropsWithChildren, createContext, useContext } from "react";
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
    filter={(v, s) => {
      // Ignore casing, whitespace, dashes, and underscores when searching
      const value = v.replace(/[-_\s]/g, " ").toLowerCase();
      const search = s.replace(/[-_\s]/g, " ").toLowerCase();

      if (value.includes(search)) return 1;
      return 0;
    }}
    {...props}
  />
));
Command.displayName = CommandPrimitive.displayName;

const CommandInput = forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div className="flex items-center border-b border-gray-500 pl-3" cmdk-input-wrapper="">
    <SearchIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        "flex w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-gray-300",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  </div>
));
CommandInput.displayName = CommandPrimitive.Input.displayName;

const CommandEmpty = forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty ref={ref} className="p-3 text-center text-sm text-gray-200" {...props} />
));
CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

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
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, children, onSelect, ...props }, ref) => {
  const { selectedValue, onItemSelected } = useContext(ComboboxContext);

  return (
    <CommandPrimitive.Item
      ref={ref}
      onSelect={() => {
        if (selectedValue === props.value) {
          onItemSelected(undefined);
        } else {
          onItemSelected(props.value);
        }
      }}
      className={cn(
        "relative flex cursor-pointer select-none items-center gap-x-2 rounded p-2 text-sm text-gray-100 outline-none aria-selected:bg-gray-600 aria-selected:text-white",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        selectedValue === props.value && "!bg-gray-800 font-medium !text-white",
        className
      )}
      {...props}
    >
      {children}
      {selectedValue === props.value && (
        <div className="flex grow justify-end">
          <CheckIcon className="h-4 w-4" />
        </div>
      )}
    </CommandPrimitive.Item>
  );
});
CommandItem.displayName = CommandPrimitive.Item.displayName;

const CommandSeparator = forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator ref={ref} className={cn("-mx-1 h-px bg-gray-500", className)} {...props} />
));
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

const ComboboxContext = createContext<{
  selectedValue: string | undefined;
  onItemSelected: (value: string | undefined) => void;
}>({
  selectedValue: undefined,
  onItemSelected: () => {},
});

interface ComboboxProps extends PopoverPrimitive.PopoverProps, PropsWithChildren {
  value?: string;
  onValueChanged?: (value: string | undefined) => void;
}

export function Combobox(props: ComboboxProps) {
  const { value, onValueChanged, onOpenChange, ...otherProps } = props;

  const [open, setOpen] = useState(false);

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (onOpenChange) onOpenChange(o);
      }}
      {...otherProps}
    >
      <ComboboxContext.Provider
        value={{
          selectedValue: value,
          onItemSelected: (val) => {
            setOpen(false);
            if (onValueChanged) onValueChanged(val);
          },
        }}
      >
        {props.children}
      </ComboboxContext.Provider>
    </Popover>
  );
}

export const ComboboxTrigger = PopoverTrigger;
export const ComboboxInput = CommandInput;
export const ComboboxEmpty = CommandEmpty;
export const ComboboxItemGroup = CommandGroup;
export const ComboboxItem = CommandItem;
export const ComboboxSeparator = CommandSeparator;

export function ComboboxItemsContainer(props: { className?: string } & PropsWithChildren) {
  return (
    <div
      className={cn("custom-scroll max-h-[20rem] overflow-y-auto overflow-x-hidden", props.className)}
    >
      {props.children}
    </div>
  );
}

export function ComboboxContent(props: PropsWithChildren & PopoverPrimitive.PopoverContentProps) {
  const { children, ...popoverProps } = props;

  return (
    <PopoverContent {...popoverProps}>
      <Command>{props.children}</Command>
    </PopoverContent>
  );
}

export function ComboboxButton(props: { className?: string } & PropsWithChildren) {
  return (
    <ComboboxTrigger asChild>
      <Button
        className={cn("flex w-auto justify-between px-3 font-normal text-gray-100", props.className)}
      >
        {props.children}
        <ChevronDownIcon className="ml-5 h-4 w-4" />
      </Button>
    </ComboboxTrigger>
  );
}
