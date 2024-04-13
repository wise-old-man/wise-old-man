"use client";

import { useMutation } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import {
  CreateGroupPayload,
  GROUP_ROLES,
  GroupMemberFragment,
  GroupRole,
  GroupRoleProps,
} from "@wise-old-man/utils";
import Link from "next/link";
import { cn } from "~/utils/styling";
import { useToast } from "~/hooks/useToast";
import { useWOMClient } from "~/hooks/useWOMClient";
import { createContext, useContext, useState } from "react";
import { Button } from "~/components/Button";
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
import { Container } from "~/components/Container";
import { DataTable } from "~/components/DataTable";
import { GroupRoleIcon } from "~/components/Icon";
import { Label } from "~/components/Label";
import { PlayerSearch } from "~/components/PlayerSearch";
import { GroupInformationForm } from "~/components/groups/GroupInformationForm";
import { ImportFromFileDialog } from "~/components/groups/ImportFromFileDialog";
import { EmptyGroupDialog } from "~/components/groups/EmptyGroupDialog";
import { SaveGroupVerificationCodeDialog } from "~/components/groups/SaveGroupVerificationCodeDialog";
import { standardizeUsername } from "~/utils/strings";

import ArrowRightIcon from "~/assets/arrow_right.svg";
import ChevronDownIcon from "~/assets/chevron_down.svg";

type FormStep = "info" | "import" | "members";
type ImportSource = "none" | "file";

const CreateGroupContext = createContext({
  step: "info" as FormStep,
  importSource: undefined as ImportSource | undefined,
  showingImportDialog: false,
  setStep: (_step: FormStep) => {},
  setImportSource: (_source?: ImportSource) => {},
  setShowingImportDialog: (_value: boolean) => {},
});

export function CreateGroupForm() {
  const toast = useToast();
  const client = useWOMClient();
  const router = useRouter();

  const [step, setStep] = useState<FormStep>("info");
  const [importSource, setImportSource] = useState<ImportSource | undefined>();

  const [showingImportDialog, setShowingImportDialog] = useState(false);
  const [showingEmptyGroupDialog, setShowingEmptyGroupDialog] = useState(false);

  const [payload, setPayload] = useState<CreateGroupPayload>({ name: "", members: [] });

  const stepLabel = {
    info: "1. Basic information",
    import: "2. Select group import method",
    members: "3. Select group members",
  }[step];

  const createMutation = useMutation({
    mutationFn: (group: CreateGroupPayload) => {
      return client.groups.createGroup(group);
    },
    onSuccess: (data) => {
      router.prefetch(`/groups/${data.group.id}`);
      toast.toast({ variant: "success", title: "Group created successfully!" });
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.toast({ variant: "error", title: error.message });
      }
    },
  });

  function handleSubmitMembers(members: GroupMemberFragment[]) {
    const newPayload = { ...payload, members };
    setPayload(newPayload);

    if (newPayload.members.length === 0) {
      setShowingEmptyGroupDialog(true);
      return;
    }

    createMutation.mutate(newPayload);
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
      <Container className="mt-8" style={{ "--max-width": "42rem" }}>
        <h1 className="text-3xl font-bold">Create a new group</h1>
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
              step !== "members" ? "bg-gray-500" : "bg-blue-500"
            )}
          />
        </div>
        <h2 className="mt-3 text-sm text-white">{stepLabel}</h2>
        <div className="mt-10">
          {step === "info" && (
            <GroupInformationForm
              isEditing={false}
              group={{
                name: payload.name,
                clanChat: payload.clanChat ?? null,
                homeworld: payload.homeworld ?? null,
                description: payload.description ?? null,
              }}
              onGroupChanged={(name, clanChat, homeworld, description) => {
                setPayload({ ...payload, name, clanChat, homeworld, description });
                setStep("import");
              }}
              formActions={(disabled) => (
                <div className="flex justify-end">
                  <Button variant="blue" disabled={disabled}>
                    Next
                  </Button>
                </div>
              )}
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
              <GroupMembersForm
                payload={payload}
                onSubmit={handleSubmitMembers}
                onSave={(members: GroupMemberFragment[]) => {
                  setPayload({ ...payload, members });
                }}
              />
            </>
          )}
        </div>
        <SaveGroupVerificationCodeDialog
          isOpen={!!createMutation.data}
          verificationCode={createMutation.data?.verificationCode || ""}
          onClose={() => {
            if (!createMutation.data) return;
            router.push(`/groups/${createMutation.data?.group.id}`);
          }}
        />
        <EmptyGroupDialog
          isOpen={showingEmptyGroupDialog}
          onClose={() => {
            setShowingEmptyGroupDialog(false);
          }}
          onConfirm={() => {
            createMutation.mutate(payload);
            setShowingEmptyGroupDialog(false);
          }}
        />
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
        How would you like to add your group members?
      </Label>
      <div className="mt-3 flex flex-col gap-4">
        <button
          onClick={() => handleSelectImportSource("file")}
          className="flex items-center justify-between rounded-lg border border-gray-500 bg-gray-700 px-5 py-3 text-left hover:bg-gray-600"
        >
          <div>
            <span className="text-base font-semibold">Import from file</span>
            <p className="mt-1 text-sm text-gray-200">
              Copy / paste a list of usernames from a text file
            </p>
          </div>
          <ArrowRightIcon className="h-5 w-5" />
        </button>
        <button
          onClick={() => handleSelectImportSource("none")}
          className="flex items-center justify-between rounded-lg border border-gray-500 bg-gray-700 px-5 py-3 text-left hover:bg-gray-600"
        >
          <div>
            <span className="text-base font-semibold">Add players manually</span>
            <p className="mt-1 text-sm text-gray-200">
              Add all member usernames and their roles manually
            </p>
          </div>
          <ArrowRightIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

