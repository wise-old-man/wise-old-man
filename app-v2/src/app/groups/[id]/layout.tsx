import Link from "next/link";
import { PropsWithChildren } from "react";
import { GroupDetails } from "@wise-old-man/utils";
import { fetchGroup } from "~/services/wiseoldman";
import { Button } from "~/components/Button";
import { QueryLink } from "~/components/QueryLink";
import { Container } from "~/components/Container";
import { Tabs, TabsList, TabsTrigger } from "~/components/Tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/Tooltip";
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

export const runtime = "edge";
export const dynamic = "force-dynamic";

interface PageProps {
  params: {
    id: number;
  };
}

export default async function GroupDetailsLayout(props: PropsWithChildren<PageProps>) {
  const { children, params } = props;
  const { id } = params;

  // @ts-ignore - There's no decent API from Next.js yet (as of 13.4.0)
  const routeSegment = children.props.childProp.segment;

  const group = await fetchGroup(id);

  return (
    <Container>
      <Header {...group} />
      <div className="mt-7">
        <Navigation id={id} routeSegment={routeSegment} />
      </div>
      {children}
    </Container>
  );
}

interface NavigationProps {
  id: number;
  routeSegment: string;
}

function Navigation(props: NavigationProps) {
  const { id, routeSegment } = props;

  const validTabs = [
    "overview",
    "competitions",
    "leaderboards",
    "achievements",
    "name-changes",
    "statistics",
  ];

  let selectedSegment: string | undefined;

  if (validTabs.includes(routeSegment)) {
    selectedSegment = routeSegment;
  } else {
    selectedSegment = "overview";
  }

  return (
    <div className="custom-scroll pointer-events-auto relative mb-6 overflow-x-auto bg-gray-900 pb-2">
      <Tabs defaultValue={selectedSegment}>
        <TabsList aria-label="Competition Navigation">
          <Link href={`/groups/${id}`} aria-label="Navigate to the groups's overview">
            <TabsTrigger value="overview">Overview</TabsTrigger>
          </Link>
          <Link href={`/groups/${id}/competitions`} aria-label="Navigate to groups's competitions list">
            <TabsTrigger value="competitions">Competitions</TabsTrigger>
          </Link>
          <Link href={`/groups/${id}/leaderboards`} aria-label="Navigate to groups's leaderboards">
            <TabsTrigger value="leaderboards">Leaderboards</TabsTrigger>
          </Link>
          <Link href={`/groups/${id}/achievements`} aria-label="Navigate to groups's achievements">
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </Link>
          <Link href={`/groups/${id}/name-changes`} aria-label="Navigate to groups's name changes">
            <TabsTrigger value="name-changes">Name changes</TabsTrigger>
          </Link>
          <Link href={`/groups/${id}/statistics`} aria-label="Navigate to groups's statistics">
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
          </Link>
        </TabsList>
      </Tabs>
    </div>
  );
}

function Header(props: GroupDetails) {
  const { id, name, description, clanChat, homeworld, memberCount } = props;

  return (
    <div>
      <div className="flex flex-col-reverse items-start justify-between gap-x-5 gap-y-7 md:flex-row">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold">{name}</h1>
          <p className="mt-1 text-body text-gray-200">{description}</p>
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
              <Link prefetch={false} href={`/groups/${id}/edit`}>
                <DropdownMenuItem>Edit</DropdownMenuItem>
              </Link>
              <QueryLink query={{ dialog: "delete" }}>
                <DropdownMenuItem>Delete</DropdownMenuItem>
              </QueryLink>
              <Link prefetch={false} href={`/competitions/create?groupId=${id}`}>
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
