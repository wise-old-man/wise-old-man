"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import {
  CompetitionType,
  CreateCompetitionPayload,
  GroupDetails,
  GroupListItem,
  Metric,
  WOMClient,
} from "@wise-old-man/utils";
import { cn } from "~/utils/styling";
import { useToast } from "~/hooks/useToast";
import { Label } from "../Label";
import { Container } from "../Container";
import { CompetitionInfoForm } from "./CompetitionInfoForm";
import { CompetitionGroupForm } from "./CompetitionGroupForm";
import { CompetitionTypeSelector } from "./CompetitionTypeSelector";
import { CompetitionParticipantsForm } from "./CompetitionParticipantsForm";
import { SaveCompetitionVerificationCodeDialog } from "./SaveCompetitionVerificationCodeDialog";

type FormStep = "info" | "group" | "participants";
type TimezoneOption = "local" | "utc";

interface CreateCompetitionFormProps {
  group?: GroupDetails;
}

export function CreateCompetitionForm(props: CreateCompetitionFormProps) {
  const toast = useToast();
  const router = useRouter();

  const [group, setGroup] = useState<GroupListItem | undefined>(props.group);
  const [groupVerificationCode, setGroupVerificationCode] = useState("");

  const [step, setStep] = useState<FormStep>("info");
  const [timezone, setTimezone] = useState<TimezoneOption>("local");

  const [type, setType] = useState<CompetitionType>(CompetitionType.CLASSIC);

  const [competition, setCompetition] = useState<CreateCompetitionPayload>({
    title: "",
    metric: Metric.OVERALL,
    startsAt: getDefaultStartDate(),
    endsAt: getDefaultEndDate(),
    participants: [],
  });

  const stepLabel = {
    info: "1. Basic information",
    group: "2. Host group",
    participants: "3. Participants",
  }[step];

  const createMutation = useMutation({
    mutationFn: (competition: CreateCompetitionPayload) => {
      const client = new WOMClient({
        userAgent: "WiseOldMan - App v2 (Client Side)",
      });

      const payload = {
        ...competition,
      };

      if (group && groupVerificationCode) {
        payload.groupId = group.id;
        payload.groupVerificationCode = groupVerificationCode;
      }

      return client.competitions.createCompetition(payload);
    },
    onSuccess: (data) => {
      router.prefetch(`/competitions/${data.competition.id}`);
      toast.toast({ variant: "success", title: "Group created successfully!" });
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.toast({ variant: "error", title: error.message });
      }
    },
  });

  return (
    <Container className="mt-8 max-w-2xl">
      <h1 className="text-3xl font-bold">Create a new competition</h1>
      <div className="mt-5 flex gap-x-2">
        <div className="h-1 w-12 rounded-full bg-blue-500" />
        <div
          className={cn(
            "h-1 w-12 rounded-full transition-colors duration-300",
            step === "info" ? "bg-gray-500" : "bg-blue-500"
          )}
        />
        <div
          className={cn(
            "h-1 w-12 rounded-full transition-colors duration-300",
            step !== "participants" ? "bg-gray-500" : "bg-blue-500"
          )}
        />
      </div>
      <h2 className="mt-3 text-sm text-white">{stepLabel}</h2>
      <div className="mt-10">
        {step === "info" && (
          <CompetitionInfoForm
            timezone={timezone}
            competition={competition}
            onTimezoneChanged={(tz) => {
              setTimezone(tz);
            }}
            onCompetitionChanged={(c) => {
              setCompetition(c);
              setStep("group");
            }}
          />
        )}
        {step === "group" && (
          <CompetitionGroupForm
            group={group}
            groupVerificationCode={groupVerificationCode}
            onSkip={() => {
              setStep("participants");
            }}
            onGroupSelected={(group) => {
              setGroup(group);
            }}
            onCodeConfirmed={(code) => {
              setStep("participants");
              setGroupVerificationCode(code);
            }}
            onPreviousClicked={() => {
              setStep("info");
            }}
          />
        )}
        {step === "participants" && (
          <div className="flex flex-col gap-y-12">
            <div>
              <Label htmlFor="type" className="mb-2 block text-xs text-gray-200">
                Type
              </Label>
              <CompetitionTypeSelector
                id="type"
                type={type}
                onTypeChanged={(type) => {
                  setType(type);

                  if (type === CompetitionType.CLASSIC) {
                    setCompetition({ ...competition, participants: [] });
                  } else {
                    setCompetition({ ...competition, teams: [] });
                  }
                }}
              />
            </div>
            <CompetitionParticipantsForm
              type={type}
              group={group}
              competition={competition}
              onPreviousClicked={() => {
                setStep("group");
              }}
              onSubmit={() => {
                createMutation.mutate(competition);
              }}
              onTeamsChanged={(teams) => {
                setCompetition({ ...competition, teams });
              }}
              onParticipantsChanged={(participants) => {
                setCompetition({ ...competition, participants });
              }}
            />
          </div>
        )}
      </div>

      <SaveCompetitionVerificationCodeDialog
        isOpen={!!createMutation.data}
        isGroupCompetition={!!createMutation.data?.competition.groupId}
        verificationCode={createMutation.data?.verificationCode || ""}
        onClose={() => {
          if (!createMutation.data) return;
          router.push(`/competitions/${createMutation.data?.competition.id}`);
        }}
      />
    </Container>
  );
}

function getDefaultStartDate() {
  const now = new Date();
  now.setHours(20, 0, 0, 0);
  now.setDate(now.getDate() + 1);

  return now;
}

function getDefaultEndDate() {
  const now = new Date();
  now.setHours(20, 0, 0, 0);
  now.setDate(now.getDate() + 8);

  return now;
}
