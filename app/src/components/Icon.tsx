import Image from "next/image";
import { cn } from "~/utils/styling";
import { Country, CountryProps, GroupRole, Metric, PlayerType } from "@wise-old-man/utils";

export function MetricIcon(props: { metric: Metric | "ttm" | "tt200m" | "combat" }) {
  const { metric } = props;
  return (
    <Image height={24} width={24} alt={metric} src={`/img/metrics/${metric}.png`} className="shrink-0" />
  );
}

export function MetricIconSmall(props: { metric: Metric | "ehp+ehb" | "combat" }) {
  const { metric } = props;
  return (
    <Image
      height={16}
      width={16}
      alt={metric}
      src={`/img/metrics_small/${metric}.png`}
      className="shrink-0"
    />
  );
}

export function PlayerTypeIcon(props: { playerType: PlayerType; className?: string }) {
  const { className } = props;
  return (
    <Image
      width={18}
      height={18}
      alt="League - Trailblazer Reloaded"
      src={`/img/player_types/league.png`}
      className={cn("shrink-0", className)}
      style={{ imageRendering: "pixelated" }}
    />
  );
}

export function GroupRoleIcon(props: { role: GroupRole }) {
  const { role } = props;
  return (
    <Image
      width={13}
      height={13}
      alt={role}
      src={`/img/group_roles/${role === GroupRole.MEMBER ? "minion" : role}.png`}
      className="shrink-0"
    />
  );
}

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

export function LeagueTierIcon(props: { tier: string; size?: "sm" | "lg" }) {
  const { tier, size = "sm" } = props;

  let bgColor = "";

  switch (tier) {
    case "Bronze":
      bgColor = "#6a512e";
      break;
    case "Iron":
      bgColor = "#6c5f5d";
      break;
    case "Steel":
      bgColor = "#aaa4a4";
      break;
    case "Mithril":
      bgColor = "#51517c";
      break;
    case "Adamant":
      bgColor = "#476547";
      break;
    case "Rune":
      bgColor = "#577987";
      break;
    case "Dragon":
      bgColor = "#ab3424";
      break;
  }

  return (
    <div
      className={cn("rounded-full", size === "sm" ? "h-3 w-3" : "h-[1.125rem] w-[1.125rem]")}
      style={{
        background: bgColor,
      }}
    />
  );
}
