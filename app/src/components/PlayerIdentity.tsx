import React from "react";
import {
  Activity,
  CountryProps,
  GroupRoleProps,
  MemberActivityWithPlayer,
  Player,
  PlayerBuild,
  PlayerBuildProps,
  PlayerStatus,
  PlayerType,
  PlayerTypeProps,
} from "@wise-old-man/utils";
import Link from "next/link";
import { cn } from "~/utils/styling";
import { timeago } from "~/utils/dates";
import { Flag, GroupRoleIcon, PlayerTypeIcon } from "./Icon";
import { Badge } from "./Badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "./Tooltip";

import WarningFilledIcon from "~/assets/warning_filled.svg";

interface PlayerIdentityProps {
  player: Player;
  caption?: React.JSX.Element | string | undefined;
  renderTooltip?: boolean;
  href?: string;
  moreContextTooltip?: React.JSX.Element | null;
}

export function PlayerIdentity(props: PlayerIdentityProps) {
  const { player, caption, href, renderTooltip = true, moreContextTooltip } = props;

  let icon: React.ReactNode;

  if (player.status === PlayerStatus.ARCHIVED) {
    icon = <WarningFilledIcon className="h-4 w-4 text-red-500" />;
  } else if (player.status === PlayerStatus.UNRANKED) {
    icon = <WarningFilledIcon className="h-4 w-4 text-yellow-500" />;
  } else if (player.status === PlayerStatus.FLAGGED || player.status === PlayerStatus.BANNED) {
    icon = <WarningFilledIcon className="h-4 w-4 text-orange-500" />;
  } else {
    icon = <PlayerTypeIcon playerType={player.type} />;
  }

  return (
    <Tooltip delayDuration={700}>
      <div className="flex items-center text-sm text-white">
        <TooltipTrigger asChild>
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-600 bg-gray-900 shadow-inner shadow-black/50">
            {player.country && (
              <div className="absolute -right-1 bottom-0">
                <Flag
                  size="sm"
                  country={player.country}
                  className="h-3.5 w-3.5 rounded-full border-2 border-gray-900"
                />
              </div>
            )}
            {icon}
          </div>
        </TooltipTrigger>
        <div className="ml-3 flex flex-col">
          <TooltipTrigger asChild>
            <Link
              prefetch={false}
              href={href || `/players/${player.username}`}
              className={cn(
                "line-clamp-1 text-sm font-medium hover:underline",
                player.patron && "text-amber-300"
              )}
            >
              {player.status === PlayerStatus.ARCHIVED ? "[Archived]" : player.displayName}
            </Link>
          </TooltipTrigger>
          {caption && <span className="text-xs text-gray-200">{caption}</span>}
        </div>
      </div>
      {renderTooltip && (
        <TooltipContent className="min-w-[16rem] max-w-xl p-0 sm:max-w-2xl">
          <PlayerIdentityTooltip player={player} moreContextTooltip={moreContextTooltip} />
        </TooltipContent>
      )}
    </Tooltip>
  );
}

export function PlayerIdentityTooltip(props: { player: Player; moreContextTooltip?: React.ReactNode }) {
  const { player, moreContextTooltip } = props;

  const updatedTimeago = `Updated ${timeago.format(player.updatedAt || new Date())}`;

  return (
    <>
      <div className="flex flex-col rounded-t-lg border-b border-gray-500 px-4 py-3">
        <span>{player.status === PlayerStatus.ARCHIVED ? "[Archived]" : player.displayName}</span>
        <span className="text-xs text-gray-200">{updatedTimeago}</span>
        {player.status === PlayerStatus.ARCHIVED && (
          <span className="mt-4 text-xs text-red-400">
            This player has been archived. Visit their profile for more information.
          </span>
        )}
        {player.status === PlayerStatus.FLAGGED && (
          <span className="mt-4 text-xs text-orange-400">
            This player is flagged. Visit their profile for more information.
          </span>
        )}
        {player.status === PlayerStatus.BANNED && (
          <span className="mt-4 text-xs text-orange-400">
            This player is banned. Visit their profile for more information.
          </span>
        )}
        {player.status === PlayerStatus.UNRANKED && player.updatedAt && (
          <span className="mt-4 text-xs text-gray-200">
            This player is unranked. They could not be found on the hiscores.
          </span>
        )}
        {player.type === PlayerType.UNKNOWN && (
          <span className="mt-4 text-xs text-gray-200">
            This player is could not be found on the hiscores.
          </span>
        )}
      </div>
      <div className="flex flex-col divide-y divide-gray-500 md:flex-row md:divide-x">
        {player.patron && (
          <div className="flex items-center justify-center py-4 md:px-4">
            <a href="https://wiseoldman.net/patreon" target="_blank" rel="noopener noreferrer">
              <Badge variant="gold">Patreon Supporter</Badge>
            </a>
          </div>
        )}
        <div className="flex min-w-[5rem] flex-col px-4 py-3">
          <span className="mb-1 text-xs text-gray-200">Type</span>
          <div className="flex items-center gap-x-2">
            <PlayerTypeIcon playerType={player.type} />
            <span>{PlayerTypeProps[player.type].name}</span>
          </div>
        </div>
        {moreContextTooltip && (
          <div className="flex min-w-[5rem] flex-col px-4 py-3">{moreContextTooltip}</div>
        )}
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
              <Flag size="sm" country={player.country} className="h-3 w-3" />
              <span className="line-clamp-1">{CountryProps[player.country].name}</span>
            </a>
          </div>
        )}
      </div>
    </>
  );
}
