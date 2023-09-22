"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CustomPeriodDialog } from "../CustomPeriodDialog";

interface GroupGainedCustomPeriodDialogProps {
  groupId: number;
}

export function GroupGainedCustomPeriodDialog(props: GroupGainedCustomPeriodDialogProps) {
  const { groupId } = props;

  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function handleSelection(startDate: Date, endDate: Date) {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("period");
    nextParams.delete("dialog");
    nextParams.set("startDate", startDate.toISOString());
    nextParams.set("endDate", endDate.toISOString());

    startTransition(() => {
      router.push(`/groups/${groupId}/gained?${nextParams.toString()}`, { scroll: false });
    });
  }

  function handleClose() {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("dialog");

    startTransition(() => {
      router.push(`/groups/${groupId}/gained?${nextParams.toString()}`, { scroll: false });
    });
  }

  return (
    <CustomPeriodDialog
      isOpen={searchParams.get("dialog") === "custom_period"}
      isPending={isPending}
      onClose={handleClose}
      onSelected={handleSelection}
    />
  );
}
