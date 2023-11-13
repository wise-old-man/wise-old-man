import Link from "next/link";
import Image from "next/image";
import { PropsWithChildren } from "react";
import { GroupDetails } from "@wise-old-man/utils";
import { getGroupDetails } from "~/services/wiseoldman";
import { cn } from "~/utils/styling";
import { Badge } from "~/components/Badge";
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
    <Container className={cn((group.socialLinks || group.profileImage) && "md:!pt-0")}>
      {group.patron && (
        <>
          {group.bannerImage ? (
            <div className="relative mb-5 h-24 w-full overflow-hidden md:h-36">
              <Image
                src={group.bannerImage}
                alt={`${group.name} - Banner`}
                className="absolute inset-0 object-cover object-center"
                fill
              />
              <div className="absolute inset-0 hidden bg-gradient-to-tl from-black/30 to-black/0 md:block" />
            </div>
          ) : (
            <>
              {(group.socialLinks || group.profileImage) && (
                <div className="mb-5 hidden h-24 w-full bg-gray-700 md:block" />
              )}
            </>
          )}
        </>
      )}
      <Header {...group} />
      <div className="custom-scroll pointer-events-auto relative mt-10 overflow-x-auto bg-gray-900">
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
  const { id, name, description, clanChat, patron, profileImage, homeworld, memberCount } = props;

  return (
    <div>
      <div className="flex items-start justify-between gap-x-5 gap-y-7">
        <div className="flex items-center md:items-start">
          {patron && profileImage && (
            <div className="z-10 mr-5 shrink-0 rounded-full bg-gray-900 md:-mt-[4rem] md:p-2">
              <Image
                className="h-20 w-20 rounded-full border-2 border-amber-300 md:h-[7.5rem] md:w-[7.5rem]"
                src={profileImage}
                width={120}
                height={120}
                alt={`${name} - Profile Image`}
              />
            </div>
          )}
          <div className="flex flex-col">
            <div className="flex items-center gap-x-3">
              <h1 className="text-xl font-bold md:text-2xl xl:text-3xl">{name}</h1>
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
        </div>
        <div className="flex shrink-0 items-center gap-x-2">
          <QueryLink query={{ dialog: "update-all" }} className="hidden md:block">
            <Button variant="blue">Update all</Button>
          </QueryLink>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button iconButton>
                <OverflowIcon className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <QueryLink query={{ dialog: "update-all" }} className="block md:hidden">
                <DropdownMenuItem>Update all</DropdownMenuItem>
              </QueryLink>
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
      <div className="mt-5 flex items-center">
        {patron && (
          <div
            className={cn(
              "flex justify-center",
              profileImage ? "w-[6.25rem] pr-5 md:w-[9.75rem]" : "pr-7"
            )}
          >
            <Badge variant="gold" className="hidden px-2 md:inline-block">
              Patreon Supporters
            </Badge>
            <Badge variant="gold" className="inline-block md:hidden">
              Patrons
            </Badge>
          </div>
        )}
        <div className="flex items-center gap-x-7">
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
    </div>
  );
}
