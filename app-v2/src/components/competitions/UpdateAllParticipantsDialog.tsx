"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { WOMClient } from "@wise-old-man/utils";
import { useToast } from "~/hooks/useToast";
import { Input } from "../Input";
import { Label } from "../Label";
import { Button } from "../Button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../Dialog";

import CheckIcon from "~/assets/check.svg";

interface UpdateAllParticipantsDialogProps {
  competitionId: number;
}

export function UpdateAllParticipantsDialog(props: UpdateAllParticipantsDialogProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const isOpen = searchParams.get("dialog") === "update-all";

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(val) => {
        if (!val) router.back();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update all participants</DialogTitle>
          <DialogDescription>
            This action will queue automatic updates for all <span className="underline">outdated</span>
            &nbsp;participants. This might take a few minutes to complete.
          </DialogDescription>
        </DialogHeader>
        <UpdateAllParticipantsForm competitionId={props.competitionId} />
      </DialogContent>
    </Dialog>
  );
}

function UpdateAllParticipantsForm(props: UpdateAllParticipantsDialogProps) {
  const { competitionId } = props;

  const toast = useToast();

  const [verificationCode, setVerificationCode] = useState("");

  const client = new WOMClient({
    userAgent: "WiseOldMan - App v2 (Client Side)",
  });

  const updateMutation = useMutation({
    mutationFn: () => {
      return client.competitions.updateAll(competitionId, verificationCode);
    },
    onSuccess: () => {
      toast.toast({
        variant: "success",
        title: "Update all submitted!",
      });
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.toast({ variant: "error", title: error.message });
      }
    },
  });

  // Clear the inputs when the form is unmounted
  useEffect(() => {
    return () => {
      setVerificationCode("");
    };
  }, []);

  if (updateMutation.data) {
    const count = Number(updateMutation.data.message.split(" ")[0]);

    return (
      <div className="rounded-md border border-gray-500 p-5">
        <div className="flex items-center gap-x-1">
          <CheckIcon className="h-4 w-4 text-green-400" />
          <span className="font-medium">Submitted successfully</span>
        </div>
        <p className="mt-1 text-body text-gray-200">
          {count} outdated {count === 1 ? "player is" : "players are"} being updated in the background.
          This might take a few minutes. You can now close this dialog.
        </p>
      </div>
    );
  }

  return (
    <form
      className="mt-4 flex flex-col gap-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        updateMutation.mutate();
      }}
    >
      <div className="flex flex-col">
        <Label className="mb-2 text-xs font-normal text-gray-200">Verification code</Label>
        <Input
          type="password"
          name="verificationCode"
          autoComplete="verificationCode"
          placeholder="xxx-xxx-xxx"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
        />
        <Label className="mt-4 text-xs text-gray-200">
          Lost your verification code?&nbsp;
          <a
            href="https://wiseoldman.net/discord"
            target="_blank"
            rel="noreferrer"
            className="text-white underline"
          >
            Join our Discord for help
          </a>
        </Label>
      </div>
      <Button
        type="submit"
        size="lg"
        variant="blue"
        className="mt-6 justify-center"
        disabled={verificationCode.length === 0 || updateMutation.isPending}
      >
        {updateMutation.isPending ? "Submitting..." : "Confirm"}
      </Button>
    </form>
  );
}
