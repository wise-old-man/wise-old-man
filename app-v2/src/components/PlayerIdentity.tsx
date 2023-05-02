import { PropsWithChildren } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Country,
  CountryProps,
  Player,
  PlayerBuild,
  PlayerBuildProps,
  PlayerType,
  PlayerTypeProps,
} from "@wise-old-man/utils";
import { timeago } from "~/utils/dates";
import { Tooltip, TooltipContent, TooltipTrigger } from "./Tooltip";
import { Tooltip, TooltipContent, TooltipTrigger } from "./Tooltip";
import { timeago } from "~/utils/dates";

interface PlayerIdentityProps {
  player: Player;
  caption?: string;
}

function PlayerIdentity(props: PlayerIdentityProps) {
  const { player, caption } = props;

  return (
    <Tooltip delayDuration={700}>
      <div className="flex items-center text-sm text-white">
        <TooltipTrigger asChild>
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-600 bg-gray-900 shadow-inner shadow-black/50">
            {player.country && (
              <div className="absolute -right-1 bottom-0">
                <Flag country={player.country} />
              </div>
            )}
            <PlayerTypeIcon playerType={player.type} />
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
      <TooltipContent className="min-w-[16rem] max-w-lg p-0">
        <PlayerIdentityTooltip player={player} />
      </TooltipContent>
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
            <div className="flex items-center gap-x-1">
              <Flag country={player.country} />
              <span className="line-clamp-1">{CountryProps[player.country].name}</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function Flag(props: { country: Country }) {
  const { code, name } = CountryProps[props.country];

  return (
    <Image
      width={14}
      height={14}
      alt={`${name} (${code} Flag)`}
      src={`/img/flags/${code}.svg`}
      className="h-3.5 w-3.5 overflow-hidden rounded-full border-2 border-gray-900"
    />
  );
}

function PlayerTypeIcon(props: { playerType: PlayerType }) {
  const { playerType } = props;

  return <Image width={10} height={13} alt={playerType} src={`/img/player_types/${playerType}.png`} />;
}

export { PlayerIdentity };
