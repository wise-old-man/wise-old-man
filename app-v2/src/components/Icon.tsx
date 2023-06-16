import Image from "next/image";
import { GroupRole, Metric, PlayerType } from "@wise-old-man/utils";

export function MetricIcon(props: { metric: Metric }) {
  const { metric } = props;
  return (
    <Image height={24} width={24} alt={metric} src={`/img/metrics/${metric}.png`} className="shrink-0" />
  );
}

export function MetricIconSmall(props: { metric: Metric | "ehp+ehb" }) {
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

export function PlayerTypeIcon(props: { playerType: PlayerType }) {
  const { playerType } = props;
  return (
    <Image
      width={10}
      height={13}
      alt={playerType}
      src={`/img/player_types/${playerType}.png`}
      className="shrink-0"
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
      src={`/img/group_roles/${role === GroupRole.MEMBER ? "minion" : role.replaceAll("_", " ")}.png`}
      className="shrink-0"
    />
  );
}
