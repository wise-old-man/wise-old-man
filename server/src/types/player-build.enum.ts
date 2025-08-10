export const PlayerBuild = {
  MAIN: 'main',
  F2P: 'f2p',
  F2P_LVL3: 'f2p_lvl3',
  LVL3: 'lvl3',
  ZERKER: 'zerker',
  DEF1: 'def1',
  HP10: 'hp10'
} as const;

export type PlayerBuild = (typeof PlayerBuild)[keyof typeof PlayerBuild];

export const PLAYER_BUILDS = Object.values(PlayerBuild) as PlayerBuild[];
