import React, { PropsWithChildren } from "react";
import {
  CountryProps,
  Player,
  PlayerBuild,
  PlayerBuildProps,
  PlayerDetails,
  PlayerStatus,
  PlayerTypeProps,
} from "@wise-old-man/utils";
import { formatDatetime, timeago } from "~/utils/dates";
import { getPlayerDetails } from "~/services/wiseoldman";
import { Button } from "~/components/Button";
import { QueryLink } from "~/components/QueryLink";
import { Container } from "~/components/Container";
import { Flag, PlayerTypeIcon } from "~/components/Icon";
import { PlayerNavigation } from "~/components/players/PlayerNavigation";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/Tooltip";
import { UpdatePlayerForm } from "~/components/players/UpdatePlayerForm";
import { Alert, AlertDescription, AlertTitle } from "~/components/Alert";
import { AssertPlayerTypeForm } from "~/components/players/AssertPlayerTypeForm";
import { NameChangeSubmissionDialog } from "~/components/NameChangeSubmissionDialog";
import { PlayerCustomPeriodDialog } from "~/components/players/PlayerCustomPeriodDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/Dropdown";

import OverflowIcon from "~/assets/overflow.svg";
import ExternalIcon from "~/assets/external.svg";
import WarningFilledIcon from "~/assets/warning_filled.svg";

export const dynamic = "force-dynamic";

interface PageProps {
  params: {
    username: string;
  };
}

export default async function PlayerLayout(props: PropsWithChildren<PageProps>) {
  const { children, params } = props;
  const username = decodeURI(params.username);

  const player = await getPlayerDetails(username).catch(() => null);

  if (!player) {
    // If it fails to fetch this player, fallback to only rendering the child node.
    // This child will be the Error boundary defined in error.tsx.
    return <Container>{children}</Container>;
  }

  return (
    <Container className="relative">
      {player.status !== PlayerStatus.ACTIVE && (
        <div className="mt-12 md:mb-10 md:mt-0">
          <PlayerStatusAlert player={player} />
        </div>
      )}
      <Header {...player} />
      <div className="mt-7">
        <PlayerNavigation username={username} />
      </div>
      {children}

      {/* Dialogs */}
      <PlayerCustomPeriodDialog username={username} />
      <NameChangeSubmissionDialog oldName={player.displayName} />
    </Container>
  );
}

function Header(props: PlayerDetails) {
  const { status, type, country, displayName } = props;

  let icon: React.ReactNode;

  if (status === PlayerStatus.ARCHIVED) {
    icon = <WarningFilledIcon className="h-8 w-8 text-red-500" />;
  } else if (status === PlayerStatus.FLAGGED || status === PlayerStatus.BANNED) {
    icon = <WarningFilledIcon className="h-8 w-8 text-orange-500" />;
  } else if (status === PlayerStatus.UNRANKED) {
    icon = <WarningFilledIcon className="h-8 w-8 text-yellow-500" />;
  } else {
    icon = <PlayerTypeIcon playerType={type} size="lg" />;
  }

  const actionsElement = (
    <div className="flex shrink-0 items-center gap-x-2">
      <UpdatePlayerForm player={props} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button iconButton>
            <OverflowIcon className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`https://secure.runescape.com/m=hiscore_oldschool/hiscorepersonal.ws?user1=${props.displayName}`}
          >
            <DropdownMenuItem>
              Open Official Hiscores <ExternalIcon className="ml-2 h-4 w-4" />
            </DropdownMenuItem>
          </a>
          <QueryLink query={{ dialog: "submit-name" }}>
            <DropdownMenuItem>Submit name change</DropdownMenuItem>
          </QueryLink>
          <AssertPlayerTypeForm player={props} />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  return (
    <div className="flex items-end justify-between">
      <div className="absolute left-0 right-0 top-0 flex justify-end border-b border-gray-700 bg-gray-900 px-7 py-4 md:hidden">
        {actionsElement}
      </div>
      <div className="mt-12 flex items-center gap-x-5 md:mt-0">
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
      <div className="hidden md:block">{actionsElement}</div>
    </div>
  );
}

function PlayerStatusAlert(props: { player: Player }) {
  const { status } = props.player;

  if (status === PlayerStatus.ARCHIVED) {
    return (
      <Alert variant="error">
        <div>
          <AlertTitle>This player is archived</AlertTitle>
          <AlertDescription>
            Their previous username has been taken by another player. If you know this account&apos;s new
            username, you can
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://wiseoldman.net/discord"
              className="text-white underline"
            >
              {" contact us on Discord "}
            </a>
            to transfer their old data to their current username.
          </AlertDescription>
        </div>
      </Alert>
    );
  }

  if (status === PlayerStatus.BANNED) {
    return (
      <Alert variant="error" className="border-orange-700 bg-orange-900/10">
        <div>
          <AlertTitle>This player is banned</AlertTitle>
          <AlertDescription>
            This player could not be found on the hiscores last time we checked. It was then confirmed to
            be banned via RuneMetrics. You can update to re-check this status, it may take a few minutes
            to complete.
          </AlertDescription>
        </div>
      </Alert>
    );
  }

  if (status === PlayerStatus.FLAGGED) {
    return (
      <Alert variant="error" className="border-orange-700 bg-orange-900/10">
        <div>
          <AlertTitle>This player is flagged</AlertTitle>
          <AlertDescription>
            This is often caused by an unregistered name change, a de-iron or a hiscores rollback. Our
            team has been notified of this and will review you profile ASAP. Please check again in a few
            hours. You can also{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://wiseoldman.net/discord"
              className="text-white underline"
            >
              {" contact us on Discord "}
            </a>
            for more information.
          </AlertDescription>
        </div>
      </Alert>
    );
  }

  return (
    <Alert variant="error" className="border-yellow-700 bg-yellow-900/10">
      <div>
        <AlertTitle>This player is unranked</AlertTitle>
        <AlertDescription>
          <p>
            This player could not be found on the hiscores last time we checked. This can either mean
            they&apos;ve changed their name, they&apos;re banned or they have dropped out of the hiscores
            due to low levels.
          </p>
          <p className="mt-5">
            Do you know this player&apos;s new username?
            <QueryLink className="text-white underline" query={{ dialog: "submit-name" }}>
              {" submit a name change "}
            </QueryLink>
            or
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://wiseoldman.net/discord"
              className="text-white underline"
            >
              {" contact us on Discord "}
            </a>
            for more information.
          </p>
        </AlertDescription>
      </div>
    </Alert>
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
    elements.push(<span className="text-orange-400">Banned</span>);
  } else if (status === PlayerStatus.ARCHIVED) {
    elements.push(<span className="text-red-400">Archived</span>);
  }

  elements.push(<span>{PlayerTypeProps[type].name}</span>);

  if (build !== PlayerBuild.MAIN) {
    elements.push(<span>{PlayerBuildProps[build].name}</span>);
  }

  if (latestSnapshot) {
    elements.push(
      <Tooltip>
        <TooltipTrigger asChild>
          <span>Last updated {timeago.format(latestSnapshot.createdAt)}</span>
        </TooltipTrigger>
        <TooltipContent side="bottom">{formatDatetime(latestSnapshot.createdAt)}</TooltipContent>
      </Tooltip>
    );
  }

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
