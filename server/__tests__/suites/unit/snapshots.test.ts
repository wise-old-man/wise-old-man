import { Metric, MetricLeaders, Player } from '../../../src/utils';
import * as utils from '../../../src/api/modules/snapshots/snapshot.utils';

function buildMockMetricLeaders() {
  return {
    skills: {
      attack: {
        metric: 'attack',
        player: null,
        rank: -1
      }
    },
    bosses: {
      zulrah: {
        metric: 'zulrah',
        player: null,
        rank: 100
      }
    },
    activities: {
      bounty_hunter_hunter: {
        metric: 'bounty_hunter_hunter',
        player: null,
        rank: 100
      }
    },
    computed: {
      ehp: {
        metric: 'ehp',
        player: null,
        rank: -1
      }
    }
  } as unknown as MetricLeaders;
}

function buildMockPlayers() {
  return [
    { id: 1, username: 'jonxslays' },
    { id: 2, username: 'psikoi' },
    { id: 3, username: 'alexsuperfly' }
  ] as unknown as Player[];
}

function buildMockLeaderIdMap() {
  const leaderIdMap = new Map<Metric, number>();
  leaderIdMap.set(Metric.ATTACK, 1);
  leaderIdMap.set(Metric.ZULRAH, 2);
  leaderIdMap.set(Metric.BOUNTY_HUNTER_HUNTER, 3);
  leaderIdMap.set(Metric.EHP, 1);
  return leaderIdMap;
}

describe('Util - Snapshots', () => {
  test('average', () => {
    expect(() => utils.average([])).toThrow('Invalid snapshots list. Failed to find average.');
    expect(() => utils.average(null)).toThrow('Invalid snapshots list. Failed to find average.');
    expect(() => utils.average(undefined)).toThrow('Invalid snapshots list. Failed to find average.');
  });

  test('getMetricLeaders', () => {
    expect(() => utils.getMetricLeaders([])).toThrow(
      'Invalid snapshots list. Failed to find metric leaders.'
    );

    expect(() => utils.getMetricLeaders(null)).toThrow(
      'Invalid snapshots list. Failed to find metric leaders.'
    );

    expect(() => utils.getMetricLeaders(undefined)).toThrow(
      'Invalid snapshots list. Failed to find metric leaders.'
    );
  });

  test('assignPlayersToMetricLeaders', () => {
    const metricLeaders = buildMockMetricLeaders();
    const leaderIdMap = buildMockLeaderIdMap();
    const players = buildMockPlayers();
    utils.assignPlayersToMetricLeaders(metricLeaders, leaderIdMap, players);

    expect(metricLeaders.skills.attack.player).toEqual(null);
    expect(metricLeaders.bosses.zulrah.player.username).toEqual('psikoi');
    expect(metricLeaders.activities.bounty_hunter_hunter.player.username).toEqual('alexsuperfly');
    expect(metricLeaders.computed.ehp.player).toEqual(null);
  });
});
