import Image from "next/image";
import { cn } from "~/utils/styling";
import { Country, CountryProps, GroupRole, Metric, PlayerType } from "@wise-old-man/utils";
import metricsSprite from "../../public/img/metrics/spritesheet.json";
import metricsSmallSprite from "../../public/img/metrics_small/spritesheet.json";
import playerTypeIconsSprite from "../../public/img/player_types/spritesheet.json";
import groupRolesSprite from "../../public/img/group_roles/spritesheet.json";

type SpriteMap = Record<string, { x: number; y: number }>;

interface SpriteIconProps {
  name: string;
  spriteMap: SpriteMap;
  spriteUrl: string;
  width: number;
  height: number;
  className?: string;
  fallbackSrc?: string;
  fallbackAlt?: string;
}

function SpriteIcon({
  name,
  spriteMap,
  spriteUrl,
  width,
  height,
  className,
  fallbackSrc = "/img/fallback-icon.png",
  fallbackAlt = name,
}: SpriteIconProps) {
  const coords = spriteMap[`${name}.png`];

  if (!coords) {
    return <img src={fallbackSrc} alt={fallbackAlt} width={width} height={height} className={cn("shrink-0", className)} />;
  }

  return (
    <div
      aria-label={name}
      className={cn("shrink-0", className)}
      style={{
        backgroundImage: `url(${spriteUrl})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: `-${coords.x}px -${coords.y}px`,
        width,
        height,
      }}
    />
  );
}

export const MetricIcon = (props: { metric: Metric | "ttm" | "tt200m" | "combat" }) => (
  <SpriteIcon
    name={props.metric}
    spriteMap={metricsSprite}
    spriteUrl="/img/metrics/spritesheet.png"
    width={24}
    height={24}
  />
);

export const MetricIconSmall = (props: { metric: Metric | "ehp+ehb" | "combat" }) => (
  <SpriteIcon
    name={props.metric}
    spriteMap={metricsSmallSprite}
    spriteUrl="/img/metrics_small/spritesheet.png"
    width={16}
    height={16}
  />
);

export const PlayerTypeIcon = (props: { playerType: PlayerType; className?: string }) => (
  <SpriteIcon
    name={props.playerType}
    spriteMap={playerTypeIconsSprite}
    spriteUrl="/img/player_types/spritesheet.png"
    width={10}
    height={13}
    className={props.className}
  />
);

export const GroupRoleIcon = (props: { role: GroupRole }) => (
  <SpriteIcon
    name={props.role === GroupRole.MEMBER ? "minion" : props.role}
    spriteMap={groupRolesSprite}
    spriteUrl="/img/group_roles/spritesheet.png"
    width={13}
    height={13}
  />
);

export function Flag(props: { country: Country; className?: string; size: "sm" | "lg" }) {
  const { code, name } = CountryProps[props.country];

  return (
    <Image
      width={props.size === "sm" ? 14 : 20}
      height={props.size === "sm" ? 14 : 20}
      alt={`${name} (${code} Flag)`}
      src={`/img/flags/${code}.svg`}
      className={props.className}
    />
  );
}
