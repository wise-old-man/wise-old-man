"use client";

import { useEffect, useRef, useState } from "react";

import { useToast } from "~/hooks/useToast";
import { useTicker } from "~/hooks/useTicker";
import { Input } from "../Input";
import { Button } from "../Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../Dialog";

import ClipboardIcon from "~/assets/clipboard.svg";

const MIN_WAIT_PERIOD_SECONDS = 10;

interface SaveVerificationCodeDialogProps {
  isOpen: boolean;
  verificationCode: string;
  onClose: () => void;
}

export function SaveVerificationCodeDialog(props: SaveVerificationCodeDialogProps) {
  const { isOpen, onClose, verificationCode } = props;

  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const [openedTimestamp, setOpenedTimestamp] = useState<number | null>(null);

  useTicker(500, isOpen);

  useEffect(() => {
    if (isOpen) setOpenedTimestamp(Date.now());
  }, [isOpen]);

  const timeEllapsed = openedTimestamp ? Math.ceil((Date.now() - openedTimestamp) / 1000) : 0;
  const hasWaited = timeEllapsed >= MIN_WAIT_PERIOD_SECONDS;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(val) => {
        if (!val) props.onClose();
      }}
    >
      <DialogContent className="w-[22rem]">
        <DialogHeader>
          <DialogTitle className="text-center">Done!</DialogTitle>
          <span className="text-center text-sm text-blue-400">
            Your group&apos;s verification code is:
          </span>
        </DialogHeader>
        <div className="flex items-center gap-x-2">
          <Input
            ref={inputRef}
            readOnly
            autoFocus={false}
            value={verificationCode}
            containerClassName="grow"
            className="text-center font-mono text-xl"
          />

          <Button
            autoFocus
            variant="outline"
            iconButton
            onClick={() => {
              if (inputRef.current) inputRef.current.select();
              navigator.clipboard.writeText(verificationCode);

              toast.toast({ variant: "success", title: "Copied to the clipboard!" });
            }}
          >
            <ClipboardIcon className="h-5 w-5 text-gray-200" />
          </Button>
        </div>
        <p className="text-center text-body text-gray-200">
          Please save this code somewhere, without it you won&apos;t be able to edit or delete this group
          in the future.
        </p>
        <Button
          size="lg"
          variant="blue"
          className="mt-4 justify-center tabular-nums"
          disabled={!hasWaited}
          onClick={() => onClose()}
        >
          {hasWaited ? "Ok, I got it" : "Please read above"}{" "}
          {!hasWaited && `(${MIN_WAIT_PERIOD_SECONDS - timeEllapsed}s)`}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
