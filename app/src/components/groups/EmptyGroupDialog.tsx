"use client";

import { Button } from "../Button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../Dialog";

interface EmptyGroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function EmptyGroupDialog(props: EmptyGroupDialogProps) {
  const { isOpen, onClose, onConfirm } = props;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(val) => {
        if (!val) props.onClose();
      }}
    >
      <DialogContent className="w-[24rem]">
        <DialogHeader>
          <DialogTitle>No members</DialogTitle>
          <DialogDescription>
            You&apos;re about to create a group with 0 members. Are you sure you want to continue?
          </DialogDescription>
        </DialogHeader>
        <div className="mt-3 flex justify-end gap-x-3">
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={onConfirm} variant="blue">
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
