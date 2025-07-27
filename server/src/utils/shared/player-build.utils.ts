import { PlayerBuild } from '../../types';

export const PlayerBuildProps: Record<PlayerBuild, { name: string }> = {
  [PlayerBuild.MAIN]: { name: 'Main' },
  [PlayerBuild.F2P]: { name: 'F2P' },
  [PlayerBuild.F2P_LVL3]: { name: 'F2P & Level 3' },
  [PlayerBuild.LVL3]: { name: 'Level 3' },
  [PlayerBuild.ZERKER]: { name: 'Zerker Pure' },
  [PlayerBuild.DEF1]: { name: '1 Defence Pure' },
  [PlayerBuild.HP10]: { name: '10 Hitpoints Pure' }
};

export function isPlayerBuild(buildString: string): buildString is PlayerBuild {
  return buildString in PlayerBuildProps;
}
