"use client";

import { useState } from "react";
import { Time } from "@internationalized/date";
import { Period, PeriodProps } from "@wise-old-man/utils";
import { DateValue, TimeValue } from "@react-aria/datepicker";
import { Label } from "./Label";
import { Button } from "./Button";
import { DateTimePicker, TimeField, toCalendarDate, toDate } from "./DatePicker";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./Dialog";

import LoadingIcon from "~/assets/loading.svg";

interface CustomPeriodDialogProps {
  isOpen: boolean;
  isPending: boolean;
  onClose: () => void;
  onSelected: (startDate: Date, endDate: Date) => void;
}

export function CustomPeriodDialog(props: CustomPeriodDialogProps) {
  const { isOpen, isPending, onSelected, onClose } = props;

  const [startTime, setStartTime] = useState<TimeValue>(new Time(12, 0));
  const [endTime, setEndTime] = useState<TimeValue>(new Time(12, 0));

  const [startDate, setStartDate] = useState<DateValue>(
      toCalendarDate(new Date(
          Math.max(Date.now() -
              PeriodProps[Period.WEEK].milliseconds,
              new Date('2013-01-01T00:00:00').getTime())))
  );

  const [endDate, setEndDate] = useState<DateValue>(toCalendarDate(new Date()));

  function handleSelection() {
    const startDateTime = Math.max(toDate(startDate, startTime).getTime(),
        new Date('2013-01-01T00:00:00').getTime());
    const endDateTime = toDate(endDate, endTime);

    onSelected(new Date(startDateTime), new Date(endDateTime));
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(val) => {
        if (!val) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select a custom period</DialogTitle>
          <DialogDescription>
            Define a custom period by selecting a start and end date. These are displayed in your local
            time.
          </DialogDescription>
        </DialogHeader>
        <form
          className="mt-2 flex flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            handleSelection();
          }}
        >
          <div className="flex grow gap-x-4">
            <div className="grow">
              <Label className="mb-2 block text-xs text-gray-200">Start date</Label>
              <DateTimePicker inDialog value={startDate} onChange={setStartDate} />
            </div>
            <div className="grow">
              <Label className="mb-2 block text-xs text-gray-200">Start time</Label>
              <TimeField value={startTime} onChange={setStartTime} />
            </div>
          </div>
          <div className="mt-5 flex grow gap-x-4">
            <div className="grow">
              <Label className="mb-2 block text-xs text-gray-200">End date</Label>
              <DateTimePicker inDialog value={endDate} onChange={setEndDate} />
            </div>
            <div className="grow">
              <Label className="mb-2 block text-xs text-gray-200">End time</Label>
              <TimeField value={endTime} onChange={setEndTime} />
            </div>
          </div>
          <div className="mt-5 w-full grow border-t border-gray-700">
            <Button disabled={isPending} size="lg" variant="blue" className="mt-5 w-full justify-center">
              {isPending ? (
                <>
                  <LoadingIcon className="-ml-2 mr-2 h-5 w-5 animate-spin" />
                  Loading...
                </>
              ) : (
                <>Confirm</>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
