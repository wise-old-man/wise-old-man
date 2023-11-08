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
} from "@wise-old-man/utils";
import { cn } from "~/utils/styling";
import { useToast } from "~/hooks/useToast";
import { useWOMClient } from "~/hooks/useWOMClient";
import { Label } from "../Label";
import { Button } from "../Button";
import { Container } from "../Container";
import { CompetitionInfoForm } from "./CompetitionInfoForm";
import { CompetitionGroupForm } from "./CompetitionGroupForm";
import { CompetitionTypeSelector } from "./CompetitionTypeSelector";
import { CompetitionTeamsForm } from "./CompetitionTeamsForm";
import { CompetitionParticipantsForm } from "./CompetitionParticipantsForm";
import { SaveCompetitionVerificationCodeDialog } from "./SaveCompetitionVerificationCodeDialog";

import ArrowRightIcon from "~/assets/arrow_right.svg";

type FormStep = "info" | "group" | "participants";
type TimezoneOption = "local" | "utc";

interface CreateCompetitionFormProps {
  group?: GroupDetails;
}

export function CreateCompetitionForm(props: CreateCompetitionFormProps) {
  const toast = useToast();
  const client = useWOMClient();
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
      toast.toast({ variant: "success", title: "Competition created successfully!" });
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.toast({ variant: "error", title: error.message });
      }
    },
  });

  return (
    <Container className="mt-8" style={{ "--max-width": "42rem" }}>
      <h1 className="text-3xl font-bold">Create a new competition</h1>
      <div className="mt-5 flex gap-x-2">
        <div className="h-1 w-12 rounded-full bg-primary-500" />
        <div
          className={cn(
            "h-1 w-12 rounded-full transition-colors duration-300",
            step === "info" ? "bg-gray-500" : "bg-primary-500"
          )}
        />
        <div
          className={cn(
            "h-1 w-12 rounded-full transition-colors duration-300",
            step !== "participants" ? "bg-gray-500" : "bg-primary-500"
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
              setCompetition((prev) => ({ ...prev, ...c }));
              setStep("group");
            }}
            formActions={(disabled) => (
              <div className="flex justify-end">
                <Button variant="primary" disabled={disabled}>
                  Next
                </Button>
              </div>
            )}
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
            formActions={(disabled, loading) => (
              <div className="flex justify-between gap-x-3">
                <Button type="button" variant="outline" onClick={() => setStep("info")}>
                  <ArrowRightIcon className="-ml-1.5 h-4 w-4 -rotate-180" />
                  Previous
                </Button>
                <Button variant="primary" disabled={disabled || loading}>
                  {loading ? "Checking..." : "Next"}
                  <ArrowRightIcon className="-mr-1.5 h-4 w-4" />
                </Button>
              </div>
            )}
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

            {type === CompetitionType.CLASSIC ? (
              <CompetitionParticipantsForm
                group={group}
                participants={
                  competition && "participants" in competition ? competition.participants : []
                }
                onParticipantsChanged={(participants) => {
                  setCompetition({ ...competition, participants });
                }}
                formActions={(disabled) => (
                  <div className="flex justify-between gap-x-3">
                    <Button variant="outline" onClick={() => setStep("group")}>
                      <ArrowRightIcon className="-ml-1.5 h-4 w-4 -rotate-180" />
                      Previous
                    </Button>
                    <Button
                      variant="primary"
                      disabled={disabled}
                      onClick={() => createMutation.mutate(competition)}
                    >
                      Next
                      <ArrowRightIcon className="-mr-1.5 h-4 w-4" />
                    </Button>
                  </div>
                )}
              />
            ) : (
              <CompetitionTeamsForm
                teams={competition && "teams" in competition ? competition.teams : []}
                onTeamsChanged={(teams) => {
                  setCompetition({ ...competition, teams });
                }}
                formActions={(disabled) => (
                  <div className="flex justify-between gap-x-3">
                    <Button variant="outline" onClick={() => setStep("group")}>
                      <ArrowRightIcon className="-ml-1.5 h-4 w-4 -rotate-180" />
                      Previous
                    </Button>
                    <Button
                      variant="primary"
                      disabled={disabled}
                      onClick={() => createMutation.mutate(competition)}
                    >
                      Next
                      <ArrowRightIcon className="-mr-1.5 h-4 w-4" />
                    </Button>
                  </div>
                )}
              />
            )}
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
