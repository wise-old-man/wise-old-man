"use client";

import { useState } from "react";
import { cn } from "~/utils/styling";
import { useMutation } from "@tanstack/react-query";
import { WOMClient } from "@wise-old-man/utils";
import { useToast } from "~/hooks/useToast";
import { Input } from "../Input";
import { Label } from "../Label";
import { Button } from "../Button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../Tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../Dialog";

import InfoIcon from "~/assets/info.svg";
import CheckIcon from "~/assets/check.svg";

interface VerificationCodeCheckDialogProps {
  isOpen: boolean;
  groupId: number;
  onValidated: (code: string) => void;
}

export function VerificationCodeCheckDialog(props: VerificationCodeCheckDialogProps) {
  const { groupId, isOpen, onValidated } = props;

  const toast = useToast();
  const [verificationCode, setVerificationCode] = useState("");

  const checkMutation = useMutation({
    mutationFn: async () => {
      const client = new WOMClient({
        userAgent: "WiseOldMan - App v2 (Client Side)",
      });

      try {
        await client.groups.editGroup(groupId, {}, verificationCode);
      } catch (error) {
        if (!(error instanceof Error) || !("statusCode" in error)) throw new Error();

        // If it failed with 400 (Bad Request), that means it got through the code validation checks
        // and just failed due to an empty payload (as expected)
        if (error.statusCode === 400) return verificationCode;
        throw error;
      }
    },
    onError: () => {
      console.log("what");
      toast.toast({ variant: "error", title: "Incorrect verification code." });
    },
    onSuccess: (code) => {
      setTimeout(() => {
        if (code) onValidated(code);
      }, 500);
    },
  });

  const hasValidated = !!checkMutation.data;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="w-[28rem]" hideClose>
        <DialogHeader>
          <DialogTitle>Verification check</DialogTitle>
          <DialogDescription>
            To edit this group, you must first verify that you are the owner of the group.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            checkMutation.mutate();
          }}
        >
          <div className="mb-2 mt-5 flex items-center">
            {hasValidated ? (
              <>
                <Label className="mr-1 text-xs font-normal text-green-400">Validated</Label>
                <CheckIcon className="h-4 w-4 text-green-400" />
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
          <Input
            type="password"
            autoFocus
            name="verificationCode"
            autoComplete="verificationCode"
            className={cn(hasValidated && "border-green-400")}
            placeholder="Ex: 123-456-789"
            value={verificationCode}
            disabled={checkMutation.isPending}
            onChange={(e) => setVerificationCode(e.target.value)}
          />
          <div className="flex">
            <Button
              size="lg"
              variant="blue"
              className="mt-4 grow justify-center"
              disabled={verificationCode.length === 0 || checkMutation.isPending || hasValidated}
            >
              {hasValidated ? "Please wait..." : checkMutation.isPending ? "Checking..." : "Confirm"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
