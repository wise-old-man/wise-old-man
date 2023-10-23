"use client";

import { useState } from "react";
import { Team } from "@wise-old-man/utils";
import { Label } from "../Label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../Dialog";
import { Input } from "../Input";
import { Button } from "../Button";
import { PlayerSearch } from "../PlayerSearch";
import { standardizeUsername } from "~/utils/strings";

import CloseIcon from "~/assets/close.svg";

const MAX_TEAM_NAME_LENGTH = 30;

interface EditTeamDialogProps {
  isOpen: boolean;
  team: Team | null;
  onClose: () => void;
  onSubmit: (newTeam: Team) => void;
}

export function EditTeamDialog(props: EditTeamDialogProps) {
  const { team, isOpen, onClose, onSubmit } = props;

  const [name, setName] = useState(team ? team.name : "");
  const [participants, setParticipants] = useState(team ? team.participants : []);

  function handleSubmit() {
    onSubmit({ name, participants });
  }

  function handleAddPlayers(usernames: string) {
    // Handle comma separated usernames
    const playersToAdd = usernames.split(",").filter((s) => s.length > 0);

    const unique: string[] = [];

    playersToAdd.forEach((p) => {
      if (unique.map(standardizeUsername).includes(standardizeUsername(p))) return;
      if (participants.map(standardizeUsername).includes(standardizeUsername(p))) return;

      unique.push(p);
    });

    setParticipants([...participants, ...unique]);
  }

  function handleRemovePlayer(username: string) {
    setParticipants(
      participants.filter((p) => standardizeUsername(p) !== standardizeUsername(username))
    );
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(val) => {
        if (!val) onClose();
      }}
    >
      <DialogContent className="!max-w-[24rem]">
        <DialogHeader>
          <DialogTitle>{team ? `Editing: ${team.name}` : "Add a new team"}</DialogTitle>
        </DialogHeader>
        <form
          className="mt-2 flex flex-col gap-y-7"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div>
            <Label htmlFor="title" className="mb-2 block text-xs text-gray-200">
              Team name
            </Label>
            <Input
              id="name"
              placeholder="Ex: Varrock Warriors"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={MAX_TEAM_NAME_LENGTH}
              autoFocus
              rightElement={
                <span className="text-xs tabular-nums text-gray-200">
                  {name.length} / {MAX_TEAM_NAME_LENGTH}
                </span>
              }
            />
          </div>
          <div>
            <Label className="mb-2 block text-xs text-gray-200">Participants</Label>
            <PlayerSearch mode="select" onPlayerSelected={handleAddPlayers} />
            <div className="mt-3">
              {participants.length === 0 ? (
                <div className="flex justify-center rounded border border-dashed border-gray-400 p-7">
                  <p className="max-w-xs text-center text-xs font-normal leading-6 text-gray-200">
                    No participants yet. Please use the search bar above to start selecting players.
                  </p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 rounded-md border border-gray-600 bg-gray-900 p-5">
                  {participants.map((p) => (
                    <Button
                      key={p}
                      className="bg-gray-500"
                      size="sm"
                      onClick={() => handleRemovePlayer(p)}
                    >
                      {p}
                      <CloseIcon className="-mr-1 h-4 w-4" />
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <Button
            size="lg"
            variant="blue"
            className="justify-center"
            disabled={name.length === 0 || participants.length === 0}
          >
            {team ? "Confirm" : "Add team"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
