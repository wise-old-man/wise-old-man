enum PlayerType {
  UNKNOWN = 'unknown',
  REGULAR = 'regular',
  IRONMAN = 'ironman',
  ULTIMATE = 'ultimate',
  HARDCORE = 'hardcore'
}

enum PlayerBuild {
  MAIN = 'main',
  F2P = 'f2p',
  LVL3 = 'lvl3',
  ZERKER = 'zerker',
  DEF1 = '1def',
  HP10 = '10hp'
}

const PlayerTypeProps = {
  [PlayerType.UNKNOWN]: { name: 'Unknown' },
  [PlayerType.REGULAR]: { name: 'Regular' },
  [PlayerType.IRONMAN]: { name: 'Ironman' },
  [PlayerType.ULTIMATE]: { name: 'Ultimate' },
  [PlayerType.HARDCORE]: { name: 'Hardcore' }
};

const PlayerBuildProps = {
  [PlayerBuild.MAIN]: { name: 'Main' },
  [PlayerBuild.F2P]: { name: 'F2P' },
  [PlayerBuild.LVL3]: { name: 'Level 3' },
  [PlayerBuild.ZERKER]: { name: 'Zerker Pure' },
  [PlayerBuild.DEF1]: { name: '1 Defence Pure' },
  [PlayerBuild.HP10]: { name: '10 Hitpoints Pure' }
};

const PLAYER_TYPES = Object.values(PlayerType);
const PLAYER_BUILDS = Object.values(PlayerBuild);

function findPlayerType(typeName: string): PlayerType | null {
  for (var [key, value] of Object.entries(PlayerTypeProps)) {
    if (value.name === typeName) return key as PlayerType;
  }

  return null;
}

function findPlayerBuild(buildName: string): PlayerBuild | null {
  for (var [key, value] of Object.entries(PlayerBuildProps)) {
    if (value.name === buildName) return key as PlayerBuild;
  }

  return null;
}

function standardizeUsername(username) {
  return sanitizeUsername(username).toLowerCase();
}

function sanitizeUsername(username) {
  return username.replace(/[-_\s]/g, ' ').trim();
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
  findPlayerType,
  findPlayerBuild,
  sanitizeUsername,
  standardizeUsername
};
