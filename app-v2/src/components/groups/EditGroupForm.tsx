"use client";

import { useMutation } from "@tanstack/react-query";
import { GroupDetails, WOMClient } from "@wise-old-man/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useToast } from "~/hooks/useToast";
import { cn } from "~/utils/styling";
import { Alert, AlertDescription, AlertTitle } from "../Alert";
import { Container } from "../Container";
import { Label } from "../Label";
import { PlayerSearch } from "../PlayerSearch";
import { QueryLink } from "../QueryLink";
import { RuneLiteSyncDialog } from "./RuneLiteSyncDialog";
import { GroupInformationForm } from "./GroupInformationForm";
import { ImportFromFileDialog } from "./ImportFromFileDialog";
import { VerificationCodeCheckDialog } from "./VerificationCodeCheckDialog";

interface EditGroupFormProps {
  group: GroupDetails;
}

export function EditGroupForm(props: EditGroupFormProps) {
  const { group } = props;

  const section = useSearchParams().get("section");

  const [verificationCode, setVerificationCode] = useState<string | undefined>();

  return (
    <Container className="max-w-4xl">
      <h1 className="mt-3 border-b border-gray-600 pb-7 text-3xl font-bold">{group.name}</h1>

      <div className="grid grid-cols-10 gap-x-7">
        <div className="col-span-3 border-r border-gray-600 pr-7 pt-7">
          <SideNavigation />
        </div>
        <div className="col-span-7 pt-7">
          {section === "members" ? (
            <MembersSection {...props} verificationCode={verificationCode || ""} />
          ) : (
            <GeneralSection {...props} verificationCode={verificationCode || ""} />
          )}
        </div>
      </div>

      <VerificationCodeCheckDialog
        groupId={group.id}
        isOpen={!verificationCode}
        onValidated={setVerificationCode}
      />
    </Container>
  );
}

function MembersSection(props: EditGroupFormProps & { verificationCode: string }) {
  const { group, verificationCode } = props;

  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <div>
      <RuneLiteSyncInfo />

      <div className="mt-10 flex justify-between">
        <Label className="mb-2 block text-xs text-gray-200">Add members</Label>
        <QueryLink query={{ dialog: "import" }} className="text-xs text-blue-400 hover:underline">
          Import members list
        </QueryLink>
      </div>
      <PlayerSearch mode="select" onPlayerSelected={() => {}} />

      <ImportFromFileDialog
        isOpen={searchParams.get("dialog") === "import"}
        onClose={() => {
          const nextParams = new URLSearchParams(searchParams);
          nextParams.delete("dialog");

          router.replace(`/groups/${group.id}/edit?${nextParams.toString()}`);
        }}
        onSubmit={(members) => {}}
      />

      <RuneLiteSyncDialog />
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
      clanChat: string | undefined;
      homeworld: number | undefined;
      description: string | undefined;
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
      isEditing={true}
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

function RuneLiteSyncInfo() {
  return (
    <Alert>
      <AlertTitle>Do you know about our integration with RuneLite?</AlertTitle>
      <AlertDescription className="mt-3">
        <p>
          By using our RuneLite plugin, you can automatically sync your WiseOldMan group with your
          in-game clan wth just one click.
        </p>

        <QueryLink
          query={{ dialog: "runelite-sync" }}
          className="mt-5 block text-blue-400 hover:underline"
        >
          Find out more
        </QueryLink>
        {/* <Accordion type="single" collapsible className="mt-5">
          <AccordionItem value="find_out_more" className="border-0">
            <AccordionTrigger className="rounded border border-gray-500 p-3 text-sm text-gray-100">
              Find out more
            </AccordionTrigger>
            <AccordionContent className="mt-1 rounded border border-gray-500 p-3 text-gray-200">
              <p>
                The Wise Old Man plugin makes managing groups easy. With just a few clicks, group leaders
                can synchronize their clan list with their Wise Old Man group. Syncing cross references
                your clan members with your WOM group, then gives you the option to either add new
                members or overwrite the whole group.
              </p>
              <p className="mt-3">
                To use this feature, make sure you have your plugin configured correctly. Check the “Sync
                Clan Button” box, enter your group number/ID (you can find it in your group&apos;'s page
                URL), and your group&apos;s verification code.&nbsp;
                <span className="font-bold">
                  The sync button will not appear if your group number and verification code are
                  incorrect.
                </span>
                <Image src={PluginSettings} alt="RuneLite Plugin Settings" className="mt-5" />
                <Image src={PluginButton} alt="RuneLite Plugin Sync Button" className="mt-5" />
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion> */}
      </AlertDescription>
    </Alert>
  );
}
