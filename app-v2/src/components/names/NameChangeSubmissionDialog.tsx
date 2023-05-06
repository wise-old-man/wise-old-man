"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../Dialog";
import { Input } from "../Input";
import { Button } from "../Button";
import { useEffect, useState } from "react";

export function NameChangeSubmissionDialog() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const isOpen = searchParams.get("modal") === "submit";

  const [oldName, setOldName] = useState("");
  const [newName, setNewName] = useState("");

  function handleSubmit() {
    // TODO: send API request
    console.log({ oldName, newName });
  }

  // Clear the inputs when the dialog is closed
  useEffect(() => {
    if (!isOpen) {
      setOldName("");
      setNewName("");
    }
  }, [isOpen]);

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
        <form
          className="flex flex-col gap-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <Input
            placeholder="Enter the old name"
            value={oldName}
            onChange={(e) => setOldName(e.target.value)}
          />
          <Input
            placeholder="Enter the new name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Button
            variant="blue"
            size="lg"
            className="mt-2 justify-center"
            disabled={oldName.length === 0 || newName.length === 0}
          >
            Confirm
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
