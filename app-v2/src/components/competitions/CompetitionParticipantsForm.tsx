"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CompetitionType, CreateCompetitionPayload, GroupListItem, Team } from "@wise-old-man/utils";
import Link from "next/link";
import { useState } from "react";
import { useToast } from "~/hooks/useToast";
import { standardizeUsername } from "~/utils/strings";
import { Button } from "../Button";
import { Label } from "../Label";
import { DataTable } from "../DataTable";
import { PlayerSearch } from "../PlayerSearch";
import { Badge } from "../Badge";
import { EditTeamDialog } from "./EditTeamDialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../Dropdown";

import PlusIcon from "~/assets/plus.svg";
import OverflowIcon from "~/assets/overflow.svg";
import ArrowRightIcon from "~/assets/arrow_right.svg";

interface CompetitionParticipantsFormProps {
  type: CompetitionType;
  group: GroupListItem | undefined;
  competition: CreateCompetitionPayload;
  onTeamsChanged: (teams: Team[]) => void;
  onParticipantsChanged: (participants: string[]) => void;
  onSubmit: () => void;
  onPreviousClicked: () => void;
}

export function CompetitionParticipantsForm(props: CompetitionParticipantsFormProps) {
  const { competition, type, group } = props;

  const participants = competition && "participants" in competition ? competition.participants : [];
  const teams = competition && "teams" in competition ? competition.teams : [];

  const canSubmit =
    type === CompetitionType.CLASSIC ? !!group || participants.length > 0 : teams.length > 0;

  return (
    <>
      <div>
        {type === CompetitionType.CLASSIC ? (
          <>
            {group ? (
              <>
                <Label className="mb-2 block text-xs text-gray-200">Participants</Label>
                <div className="flex h-24 w-full items-center justify-center rounded-lg border border-dashed border-gray-500 px-16 text-center text-xs leading-5 text-gray-200">
                  All {group.name} members will be automatically added as participants.
                </div>
              </>
            ) : (
              <ParticipantsSelection
                participants={participants}
                onParticipantsChanged={props.onParticipantsChanged}
              />
            )}
          </>
        ) : (
          <>
            <TeamsSelection teams={teams} onTeamsChanged={props.onTeamsChanged} />
          </>
        )}
      </div>
      <div className="mt-3 flex justify-between gap-x-3 border-t border-gray-500 py-5">
        <Button variant="outline" onClick={props.onPreviousClicked}>
          <ArrowRightIcon className="-ml-1.5 h-4 w-4 -rotate-180" />
          Previous
        </Button>
        <Button variant="blue" disabled={!canSubmit} onClick={props.onSubmit}>
          Next
          <ArrowRightIcon className="-mr-1.5 h-4 w-4" />
        </Button>
      </div>
    </>
  );
}

interface ParticipantsSelectionProps {
  participants: string[];
  onParticipantsChanged: (participants: string[]) => void;
}

function ParticipantsSelection(props: ParticipantsSelectionProps) {
  const { participants, onParticipantsChanged } = props;

  function handleAddPlayers(usernames: string) {
    // Handle comma separated usernames
    const playersToAdd = usernames.split(",").filter((s) => s.length > 0);

    const unique: string[] = [];

    playersToAdd.forEach((p) => {
      if (unique.map(standardizeUsername).includes(standardizeUsername(p))) return;
      if (participants.map(standardizeUsername).includes(standardizeUsername(p))) return;

      unique.push(p);
    });

    onParticipantsChanged([...participants, ...unique]);
  }

  function handleRemovePlayer(username: string) {
    onParticipantsChanged(
      participants.filter((p) => standardizeUsername(p) !== standardizeUsername(username))
    );
  }

  const PARTICIPANTS_COLUMN_DEFS: ColumnDef<string>[] = [
    {
      accessorKey: "username",
      header: "Player",
      cell: ({ row }) => {
        return (
          <div className="pr-5 text-sm font-medium text-white">
            <Link href={`/players/${row.original}`} className="hover:underline">
              {row.original}
            </Link>
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <div className="flex justify-end text-sm text-gray-200">
            <Button type="button" size="sm" onClick={() => handleRemovePlayer(row.original)}>
              Remove
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <Label className="mb-2 block text-xs text-gray-200">
        Add participants ({participants.length})
      </Label>
      <PlayerSearch mode="select" onPlayerSelected={handleAddPlayers} />
      <div className="mt-7">
        {participants.length === 0 ? (
          <div className="flex justify-center rounded border border-dashed border-gray-400 p-7">
            <p className="max-w-xs text-center text-sm font-normal leading-6 text-gray-200">
              No participants yet. Please use the search bar above to start selecting players.
            </p>
          </div>
        ) : (
          <DataTable data={participants} columns={PARTICIPANTS_COLUMN_DEFS} enablePagination />
        )}
      </div>
    </>
  );
}

interface TeamsSelectionProps {
  teams: Team[];
  onTeamsChanged: (teams: Team[]) => void;
}

function TeamsSelection(props: TeamsSelectionProps) {
  const { teams, onTeamsChanged } = props;

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
    <>
      <Label className="mb-2 block text-xs text-gray-200">Teams ({teams.length})</Label>
      {teams.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded border border-dashed border-gray-400 p-7">
          <p className="max-w-[18rem] text-center text-sm font-normal leading-6 text-gray-200">
            No teams yet. Please click below to start adding teams to your competition.
          </p>
          <button
            type="button"
            className="mt-5 text-sm font-medium text-blue-400 hover:underline"
            onClick={() => {
              setEditing(true);
              setEditingTeamName(undefined);
            }}
          >
            Add new team
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
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
            className="group flex min-h-[10rem] flex-col items-center justify-center rounded-md border border-gray-500 py-7 text-sm text-gray-200 hover:border-gray-400 hover:text-gray-100"
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
        key={editingTeamName}
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
    </>
  );
}
