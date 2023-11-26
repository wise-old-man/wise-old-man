"use client";

import { useMutation } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import {
  GROUP_ROLES,
  GroupDetails,
  GroupMemberFragment,
  GroupRole,
  GroupRoleProps,
  MembershipWithPlayer,
} from "@wise-old-man/utils";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { useToast } from "~/hooks/useToast";
import { standardizeUsername } from "~/utils/strings";
import { cn } from "~/utils/styling";
import { useWOMClient } from "~/hooks/useWOMClient";
import { Alert, AlertDescription, AlertTitle } from "../Alert";
import { Badge } from "../Badge";
import { Button } from "../Button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemGroup,
  ComboboxItemsContainer,
  ComboboxTrigger,
} from "../Combobox";
import { Container } from "../Container";
import { DataTable } from "../DataTable";
import { GroupRoleIcon } from "../Icon";
import { Label } from "../Label";
import { PlayerSearch } from "../PlayerSearch";
import { QueryLink } from "../QueryLink";
import { Tabs, TabsList, TabsTrigger } from "../Tabs";
import { GroupInformationForm } from "./GroupInformationForm";
import { RuneLiteSyncDialog } from "./RuneLiteSyncDialog";
import { EmptyGroupDialog } from "./EmptyGroupDialog";
import { Input } from "../Input";
import { GroupVerificationCodeCheckDialog } from "./GroupVerificationCodeCheckDialog";

import WebIcon from "~/assets/web.svg";
import TwitchIcon from "~/assets/twitch.svg";
import WarningIcon from "~/assets/warning.svg";
import LoadingIcon from "~/assets/loading.svg";
import TwitterIcon from "~/assets/twitter.svg";
import DiscordIcon from "~/assets/discord.svg";
import YoutubeIcon from "~/assets/youtube.svg";
import ChevronDownIcon from "~/assets/chevron_down.svg";

interface EditGroupFormProps {
  group: GroupDetails;
}

export function EditGroupForm(props: EditGroupFormProps) {
  const { group } = props;

  const section = useSearchParams().get("section");
  const [verificationCode, setVerificationCode] = useState<string | undefined>();

  return (
    <Container style={{ "--max-width": "64rem" }}>
      <h1 className="mt-3 border-gray-600 text-xl font-bold md:border-b md:pb-7 md:text-3xl">
        {group.name}
      </h1>

      <div className="grid-cols-10 gap-x-12 md:grid">
        <div className="col-span-3 border-gray-600 pt-7 md:border-r md:pr-7">
          <SideNavigation showPatronTabs={group.patron} />
        </div>
        <div className="col-span-7 flex pt-7">
          {(!section || section === "general") && (
            <GeneralSection
              {...props}
              key={group.updatedAt.toString()}
              verificationCode={verificationCode || ""}
            />
          )}
          {section === "members" && (
            <MembersSection
              {...props}
              key={group.updatedAt.toString()}
              verificationCode={verificationCode || ""}
            />
          )}
          {section === "links" && (
            <SocialLinksSection
              {...props}
              key={group.updatedAt.toString()}
              verificationCode={verificationCode || ""}
            />
          )}
        </div>
      </div>

      <GroupVerificationCodeCheckDialog
        group={group}
        isOpen={!verificationCode}
        onValidated={setVerificationCode}
      />
    </Container>
  );
}

type GroupSocialLinks = GroupDetails["socialLinks"];

