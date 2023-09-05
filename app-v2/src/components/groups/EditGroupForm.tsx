"use client";

import { useMutation } from "@tanstack/react-query";
import { GroupDetails, WOMClient } from "@wise-old-man/utils";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { use, useState } from "react";
import { useToast } from "~/hooks/useToast";
import { cn } from "~/utils/styling";
import { Button } from "../Button";
import { Container } from "../Container";
import { Input } from "../Input";
import { Label } from "../Label";
import { QueryLink } from "../QueryLink";
import { Tooltip, TooltipContent, TooltipTrigger } from "../Tooltip";
import { GroupInformationForm } from "./GroupInformationForm";

import InfoIcon from "~/assets/info.svg";
import CheckIcon from "~/assets/check.svg";

interface EditGroupFormProps {
  group: GroupDetails;
}

export function EditGroupForm(props: EditGroupFormProps) {
  const { group } = props;

  const searchParams = useSearchParams();
  const section = searchParams.get("section");

  const [verificationCode, setVerificationCode] = useState<string | undefined>();

  return (
    <Container className="max-w-4xl">
      <h1 className="text-lg text-red-500">handle editing groups with null homeworld/clanChat/etc</h1>

      <div className="flex items-end justify-between border-b border-gray-600 pb-7">
        <h1 className="text-3xl font-bold">{group.name}</h1>
        <Link href={`/groups/${group.id}`} className="text-sm text-blue-400 hover:underline">
          Go to group page
        </Link>
      </div>
      {verificationCode ? (
        <div className="grid grid-cols-10 gap-x-7">
          <div className="col-span-3 border-r border-gray-600 pr-7 pt-7">
            <SideNavigation />
          </div>
          <div className="col-span-7 pt-7">
            <GeneralSection {...props} verificationCode={verificationCode} />
          </div>
        </div>
      ) : (
        <VerificationCodeWall {...props} onValidated={setVerificationCode} />
      )}
    </Container>
  );
}

function VerificationCodeWall(props: EditGroupFormProps & { onValidated: (code: string) => void }) {
  const toast = useToast();
  const [verificationCode, setVerificationCode] = useState("");

  const checkMutation = useMutation({
    mutationFn: async () => {
      const client = new WOMClient({
        userAgent: "WiseOldMan - App v2 (Client Side)",
      });

      try {
        await client.groups.editGroup(props.group.id, {}, verificationCode);
      } catch (error) {
        if (!(error instanceof Error) || !("statusCode" in error)) throw new Error();

        // If it failed with 400 (Bad Request), that means it got through the code validation checks
        // and just failed due to an empty payload (as expected)
        if (error.statusCode === 400) return verificationCode;
      }
    },
    onError: () => {
      toast.toast({ variant: "error", title: "Incorrect verification code." });
    },
    onSuccess: (code) => {
      setTimeout(() => {
        if (code) props.onValidated(code);
      }, 500);
    },
  });

  const hasValidated = !!checkMutation.data;

  return (
    <div className="mt-7 flex min-h-[16rem] items-center justify-center">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          checkMutation.mutate();
        }}
        className="flex flex-col rounded-md border border-gray-500 bg-gray-700 p-7 shadow-lg"
      >
        <p className="max-w-xs text-body">
          To edit this group, you must first verify that you are the owner of the group.
        </p>

        <div className="mb-2 mt-5 flex items-center">
          {hasValidated ? (
            <>
              <Label className="text-xs font-normal text-green-400">Validated</Label>
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
        <Button
          size="lg"
          variant="blue"
          className="mt-4 justify-center"
          disabled={verificationCode.length === 0 || checkMutation.isPending || hasValidated}
        >
          {hasValidated ? "Please wait..." : checkMutation.isPending ? "Submitting..." : "Confirm"}
        </Button>
      </form>
    </div>
  );
}

function GeneralSection(props: EditGroupFormProps & { verificationCode: string }) {
  const { group, verificationCode } = props;

  const router = useRouter();
  const toast = useToast();

  const editGeneralMutation = useMutation({
    mutationFn: (payload: {
      name: string;
      clanChat: string;
      homeworld: number;
      description: string;
    }) => {
      const client = new WOMClient({
        userAgent: "WiseOldMan - App v2 (Client Side)",
      });

      return client.groups.editGroup(group.id, payload, verificationCode);
    },
    onSuccess: () => {
      router.refresh();
      toast.toast({ variant: "success", title: "Group edited successfully!" });
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.toast({ variant: "error", title: error.message });
      }
    },
  });

  return (
    <GroupInformationForm
      group={group}
      onSubmit={(name, clanChat, homeworld, description) =>
        editGeneralMutation.mutate({ name, clanChat, homeworld, description })
      }
      ctaDisabled={editGeneralMutation.isPending}
      ctaContent={<>{editGeneralMutation.isPending ? "Saving..." : "Save"}</>}
      showUnsavedChangesWarning
    />
  );
}

function SideNavigation() {
  const searchParams = useSearchParams();
  const section = searchParams.get("section");

  return (
    <ul>
      <QueryLink query={{ section: "general" }}>
        <li
          className={cn(
            "relative overflow-hidden rounded px-4 py-3 text-sm text-gray-200 hover:bg-gray-800 active:bg-gray-600",
            (!section || section === "general") && "bg-gray-700 text-white"
          )}
        >
          {(!section || section === "general") && (
            <div className="absolute bottom-0 left-0 top-0 w-0.5 bg-blue-500" />
          )}
          General
        </li>
      </QueryLink>
      <QueryLink query={{ section: "members" }}>
        <li
          className={cn(
            "relative overflow-hidden rounded px-4 py-3 text-sm text-gray-200 hover:bg-gray-800 active:bg-gray-600",
            section === "members" && "bg-gray-700 text-white"
          )}
        >
          {section === "members" && <div className="absolute bottom-0 left-0 top-0 w-0.5 bg-blue-500" />}
          Members
        </li>
      </QueryLink>
    </ul>
  );
}
