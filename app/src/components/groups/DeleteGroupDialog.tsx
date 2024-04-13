"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "~/hooks/useToast";
import { useWOMClient } from "~/hooks/useWOMClient";
import { Input } from "../Input";
import { Label } from "../Label";
import { Button } from "../Button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../Tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../Dialog";

import InfoIcon from "~/assets/info.svg";

interface DeleteGroupDialogProps {
  groupId: number;
}

export function DeleteGroupDialog(props: DeleteGroupDialogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isOpen = searchParams.get("dialog") === "delete";

  function handleClose() {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("dialog");

    router.replace(`${pathname}?${nextParams.toString()}`);
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(val) => {
        if (!val) handleClose();
      }}
    >
      <DialogContent className="w-[28rem]">
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete this group and all its data.
          </DialogDescription>
        </DialogHeader>
        <DeleteGroupForm
          groupId={props.groupId}
          onQuit={() => handleClose()}
          onSubmitted={() => router.push("/groups")}
        />
      </DialogContent>
    </Dialog>
  );
}

interface DeleteGroupFormProps extends DeleteGroupDialogProps {
  onQuit: () => void;
  onSubmitted: () => void;
}

function DeleteGroupForm(props: DeleteGroupFormProps) {
  const { groupId, onQuit, onSubmitted } = props;

  const toast = useToast();
  const client = useWOMClient();

  const [verificationCode, setVerificationCode] = useState("");

  const deleteMutation = useMutation({
    mutationFn: () => {
      return client.groups.deleteGroup(groupId, verificationCode);
    },
    onSuccess: () => {
      toast.toast({ variant: "success", title: "Group deleted successfully!" });
      onSubmitted();
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.toast({ variant: "error", title: error.message });
      }
    },
  });

  return (
    <form
      className="mt-2 flex flex-col gap-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        deleteMutation.mutate();
      }}
    >
      <div className="flex flex-col">
        <div className="mb-2 flex items-center">
          <Label className="text-xs font-normal text-gray-200">Verification code</Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <InfoIcon className="ml-1 h-3 w-3 text-gray-200" />
              </span>
            </TooltipTrigger>
            <TooltipContent align="center" className="text-gray-100">
              Lost or forgot your code?
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://wiseoldman.net/discord"
                className="ml-1 text-white underline"
              >
                Join our Discord for help
              </a>
            </TooltipContent>
          </Tooltip>
        </div>
        <Input
          autoFocus
          type="password"
          name="verificationCode"
          autoComplete="verificationCode"
          placeholder="Ex: 123-456-789"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
        />
        <div className="mt-4 flex justify-end gap-x-2">
          <Button type="button" onClick={onQuit}>
            Cancel
          </Button>
          <Button
            variant="red"
            type="submit"
            disabled={verificationCode.length === 0 || deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </form>
  );
}
