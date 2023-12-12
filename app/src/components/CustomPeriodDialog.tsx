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

  const errorLabels = {
    start: "Start date must be after " + earliestDate.toString(),
    endFuture: "End date must not be in the future",
    endBeforeStart: "End date must be after start date"
  };

 function resetStates() {
    setInvalidStartDate(false);
    setInvalidEndDate(false);
    setStartDateAfterEndDate(false);
 }

 function getLabel(type: string) {
  const isError = type === typeEnum.START ? invalidStartDate : invalidEndDate || startDateAfterEndDate;
  const label = type === typeEnum.START ? "Start date" : "End date";
  const errorText = type === typeEnum.START ? errorLabels.start : invalidEndDate ? errorLabels.endFuture : errorLabels.endBeforeStart;
  const className = `mb-2 block text-xs ${isError ? "text-red-500" : "text-gray-200"}`;
  return <Label className={className}>{isError ? errorText : label}</Label>;
}

 function setEndDateTime(dateTime: Date) {
  setEndTime(new Time(dateTime.getHours(), dateTime.getMinutes()));
  setEndDate(toCalendarDate(dateTime));
}

function validateDate(date: DateValue, time: TimeValue, type: string) {
  const dateTime = toDate(date, time);
  if (type === typeEnum.START && dateTime.getFullYear() < 2013) {
    setInvalidStartDate(true);
    setStartDate(earliestDate);
    return false;
  }
  if (type === typeEnum.END) {
    if (dateTime < toDate(startDate, startTime)) {
      setStartDateAfterEndDate(true);
      setEndDateTime(toDate(startDate, startTime));
      return false;
    }
    if (dateTime > new Date()) {
      setInvalidEndDate(true);
      setEndDateTime(new Date());
      return false;
    }
  }
  resetStates();
  return true;
}

  function handleSelection() {
    resetStates();

    if (validateDate(startDate, startTime, typeEnum.START) !== true) return;
    if (validateDate(endDate, endTime, typeEnum.END) !== true ) return;


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
