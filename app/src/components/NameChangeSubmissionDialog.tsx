"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { WOMClient } from "@wise-old-man/utils";
import { useToast } from "~/hooks/useToast";
import { cn } from "~/utils/styling";
import { Input } from "./Input";
import { Label } from "./Label";
import { Button } from "./Button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./Dialog";

interface NameChangeSubmissionDialogProps {
  oldName?: string;
}

export function NameChangeSubmissionDialog(props: NameChangeSubmissionDialogProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const isOpen = searchParams.get("dialog") === "submit-name";

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(val) => {
        if (!val) router.back();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit new name change</DialogTitle>
          <DialogDescription>
            Most name changes are usually auto-reviewed within the first two minutes. If yours
            doesn&apos;t, you can contact us on&nbsp;
            <a
              href="https://wiseoldman.net/discord"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-white hover:underline"
            >
              Discord
            </a>
            &nbsp;for help.
          </DialogDescription>
        </DialogHeader>
        <SubmitNameChangeForm {...props} />
      </DialogContent>
    </Dialog>
  );
}

function SubmitNameChangeForm(props: NameChangeSubmissionDialogProps) {
  const toast = useToast();
  const router = useRouter();

  const [isTransitioning, startTransition] = useTransition();

  const [oldName, setOldName] = useState(props.oldName || "");
  const [newName, setNewName] = useState("");

  const oldNameError = validate(oldName);
  const newNameError = validate(newName);

  const submitMutation = useMutation({
    mutationFn: (params: { oldName: string; newName: string }) => {
      const client = new WOMClient({
        userAgent: "WiseOldMan - App v2 (Client Side)",
      });

      return client.nameChanges.submitNameChange(params.oldName, params.newName);
    },
    onSuccess: () => {
      startTransition(() => {
        router.refresh();
        router.push("/names");

        toast.toast({
          variant: "success",
          title: "Name change submitted succesfully!",
          description: `It should be auto-reviewed within the next few minutes.`,
        });
      });
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.toast({ variant: "error", title: error.message });
      }
    },
  });

  const canSubmit = oldName.length > 0 && newName.length > 0 && !oldNameError && !newNameError;

  // Clear the inputs when the form is unmounted
  useEffect(() => {
    return () => {
      setOldName("");
      setNewName("");
    };
  }, []);

  return (
    <form
      className="mt-2 flex flex-col gap-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        submitMutation.mutate({ oldName, newName });
      }}
    >
      <div className="flex flex-col">
        <Label className="mb-2 text-xs font-normal text-gray-200">Old Name</Label>
        <Input
          placeholder="Ex: Zezima"
          name="oldName"
          value={oldName}
          onChange={(e) => setOldName(e.target.value)}
          className={cn(oldNameError && "border-red-400")}
        />
        {oldNameError && <Label className="mt-2 text-xs font-normal text-red-400">{oldNameError}</Label>}
      </div>
      <div className="mt-1 flex flex-col">
        <Label className="mb-2 text-xs font-normal text-gray-200">New Name</Label>
        <Input
          placeholder="Ex: Lynx Titan"
          name="newName"
          autoFocus={!!props.oldName}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className={cn(newNameError && "border-red-400")}
        />
        {newNameError && <Label className="mt-2 text-xs font-normal text-red-400">{newNameError}</Label>}
      </div>
      <Button
        type="submit"
        size="lg"
        variant="primary"
        className="mt-2 justify-center"
        disabled={!canSubmit || isTransitioning || submitMutation.isPending}
      >
        {isTransitioning || submitMutation.isPending ? "Submitting..." : "Confirm"}
      </Button>
    </form>
  );
}

function validate(username: string): string | undefined {
  const sanitized = username.trim();

  if (sanitized.length > 12) {
    return "Usernames have a maximum length of 12 characters.";
  }

  if (sanitized.length > 0 && !new RegExp(/^[a-zA-Z0-9 ]{1,12}$/).test(sanitized)) {
    return "Usernames cannot contain any special characters.";
  }

  return "";
}
