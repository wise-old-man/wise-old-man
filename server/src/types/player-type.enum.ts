export const PlayerType = {
  UNKNOWN: 'unknown',
  REGULAR: 'regular',
  IRONMAN: 'ironman',
  HARDCORE: 'hardcore',
  ULTIMATE: 'ultimate'
} as const;

export type PlayerType = (typeof PlayerType)[keyof typeof PlayerType];

export const PLAYER_TYPES = Object.values(PlayerType) as PlayerType[];
