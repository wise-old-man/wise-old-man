import Link from "next/link";
import { PropsWithChildren } from "react";
import { GroupDetails } from "@wise-old-man/utils";
import { getGroupDetails } from "~/services/wiseoldman";
import { Button } from "~/components/Button";
import { QueryLink } from "~/components/QueryLink";
import { Container } from "~/components/Container";
import { DeleteGroupDialog } from "~/components/groups/DeleteGroupDialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/Tooltip";
import { UpdateAllMembersDialog } from "~/components/groups/UpdateAllMembersDialog";
import { GroupDetailsNavigation } from "~/components/groups/GroupDetailsNavigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/Dropdown";

import ChatIcon from "~/assets/chat.svg";
import GlobeIcon from "~/assets/globe.svg";
import PeopleIcon from "~/assets/people-2.svg";
import OverflowIcon from "~/assets/overflow.svg";
import VerifiedIcon from "~/assets/verified.svg";

export const dynamic = "force-dynamic";

interface PageProps {
  params: {
    id: number;
  };
}

export default async function GroupDetailsLayout(props: PropsWithChildren<PageProps>) {
  const { children, params } = props;
  const { id } = params;

  const group = await getGroupDetails(id);

  return (
    <Container>
      <Header {...group} />
      <div className="custom-scroll pointer-events-auto relative mt-7 overflow-x-auto bg-gray-900">
        <GroupDetailsNavigation id={id} />
      </div>
      {children}

      {/* Dialogs */}
      <DeleteGroupDialog groupId={id} />
      <UpdateAllMembersDialog groupId={id} />
    </Container>
  );
}

function Header(props: GroupDetails) {
  const { id, name, description, clanChat, homeworld, memberCount } = props;

  return (
    <div>
      <div className="flex flex-col-reverse items-start justify-between gap-x-5 gap-y-7 md:flex-row">
        <div className="flex flex-col">
          <div className="flex items-center gap-x-3">
            <h1 className="text-3xl font-bold">{name}</h1>
            {props.verified && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <VerifiedIcon className="mt-1 h-5 w-5" />
                </TooltipTrigger>
                <TooltipContent>This group is verified on our Discord server.</TooltipContent>
              </Tooltip>
            )}
          </div>
          {description && <p className="mt-1 text-body text-gray-200">{description}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-x-2">
          <QueryLink query={{ dialog: "update-all" }}>
            <Button variant="blue">Update all</Button>
          </QueryLink>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button iconButton>
                <OverflowIcon className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <Link href={`/groups/${id}/edit`}>
                <DropdownMenuItem>Edit</DropdownMenuItem>
              </Link>
              <QueryLink query={{ dialog: "delete" }}>
                <DropdownMenuItem>Delete</DropdownMenuItem>
              </QueryLink>
              <Link href={`/competitions/create?groupId=${id}`}>
                <DropdownMenuItem>Create group competition</DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="mt-5 flex items-center gap-x-7">
        {clanChat && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center">
                <ChatIcon className="mr-2 h-5 w-5 text-gray-200" />
                <span className="text-xs text-gray-200">{clanChat}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>Clan Chat: {clanChat}</TooltipContent>
          </Tooltip>
        )}
        {homeworld && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center">
                <GlobeIcon className="mr-2 h-5 w-5 text-gray-200" />
                <span className="text-xs text-gray-200">{homeworld}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>Home world: {homeworld}</TooltipContent>
          </Tooltip>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center">
              <PeopleIcon className="mr-2 h-5 w-5 text-gray-200" />
              <span className="text-xs text-gray-200">{memberCount}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>{memberCount} members</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
