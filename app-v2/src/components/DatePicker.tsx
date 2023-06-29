"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import { forwardRef, useEffect, useRef, useState } from "react";
import { createCalendar, parseDate } from "@internationalized/date";
import { padNumber } from "@wise-old-man/utils";
import { AriaDatePickerProps, AriaTimeFieldProps, DateValue, TimeValue } from "@react-aria/datepicker";
import {
  useButton,
  useDateField,
  useDatePicker,
  useDateSegment,
  useInteractOutside,
  useLocale,
  useTimeField,
} from "react-aria";
import {
  DateFieldState,
  DatePickerStateOptions,
  DateSegment as IDateSegment,
  useDateFieldState,
  useDatePickerState,
  useTimeFieldState,
} from "react-stately";
import { cn } from "~/utils/styling";
import { Button } from "~/components/Button";
import { Calendar } from "~/components/Calendar";

import CalendarIcon from "~/assets/calendar.svg";

const PopoverContent = forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-10 mt-1 rounded-md border border-gray-500 bg-gray-700 p-4 text-gray-100 shadow-md outline-none",
        "animate-in data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export const DateTimePicker = forwardRef<
  HTMLDivElement,
  DatePickerStateOptions<DateValue> & { inDialog?: boolean }
>((props, forwardedRef) => {
  const ref = useForwardedRef(forwardedRef);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const [open, setOpen] = useState(false);

  const state = useDatePickerState(props);
  const {
    groupProps,
    fieldProps,
    buttonProps: _buttonProps,
    dialogProps,
    calendarProps,
  } = useDatePicker(props, state, ref);

  const { buttonProps } = useButton(_buttonProps, buttonRef);

  useInteractOutside({
    ref: contentRef,
    onInteractOutside: () => setOpen(false),
  });

  return (
    <div {...groupProps} ref={ref} className={cn(groupProps.className, "flex items-center rounded-md")}>
      <DateField {...fieldProps} isSegmented />
      <PopoverPrimitive.Popover open={open} onOpenChange={setOpen}>
        <PopoverPrimitive.PopoverTrigger asChild>
          <Button
            {...buttonProps}
            className="h-10 rounded-l-none bg-gray-900 px-3"
            variant="outline"
            iconButton
            disabled={props.isDisabled}
            onClick={() => setOpen(true)}
          >
            <CalendarIcon className="h-5 w-5 text-gray-200" />
          </Button>
        </PopoverPrimitive.PopoverTrigger>
        <PopoverContent ref={contentRef} className={cn("w-full", props.inDialog && "z-50")}>
          <div {...dialogProps} className="space-y-3">
            <Calendar
              {...calendarProps}
              mode="single"
              onSelect={(d) => {
                if (!d || !calendarProps.onChange) return;
                calendarProps.onChange(toCalendarDate(d));
                setOpen(false);
              }}
            />
            {!!state.hasTime && <TimeField value={state.timeValue} onChange={state.setTimeValue} />}
          </div>
        </PopoverContent>
      </PopoverPrimitive.Popover>
    </div>
  );
});
DateTimePicker.displayName = "DateTimePicker";

export function DateField(props: AriaDatePickerProps<DateValue> & { isSegmented?: boolean }) {
  const { locale } = useLocale();
  const state = useDateFieldState({ ...props, locale, createCalendar });

  const ref = useRef(null);
  const { fieldProps } = useDateField(props, state, ref);

  return (
    <div
      {...fieldProps}
      ref={ref}
      className={cn(
        "inline-flex h-10 min-w-[10rem] flex-1 items-center border border-gray-700 bg-gray-900 px-3 py-2 text-sm",
        props.isDisabled ? "cursor-not-allowed opacity-50" : "",
        props.isSegmented ? "rounded-l-md border-r-0" : "rounded-md"
      )}
    >
      {state.segments.map((segment, i) => (
        <DateSegment key={i} segment={segment} state={state} />
      ))}
      {state.validationState === "invalid" && <span aria-hidden="true">🚫</span>}
    </div>
  );
}

export function TimeField(props: AriaTimeFieldProps<TimeValue>) {
  const { locale } = useLocale();
  const state = useTimeFieldState({ ...props, locale });

  const ref = useRef(null);
  const { fieldProps } = useTimeField(props, state, ref);

  return (
    <div
      {...fieldProps}
      ref={ref}
      className={cn(
        "inline-flex h-10 w-full min-w-[5rem] flex-1 rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm",
        props.isDisabled ? "cursor-not-allowed opacity-50" : ""
      )}
    >
      {state.segments.map((segment, i) => (
        <DateSegment key={i} segment={segment} state={state} />
      ))}
      {state.validationState === "invalid" && <span aria-hidden="true">🚫</span>}
    </div>
  );
}

interface DateSegmentProps {
  segment: IDateSegment;
  state: DateFieldState;
}

function DateSegment({ segment, state }: DateSegmentProps) {
  const ref = useRef(null);
  const { segmentProps } = useDateSegment(segment, state, ref);

  return (
    <div
      {...segmentProps}
      ref={ref}
      className={cn(
        "focus:rounded-[2px] focus:bg-gray-600 focus:text-white focus:outline-none",
        segment.type !== "literal" ? "px-[1px]" : "",
        segment.isPlaceholder ? "text-gray-200" : ""
      )}
    >
      {segment.text}
    </div>
  );
}

export function toCalendarDate(date: Date) {
  return parseDate(
    [date.getFullYear(), padNumber(date.getMonth() + 1), padNumber(date.getDate())].join("-")
  );
}

export function toDate(calendarDate: DateValue, time?: TimeValue) {
  const date = new Date(calendarDate.year, calendarDate.month - 1, calendarDate.day);
  if (time) {
    date.setHours(time.hour);
    date.setMinutes(time.minute);
  }
  return date;
}

function useForwardedRef<T>(ref: React.ForwardedRef<T>) {
  const innerRef = useRef<T>(null);

  useEffect(() => {
    if (!ref) return;
    if (typeof ref === "function") {
      ref(innerRef.current);
    } else {
      ref.current = innerRef.current;
    }
  });

  return innerRef;
}
