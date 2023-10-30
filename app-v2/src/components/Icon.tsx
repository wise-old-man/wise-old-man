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
  const { playerType, className } = props;
  return (
    <Image
      width={10}
      height={13}
      alt={playerType}
      src={`/img/player_types/${playerType}.png`}
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
