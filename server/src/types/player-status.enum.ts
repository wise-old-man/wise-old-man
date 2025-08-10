export const PlayerStatus = {
  ACTIVE: 'active',
  UNRANKED: 'unranked',
  FLAGGED: 'flagged',
  ARCHIVED: 'archived',
  BANNED: 'banned'
} as const;

export type PlayerStatus = (typeof PlayerStatus)[keyof typeof PlayerStatus];

export const PLAYER_STATUSES = Object.values(PlayerStatus) as PlayerStatus[];
