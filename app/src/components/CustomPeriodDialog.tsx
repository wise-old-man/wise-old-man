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
    toCalendarDate(new Date(Date.now() - PeriodProps[Period.WEEK].milliseconds))
  );

  const [endDate, setEndDate] = useState<DateValue>(toCalendarDate(new Date()));
  const [invalidStartDate, setInvalidStartDate] = useState(false);

  const [invalidEndDate, setInvalidEndDate] = useState(false);
  const [startDateAfterEndDate, setStartDateAfterEndDate] = useState(false);

  const earliestDate = toCalendarDate(new Date(2013, 0, 1));
  const typeEnum = { START: 'start', END: 'end' };

 function resetStates() {
    setInvalidStartDate(false);
    setInvalidEndDate(false);
    setStartDateAfterEndDate(false);
 }

 function getLabel(type: string) {
    if (type === typeEnum.START && invalidStartDate) {
      return <Label className="mb-2 block text-xs text-red-500">Start date must be after {earliestDate.toString()}</Label>
    } else if (type === typeEnum.END && invalidEndDate) {
      return <Label className="mb-2 block text-xs text-red-500">End date must not be in the future</Label>
    } else if (type === typeEnum.END && startDateAfterEndDate) {
      return <Label className="mb-2 block text-xs text-red-500">End date must be after start date</Label>
    } else if (type === typeEnum.END) {
      return <Label className="mb-2 block text-xs text-gray-200">End date</Label>
    } else {
      return <Label className="mb-2 block text-xs text-gray-200">Start date</Label>
    }
 }

  function handleSelection() {
    resetStates();

    // Prevent users from checking metrics before 2013
    if (startDate.year < 2013) {
      setInvalidStartDate(true);
      setStartDate(toCalendarDate(new Date(2013, 0, 1)));
      return;
    }

    // Prevent users from checking past metrics that don't exist
    if (endDate.year < 2013) {
      setInvalidEndDate(true);
      setEndDate(toCalendarDate(new Date(2013, 0, 1)));
      return;
      }

    // Check if endtime is before starttime
    if (toDate(endDate, endTime) < toDate(startDate, startTime)) {
      console.log("End date is before start date");
      setStartDateAfterEndDate(true);
      //Set the end date to a minute after the start date
      setEndDate(toCalendarDate(toDate(startDate, startTime)));
      setEndTime(new Time(toDate(startDate, startTime).getMinutes()+1));
      return;
    }

    // Prevent users from checking future metrics that don't exist
    if (toDate(endDate, endTime) > new Date()) {
      setInvalidEndDate(true);
      setEndTime(new Time(new Date().getHours(), new Date().getMinutes()));
      setEndDate(toCalendarDate(new Date()));
      return;
    }

    const startDateTime = toDate(startDate, startTime);
    const endDateTime = toDate(endDate, endTime);

    onSelected(startDateTime, endDateTime);
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
              { getLabel(typeEnum.START) }
              <DateTimePicker inDialog value={startDate} onChange={setStartDate} />
            </div>
            <div className="grow">
              <Label className="mb-2 block text-xs text-gray-200">Start time</Label>
              <TimeField value={startTime} onChange={setStartTime} />
            </div>
          </div>
          <div className="mt-5 flex grow gap-x-4">
            <div className="grow">
              {getLabel(typeEnum.END)}
              <DateTimePicker inDialog value={endDate} onChange={setEndDate}/>
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
