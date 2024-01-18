import { COMBAT_SKILLS, MEMBER_SKILLS, Metric, Player, PlayerBuild } from "@wise-old-man/utils";

export function hasSpecialEhp(player: Player) {
  return ['f2p', 'f2p_lvl3', 'lvl3'].includes(player.build);
}

export function getBuildHiddenMetrics(build: PlayerBuild): Metric[] {
  switch (build) {
    case "f2p":
      return MEMBER_SKILLS;
    case "f2p_lvl3":
      return [...MEMBER_SKILLS, ...COMBAT_SKILLS];
    case "lvl3":
      return COMBAT_SKILLS;
  }

  return [];
}
