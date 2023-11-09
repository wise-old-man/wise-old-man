"use client";

import { CreateGroupPayload, WOMClient } from "@wise-old-man/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../Dialog";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Label } from "../Label";
import { useState } from "react";
import { Input } from "../Input";
import { Button } from "../Button";
import { useToast } from "~/hooks/useToast";

const regularClient = new WOMClient({
  userAgent: "(League) Wise Old Man - App v2 (Client Side)",
});

interface CloneGroupDialogProps {
  onSubmit: (payload: CreateGroupPayload) => void;
}

export function CloneGroupDialog(props: CloneGroupDialogProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const isOpen = searchParams.get("dialog") === "clone-group";

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(val) => {
        if (!val) router.back();
      }}
    >
      <DialogContent className="md:!max-w-lg">
        <DialogHeader>
          <DialogTitle>Copy a main website group to this League website.</DialogTitle>
          <DialogDescription className="mb-5 mt-3 underline">
            Please keep in mind that these two groups will not be linked, and any changes in one will not
            be reflected in the other.
          </DialogDescription>
        </DialogHeader>
        <CloneGroupForm {...props} />
      </DialogContent>
    </Dialog>
  );
}

function CloneGroupForm(props: CloneGroupDialogProps) {
  const toast = useToast();

  const [url, setUrl] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  const groupId = parseURL(url);

  const checkMutation = useMutation({
    mutationFn: async () => {
      try {
        if (!groupId) return;

        await regularClient.groups.editGroup(groupId, {}, verificationCode);
      } catch (error) {
        if (!(error instanceof Error) || !("statusCode" in error)) throw new Error();

        // If it failed with 400 (Bad Request), that means it got through the code validation checks
        // and just failed due to an empty payload (as expected)
        if (error.statusCode === 400) return verificationCode;
        throw error;
      }
    },
    onError: () => {
      toast.toast({ variant: "error", title: "Incorrect verification code." });
    },
  });

  async function handleSubmit() {
    if (!groupId) return;

    // This will throw an error if the code is incorrect
    await checkMutation.mutateAsync();

    const group = await regularClient.groups.getGroupDetails(groupId);

    const payload = {
      name: group.name,
      clanChat: group.clanChat ? group.clanChat : undefined,
      homeworld: group.homeworld ? group.homeworld : undefined,
      description: group.description ? group.description : undefined,
      members: group.memberships.map((g) => ({ username: g.player.displayName, role: g.role })),
    };

    props.onSubmit(payload);
  }

  return (
    <form
      className="mt-5 flex flex-col gap-y-7"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <div>
        <Label htmlFor="url" className="mb-2 block text-xs font-normal text-gray-200">
          Group Page URL
        </Label>
        <Input
          autoFocus
          id="url"
          name="url"
          placeholder="Ex: https://www.wiseoldman.net/groups/201"
          value={url}
          disabled={checkMutation.isPending}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="verificationCode" className="mb-2 block text-xs font-normal text-gray-200">
          Group verification code
        </Label>
        <Input
          type="password"
          id="verificationCode"
          name="verificationCode"
          autoComplete="verificationCode"
          placeholder="Ex: 123-456-789"
          value={verificationCode}
          disabled={checkMutation.isPending}
          onChange={(e) => setVerificationCode(e.target.value)}
        />
      </div>
      <div className="flex">
        <Button
          size="lg"
          variant="primary"
          className="grow justify-center"
          disabled={
            url.length === 0 || verificationCode.length === 0 || !groupId || checkMutation.isPending
          }
        >
          {checkMutation.isPending ? "Submitting..." : "Confirm"}
        </Button>
      </div>
    </form>
  );
}

function parseURL(url: string) {
  const match = url.match(/\/groups\/(\d+)/g) || [];

  if (!match || !match.length) {
    return null;
  }

  return Number(match[0]?.replace("/groups/", ""));
}
