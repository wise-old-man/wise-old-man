"use client";

import { useQuery } from "@tanstack/react-query";
import { GroupMemberFragment, GroupRole } from "@wise-old-man/utils";
import useDebouncedValue from "~/hooks/useDebouncedValue";
import { useWOMClient } from "~/hooks/useWOMClient";
import { cn } from "~/utils/styling";
import { useState } from "react";
import { Input } from "../Input";
import { Label } from "../Label";
import { Button } from "../Button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../Dialog";

interface ImportFromTempleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (members: GroupMemberFragment[]) => void;
}

export function ImportFromTempleDialog(props: ImportFromTempleDialogProps) {
  const { isOpen } = props;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(val) => {
        if (!val) props.onClose();
      }}
    >
      <DialogContent className="w-[28rem]">
        <DialogHeader>
          <DialogTitle>Import from TempleOSRS</DialogTitle>
          <DialogDescription>
            Import all your group members by pasting in your group&apos;s TempleOSRS URL
          </DialogDescription>
        </DialogHeader>
        <ImportFromTempleForm {...props} />
      </DialogContent>
    </Dialog>
  );
}

function ImportFromTempleForm(props: ImportFromTempleDialogProps) {
  const { onSubmit } = props;

  const [urlInput, setUrlInput] = useState("");

  const debouncedValue = useDebouncedValue(urlInput, 300);
  const client = useWOMClient();

  const { data, error, isLoading } = useQuery<{ members: string[]; leaders?: string[] }>({
    queryKey: ["templeImport", debouncedValue],
    queryFn: () => {
      const parsedId = parseURL(debouncedValue);

      return client.getRequest(`/groups/migrate/temple/${parsedId}`);
    },
    retry: 2,
    staleTime: 30,
    enabled: debouncedValue.length > 0,
  });

  function handleSubmit() {
    if (!data) return;

    onSubmit([
      ...(data.leaders?.map((username) => ({ username, role: GroupRole.LEADER })) || []),
      ...data.members.map((username) => ({ username, role: GroupRole.MEMBER })),
    ]);
  }

  return (
    <form
      className="mt-2 flex flex-col gap-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <Input
        disabled={isLoading}
        placeholder="TempleOSRS group URL"
        className={cn(!!data && "border-green-400", !!error && "border-red-400")}
        value={urlInput}
        onChange={(e) => setUrlInput(e.target.value)}
      />
      {isLoading && <Label className="text-xs text-gray-200">Loading...</Label>}
      {!!data && (
        <Label className="text-xs text-green-400">
          Found {data.members.length + (data.leaders?.length || 0)} members
        </Label>
      )}
      {!!error && (
        <Label className="text-xs text-red-400">
          Failed to find any valid group in the provided URL
        </Label>
      )}
      {!!data && (
        <pre className="custom-scroll mt-3 max-h-[20vh] overflow-y-auto rounded-md border border-gray-500 p-3 font-sans text-sm leading-7">
          {data.members.join("\n")}
        </pre>
      )}
      <Button size="lg" disabled={!data} variant="primary" className="mt-4 justify-center">
        Confirm
      </Button>
    </form>
  );
}

function parseURL(url: string) {
  const match = url.match(/id=(\d+)/) || [];

  if (!match || !match.length) {
    throw new Error();
  }

  // Return the group id
  return parseInt(match[1]);
}
