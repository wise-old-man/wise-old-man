"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CustomPeriodDialog } from "../CustomPeriodDialog";

interface PlayerGainedCustomPeriodDialogProps {
  username: string;
}

export function PlayerGainedCustomPeriodDialog(props: PlayerGainedCustomPeriodDialogProps) {
  const { username } = props;

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
      router.push(`/players/${username}/gained?${nextParams.toString()}`, { scroll: false });
    });
  }

  function handleClose() {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("dialog");

    startTransition(() => {
      router.push(`/players/${username}/gained?${nextParams.toString()}`, { scroll: false });
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
