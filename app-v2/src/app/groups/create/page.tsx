"use client";

import {
  CreateGroupPayload,
  GROUP_ROLES,
  GroupMemberFragment,
  GroupRole,
  GroupRoleProps,
} from "@wise-old-man/utils";
import Link from "next/link";
import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { standardizeUsername } from "~/utils/strings";
import { Label } from "~/components/Label";
import { Button } from "~/components/Button";
import { GroupRoleIcon } from "~/components/Icon";
import { Container } from "~/components/Container";
import { DataTable } from "~/components/DataTable";
import { PlayerSearch } from "~/components/PlayerSearch";
import { GroupInformationForm } from "~/components/groups/GroupInformationForm";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemGroup,
  ComboboxItemsContainer,
  ComboboxTrigger,
} from "~/components/Combobox";

import CheckIcon from "~/assets/check.svg";
import ChevronDownIcon from "~/assets/chevron_down.svg";

type FormStep = "info" | "members";
type ImportSource = "none" | "cml" | "templeosrs" | "file";

export default function CreateGroupPage() {
  const [step, setStep] = useState<FormStep>("info");
  const [group, setGroup] = useState<CreateGroupPayload>({ name: "", members: [] });

  function handleSubmit(members: GroupMemberFragment[]) {
    const newGroup = { ...group, members };
    setGroup(newGroup);

    // TODO: Submit to API
    console.log("submit", newGroup);
  }

  return (
    <Container className="mt-8 max-w-2xl">
      <h1 className="text-3xl font-bold">Create a new group</h1>
      <h2 className="mt-1 text-base text-gray-200">
        {step === "info" ? "1. Basic information" : "2. Select group members"}
      </h2>
      <div className="mt-10">
        {step === "info" && (
          <GroupInformationForm
            group={group}
            onSubmit={(name, clanChat, homeworld, description) => {
              setGroup({ ...group, name, clanChat, homeworld, description });
              setStep("members");
            }}
          />
        )}
        {step === "members" && (
          <GroupMembersForm
            group={group}
            onBack={() => {
              setStep("info");
            }}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </Container>
  );
}

interface GroupMembersFormProps {
  group: CreateGroupPayload;
  onBack: () => void;
  onSubmit: (members: GroupMemberFragment[]) => void;
}

function GroupMembersForm(props: GroupMembersFormProps) {
  const { group, onBack, onSubmit } = props;

  const [members, setMembers] = useState<GroupMemberFragment[]>(group.members);
  const [importSource, setImportSource] = useState<ImportSource | undefined>();

  function handleSelectImportSource(mode: ImportSource) {
    setImportSource(mode);
  }

  function handleAddPlayers(usernames: string) {
    // Handle comma separated usernames
    const playersToAdd = usernames.split(",").filter((s) => s.length > 0);

    const unique: string[] = [];

    playersToAdd.forEach((p) => {
      if (unique.map(standardizeUsername).includes(standardizeUsername(p))) return;
      if (members.map((m) => standardizeUsername(m.username)).includes(standardizeUsername(p))) return;

      unique.push(p);
    });

    setMembers((prev) => [...prev, ...unique.map((p) => ({ username: p, role: GroupRole.MEMBER }))]);
  }

  function handleRemovePlayer(username: string) {
    setMembers((members) =>
      members.filter((m) => standardizeUsername(m.username) !== standardizeUsername(username))
    );
  }

  function handleRoleChanged(username: string, role: GroupRole) {
    setMembers((members) =>
      members.map((m) => {
        if (standardizeUsername(m.username) === standardizeUsername(username)) {
          return { ...m, role };
        }

        return m;
      })
    );
  }

  return (
    <div>
      <div className="rounded-lg border border-gray-500 p-5">
        {importSource ? (
          <div className="flex items-center justify-between text-sm">
            <div>
              Import selection:{" "}
              <span className="text-blue-400">
                {importSource === "templeosrs" && "TempleOSRS"}
                {importSource === "cml" && "CrystalMathLabs"}
                {importSource === "file" && "Text file"}
                {importSource === "none" && "None (manual)"}
              </span>
            </div>
            <Button size="sm" onClick={() => setImportSource(undefined)}>
              Change selection
            </Button>
          </div>
        ) : (
          <div>
            <Label className="text-sm font-normal text-gray-200">
              You can import an existing members list from...
            </Label>
            <div className="mt-4 flex items-center gap-x-4">
              <Button
                onClick={() => handleSelectImportSource("templeosrs")}
                variant={importSource === "templeosrs" ? "blue" : "default"}
              >
                {importSource === "templeosrs" && <CheckIcon className="-ml-2 h-5 w-5" />}
                TempleOSRS
              </Button>
              <Button
                onClick={() => handleSelectImportSource("cml")}
                variant={importSource === "cml" ? "blue" : "default"}
              >
                {importSource === "cml" && <CheckIcon className="-ml-2 h-5 w-5" />}
                CrystalMathLabs
              </Button>
              <Button
                onClick={() => handleSelectImportSource("file")}
                variant={importSource === "file" ? "blue" : "default"}
              >
                {importSource === "file" && <CheckIcon className="-ml-2 h-5 w-5" />}
                Copy / paste a text file
              </Button>
            </div>
            <Label className="mb-4 mt-7 block text-sm font-normal text-gray-200">
              Or, you can add all your members manually
            </Label>
            <Button
              onClick={() => handleSelectImportSource("none")}
              variant={importSource === "none" ? "blue" : "default"}
            >
              {importSource === "none" && <CheckIcon className="-ml-2 h-5 w-5" />}
              Add manually
            </Button>
          </div>
        )}
      </div>
      {!!importSource && (
        <div className="mt-10">
          <Label className="mb-2 block text-xs text-gray-200">Add members</Label>
          <PlayerSearch mode="select" onPlayerSelected={handleAddPlayers} />
          <Label className="mb-2 mt-10 block text-xs text-gray-200">Members ({members.length})</Label>
          {members.length === 0 ? (
            <div className="flex justify-center rounded border border-dashed border-gray-400 p-7">
              <p className="max-w-xs text-center text-sm font-normal leading-6 text-gray-200">
                No members yet. Please use the search bar above to start selecting members.
              </p>
            </div>
          ) : (
            <DataTable
              data={members}
              enablePagination
              columns={getColumnDefinitions(handleRemovePlayer, handleRoleChanged)}
            />
          )}

          <div className="mt-10 flex justify-end gap-x-3">
            <Button onClick={onBack}>Previous</Button>
            <Button variant="blue" onClick={() => onSubmit(members)}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function getColumnDefinitions(
  onRemoveClicked: (username: string) => void,
  onRoleChanged: (username: string, role: GroupRole) => void
) {
  const MEMBERS_COLUMN_DEFS: ColumnDef<GroupMemberFragment>[] = [
    {
      accessorKey: "username",
      header: "Player",
      cell: ({ row }) => {
        return (
          <div className="pr-5 text-sm font-medium text-white">
            <Link href={`/players/${row.original.username}`} className="hover:underline">
              {row.original.username}
            </Link>
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        return (
          <Combobox
            value={row.original.role}
            onValueChanged={(val) => {
              onRoleChanged(row.original.username, val as GroupRole);
            }}
          >
            <ComboboxTrigger className="w-full sm:w-48">
              <div className="flex items-center justify-between gap-x-3 rounded border border-gray-600 px-3 py-2 text-left text-sm transition-colors hover:border-gray-400">
                <div className="flex items-center gap-x-2">
                  <GroupRoleIcon role={row.original.role || GroupRole.MEMBER} />
                  {GroupRoleProps[row.original.role || GroupRole.MEMBER].name}
                </div>
                <ChevronDownIcon className="mt-px h-5 w-5" />
              </div>
            </ComboboxTrigger>
            <ComboboxContent>
              <ComboboxInput placeholder="Search roles..." />
              <ComboboxEmpty>No results were found</ComboboxEmpty>
              <ComboboxItemsContainer>
                <ComboboxItemGroup label="Role">
                  {GROUP_ROLES.map((role) => (
                    <ComboboxItem key={role} value={role}>
                      <GroupRoleIcon role={role} />
                      {GroupRoleProps[role].name}
                    </ComboboxItem>
                  ))}
                </ComboboxItemGroup>
              </ComboboxItemsContainer>
            </ComboboxContent>
          </Combobox>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <div className="flex justify-end text-sm text-gray-200">
            <Button size="sm" onClick={() => onRemoveClicked(row.original.username)}>
              Remove
            </Button>
          </div>
        );
      },
    },
  ];

  return MEMBERS_COLUMN_DEFS;
}
