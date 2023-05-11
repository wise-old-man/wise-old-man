import {
  Country,
  CountryProps,
  Player,
  PlayerBuild,
  PlayerBuildProps,
  PlayerStatus,
  PlayerTypeProps,
} from "@wise-old-man/utils";
import Image from "next/image";
import Link from "next/link";
import { PropsWithChildren } from "react";
import { timeago } from "~/utils/dates";
import { cn } from "~/utils/styling";
import { PlayerTypeIcon } from "./Icon";
import { Tooltip, TooltipContent, TooltipTrigger } from "./Tooltip";

import WarningIcon from "~/assets/warning.svg";

interface PlayerIdentityProps {
  player: Player;
  caption?: string;
  renderTooltip?: boolean;
}

function PlayerIdentity(props: PlayerIdentityProps) {
  const { player, caption, renderTooltip = true } = props;

  return (
    <Tooltip delayDuration={700}>
      <div className="flex items-center text-sm text-white">
        <TooltipTrigger asChild>
          <div
            className={cn(
              "relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-600 bg-gray-900 shadow-inner shadow-black/50",
              player.status === PlayerStatus.ARCHIVED && "border-red-500"
            )}
          >
            {player.country && (
              <div className="absolute -right-1 bottom-0">
                <Flag
                  country={player.country}
                  className="h-3.5 w-3.5 rounded-full border-2 border-gray-900"
                />
              </div>
            )}
            {player.status === PlayerStatus.ARCHIVED ? (
              <WarningIcon className="h-3 w-3 text-red-500" />
            ) : (
              <PlayerTypeIcon playerType={player.type} />
            )}
          </div>
        </TooltipTrigger>
        <div className="ml-2 flex flex-col">
          <TooltipTrigger asChild>
            <Link
              href={`/players/${player.username}`}
              className="line-clamp-1 text-sm font-medium hover:underline"
            >
              {player.displayName}
            </Link>
          </TooltipTrigger>
          {caption && <span className="text-xs text-gray-200">{caption}</span>}
        </div>
      </div>
      {renderTooltip && (
        <TooltipContent className="min-w-[16rem] max-w-lg p-0">
          <PlayerIdentityTooltip player={player} />
        </TooltipContent>
      )}
    </Tooltip>
  );
}

function PlayerIdentityTooltip(props: PropsWithChildren<{ player: Player }>) {
  const { player } = props;

  const updatedTimeago = `Updated ${timeago.format(player.updatedAt || new Date())}`;

  return (
    <>
      <div className="flex flex-col rounded-t-lg border-b border-gray-500 px-4 py-3">
        <span>{player.displayName}</span>
        <span className="text-xs text-gray-200">{updatedTimeago}</span>
        {player.status === PlayerStatus.ARCHIVED && (
          <span className="mt-4 text-xs text-red-300">
            This player is archived. Visit their profile for more information.
          </span>
        )}
      </div>
      <div className="flex divide-x divide-gray-500">
        <div className="flex min-w-[5rem] flex-col px-4 py-3">
          <span className="mb-1 text-xs text-gray-200">Type</span>
          <div className="flex items-center gap-x-2">
            <PlayerTypeIcon playerType={player.type} />
            <span>{PlayerTypeProps[player.type].name}</span>
          </div>
        </div>
        {player.build !== PlayerBuild.MAIN && (
          <div className="flex min-w-[5rem] flex-col px-4 py-3">
            <span className="mb-1 text-xs text-gray-200">Build</span>
            <span>{PlayerBuildProps[player.build].name}</span>
          </div>
        )}
        {player.country && (
          <div className="flex min-w-[5rem] flex-col px-4 py-3">
            <span className="mb-1 text-xs text-gray-200">Country</span>
            <a
              className="flex items-center gap-x-1 hover:underline"
              href="https://wiseoldman.net/flags"
              title="How to setup?"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Flag country={player.country} className="h-3 w-3" />
              <span className="line-clamp-1">{CountryProps[player.country].name}</span>
            </a>
          </div>
        )}
      </div>
    </>
  );
}

function Flag(props: { country: Country; className?: string }) {
  const { code, name } = CountryProps[props.country];

  return (
    <Image
      width={14}
      height={14}
      alt={`${name} (${code} Flag)`}
      src={`/img/flags/${code}.svg`}
      className={props.className}
    />
  );
}

export { PlayerIdentity };
