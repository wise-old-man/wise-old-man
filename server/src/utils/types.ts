// This is an exact copy of the native Typescript type "Record"
// But since that word is already used for WOM Player Records,
// the client-js bundle gets confused, so this renames it to MapOf
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MapOf<K extends keyof any, T> = {
  [P in K]: T;
};

export * from '../api/modules/achievements/achievement.types';
export * from '../api/modules/competitions/competition.types';
export * from '../api/modules/deltas/delta.types';
export * from '../api/modules/efficiency/efficiency.types';
export * from '../api/modules/groups/group.types';
export * from '../api/modules/name-changes/name-change.types';
export * from '../api/modules/players/player.types';
export * from '../api/modules/records/record.types';
export * from '../api/modules/snapshots/snapshot.types';
