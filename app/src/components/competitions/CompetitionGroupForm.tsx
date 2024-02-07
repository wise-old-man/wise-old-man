"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { GroupListItem } from "@wise-old-man/utils";
import { useToast } from "~/hooks/useToast";
import { useWOMClient } from "~/hooks/useWOMClient";
import { cn } from "~/utils/styling";
import { Alert, AlertDescription } from "../Alert";
import { Input } from "../Input";
import { Label } from "../Label";
import { Switch } from "../Switch";
import { GroupSearch } from "../groups/GroupSearch";

import CloseIcon from "~/assets/close.svg";
import VerifiedIcon from "~/assets/verified.svg";

interface CompetitionGroupFormProps {
  group: GroupListItem | undefined;
  groupVerificationCode: string | undefined;

  onSkip: () => void;
  onCodeConfirmed: (code: string) => void;
  onGroupSelected: (group: GroupListItem | undefined) => void;

  formActions: (disabled: boolean, loading: boolean) => JSX.Element;
}

export function CompetitionGroupForm(props: CompetitionGroupFormProps) {
  const toast = useToast();
  const client = useWOMClient();

  const { group, onSkip, onGroupSelected, onCodeConfirmed } = props;

  const [isGroupCompetition, setIsGroupCompetition] = useState(!!group);
  const [groupVerificationCode, setGroupVerificationCode] = useState(props.groupVerificationCode);

  const canSubmit =
    !isGroupCompetition || !!(group && groupVerificationCode && groupVerificationCode.length === 11);

  const checkMutation = useMutation({
    mutationFn: async () => {
      if (!group || !groupVerificationCode) return;

      try {
        await client.groups.editGroup(group.id, {}, groupVerificationCode);
      } catch (error) {
        if (!(error instanceof Error) || !("statusCode" in error)) throw new Error();

        // If it failed with 400 (Bad Request), that means it got through the code validation checks
        // and just failed due to an empty payload (as expected)
        if (error.statusCode === 400) return groupVerificationCode;
        throw error;
      }
    },
    onError: () => {
      toast.toast({ variant: "error", title: "Incorrect verification code." });
    },
    onSuccess: (code) => {
      if (code) {
        onCodeConfirmed(code);
      }
    },
  });

  return (
    <form
      className="flex flex-col gap-y-7"
      onSubmit={(e) => {
        e.preventDefault();

        if (isGroupCompetition) {
          checkMutation.mutate();
        } else {
          onSkip();
        }
      }}
    >
      <Alert>
        <AlertDescription>
          <p>
            By linking your group as the host to this competition, all your group members will be
            automatically synced up as this competition&apos;s participants. You will also be able to
            edit/delete the competition using the group&apos;s verification code instead.
          </p>
          <p className="mt-5">
            Dont&apos;t have a group yet?{" "}
            <Link prefetch={false} href="/groups/create" className="text-blue-400">
              Create one here
            </Link>
          </p>
        </AlertDescription>
      </Alert>

      <div>
        <span className="text-body">Is this a group competition?</span>
        <div className="mt-3 flex items-center gap-x-3">
          <Switch
            checked={isGroupCompetition}
            onCheckedChange={(val) => {
              setIsGroupCompetition(val);
              if (!val) onGroupSelected(undefined);
            }}
          />
          <span>{isGroupCompetition ? "Yes" : "No"}</span>
        </div>
      </div>

      <div className={cn("mt-4", !isGroupCompetition && "pointer-events-none opacity-50")}>
        <div>
          <Label className="mb-2 block text-xs text-gray-200">Group selection</Label>
          <GroupSelector group={group} onGroupSelected={onGroupSelected} />
        </div>
        <div className="mt-7">
          <Label htmlFor="code" className="mb-2 block text-xs text-gray-200">
            Group verification code
          </Label>
          <Input
            id="code"
            type="password"
            className="h-12"
            placeholder="Ex: 123-456-789"
            maxLength={11}
            value={groupVerificationCode}
            onChange={(e) => setGroupVerificationCode(e.target.value)}
          />
        </div>
      </div>

      {/* Allow the parent pages to render what they need on the actions slot (Previous/Next or Save) */}
      <div className="mt-3 border-t border-gray-500 py-5">
        {props.formActions(!canSubmit, checkMutation.isPending)}
      </div>
    </form>
  );
}

interface GroupSelectorProps {
  group?: GroupListItem;
  onGroupSelected: (group?: GroupListItem) => void;
}

function GroupSelector(props: GroupSelectorProps) {
  const { group, onGroupSelected } = props;

  if (group) {
    return (
      <div className="flex h-12 items-center justify-between rounded-md border border-gray-400 bg-gray-700 px-4 shadow-sm">
        <div>
          <div className="flex items-center gap-x-1.5 text-sm font-medium">
            {group.name}
            {group.verified && <VerifiedIcon className="h-4 w-4" />}
          </div>
        </div>
        <button type="button" onClick={() => onGroupSelected(undefined)}>
          <CloseIcon className="-mr-1 h-7 w-7 rounded p-1 text-gray-200 hover:bg-gray-600 hover:text-gray-100" />
        </button>
      </div>
    );
  }

  return <GroupSearch onGroupSelected={onGroupSelected} />;
}
