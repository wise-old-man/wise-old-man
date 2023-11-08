"use client";

import { Team } from "@wise-old-man/utils";
import { useState } from "react";
import { useToast } from "~/hooks/useToast";
import { standardizeUsername } from "~/utils/strings";
import { Badge } from "../Badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../Dropdown";
import { Label } from "../Label";
import { EditTeamDialog } from "./EditTeamDialog";

import OverflowIcon from "~/assets/overflow.svg";
import PlusIcon from "~/assets/plus.svg";

interface CompetitionTeamsFormProps {
  teams: Team[];
  onTeamsChanged: (teams: Team[]) => void;
  formActions: (disabled: boolean) => JSX.Element;
}

export function CompetitionTeamsForm(props: CompetitionTeamsFormProps) {
  const { teams, onTeamsChanged, formActions } = props;

  const toast = useToast();

  const [isEditing, setEditing] = useState(false);
  const [editingTeamName, setEditingTeamName] = useState<string | undefined>();

  const editingTeam = editingTeamName ? teams.find((t) => t.name === editingTeamName) ?? null : null;

  function handleAddTeam(team: Team) {
    const hasRepeatedNames = teams
      .map((t) => standardizeUsername(t.name))
      .includes(standardizeUsername(team.name));

    if (hasRepeatedNames) {
      const errorMessage = "Failed to add team: Repeated team name";
      toast.toast({ variant: "error", title: errorMessage });
      return;
    }

    onTeamsChanged([...teams, team]);

    setEditing(false);
  }

  function handleEditTeam(team: Team) {
    if (!editingTeamName) return;

    const hasRepeatedNames = teams
      .filter((t) => t.name !== editingTeamName)
      .map((t) => standardizeUsername(t.name))
      .includes(standardizeUsername(team.name));

    if (hasRepeatedNames) {
      const errorMessage = "Failed to add team: Repeated team name";
      toast.toast({ variant: "error", title: errorMessage });
      return;
    }

    onTeamsChanged(teams.map((t) => (t.name === editingTeamName ? team : t)));

    setEditing(false);
    setEditingTeamName(undefined);
  }

  function handleDeleteTeam(teamName: string) {
    onTeamsChanged(teams.filter((t) => t.name !== teamName));
  }

  return (
    <div>
      <div>
        <Label className="mb-2 block text-xs text-gray-200">Teams ({teams.length})</Label>
        {teams.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded border border-dashed border-gray-400 p-7">
            <p className="max-w-[18rem] text-center text-sm font-normal leading-6 text-gray-200">
              No teams yet. Please click below to start adding teams to your competition.
            </p>
            <button
              type="button"
              className="mt-5 text-sm font-medium text-primary-400 hover:underline"
              onClick={() => {
                setEditing(true);
                setEditingTeamName(undefined);
              }}
            >
              Add new team
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {teams.map((team) => {
              return (
                <div key={team.name} className="rounded-md border border-gray-500 bg-gray-800 shadow-sm">
                  <div className="flex justify-between gap-x-3 border-b border-gray-600 px-4 py-3">
                    <span className="truncate overflow-ellipsis font-medium">{team.name}</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="group">
                        <OverflowIcon className="h-5 w-5 group-hover:text-gray-200" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditing(true);
                            setEditingTeamName(team.name);
                          }}
                        >
                          Edit team
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteTeam(team.name)}>
                          Delete team
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex flex-wrap gap-2 px-4 py-3">
                    {team.participants.map((p) => (
                      <Badge key={p} className="bg-gray-500 text-sm">
                        {p}
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
            <button
              type="button"
              className="group flex flex-col items-center justify-center rounded-md border border-gray-500 py-7 text-sm text-gray-200 hover:border-gray-400 hover:text-gray-100"
              onClick={() => {
                setEditing(true);
                setEditingTeamName(undefined);
              }}
            >
              <div className="mb-3 rounded-full border border-gray-200 p-1 group-hover:border-gray-100">
                <PlusIcon className="h-5 w-5" />
              </div>
              Add new team
            </button>
          </div>
        )}
        <EditTeamDialog
          key={`${editingTeamName ?? "new"}_${isEditing}`}
          team={editingTeam}
          isOpen={isEditing}
          onClose={() => {
            setEditing(false);
            setEditingTeamName(undefined);
          }}
          onSubmit={(team) => {
            if (editingTeamName) {
              handleEditTeam(team);
            } else {
              handleAddTeam(team);
            }
            setEditing(false);
            setEditingTeamName(undefined);
          }}
        />
      </div>
      {/* Allow the parent pages to render what they need on the actions slot (Previous/Next or Save) */}
      <div className="py-5">{formActions(teams.length === 0)}</div>
    </div>
  );
}
