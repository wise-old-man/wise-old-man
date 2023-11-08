"use client";

import { useState } from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { GroupListItem } from "@wise-old-man/utils";
import { standardizeUsername } from "~/utils/strings";
import { Button } from "../Button";
import { DataTable } from "../DataTable";
import { Label } from "../Label";
import { PlayerSearch } from "../PlayerSearch";
import { ImportFromFileDialog } from "../groups/ImportFromFileDialog";

interface CompetitionParticipantsFormProps {
  group?: GroupListItem;
  participants: string[];
  onParticipantsChanged: (participants: string[]) => void;
  formActions: (disabled: boolean) => JSX.Element;
}

export function CompetitionParticipantsForm(props: CompetitionParticipantsFormProps) {
  const { participants, group, onParticipantsChanged, formActions } = props;

  const [showingImportDialog, setShowingImportDialog] = useState(false);

  const canSubmit = !!group || participants.length > 0;

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
    <div>
      <div>
        {!!group ? (
          <>
            <Label className="mb-2 block text-xs text-gray-200">Participants</Label>
            <div className="flex h-24 w-full items-center justify-center rounded-lg border border-dashed border-gray-500 px-16 text-center text-xs leading-5 text-gray-200">
              All {group.name} members will be automatically added as participants.
            </div>
          </>
        ) : (
          <>
            <div className="mb-2 flex items-center justify-between">
              <Label className="text-xs text-gray-200">Add participants ({participants.length})</Label>
              <button
                onClick={() => setShowingImportDialog(true)}
                className="text-xs font-medium text-primary-400 hover:underline"
              >
                Import list
              </button>
            </div>
            <PlayerSearch mode="select" onPlayerSelected={handleAddPlayers} />
            <div className="mt-7">
              {participants.length === 0 ? (
                <div className="flex justify-center rounded border border-dashed border-gray-400 p-7">
                  <p className="max-w-xs text-center text-sm font-normal leading-6 text-gray-200">
                    No participants yet. Please use the search bar above to start selecting players.
                  </p>
                </div>
              ) : (
                <DataTable data={participants} columns={PARTICIPANTS_COLUMN_DEFS} />
              )}
            </div>
          </>
        )}
      </div>
      {/* Allow the parent pages to render what they need on the actions slot (Previous/Next or Save) */}
      <div className="border-gray-500 py-5">{formActions(!canSubmit)}</div>

      <ImportFromFileDialog
        isOpen={showingImportDialog}
        onClose={() => {
          setShowingImportDialog(false);
        }}
        onSubmit={(usernames) => {
          handleAddPlayers(usernames.join(","));
          setShowingImportDialog(false);
        }}
      />
    </div>
  );
}
