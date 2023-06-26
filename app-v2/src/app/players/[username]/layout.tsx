import React, { PropsWithChildren } from "react";
import Link from "next/link";
import {
  CountryProps,
  PlayerBuild,
  PlayerBuildProps,
  PlayerDetails,
  PlayerStatus,
  PlayerTypeProps,
} from "@wise-old-man/utils";
import { formatDatetime, timeago } from "~/utils/dates";
import { fetchPlayer } from "~/services/wiseoldman";
import { Button } from "~/components/Button";
import { QueryLink } from "~/components/QueryLink";
import { Container } from "~/components/Container";
import { Flag, PlayerTypeIcon } from "~/components/Icon";
import { Tabs, TabsList, TabsTrigger } from "~/components/Tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/Tooltip";
import { PlayerCustomPeriodDialog } from "~/components/players/PlayerCustomPeriodDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/Dropdown";

import OverflowIcon from "~/assets/overflow.svg";
import WarningFilledIcon from "~/assets/warning_filled.svg";

interface PageProps {
  params: {
    username: string;
  };
}

export default async function PlayerLayout(props: PropsWithChildren<PageProps>) {
  const { children, params } = props;
  const username = decodeURI(params.username);

  // @ts-ignore - There's no decent API from Next.js yet (as of 13.4.0)
  const routeSegment = children.props.childProp.segment;

  const player = await fetchPlayer(username);

  return (
    <Container>
      <Header {...player} />
      <div className="mt-7">
        <Navigation username={username} routeSegment={routeSegment} />
      </div>
      {children}

      {/* Dialogs */}
      <PlayerCustomPeriodDialog username={username} />
    </Container>
  );
}

interface NavigationProps {
  username: string;
  routeSegment: string;
}

function Navigation(props: NavigationProps) {
  const { username, routeSegment } = props;

  const validTabs = [
    "overview",
    "gained",
    "competitions",
    "groups",
    "records",
    "achievements",
    "name-changes",
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
          <Link href={`/players/${username}`} aria-label="Navigate to the player's overview">
            <TabsTrigger value="overview">Overview</TabsTrigger>
          </Link>
          <Link href={`/players/${username}/gained`} aria-label="Navigate to the player's gains">
            <TabsTrigger value="gained">Gained</TabsTrigger>
          </Link>
          <Link
            href={`/players/${username}/competitions`}
            aria-label="Navigate to the player's competitions"
          >
            <TabsTrigger value="competitions">Competitions</TabsTrigger>
          </Link>
          <Link href={`/players/${username}/groups`} aria-label="Navigate to the player's groups">
            <TabsTrigger value="groups">Groups</TabsTrigger>
          </Link>
          <Link href={`/players/${username}/records`} aria-label="Navigate to the player's records">
            <TabsTrigger value="records">Records</TabsTrigger>
          </Link>
          <Link
            href={`/players/${username}/achievements`}
            aria-label="Navigate to the player's achievements"
          >
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </Link>
          <Link
            href={`/players/${username}/name-changes`}
            aria-label="Navigate to the player's name changes"
          >
            <TabsTrigger value="name-changes">Name changes</TabsTrigger>
          </Link>
        </TabsList>
      </Tabs>
    </div>
  );
}

function Header(props: PlayerDetails) {
  const { status, type, country, displayName } = props;

  let icon: React.ReactNode;

  // TODO: Add "banned" status
  if (status === PlayerStatus.ARCHIVED) {
    icon = <WarningFilledIcon className="h-8 w-8 text-red-500" />;
  } else if (status === PlayerStatus.UNRANKED) {
    icon = <WarningFilledIcon className="h-8 w-8 text-yellow-500" />;
  } else if (status === PlayerStatus.FLAGGED) {
    icon = <WarningFilledIcon className="h-8 w-8 text-orange-500" />;
  } else {
    icon = <PlayerTypeIcon playerType={type} size="lg" />;
  }

  return (
    <div className="flex items-end justify-between">
      <div className="flex items-center gap-x-5">
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-gray-600 bg-gray-900 shadow-inner shadow-black/50">
          {country && (
            <div className="absolute -right-1 bottom-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Flag
                    size="lg"
                    country={country}
                    className="h-5 w-5 rounded-full border-2 border-gray-900"
                  />
                </TooltipTrigger>
                <TooltipContent side="bottom" className="flex min-w-[5rem] flex-col px-4 py-3">
                  <span className="mb-1 text-xs text-gray-200">Country</span>
                  <a
                    className="flex items-center gap-x-2 hover:underline"
                    href="https://wiseoldman.net/flags"
                    title="How to setup?"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Flag size="sm" country={country} className="h-3 w-3" />
                    <span className="line-clamp-1">{CountryProps[country].name}</span>
                  </a>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
          {icon}
        </div>
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold">{displayName}</h1>
          <p className="mt-1 whitespace-pre text-body text-gray-200">
            <PlayerAttributes {...props} />
          </p>
        </div>
      </div>
      <div>
        <div className="flex shrink-0 items-center gap-x-2">
          <QueryLink query={{ dialog: "update-all" }}>
            <Button variant="blue">Update</Button>
          </QueryLink>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button iconButton>
                <OverflowIcon className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <QueryLink query={{ dialog: "delete" }}>
                <DropdownMenuItem>Delete</DropdownMenuItem>
              </QueryLink>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

function PlayerAttributes(props: PlayerDetails) {
  const { status, type, build, latestSnapshot } = props;

  const elements: React.ReactNode[] = [];

  if (status === PlayerStatus.FLAGGED) {
    elements.push(<span className="text-orange-400">Flagged</span>);
  } else if (status === PlayerStatus.UNRANKED) {
    elements.push(<span className="text-yellow-400">Unranked</span>);
  } else if (status === PlayerStatus.BANNED) {
    elements.push(<span className="text-yellow-400">Banned</span>);
  } else if (status === PlayerStatus.ARCHIVED) {
    elements.push(<span className="text-red-400">Archived</span>);
  }

  elements.push(<span>{PlayerTypeProps[type].name}</span>);

  if (build !== PlayerBuild.MAIN) {
    elements.push(<span>{PlayerBuildProps[build].name}</span>);
  }

  elements.push(
    <Tooltip>
      <TooltipTrigger asChild>
        <span>Last updated {timeago.format(latestSnapshot.createdAt)}</span>
      </TooltipTrigger>
      <TooltipContent side="bottom">{formatDatetime(latestSnapshot.createdAt)}</TooltipContent>
    </Tooltip>
  );

  return (
    <>
      {elements.map((e, i) => {
        return (
          <React.Fragment key={i}>
            {e}
            {i < elements.length - 1 && "  ·  "}
          </React.Fragment>
        );
      })}
    </>
  );
}
