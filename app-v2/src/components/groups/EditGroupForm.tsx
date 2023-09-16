"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { GroupDetails, WOMClient } from "@wise-old-man/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "~/hooks/useToast";
import { cn } from "~/utils/styling";
import { Container } from "../Container";
import { QueryLink } from "../QueryLink";
import { GroupInformationForm } from "./GroupInformationForm";
import { VerificationCodeCheckDialog } from "./VerificationCodeCheckDialog";

interface EditGroupFormProps {
  group: GroupDetails;
}

export function EditGroupForm(props: EditGroupFormProps) {
  const { group } = props;

  const [verificationCode, setVerificationCode] = useState<string | undefined>();

  return (
    <Container className="max-w-4xl">
      <div className="flex items-end justify-between border-b border-gray-600 pb-7">
        <h1 className="text-3xl font-bold">{group.name}</h1>
        <Link href={`/groups/${group.id}`} className="text-sm text-blue-400 hover:underline">
          Go to group page
        </Link>
      </div>

      <div className="grid grid-cols-10 gap-x-7">
        <div className="col-span-3 border-r border-gray-600 pr-7 pt-7">
          <SideNavigation />
        </div>
        <div className="col-span-7 pt-7">
          <GeneralSection {...props} verificationCode={verificationCode || ""} />
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
