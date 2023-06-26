"use client";

import { useState } from "react";
import { Time } from "@internationalized/date";
import { Period, PeriodProps } from "@wise-old-man/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { DateValue, TimeValue } from "@react-aria/datepicker";
import { Label } from "../Label";
import { Button } from "../Button";
import { DateTimePicker, TimeField, toCalendarDate, toDate } from "../DatePicker";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../Dialog";

interface PlayerCustomPeriodDialogProps {
  username: string;
}

export function PlayerCustomPeriodDialog(props: PlayerCustomPeriodDialogProps) {
  const { username } = props;

  const router = useRouter();
  const searchParams = useSearchParams();

  const [startTime, setStartTime] = useState<TimeValue>(new Time(12, 0));
  const [endTime, setEndTime] = useState<TimeValue>(new Time(12, 0));

  const [startDate, setStartDate] = useState<DateValue>(
    toCalendarDate(new Date(Date.now() - PeriodProps[Period.WEEK].milliseconds))
  );
  const [endDate, setEndDate] = useState<DateValue>(toCalendarDate(new Date()));

  function handleSelection() {
    const startDateTime = toDate(startDate, startTime);
    const endDateTime = toDate(endDate, endTime);

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("period");
    nextParams.delete("dialog");
    nextParams.set("startDate", startDateTime.toISOString());
    nextParams.set("endDate", endDateTime.toISOString());

    router.push(`/players/${username}/gained?${nextParams.toString()}`);
  }

  return (
    <Dialog
      open={searchParams.get("dialog") === "custom_period"}
      onOpenChange={(val) => {
        if (!val) router.back();
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
            <Button type="submit" size="lg" variant="blue" className="mt-5 w-full justify-center">
              Confirm
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
