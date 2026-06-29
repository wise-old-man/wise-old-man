"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useMutation } from "@tanstack/react-query";
import { GroupDetailsResponse } from "@wise-old-man/utils";
import { useRouter } from "next/navigation";
import { useToast } from "~/hooks/useToast";
import { useTicker } from "~/hooks/useTicker";
import { useWOMClient } from "~/hooks/useWOMClient";
import { Alert, AlertDescription } from "../Alert";
import { Button } from "../Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../Dialog";
import { Input } from "../Input";

import ClipboardIcon from "~/assets/clipboard.svg";
import LoadingIcon from "~/assets/loading.svg";
import WarningIcon from "~/assets/warning.svg";

const MIN_WAIT_PERIOD_SECONDS = 10;

interface CompetitionCodeSectionProps {
  group: GroupDetailsResponse;
  verificationCode: string;
}

export function CompetitionCodeSection(props: CompetitionCodeSectionProps) {
  const { group, verificationCode } = props;

  const toast = useToast();
  const router = useRouter();
  const client = useWOMClient();

  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [isTransitioning, startTransition] = useTransition();

  const generateMutation = useMutation({
    mutationFn: () => {
      return client.groups.generateCompetitionCode(group.id, verificationCode);
    },
    onSuccess: (data) => {
      setGeneratedCode(data.competitionCode);
      setShowCodeDialog(true);
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.toast({ variant: "error", title: error.message });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => {
      return client.groups.deleteCompetitionCode(group.id, verificationCode);
    },
    onSuccess: () => {
      startTransition(() => {
        router.refresh();
        toast.toast({ variant: "success", title: "Competition code deleted successfully." });
      });
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.toast({ variant: "error", title: error.message });
      }
    },
  });

  const hasCompetitionCode = group.hasCompetitionCode;

  return (
    <div className="flex w-full flex-col gap-y-7">
      <Alert>
        <AlertDescription>
          <p>
            A competition code allows trusted members to create group competitions without having full
            access to manage the group. Share this code with clan event managers or trusted members who
            need to create competitions on behalf of your group.
          </p>
          <p className="mt-3 text-gray-100">
            The competition code <span className="font-medium text-white">cannot</span> be used to edit,
            delete, or manage the group itself.
          </p>
        </AlertDescription>
      </Alert>

      <div className="rounded-lg border border-gray-500 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-white">Competition Code</h3>
            <p className="mt-1 text-xs text-gray-200">
              {hasCompetitionCode
                ? "A competition code has been generated for this group."
                : "No competition code has been generated yet."}
            </p>
          </div>
          <div className="flex items-center gap-x-1.5">
            {hasCompetitionCode ? (
              <span className="rounded-full bg-green-900/30 px-2 py-0.5 text-xs font-medium text-green-400">
                Active
              </span>
            ) : (
              <span className="rounded-full bg-gray-600 px-2 py-0.5 text-xs font-medium text-gray-200">
                Not set
              </span>
            )}
          </div>
        </div>

        <div className="mt-5 flex gap-x-3">
          <Button
            variant="blue"
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
          >
            {generateMutation.isPending ? (
              <>
                <LoadingIcon className="-ml-1 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : hasCompetitionCode ? (
              "Reset Code"
            ) : (
              "Generate Code"
            )}
          </Button>
          {hasCompetitionCode && (
            <Button
              variant="outline"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending || isTransitioning}
            >
              {deleteMutation.isPending || isTransitioning ? (
                <>
                  <LoadingIcon className="-ml-1 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Code"
              )}
            </Button>
          )}
        </div>

        {hasCompetitionCode && (
          <p className="mt-3 flex items-start gap-x-1.5 text-xs text-yellow-200">
            <WarningIcon className="mt-0.5 h-3 w-3 shrink-0" />
            Resetting will invalidate the previous code. Anyone using the old code will need the new one.
          </p>
        )}
      </div>

      <SaveCompetitionCodeDialog
        isOpen={showCodeDialog}
        competitionCode={generatedCode}
        onClose={() => {
          setShowCodeDialog(false);
          startTransition(() => {
            router.refresh();
          });
        }}
      />
    </div>
  );
}

interface SaveCompetitionCodeDialogProps {
  isOpen: boolean;
  competitionCode: string;
  onClose: () => void;
}

function SaveCompetitionCodeDialog(props: SaveCompetitionCodeDialogProps) {
  const { isOpen, onClose, competitionCode } = props;

  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const [isTransitioning, startTransition] = useTransition();
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
        if (!val && hasWaited) onClose();
      }}
    >
      <DialogContent className="w-[22rem]" hideClose onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-center">Competition Code Generated!</DialogTitle>
          <span className="text-center text-sm text-blue-400">
            Your group&apos;s competition code is:
          </span>
        </DialogHeader>
        <div className="relative flex items-center gap-x-2">
          <Input
            aria-label="Competition code"
            ref={inputRef}
            readOnly
            autoFocus={false}
            value={competitionCode}
            containerClassName="grow"
            className="h-[3.25rem] text-center font-mono text-xl"
          />
          <Button
            autoFocus
            variant="outline"
            iconButton
            className="absolute right-2 top-2 bg-white/5"
            onClick={() => {
              if (inputRef.current) inputRef.current.select();
              navigator.clipboard.writeText(competitionCode);
              toast.toast({ variant: "success", title: "Copied to the clipboard!" });
            }}
          >
            <ClipboardIcon className="h-5 w-5 text-gray-200" />
          </Button>
        </div>
        <p className="text-center text-body text-gray-200">
          Save this code and share it with trusted members who need to create competitions for your
          group. This code <span className="font-medium text-white">cannot</span> be used to manage the
          group itself.
        </p>
        <Button
          size="lg"
          variant="blue"
          className="mt-4 justify-center tabular-nums"
          disabled={!hasWaited || isTransitioning}
          onClick={() => {
            startTransition(() => {
              onClose();
            });
          }}
        >
          {isTransitioning ? (
            "Closing..."
          ) : (
            <>
              {hasWaited ? "Ok, I got it" : "Please read above"}{" "}
              {!hasWaited && `(${MIN_WAIT_PERIOD_SECONDS - timeEllapsed}s)`}
            </>
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
