"use client";

import { useMutation } from "@tanstack/react-query";
import {
  CompetitionDetails,
  CompetitionType,
  Metric,
  ParticipationWithPlayerAndProgress,
  Team,
} from "@wise-old-man/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { useToast } from "~/hooks/useToast";
import { useWOMClient } from "~/hooks/useWOMClient";
import { standardizeUsername } from "~/utils/strings";
import { cn } from "~/utils/styling";
import { Button } from "../Button";
import { Container } from "../Container";
import { QueryLink } from "../QueryLink";
import { Alert, AlertDescription } from "../Alert";
import { Tabs, TabsList, TabsTrigger } from "../Tabs";
import { CompetitionInfoForm } from "./CompetitionInfoForm";
import { CompetitionTeamsForm } from "./CompetitionTeamsForm";
import { CompetitionParticipantsForm } from "./CompetitionParticipantsForm";
import { GroupVerificationCodeCheckDialog } from "../groups/GroupVerificationCodeCheckDialog";
import { CompetitionVerificationCodeCheckDialog } from "./CompetitionVerificationCodeCheckDialog";

import LoadingIcon from "~/assets/loading.svg";
import WarningIcon from "~/assets/warning.svg";

interface EditCompetitionFormProps {
  competition: CompetitionDetails;
}

export function EditCompetitionForm(props: EditCompetitionFormProps) {
  const { competition } = props;

  const section = useSearchParams().get("section");
  const [verificationCode, setVerificationCode] = useState<string | undefined>();

  return (
    <Container style={{ "--max-width": "56rem" }}>
      <h1 className="mt-3 border-gray-600 text-xl font-bold md:border-b md:pb-7 md:text-3xl">
        {competition.title}
      </h1>

      <div className="grid-cols-10 gap-x-12 md:grid">
        <div className="col-span-3 border-gray-600 pt-7 md:border-r md:pr-7">
          <SideNavigation type={competition.type} />
        </div>
        <div className="col-span-7 flex pt-7">
          {section === "teams" ? (
            <TeamsSection {...props} verificationCode={verificationCode ?? ""} />
          ) : (
            <>
              {section === "participants" ? (
                <ParticipantsSection {...props} verificationCode={verificationCode ?? ""} />
              ) : (
                <GeneralSection {...props} verificationCode={verificationCode ?? ""} />
              )}
            </>
          )}
        </div>
      </div>

      {competition.group ? (
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
      )}
    </Container>
  );
}

function SideNavigation(props: { type: CompetitionType }) {
  const searchParams = useSearchParams();
  const section = searchParams.get("section");

  return (
    <>
      <div className="block md:hidden">
        <Tabs defaultValue={section || "general"}>
          <TabsList>
            <QueryLink query={{ section: "general" }}>
              <TabsTrigger value="general">General</TabsTrigger>
            </QueryLink>
            {props.type === CompetitionType.CLASSIC ? (
              <QueryLink query={{ section: "participants" }}>
                <TabsTrigger value="participants">Participants</TabsTrigger>
              </QueryLink>
            ) : (
              <QueryLink query={{ section: "teams" }}>
                <TabsTrigger value="teams">Teams</TabsTrigger>
              </QueryLink>
            )}
          </TabsList>
        </Tabs>
      </div>
      <ul className="hidden md:block">
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
              {section === "teams" && (
                <div className="absolute bottom-0 left-0 top-0 w-0.5 bg-blue-500" />
              )}
              Teams
            </li>
          </QueryLink>
        )}
      </ul>
    </>
  );
}

type TimezoneOption = "local" | "utc";