function SocialLinksSection(props: EditGroupFormProps & { verificationCode: string }) {
  const { group, verificationCode } = props;
  const socialLinks = group.socialLinks ?? ({} as GroupSocialLinks);

  const toast = useToast();
  const router = useRouter();
  const client = useWOMClient();

  const [website, setWebsite] = useState(socialLinks?.website ?? "");
  const [discord, setDiscord] = useState(socialLinks?.discord ?? "");
  const [twitter, setTwitter] = useState(socialLinks?.twitter ?? "");
  const [youtube, setYoutube] = useState(socialLinks?.youtube ?? "");
  const [twitch, setTwitch] = useState(socialLinks?.twitch ?? "");

  const [isTransitioning, startTransition] = useTransition();

  const hasEditedWebsite = socialLinks?.website ? website !== socialLinks.website : website !== "";
  const hasEditedDiscord = socialLinks?.discord ? discord !== socialLinks.discord : discord !== "";
  const hasEditedTwitch = socialLinks?.twitch ? twitch !== socialLinks.twitch : twitch !== "";
  const hasEditedTwitter = socialLinks?.twitter ? twitter !== socialLinks.twitter : twitter !== "";
  const hasEditedYoutube = socialLinks?.youtube ? youtube !== socialLinks.youtube : youtube !== "";

  const hasUnsavedChanges =
    hasEditedWebsite || hasEditedDiscord || hasEditedTwitch || hasEditedTwitter || hasEditedYoutube;

  const editSocialLinksMutation = useMutation({
    mutationFn: (socialLinks: Required<GroupSocialLinks>) => {
      if (!socialLinks) throw Error();

      const payload = {
        socialLinks: {
          website: socialLinks.website ? socialLinks.website.trim() : "",
          discord: socialLinks.discord ? socialLinks.discord.trim() : "",
          twitter: socialLinks.twitter ? socialLinks.twitter.trim() : "",
          youtube: socialLinks.youtube ? socialLinks.youtube.trim() : "",
          twitch: socialLinks.twitch ? socialLinks.twitch.trim() : "",
        },
      };

      return client.groups.editGroup(group.id, payload, verificationCode);
    },
    onSuccess: () => {
      startTransition(() => {
        router.refresh();
        toast.toast({ variant: "success", title: "Group edited successfully!" });
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
      <form
        className="flex flex-col gap-y-7"
        onSubmit={(e) => {
          e.preventDefault();
          editSocialLinksMutation.mutate({ website, discord, twitter, youtube, twitch });
        }}
      >
        <div>
          <Label htmlFor="website" className="mb-2 block text-xs text-gray-200">
            Website URL
          </Label>
          <Input
            id="website"
            placeholder="Your group's website (or RS forums) URL."
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            leftElement={<WebIcon className="mt-px h-4 w-4 text-gray-200" />}
            autoFocus
          />
        </div>
        <div>
          <Label htmlFor="discord" className="mb-2 block text-xs text-gray-200">
            Discord URL
          </Label>
          <Input
            id="discord"
            placeholder="Your group's Discord URL."
            value={discord}
            onChange={(e) => setDiscord(e.target.value)}
            leftElement={<DiscordIcon className="mt-px h-4 w-4 text-gray-200" />}
          />
        </div>
        <div>
          <Label htmlFor="twitter" className="mb-2 block text-xs text-gray-200">
            Twitter URL
          </Label>
          <Input
            id="twitter"
            placeholder="Your group's Twitter URL."
            value={twitter}
            onChange={(e) => setTwitter(e.target.value)}
            leftElement={<TwitterIcon className="mt-px h-4 w-4 text-gray-200" />}
          />
        </div>
        <div>
          <Label htmlFor="youtube" className="mb-2 block text-xs text-gray-200">
            Youtube URL
          </Label>
          <Input
            id="youtube"
            placeholder="Your group's youtube URL."
            value={youtube}
            onChange={(e) => setYoutube(e.target.value)}
            leftElement={<YoutubeIcon className="mt-px h-4 w-4 text-gray-200" />}
          />
        </div>
        <div>
          <Label htmlFor="twitch" className="mb-2 block text-xs text-gray-200">
            Twitch URL
          </Label>
          <Input
            id="twitch"
            placeholder="Your group's Twitch URL."
            value={twitch}
            onChange={(e) => setTwitch(e.target.value)}
            leftElement={<TwitchIcon className="mt-px h-4 w-4 text-gray-200" />}
          />
        </div>

        <div className="flex">
          {hasUnsavedChanges && (
            <div className="flex items-center justify-center text-center text-xs text-gray-200">
              <WarningIcon className="mr-1 h-4 w-4" />
              You have unsaved changes
            </div>
          )}
          <div className="flex grow justify-end">
            <Button
              variant="blue"
              disabled={editSocialLinksMutation.isPending || isTransitioning || !hasUnsavedChanges}
            >
              {isTransitioning || editSocialLinksMutation.isPending ? (
                <>
                  <LoadingIcon className="-ml-1 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>Save</>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

type EditableMemberFragment = GroupMemberFragment & { isNew: boolean };

function MembersSection(props: EditGroupFormProps & { verificationCode: string }) {
  const { group, verificationCode } = props;

  const toast = useToast();
  const router = useRouter();
  const client = useWOMClient();

  const [isTransitioning, startTransition] = useTransition();

  const [showingEmptyGroupDialog, setShowingEmptyGroupDialog] = useState(false);

  const [members, setMembers] = useState<EditableMemberFragment[]>(
    group.memberships.map((g) => ({ username: g.player.displayName, role: g.role, isNew: false }))
  );

  const [removedMembers, setRemovedMembers] = useState<EditableMemberFragment[]>([]);

  const hasUnsavedChanges = hasChangedMembers(group.memberships, members);

  const editMembersMutation = useMutation({
    mutationFn: (members: GroupMemberFragment[]) => {
      return client.groups.editGroup(group.id, { members }, verificationCode);
    },
    onSuccess: () => {
      startTransition(() => {
        router.refresh();
        toast.toast({ variant: "success", title: "Group edited successfully!" });
      });
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.toast({ variant: "error", title: error.message });
      }
    },
  });

  function handleSubmit() {
    if (members.length === 0) {
      setShowingEmptyGroupDialog(true);
      return;
    }

    editMembersMutation.mutate(members);
  }

  function handleAddPlayers(usernames: string) {
    // Handle comma separated usernames
    const playersToAdd = usernames.split(",").filter((s) => s.length > 0);
    const playersToReAdd: string[] = [];

    const unique: string[] = [];

    playersToAdd.forEach((p) => {
      if (unique.map(standardizeUsername).includes(standardizeUsername(p))) {
        // Check if there aren't any repeated names in the params
        return;
      }

      if (removedMembers.map((m) => standardizeUsername(m.username)).includes(standardizeUsername(p))) {
        // Check if this player has been removed before, if so, just re-add them
        playersToReAdd.push(standardizeUsername(p));
      } else if (members.map((m) => standardizeUsername(m.username)).includes(standardizeUsername(p))) {
        // Check if there aren't any duplicate names (in new members)
        toast.toast({ variant: "error", title: `${p} has already been added to this group.` });
        return;
      }

      unique.push(p);
    });

    setRemovedMembers((prev) =>
      prev.filter((p) => !playersToReAdd.includes(standardizeUsername(p.username)))
    );

    setMembers((prev) => [
      ...prev,
      ...unique.map((p) => {
        const isNew = !group.memberships.map((m) => m.player.username).includes(standardizeUsername(p));
        return { username: p, role: GroupRole.MEMBER, isNew };
      }),
    ]);
  }

  function handleReaddPlayer(username: string) {
    const match = removedMembers.find(
      (m) => standardizeUsername(m.username) === standardizeUsername(username)
    );
    if (!match) return;

    setMembers((prev) => [...prev, match]);
    setRemovedMembers((prev) =>
      prev.filter((m) => standardizeUsername(m.username) !== standardizeUsername(username))
    );
  }

  function handleRemovePlayer(username: string) {
    const match = members.find((m) => standardizeUsername(m.username) === standardizeUsername(username));
    if (!match) return;

    if (!match.isNew) {
      setRemovedMembers((prev) => [...prev, match]);
    }

    setMembers((prev) =>
      prev.filter((m) => standardizeUsername(m.username) !== standardizeUsername(username))
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
      <RuneLiteSyncInfo />

      <Label className="mb-2 mt-10 block text-xs text-gray-200">Add members</Label>
      <PlayerSearch mode="select" onPlayerSelected={handleAddPlayers} />
      {removedMembers.length > 0 && (
        <>
          <Label className="mb-3 mt-10 block text-xs text-gray-200">Removed members</Label>
          <DataTable
            data={removedMembers}
            enablePagination
            columns={getRemovedMembersColumnDefinitions(handleReaddPlayer)}
          />
        </>
      )}
      {members.length > 0 && (
        <>
          <Label className="mb-3 mt-10 block text-xs text-gray-200">Members</Label>
          <DataTable
            data={[...members].reverse()}
            enablePagination
            columns={getMembersColumnDefinitions(handleRemovePlayer, handleRoleChanged)}
          />
        </>
      )}
      <div className="mt-5 flex">
        {hasUnsavedChanges && (
          <div className="flex items-center justify-center text-center text-xs text-gray-200">
            <WarningIcon className="mr-1 h-4 w-4" />
            You have unsaved changes
          </div>
        )}
        <div className="flex grow justify-end">
          <Button
            variant="blue"
            disabled={editMembersMutation.isPending || isTransitioning || !hasUnsavedChanges}
            onClick={handleSubmit}
          >
            {isTransitioning || editMembersMutation.isPending ? (
              <>
                <LoadingIcon className="-ml-1 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>Save</>
            )}
          </Button>
        </div>
      </div>

      {/* Dialogs */}
      <RuneLiteSyncDialog />
      <EmptyGroupDialog
        isOpen={showingEmptyGroupDialog}
        onClose={() => {
          setShowingEmptyGroupDialog(false);
        }}
        onConfirm={() => {
          editMembersMutation.mutate(members);
          setShowingEmptyGroupDialog(false);
        }}
      />
    </div>
  );
}

function GeneralSection(props: EditGroupFormProps & { verificationCode: string }) {
  const { group, verificationCode } = props;

  const toast = useToast();
  const router = useRouter();
  const client = useWOMClient();

  const [isTransitioning, startTransition] = useTransition();

  const editGeneralMutation = useMutation({
    mutationFn: (payload: {
      name: string;
      clanChat: string | undefined;
      homeworld: number | undefined;
      description: string | undefined;
    }) => {
      return client.groups.editGroup(group.id, payload, verificationCode);
    },
    onSuccess: () => {
      startTransition(() => {
        router.refresh();
        toast.toast({ variant: "success", title: "Group edited successfully!" });
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
      <GroupInformationForm
        isEditing
        group={group}
        onGroupChanged={(name, clanChat, homeworld, description) =>
          editGeneralMutation.mutate({ name, clanChat, homeworld, description })
        }
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

interface SideNavigationProps {
  showPatronTabs: boolean;
}

function SideNavigation(props: SideNavigationProps) {
  const searchParams = useSearchParams();
  const section = searchParams.get("section");

  const sections = [
    { name: "General", value: "general" },
    { name: "Members", value: "members" },
  ];

  if (props.showPatronTabs) {
    sections.push({ name: "Profile & Banner images", value: "images" });
    sections.push({ name: "Social links", value: "links" });
  }

  return (
    <>
      <div className="custom-scroll block overflow-x-auto md:hidden">
        <Tabs defaultValue={section || "general"}>
          <TabsList>
            {sections.map((s) => (
              <QueryLink key={s.value} query={{ section: s.value }}>
                <TabsTrigger value={s.value}>{s.name}</TabsTrigger>
              </QueryLink>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <ul className="hidden md:block">
        {sections.map((s) => {
          const isSelected = s.value === section || (s.value === "general" && !section);

          return (
            <QueryLink key={s.value} query={{ section: s.value }}>
              <li
                className={cn(
                  "relative overflow-hidden rounded px-4 py-3 text-sm text-gray-200 hover:bg-gray-800 active:bg-gray-600",
                  isSelected && "bg-gray-700 text-white"
                )}
              >
                {isSelected && <div className="absolute bottom-0 left-0 top-0 w-0.5 bg-blue-500" />}
                {s.name}
              </li>
            </QueryLink>
          );
        })}
      </ul>
    </>
  );
}

function RuneLiteSyncInfo() {
  return (
    <Alert>
      <AlertTitle>Do you know about our integration with RuneLite?</AlertTitle>
      <AlertDescription className="mt-3">
        <p>
          By using our RuneLite plugin, you can automatically sync your Wise Old Man group with your
          in-game clan wth just one click.
        </p>

        <QueryLink
          query={{ dialog: "runelite-sync" }}
          className="mt-5 block text-blue-400 hover:underline"
        >
          Find out more
        </QueryLink>
      </AlertDescription>
    </Alert>
  );
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

function getMembersColumnDefinitions(
  onRemoveClicked: (username: string) => void,
  onRoleChanged: (username: string, role: GroupRole) => void
) {
  const MEMBERS_COLUMN_DEFS: ColumnDef<EditableMemberFragment>[] = [
    {
      accessorKey: "username",
      header: "Player",
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-x-2 pr-5 text-sm font-medium text-white">
            <Link href={`/players/${row.original.username}`} className="hover:underline">
              {row.original.username}
            </Link>
            {row.original.isNew && <Badge variant="success">New</Badge>}
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

function getRemovedMembersColumnDefinitions(onReaddClicked: (username: string) => void) {
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
        const role = row.original.role;
        return (
          <div className="flex items-center gap-x-2 opacity-50">
            <GroupRoleIcon role={role || GroupRole.MEMBER} />
            {GroupRoleProps[role || GroupRole.MEMBER].name}
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <div className="flex justify-end text-sm text-gray-200">
            <Button size="sm" onClick={() => onReaddClicked(row.original.username)}>
              Re-add
            </Button>
          </div>
        );
      },
    },
  ];

  return MEMBERS_COLUMN_DEFS;
}

function hasChangedMembers(memberships: MembershipWithPlayer[], fragments: GroupMemberFragment[]) {
  const previousMap = new Map<string, GroupRole>();
  const nextMap = new Map<string, GroupRole>();

  memberships.forEach((m) => {
    previousMap.set(m.player.username, m.role);
  });

  fragments.forEach((m) => {
    nextMap.set(standardizeUsername(m.username), m.role || GroupRole.MEMBER);
  });

  if (previousMap.size !== nextMap.size) return true;

  for (const [username, role] of previousMap.entries()) {
    // if some previous name cannot be found in the next list, or their role has been changed
    if (!nextMap.has(username) || nextMap.get(username) !== role) return true;
  }

  for (const [username, role] of nextMap.entries()) {
    // if some next name cannot be found in the previous list, or their role has been changed
    if (!previousMap.has(username) || previousMap.get(username) !== role) return true;
  }

  return false;
}
