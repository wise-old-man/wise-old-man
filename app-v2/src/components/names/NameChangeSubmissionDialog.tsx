"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { WOMClient } from "@wise-old-man/utils";
import { useToast } from "~/hooks/useToast";
import { cn } from "~/utils/styling";
import { Input } from "../Input";
import { Label } from "../Label";
import { Button } from "../Button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../Dialog";

export function NameChangeSubmissionDialog() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const isOpen = searchParams.get("dialog") === "submit";

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
            Esse in amet ad minim cupidatat non tempor proident cupidatat nulla elit cillum. Voluptate
            ullamco pariatur elit id adipisicing.
          </DialogDescription>
        </DialogHeader>
        <SubmitNameChangeForm />
      </DialogContent>
    </Dialog>
  );
}

function SubmitNameChangeForm() {
  const toast = useToast();
  const router = useRouter();

  const [oldName, setOldName] = useState("");
  const [newName, setNewName] = useState("");

  const oldNameError = validate(oldName);
  const newNameError = validate(newName);

  const client = new WOMClient({
    userAgent: "WiseOldMan - App v2 (Client Side)",
  });

  const submitMutation = useMutation(
    (params: { oldName: string; newName: string }) => {
      return client.nameChanges.submitNameChange(params.oldName, params.newName);
    },
    {
      onSuccess: () => {
        toast.toast({
          variant: "success",
          title: "Name change submitted succesfully!",
          description: `It should be auto-reviewed within the next few minutes.`,
        });

        router.back();
      },
      onError: (error) => {
        if (error instanceof Error) {
          toast.toast({ variant: "error", title: error.message });
        }
      },
    }
  );

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
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className={cn(newNameError && "border-red-400")}
        />
        {newNameError && <Label className="mt-2 text-xs font-normal text-red-400">{newNameError}</Label>}
      </div>
      <Button
        type="submit"
        size="lg"
        variant="blue"
        className="mt-2 justify-center"
        disabled={!canSubmit || submitMutation.isLoading}
      >
        {submitMutation.isLoading ? "Submitting..." : "Confirm"}
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
