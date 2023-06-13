import { PlayerType, PlayerBuild, PlayerStatus } from '../prisma/enum-adapter';
import { MapOf } from './types';

const PlayerTypeProps: MapOf<PlayerType, { name: string }> = {
  [PlayerType.UNKNOWN]: { name: 'Unknown' },
  [PlayerType.REGULAR]: { name: 'Regular' },
  [PlayerType.IRONMAN]: { name: 'Ironman' },
  [PlayerType.HARDCORE]: { name: 'Hardcore' },
  [PlayerType.ULTIMATE]: { name: 'Ultimate' }
};

const PlayerBuildProps: MapOf<PlayerBuild, { name: string }> = {
  [PlayerBuild.MAIN]: { name: 'Main' },
  [PlayerBuild.F2P]: { name: 'F2P' },
  [PlayerBuild.LVL3]: { name: 'Level 3' },
  [PlayerBuild.ZERKER]: { name: 'Zerker Pure' },
  [PlayerBuild.DEF1]: { name: '1 Defence Pure' },
  [PlayerBuild.HP10]: { name: '10 Hitpoints Pure' }
};

const PlayerStatusProps: MapOf<PlayerStatus, { name: string }> = {
  [PlayerStatus.ACTIVE]: { name: 'Active' },
  [PlayerStatus.UNRANKED]: { name: 'Unranked' },
  [PlayerStatus.FLAGGED]: { name: 'Flagged' },
  [PlayerStatus.ARCHIVED]: { name: 'Archived' },
  [PlayerStatus.BANNED]: { name: 'Banned' }
};

const PLAYER_TYPES = Object.values(PlayerType);
const PLAYER_BUILDS = Object.values(PlayerBuild);
const PLAYER_STATUSES = Object.values(PlayerStatus);

function isPlayerType(typeString: string): typeString is PlayerType {
  return typeString in PlayerTypeProps;
}

function isPlayerBuild(buildString: string): buildString is PlayerBuild {
  return buildString in PlayerBuildProps;
}

function isPlayerStatus(statusString: string): statusString is PlayerStatus {
  return statusString in PlayerStatusProps;
}

function findPlayerType(typeName: string): PlayerType | null {
  for (const [key, value] of Object.entries(PlayerTypeProps)) {
    if (value.name.toUpperCase() === typeName.toUpperCase()) return key as PlayerType;
  }

  return null;
}

function findPlayerBuild(buildName: string): PlayerBuild | null {
  for (const [key, value] of Object.entries(PlayerBuildProps)) {
    if (value.name.toUpperCase() === buildName.toUpperCase()) return key as PlayerBuild;
  }

  return null;
}

export {
  // Enums
  PlayerType,
  PlayerBuild,
  PlayerStatus,
  PlayerTypeProps,
  PlayerBuildProps,
  PlayerStatusProps,
  // Lists
  PLAYER_TYPES,
  PLAYER_BUILDS,
  PLAYER_STATUSES,
  // Functions
  isPlayerType,
  isPlayerBuild,
  isPlayerStatus,
  findPlayerType,
  findPlayerBuild
};
