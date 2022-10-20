import { PlayerType, PlayerBuild } from '../prisma/enum-adapter';
import { MapOf } from './types';

const PlayerTypeProps: MapOf<PlayerType, { name: string }> = {
  [PlayerType.UNKNOWN]: { name: 'Unknown' },
  [PlayerType.REGULAR]: { name: 'Regular' },
  [PlayerType.IRONMAN]: { name: 'Ironman' },
  [PlayerType.HARDCORE]: { name: 'Hardcore' },
  [PlayerType.ULTIMATE]: { name: 'Ultimate' },
  [PlayerType.FRESH_START]: { name: 'Fresh Start' }
};

const PlayerBuildProps: MapOf<PlayerBuild, { name: string }> = {
  [PlayerBuild.MAIN]: { name: 'Main' },
  [PlayerBuild.F2P]: { name: 'F2P' },
  [PlayerBuild.LVL3]: { name: 'Level 3' },
  [PlayerBuild.ZERKER]: { name: 'Zerker Pure' },
  [PlayerBuild.DEF1]: { name: '1 Defence Pure' },
  [PlayerBuild.HP10]: { name: '10 Hitpoints Pure' }
};

const PLAYER_TYPES = Object.values(PlayerType);
const PLAYER_BUILDS = Object.values(PlayerBuild);

function isPlayerType(typeString: string): typeString is PlayerType {
  return typeString in PlayerTypeProps;
}

function isPlayerBuild(buildString: string): buildString is PlayerBuild {
  return buildString in PlayerBuildProps;
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
  PlayerTypeProps,
  PlayerBuildProps,
  // Lists
  PLAYER_TYPES,
  PLAYER_BUILDS,
  // Functions
  isPlayerType,
  isPlayerBuild,
  findPlayerType,
  findPlayerBuild
};
