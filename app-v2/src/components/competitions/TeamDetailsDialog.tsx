"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CompetitionDetails } from "@wise-old-man/utils";
import { cn } from "~/utils/styling";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../Dialog";
import { FormattedNumber } from "../FormattedNumber";
import { ParticipantsTable } from "./ParticipantsTable";

interface TeamDetailsDialogProps {
  competition: CompetitionDetails;
}

export function TeamDetailsDialog(props: TeamDetailsDialogProps) {
  const { competition } = props;

  const router = useRouter();
  const searchParams = useSearchParams();

  const isOpen = searchParams.get("dialog") === "team" && !!searchParams.get("team");

  const teamName = decodeURI(searchParams.get("team") || "");
  const participants = competition.participations.filter((p) => p.teamName === teamName);

  // TODO: add proper team members table
  // TODO: add tteams exports to export dialog

  const totalGained = participants.reduce((acc, curr) => acc + curr.progress.gained, 0);
  const avgGained = Math.round(totalGained / participants.length);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(val) => {
        if (!val) router.back();
      }}
    >
      <DialogContent
        hideClose
        className="custom-scroll relative flex max-h-[60vh] max-w-[95vw] translate-y-24 flex-col overflow-auto px-0 pt-0 sm:w-[90vw] sm:max-w-6xl sm:translate-y-0"
      >
        <DialogHeader className="sticky top-0 z-20 mb-0 flex flex-row items-start justify-between space-y-1 border-b border-gray-500 bg-gray-800 px-5 py-5">
          <div className="grow">
            <DialogTitle>{teamName}</DialogTitle>
            <DialogDescription>
              {participants.length} {participants.length === 1 ? "player" : "players"}
              {`  ·  Total:`}
              <span className={cn("ml-1", totalGained > 0 && "text-green-400")}>
                <FormattedNumber value={totalGained} />
              </span>
              {`  ·  Average:`}
              <span className={cn("ml-1", avgGained > 0 && "text-green-400")}>
                <FormattedNumber value={avgGained} />
              </span>
            </DialogDescription>
          </div>
          <DialogClose />
        </DialogHeader>
        <div className="mx-5 mt-1">
          <ParticipantsTable metric={competition.metric} competition={competition} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
