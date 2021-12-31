import {
  PLAYER_TYPES,
  PLAYER_BUILDS,
  PlayerTypeProps,
  PlayerBuildProps,
  PlayerType,
  PlayerBuild,
  findPlayerType,
  findPlayerBuild,
  sanitizeUsername,
  standardizeUsername
} from '../src/players';

describe('Util - Players', () => {
  test('Props', () => {
    expect(PLAYER_TYPES.some(t => !(t in PlayerTypeProps))).toBe(false);
    expect(Object.keys(PlayerType).length).toBe(Object.keys(PlayerTypeProps).length);

    expect(PLAYER_BUILDS.some(t => !(t in PlayerBuildProps))).toBe(false);
    expect(Object.keys(PlayerBuild).length).toBe(Object.keys(PlayerBuildProps).length);
  });

  test('findPlayerType', () => {
    expect(findPlayerType('Hardcore')).toBe(PlayerType.HARDCORE);
    expect(findPlayerType('ultimate')).toBe(PlayerType.ULTIMATE);
    expect(findPlayerType('Other')).toBe(null);
  });

  test('findPlayerBuild', () => {
    expect(findPlayerBuild('F2P')).toBe(PlayerBuild.F2P);
    expect(findPlayerBuild('level 3')).toBe(PlayerBuild.LVL3);
    expect(findPlayerBuild('Other')).toBe(null);
  });

  test('sanitizeUsername', () => {
    expect(sanitizeUsername(' IRON Mammal_ ')).toBe('IRON Mammal');
    expect(sanitizeUsername('    __PSIKOI')).toBe('PSIKOI');
  });

  test('standardizeUsername', () => {
    expect(standardizeUsername(' IRON Mammal_ ')).toBe('iron mammal');
    expect(standardizeUsername('    __PSIKOI')).toBe('psikoi');
  });
});