function GeneralSection(props: EditCompetitionFormProps & { verificationCode: string }) {
  const { competition, verificationCode } = props;

  const toast = useToast();
  const client = useWOMClient();
  const router = useRouter();
  const [isTransitioning, startTransition] = useTransition();

  const [timezone, setTimezone] = useState<TimezoneOption>("local");

  const editGeneralMutation = useMutation({
    mutationFn: (payload: { title: string; metric: Metric; startsAt: Date; endsAt: Date }) => {
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
    <div className="w-full">
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
              disabled={
                disabled || !hasUnsavedChanges || isTransitioning || editGeneralMutation.isPending
              }
            >
              {editGeneralMutation.isPending || isTransitioning ? (
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
    </div>
  );
}

function ParticipantsSection(props: EditCompetitionFormProps & { verificationCode: string }) {
  const { competition, verificationCode } = props;

  const toast = useToast();
  const client = useWOMClient();
  const router = useRouter();
  const [isTransitioning, startTransition] = useTransition();

  const previousParticipants = competition.participations.map((p) => p.player.displayName);

  const [participants, setParticipants] = useState<string[]>(previousParticipants);

  const hasUnsavedChanges = checkParticipantsUnsavedChanges(previousParticipants, participants);

  const editParticipantsMutation = useMutation({
    mutationFn: (payload: { participants: string[] }) => {
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
    <div>
      {competition.group && (
        <Alert className="mb-10">
          <AlertDescription>
            <p>
              This is a group competition hosted by {competition.group.name}, any new members will be
              auto-added to this competition, and any removed members will be removed from this
              competition.
            </p>
          </AlertDescription>
        </Alert>
      )}
      <CompetitionParticipantsForm
        participants={participants}
        onParticipantsChanged={setParticipants}
        formActions={(disabled) => (
          <div className={cn("flex", hasUnsavedChanges ? "justify-between" : "justify-end")}>
            {hasUnsavedChanges && (
              <div className="flex items-center justify-center text-center text-xs text-gray-200">
                <WarningIcon className="mr-1 h-4 w-4" />
                You have unsaved changes
              </div>
            )}
            <Button
              variant="blue"
              onClick={() => editParticipantsMutation.mutate({ participants })}
              disabled={
                disabled || !hasUnsavedChanges || isTransitioning || editParticipantsMutation.isPending
              }
            >
              {editParticipantsMutation.isPending || isTransitioning ? (
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
    </div>
  );
}

function TeamsSection(props: EditCompetitionFormProps & { verificationCode: string }) {
  const { competition, verificationCode } = props;

  const toast = useToast();
  const client = useWOMClient();
  const router = useRouter();
  const [isTransitioning, startTransition] = useTransition();

  const previousTeams = getTeams(competition);

  const [teams, setTeams] = useState<Team[]>(previousTeams);

  const hasUnsavedChanges = checkTeamsUnsavedChanges(previousTeams, teams);

  const editParticipantsMutation = useMutation({
    mutationFn: (payload: { teams: Team[] }) => {
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
    <CompetitionTeamsForm
      teams={teams}
      onTeamsChanged={setTeams}
      formActions={(disabled) => (
        <div className={cn("flex", hasUnsavedChanges ? "justify-between" : "justify-end")}>
          {hasUnsavedChanges && (
            <div className="flex items-center justify-center text-center text-xs text-gray-200">
              <WarningIcon className="mr-1 h-4 w-4" />
              You have unsaved changes
            </div>
          )}
          <Button
            variant="blue"
            onClick={() => editParticipantsMutation.mutate({ teams })}
            disabled={
              disabled || !hasUnsavedChanges || isTransitioning || editParticipantsMutation.isPending
            }
          >
            {editParticipantsMutation.isPending || isTransitioning ? (
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

function checkParticipantsUnsavedChanges(previousParticipants: string[], nextParticipants: string[]) {
  const normalize = (participants: string[]) => {
    return participants.map(standardizeUsername).sort();
  };

  return JSON.stringify(normalize(previousParticipants)) !== JSON.stringify(normalize(nextParticipants));
}

function checkTeamsUnsavedChanges(previousTeams: Team[], nextTeams: Team[]) {
  const normalize = (teams: Team[]) => {
    return teams
      .map((team) => ({
        name: standardizeUsername(team.name),
        participants: team.participants.map(standardizeUsername).sort(),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  return JSON.stringify(normalize(previousTeams)) !== JSON.stringify(normalize(nextTeams));
}

function getTeams(competition: CompetitionDetails): Team[] {
  const teamMap = new Map<string, ParticipationWithPlayerAndProgress[]>();

  competition.participations.forEach((participation) => {
    if (!participation.teamName) return;

    const team = teamMap.get(participation.teamName);

    if (team) {
      team.push(participation);
    } else {
      teamMap.set(participation.teamName, [participation]);
    }
  });

  return Array.from(teamMap.entries()).map(([name, participations]) => ({
    name,
    participants: participations.map((p) => p.player.displayName),
  }));
}
