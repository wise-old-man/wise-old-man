"use client";

import { CompetitionDetails, CompetitionType, Metric, WOMClient } from "@wise-old-man/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Container } from "../Container";
import { QueryLink } from "../QueryLink";
import { cn } from "~/utils/styling";
import { GroupVerificationCodeCheckDialog } from "../groups/GroupVerificationCodeCheckDialog";
import { CompetitionVerificationCodeCheckDialog } from "./CompetitionVerificationCodeCheckDialog";
import { CompetitionInfoForm } from "./CompetitionInfoForm";
import { Button } from "../Button";
import { useToast } from "~/hooks/useToast";
import { useMutation } from "@tanstack/react-query";

import WarningIcon from "~/assets/warning.svg";
import LoadingIcon from "~/assets/loading.svg";

type TimezoneOption = "local" | "utc";

interface EditCompetitionFormProps {
  competition: CompetitionDetails;
}

export function EditCompetitionForm(props: EditCompetitionFormProps) {
  const { competition } = props;

  const section = useSearchParams().get("section");
  const [verificationCode, setVerificationCode] = useState<string>("600-519-911");

  return (
    <Container className="max-w-4xl">
      <h1 className="mt-3 border-b border-gray-600 pb-7 text-3xl font-bold">{competition.title}</h1>

      <div className="grid grid-cols-10 gap-x-12">
        <div className="col-span-3 border-r border-gray-600 pr-7 pt-7">
          <SideNavigation type={competition.type} />
        </div>
        <div className="col-span-7 pt-7">
          {section === "teams" ? (
            <div>teams!</div>
          ) : (
            <>
              {section === "participants" ? (
                <div>participants!</div>
              ) : (
                <GeneralSection {...props} verificationCode={verificationCode} />
              )}
            </>
          )}
        </div>
      </div>

      {/* {competition.group ? (
        <GroupVerificationCodeCheckDialog
          group={competition.group}
          isOpen={!verificationCode}
          onValidated={setVerificationCode}
          isEditingGroupCompetition
        />
      ) : (
        <CompetitionVerificationCodeCheckDialog
          competition={competition}
          isOpen={!verificationCode}
          onValidated={setVerificationCode}
        />
      )} */}
    </Container>
  );
}

function SideNavigation(props: { type: CompetitionType }) {
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
      {props.type === CompetitionType.CLASSIC ? (
        <QueryLink query={{ section: "participants" }}>
          <li
            className={cn(
              "relative overflow-hidden rounded px-4 py-3 text-sm text-gray-200 hover:bg-gray-800 active:bg-gray-600",
              section === "participants" && "bg-gray-700 text-white"
            )}
          >
            {section === "participants" && (
              <div className="absolute bottom-0 left-0 top-0 w-0.5 bg-blue-500" />
            )}
            Participants
          </li>
        </QueryLink>
      ) : (
        <QueryLink query={{ section: "teams" }}>
          <li
            className={cn(
              "relative overflow-hidden rounded px-4 py-3 text-sm text-gray-200 hover:bg-gray-800 active:bg-gray-600",
              section === "teams" && "bg-gray-700 text-white"
            )}
          >
            {section === "teams" && <div className="absolute bottom-0 left-0 top-0 w-0.5 bg-blue-500" />}
            Teams
          </li>
        </QueryLink>
      )}
    </ul>
  );
}

function GeneralSection(props: EditCompetitionFormProps & { verificationCode: string }) {
  const { competition, verificationCode } = props;

  const toast = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [timezone, setTimezone] = useState<TimezoneOption>("local");

  const editGeneralMutation = useMutation({
    mutationFn: (payload: { title: string; metric: Metric; startsAt: Date; endsAt: Date }) => {
      const client = new WOMClient({
        userAgent: "WiseOldMan - App v2 (Client Side)",
      });

      return client.competitions.editCompetition(competition.id, payload, verificationCode);
    },
    onSuccess: () => {
      startTransition(() => {
        router.refresh();
        toast.toast({ variant: "success", title: "Competition edited successfully!" });
      });
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.toast({ variant: "error", title: error.message });
      }
    },
  });

  return (
    <CompetitionInfoForm
      timezone={timezone}
      competition={competition}
      onTimezoneChanged={(tz) => {
        setTimezone(tz);
      }}
      onCompetitionChanged={(payload) => {
        const { title, metric, startsAt, endsAt } = payload;
        editGeneralMutation.mutate({ title, metric, startsAt, endsAt });
      }}
      formActions={(disabled, hasUnsavedChanges) => (
        <div className={cn("flex", hasUnsavedChanges ? "justify-between" : "justify-end")}>
          {hasUnsavedChanges && (
            <div className="flex items-center justify-center text-center text-xs text-gray-200">
              <WarningIcon className="mr-1 h-4 w-4" />
              You have unsaved changes
            </div>
          )}
          <Button
            variant="blue"
            disabled={disabled || !hasUnsavedChanges || isPending || editGeneralMutation.isPending}
          >
            {editGeneralMutation.isPending || isPending ? (
              <>
                <LoadingIcon className="-ml-1 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>Save</>
            )}
          </Button>
        </div>
      )}
    />
  );
}
