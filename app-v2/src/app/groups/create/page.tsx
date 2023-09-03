"use client";

import {
  CreateGroupPayload,
  GROUP_ROLES,
  GroupMemberFragment,
  GroupRole,
  GroupRoleProps,
} from "@wise-old-man/utils";
import Link from "next/link";
import { createContext, useContext, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { standardizeUsername } from "~/utils/strings";
import { Label } from "~/components/Label";
import { Button } from "~/components/Button";
import { GroupRoleIcon } from "~/components/Icon";
import { Container } from "~/components/Container";
import { DataTable } from "~/components/DataTable";
import { PlayerSearch } from "~/components/PlayerSearch";
import { GroupInformationForm } from "~/components/groups/GroupInformationForm";
import { ImportFromCMLDialog } from "~/components/groups/ImportFromCMLDialog";
import { ImportFromTempleDialog } from "~/components/groups/ImportFromTempleDialog";
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

import ArrowRightIcon from "~/assets/arrow_right.svg";
import ChevronDownIcon from "~/assets/chevron_down.svg";
import { ImportFromFileDialog } from "~/components/groups/ImportFromFileDialog";

type FormStep = "info" | "import" | "members";
type ImportSource = "none" | "cml" | "templeosrs" | "file";

const CreateGroupContext = createContext({
  step: "info" as FormStep,
  importSource: undefined as ImportSource | undefined,
  showingImportDialog: false,
  setStep: (_step: FormStep) => {},
  setImportSource: (_source?: ImportSource) => {},
  setShowingImportDialog: (_value: boolean) => {},
});

export default function CreateGroupPage() {
  const [step, setStep] = useState<FormStep>("info");
  const [showingImportDialog, setShowingImportDialog] = useState(false);
  const [importSource, setImportSource] = useState<ImportSource | undefined>();

  const [group, setGroup] = useState<CreateGroupPayload>({ name: "", members: [] });

  function handleSubmit(members: GroupMemberFragment[]) {
    const newGroup = { ...group, members };
    setGroup(newGroup);

    // TODO: Submit to API
    console.log("submit", newGroup);
  }

  return (
    <CreateGroupContext.Provider
      value={{
        step,
        importSource,
        showingImportDialog,
        setStep,
        setImportSource,
        setShowingImportDialog,
      }}
    >
      <Container className="mt-8 max-w-2xl">
        <h1 className="text-3xl font-bold">Create a new group</h1>
        <h2 className="mt-1 text-base text-gray-200">
          {step === "info" && "1. Basic information"}
          {step === "import" && "2. Select group import method"}
          {step === "members" && "3. Select group members"}
        </h2>
        <div className="mt-10">
          {step === "info" && (
            <GroupInformationForm
              group={group}
              onSubmit={(name, clanChat, homeworld, description) => {
                setGroup({ ...group, name, clanChat, homeworld, description });
                setStep("import");
              }}
            />
          )}
          {step === "import" && <GroupImportOptions />}
          {step === "members" && (
            <>
              <div className="rounded-lg border border-gray-500 p-3">
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
                  <Button
                    size="sm"
                    onClick={() => {
                      setImportSource(undefined);
                      setStep("import");
                    }}
                  >
                    Change selection
                  </Button>
                </div>
              </div>
              <GroupMembersForm onSubmit={handleSubmit} />
            </>
          )}
        </div>
      </Container>
    </CreateGroupContext.Provider>
  );
}

function GroupImportOptions() {
  const { setShowingImportDialog, setStep, setImportSource } = useContext(CreateGroupContext);

  function handleSelectImportSource(source: ImportSource) {
    setStep("members");
    setImportSource(source);
    setShowingImportDialog(true);
  }

  return (
    <div>
      <Label className="text-sm font-normal text-gray-200">
        You can import an existing members list from...
      </Label>
      <div className="mt-4 flex items-center gap-x-4">
        <Button onClick={() => handleSelectImportSource("templeosrs")}>TempleOSRS</Button>
        <Button onClick={() => handleSelectImportSource("cml")}>CrystalMathLabs</Button>
        <Button onClick={() => handleSelectImportSource("file")}>Copy / paste a text file</Button>
      </div>
      <Label className="mb-4 mt-7 block text-sm font-normal text-gray-200">
        Or, you can add all your members manually
      </Label>
      <Button onClick={() => handleSelectImportSource("none")}>Add manually</Button>
      <div className="mt-10 border-t border-gray-500 py-5">
        <Button variant="outline" onClick={() => setStep("info")}>
          <ArrowRightIcon className="-ml-1.5 h-4 w-4 -rotate-180" />
          Previous
        </Button>
      </div>
    </div>
  );
}

interface GroupMembersFormProps {
  onSubmit: (members: GroupMemberFragment[]) => void;
}

function GroupMembersForm(props: GroupMembersFormProps) {
  const { onSubmit } = props;

  const { importSource, showingImportDialog, setShowingImportDialog, setStep, setImportSource } =
    useContext(CreateGroupContext);

  const [members, setMembers] = useState<GroupMemberFragment[]>([]);

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
    <>
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
        <div className="mt-10 flex justify-between gap-x-3">
          <Button variant="outline" onClick={() => setStep("import")}>
            <ArrowRightIcon className="-ml-1.5 h-4 w-4 -rotate-180" />
            Previous
          </Button>
          <Button variant="blue" onClick={() => onSubmit(members)}>
            Next
            <ArrowRightIcon className="-mr-1.5 h-4 w-4" />
          </Button>
        </div>
      </div>

      <ImportFromCMLDialog
        isOpen={showingImportDialog && importSource === "cml"}
        onClose={() => {
          setStep("import");
          setImportSource(undefined);
          setShowingImportDialog(false);
        }}
        onSubmit={(members) => {
          setMembers(members);
          setShowingImportDialog(false);
        }}
      />
      <ImportFromTempleDialog
        isOpen={showingImportDialog && importSource === "templeosrs"}
        onClose={() => {
          setStep("import");
          setImportSource(undefined);
          setShowingImportDialog(false);
        }}
        onSubmit={(members) => {
          setMembers(members);
          setShowingImportDialog(false);
        }}
      />
      <ImportFromFileDialog
        isOpen={showingImportDialog && importSource === "file"}
        onClose={() => {
          setStep("import");
          setImportSource(undefined);
          setShowingImportDialog(false);
        }}
        onSubmit={(members) => {
          setMembers(members);
          setShowingImportDialog(false);
        }}
      />
    </>
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