interface GroupMembersFormProps {
  payload: CreateGroupPayload;
  onSave: (members: GroupMemberFragment[]) => void;
  onSubmit: (members: GroupMemberFragment[]) => void;
}

function GroupMembersForm(props: GroupMembersFormProps) {
  const { payload, onSubmit, onSave } = props;

  const { importSource, showingImportDialog, setShowingImportDialog, setStep, setImportSource } =
    useContext(CreateGroupContext);

  const [members, setMembers] = useState<GroupMemberFragment[]>(payload?.members || []);

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
              No members yet. Please use the search bar above to start selecting players.
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
          <Button
            variant="outline"
            onClick={() => {
              setStep("import");
              onSave(members);
            }}
          >
            <ArrowRightIcon className="-ml-1.5 h-4 w-4 -rotate-180" />
            Previous
          </Button>
          <Button variant="blue" onClick={() => onSubmit(members)}>
            Next
            <ArrowRightIcon className="-mr-1.5 h-4 w-4" />
          </Button>
        </div>
      </div>

      <ImportFromFileDialog
        isOpen={showingImportDialog && importSource === "file"}
        onClose={() => {
          setStep("import");
          setImportSource(undefined);
          setShowingImportDialog(false);
        }}
        onSubmit={(usernames) => {
          setMembers(usernames.map((p) => ({ role: GroupRole.MEMBER, username: p })));
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
            <Link
              prefetch={false}
              href={`/players/${row.original.username}`}
              className="hover:underline"
            >
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
          <GroupRoleSelect
            role={row.original.role}
            onRoleChanged={(role) => onRoleChanged(row.original.username, role)}
          />
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

function GroupRoleSelect(props: { role?: GroupRole; onRoleChanged: (role: GroupRole) => void }) {
  const { role, onRoleChanged } = props;

  return (
    <Combobox value={role} onValueChanged={(val) => onRoleChanged(val as GroupRole)}>
      <ComboboxTrigger className="w-full sm:w-48">
        <div className="flex items-center justify-between gap-x-3 rounded-md border border-gray-400 px-3 py-2 text-left text-sm transition-colors hover:border-gray-400">
          <div className="flex items-center gap-x-2">
            <GroupRoleIcon role={role || GroupRole.MEMBER} />
            {GroupRoleProps[role || GroupRole.MEMBER].name}
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
}
