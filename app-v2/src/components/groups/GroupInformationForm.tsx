"use client";

import type { Group } from "@wise-old-man/utils";
import { useState } from "react";
import { Input } from "../Input";
import { Label } from "../Label";
import { TextArea } from "../TextArea";
import { Button } from "../Button";
import { Alert, AlertDescription } from "../Alert";

import WarningIcon from "~/assets/warning.svg";

const MAX_NAME_LENGTH = 30;
const MAX_CLAN_CHAT_LENGTH = 12;
const MAX_HOMEWORLD_LENGTH = 3;
const MAX_DESCRIPTION_LENGTH = 100;

interface GroupInformationFormProps {
  isEditing: boolean;
  group: Pick<Group, "name" | "clanChat" | "homeworld" | "description">;
  onSubmit: (name: string, clanChat: string, homeworld: number, description: string) => void;
  ctaContent: React.ReactNode;
  ctaDisabled?: boolean;
  showUnsavedChangesWarning?: boolean;
}

export function GroupInformationForm(props: GroupInformationFormProps) {
  const { group, isEditing, showUnsavedChangesWarning, onSubmit, ctaContent, ctaDisabled } = props;

  const [name, setName] = useState(group.name);
  const [clanChat, setClanChat] = useState(group.clanChat || "");
  const [homeworld, setHomeworld] = useState(group.homeworld ? group.homeworld.toString() : "");
  const [description, setDescription] = useState(group.description || "");

  const canContinue =
    name.length > 0 && clanChat.length > 0 && homeworld.length > 0 && description.length > 0;

  function handleSubmit() {
    if (!canContinue) return;

    onSubmit(name, clanChat, Number(homeworld), description);
  }

  const missingOptionals = [];
  if (!group.clanChat) missingOptionals.push("Clan chat");
  if (!group.homeworld) missingOptionals.push("Homeworld");
  if (!group.description) missingOptionals.push("Description");

  const hasEditedName = name !== group.name;
  const hasEditedClanChat = group.clanChat ? clanChat !== group.clanChat : clanChat !== "";
  const hasEditedHomeworld = group.homeworld ? Number(homeworld) !== group.homeworld : homeworld !== "";
  const hasEditedDescription = group.description
    ? description !== group.description
    : description !== "";

  const hasUnsavedChanges =
    hasEditedName || hasEditedClanChat || hasEditedHomeworld || hasEditedDescription;

  return (
    <form
      className="flex flex-col gap-y-7"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      {isEditing && missingOptionals.length > 0 && (
        <Alert variant="warn">
          <AlertDescription className="text-gray-100">
            Please note have recently made all group fields required. To proceed, fill out the missing
            fields:
            <ul className="mt-3 flex flex-col gap-y-1">
              {missingOptionals.map((field) => (
                <li key={field}>- {field}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div>
        <Label htmlFor="name" className="mb-2 block text-xs text-gray-200">
          Name
        </Label>
        <Input
          id="name"
          placeholder="Ex: Varrock Warriors"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={MAX_NAME_LENGTH}
          autoFocus
          rightElement={
            <span className="text-xs tabular-nums text-gray-200">
              {name.length} / {MAX_NAME_LENGTH}
            </span>
          }
        />
      </div>
      <div className="flex gap-x-3">
        <div className="grow">
          <Label htmlFor="clanChat" className="mb-2 block text-xs text-gray-200">
            Clan chat
          </Label>
          <Input
            id="clanChat"
            placeholder="Ex: VWarriors"
            value={clanChat}
            onChange={(e) => setClanChat(e.target.value)}
            maxLength={MAX_CLAN_CHAT_LENGTH}
            rightElement={
              <span className="text-xs tabular-nums text-gray-200">
                {clanChat.length} / {MAX_CLAN_CHAT_LENGTH}
              </span>
            }
          />
        </div>
        <div className="grow">
          <Label htmlFor="homeworld" className="mb-2 block text-xs text-gray-200">
            Homeworld
          </Label>
          <Input
            id="homeworld"
            placeholder="Ex: 508"
            value={homeworld}
            onChange={(e) => {
              if (e.target.value.length > 0 && !new RegExp(/^\d*[1-9]\d*$/).test(e.target.value)) return;
              if (e.target.value.length > MAX_HOMEWORLD_LENGTH) return;
              setHomeworld(e.target.value);
            }}
            rightElement={
              <span className="text-xs tabular-nums text-gray-200">
                {homeworld.length} / {MAX_HOMEWORLD_LENGTH}
              </span>
            }
          />
        </div>
      </div>
      <div>
        <Label htmlFor="description" className="mb-2 block text-xs text-gray-200">
          Description
        </Label>
        <TextArea
          id="description"
          className="pr-20"
          value={description}
          maxLength={MAX_DESCRIPTION_LENGTH}
          onChange={(e) => setDescription(e.target.value)}
          rightElement={
            <span className="text-xs tabular-nums text-gray-200">
              {description.length} / {MAX_DESCRIPTION_LENGTH}
            </span>
          }
        />
      </div>
      <div className="flex">
        {hasUnsavedChanges && showUnsavedChangesWarning && (
          <div className="flex items-center justify-center text-center text-xs text-gray-200">
            <WarningIcon className="mr-1 h-4 w-4" />
            You have unsaved changes
          </div>
        )}
        <div className="flex grow justify-end">
          <Button
            variant="blue"
            disabled={!canContinue || (showUnsavedChangesWarning && !hasUnsavedChanges) || ctaDisabled}
          >
            {ctaContent}
          </Button>
        </div>
      </div>
    </form>
  );
}
