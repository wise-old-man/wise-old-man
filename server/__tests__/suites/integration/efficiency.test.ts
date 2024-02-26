import supertest from 'supertest';
import prisma from '../../../src/prisma';
import {
  Boss,
  SKILLS,
  MAX_SKILL_EXP,
  SKILL_EXP_AT_99,
  EfficiencyAlgorithmType,
  PlayerType,
  PlayerBuild
} from '../../../src/utils';
import apiServer from '../../../src/api';
import { ALGORITHMS, getAlgorithm } from '../../../src/api/modules/efficiency/efficiency.utils';
import testSkillingMetas from '../../data/efficiency/configs/test.ehp';
import testBossingMetas from '../../data/efficiency/configs/test.ehb';
import { resetDatabase, resetRedis, sleep } from '../../utils';
import EfficiencyAlgorithm from '../../../src/api/modules/efficiency/EfficiencyAlgorithm';
import { computeEfficiencyRank } from '../../../src/api/modules/efficiency/services/ComputeEfficiencyRankService';

const api = supertest(apiServer.express);

beforeAll(async () => {
  await resetDatabase();
  await resetRedis();

  // Override the cache algorithms for "main" with these test rate configs, so that these tests
  // don't break when rates are updated in the future, consistent configs = consistent tests
  ALGORITHMS.set(
    EfficiencyAlgorithmType.MAIN,
    new EfficiencyAlgorithm(EfficiencyAlgorithmType.MAIN, testSkillingMetas, testBossingMetas)
  );

  // Create 100 players, with increasing overall ranks, and make sure some of them
  // are tied on EHP, and some players are ironman (to test the ranking calcs)
  // These overall ranks will be the tie breakers for maximum EHP players
  const indices = Array.from(Array(100).keys());

  for (const i of indices) {
    const player = await prisma.player.create({
      data: {
        username: `player ${i + 1}`,
        displayName: `player ${i + 1}`,
        type: i >= 80 && i < 90 ? 'ironman' : 'regular',
        ehp: i < 10 ? 1000 : 1000 - i,
        ehb: i
      }
    });

    const snapshot = await prisma.snapshot.create({
      data: {
        playerId: player.id,
        overallRank: i + 1
      }
    });

    await prisma.player.update({
      where: { id: player.id },
      data: { latestSnapshotId: snapshot.id }
    });
  }

  // Add one HCIM for later filtering checks
  await prisma.player.create({
    data: {
      username: `player hcim`,
      displayName: `player hcim`,
      type: 'hardcore',
      build: 'main',
      ehp: 2
    }
  });

  // Add one HCIM lvl3 for later filtering checks
  await prisma.player.create({
    data: {
      username: `player hcim2`,
      displayName: `player hcim2`,
      type: 'hardcore',
      build: 'lvl3',
      ehp: 2
    }
  });

  // Add one Ultimate for later filtering checks
  await prisma.player.create({
    data: {
      username: `player ult`,
      displayName: `player ult`,
      type: 'ultimate',
      build: 'main'
    }
  });

  // Add one Ultimate lvl3 for later filtering checks
  await prisma.player.create({
    data: {
      username: `player ult2`,
      displayName: `player ult2`,
      type: 'ultimate',
      build: 'lvl3'
    }
  });

  // Add one HCIM lvl3 for later filtering checks
  await prisma.player.create({
    data: {
      username: `player PT`,
      displayName: `player PT`,
      type: 'regular',
      country: 'PT'
    }
  });

  // Add one archived player for later filtering checks
  await prisma.player.create({
    data: {
      username: `archived acc`,
      displayName: `archived acc`,
      type: 'regular',
      ehp: 1000,
      status: 'archived'
    }
  });
});

afterAll(async () => {
  jest.useRealTimers();

  // Sleep for 5s to allow the server to shut down gracefully
  await apiServer.shutdown().then(() => sleep(5000));
}, 10_000);

describe('Efficiency API', () => {
  describe('1 - Maximum TTM and TT200m', () => {
    test('Check maximum TTM and TT200m', () => {
      const maxedStats = new Map(SKILLS.map(s => [s, SKILL_EXP_AT_99]));

      expect(
        ALGORITHMS.get(EfficiencyAlgorithmType.MAIN)!.calculateEHPMap(maxedStats).get('overall')
      ).toBeCloseTo(962.9246338539108, 4);

      const maximumStats = new Map(SKILLS.map(s => [s, MAX_SKILL_EXP]));
      expect(
        ALGORITHMS.get(EfficiencyAlgorithmType.MAIN)!.calculateEHPMap(maximumStats).get('overall')
      ).toBeCloseTo(12813.80829, 4);
    });
  });

  describe('2 - Player EHP calcs', () => {
    test('Maximum EHP calcs', () => {
      const maximumStats = new Map(SKILLS.map(s => [s, MAX_SKILL_EXP]));

      expect(ALGORITHMS.get(EfficiencyAlgorithmType.MAIN)!.calculateTT200mAll(maximumStats)).toBeCloseTo(
        0,
        4
      );

      const adjustedStats = new Map(SKILLS.map(s => [s, MAX_SKILL_EXP]));
      adjustedStats.set('farming', adjustedStats.get('farming')! - 1_900_000); // 1 hour of farming
      adjustedStats.set('mining', adjustedStats.get('mining')! - 125_000); // 1 hour of mining
      adjustedStats.set('smithing', adjustedStats.get('smithing')! - 10_000); // 0 hours of smithing (bonus exp from mining)

      expect(ALGORITHMS.get(EfficiencyAlgorithmType.MAIN)!.calculateEHP(adjustedStats)).toBeCloseTo(
        ALGORITHMS.get(EfficiencyAlgorithmType.MAIN)!.calculateEHPMap(maximumStats).get('overall')! - 2,
        4
      );
      expect(ALGORITHMS.get(EfficiencyAlgorithmType.MAIN)!.calculateTT200mAll(adjustedStats)).toBeCloseTo(
        2,
        4
      );
    });

    test('Maxed EHP calcs', () => {
      const maxedStats = new Map(SKILLS.map(s => [s, SKILL_EXP_AT_99]));
      expect(ALGORITHMS.get(EfficiencyAlgorithmType.MAIN)!.calculateTTM(maxedStats)).toBeCloseTo(0, 4);

      const adjustedStats = new Map(SKILLS.map(s => [s, SKILL_EXP_AT_99]));
      adjustedStats.set('farming', adjustedStats.get('farming')! - 1_900_000); // 1 hour of farming
      adjustedStats.set('prayer', adjustedStats.get('prayer')! - 1_800_000); // 1 hour of prayer

      expect(ALGORITHMS.get(EfficiencyAlgorithmType.MAIN)!.calculateEHP(adjustedStats)).toBeCloseTo(
        ALGORITHMS.get(EfficiencyAlgorithmType.MAIN)!.calculateEHPMap(maxedStats).get('overall')! - 2,
        4
      );
      expect(ALGORITHMS.get(EfficiencyAlgorithmType.MAIN)!.calculateTTM(adjustedStats)).toBeCloseTo(2, 4);
    });

    test('Skill EHP calcs', () => {
      const resetWoodcutting = new Map(SKILLS.map(s => [s, MAX_SKILL_EXP]));
      resetWoodcutting.set('woodcutting', 0);

      expect(
        ALGORITHMS.get(EfficiencyAlgorithmType.MAIN)!.calculateEHPMap(resetWoodcutting).get('woodcutting')
      ).toBeCloseTo(0, 4);

      // Woodcutting WITH bonuses (infernal axe 20%), would have taken 1008.99494 hours
      // and would have gotten us an extra 39.939m firemaking exp, saving us 79.0882 hours of fm
      // however this bonus firemaking exp won't include the cooking bonus exp (firebwan 70%)
      // so we'd have to manually train another 27.95m cooking exp, adding an extra 29,42913 hours of cooking

      const resetFmAndcook = new Map(SKILLS.map(s => [s, MAX_SKILL_EXP]));
      resetFmAndcook.set('firemaking', 0);
      resetFmAndcook.set('cooking', 0);

      expect(
        ALGORITHMS.get(EfficiencyAlgorithmType.MAIN)!.calculateEHPMap(resetFmAndcook).get('woodcutting')
      ).toBeCloseTo(1008.9949484021762 - 79.0882027723 + 29.4291365053, 4);

      expect(
        ALGORITHMS.get(EfficiencyAlgorithmType.MAIN)!.calculateEHPMap(resetFmAndcook).get('firemaking')
      ).toBeCloseTo(0, 4);

      expect(
        ALGORITHMS.get(EfficiencyAlgorithmType.MAIN)!.calculateEHPMap(resetFmAndcook).get('cooking')
      ).toBeCloseTo(0, 4);

      // But if we already have Firemaking and Cooking at 200m, that means
      // we manually trained those skills and the WC bonus exp will be wasted efficiency
      // and won't shave off any time from the total EHP, so Woodcutting will contribute
      // the full 1008 hours to the player's EHP

      const maximumStats = new Map(SKILLS.map(s => [s, MAX_SKILL_EXP]));

      expect(
        ALGORITHMS.get(EfficiencyAlgorithmType.MAIN)!.calculateEHPMap(maximumStats).get('woodcutting')
      ).toBeCloseTo(1008.994948, 4);

      // Without woodcutting bonuses (infernal axe 20%), firemaking would have taken 399.25525 hours to 200m
      // lvl1 -> lvl15  = 2,411 exp, at 58,960 per hour = 0.04089 EHP
      // lvl15 -> lvl30 = 10,952 exp, at 88,440 per hour = 0.12383 EHP
      // lvl30 -> lvl35 = 9,043 exp, at 132,660 per hour = 0.06816 EHP
      // lvl35 -> lvl45 = 39,106 exp, at 154,770 per hour = 0.25267 EHP
      // lvl45 -> lvl50 = 39,821 exp, at 198,990 per hour = 0.20011 EHP
      // lvl50 -> lvl60 = 172,409 exp, at 232,155 per hour = 0.74264 EHP
      // lvl60 -> lvl75 = 936,679 exp, at 298,485 per hour = 3.13811 EHP
      // lvl75 -> lvl90 = 4,135,911 exp, at 447,801 per hour = 9.23604 EHP
      // lvl90 -> 200m  = 194,653,668 exp, at 505,000 per hour = 385.45280 EHP

      expect(
        ALGORITHMS.get(EfficiencyAlgorithmType.MAIN)!.calculateEHPMap(resetWoodcutting).get('firemaking')
      ).toBeCloseTo(320.16709036, 4);

      // In addition, training firemaking manually to 200m (WITHOUT Woodcutting) would have also gotten
      // us 139,929,066 bonus Cooking exp from firebwans, which would have saved us
      // 147,2937536842 hours of 1t karambwans

      const resetCooking = new Map(SKILLS.map(s => [s, MAX_SKILL_EXP]));
      resetCooking.set('cooking', 0);

      expect(
        ALGORITHMS.get(EfficiencyAlgorithmType.MAIN)!.calculateEHPMap(resetCooking).get('firemaking')
      ).toBeCloseTo(320.16709036 - 147.29375, 4);

      // Make sure unranked skills return 0 EHP (and definitely not negative numbers)
      const unrankedStats = new Map(SKILLS.map(s => [s, -1]));

      expect(ALGORITHMS.get(EfficiencyAlgorithmType.MAIN)!.calculateEHP(unrankedStats)).toBe(0);
      expect(ALGORITHMS.get(EfficiencyAlgorithmType.MAIN)!.calculateEHPMap(unrankedStats).get('prayer')).toBe(
        0
      );
    });
  });

  describe('3 - Player EHB calcs', () => {
    test('EHB calcs', () => {
      const killcountMap = new Map([
        [Boss.BARROWS_CHESTS, 100], // no rate, 0 EHB
        [Boss.CERBERUS, 100], // 61 per hour, 1.63934 EHB
        [Boss.CORPOREAL_BEAST, 100], // 50 per hour, 2 EHB
        [Boss.NEX, 100], // 12 per hour, 8.33333 EHB
        [Boss.TZKAL_ZUK, 100], // 0.8 per hour, 125 EHB
        [Boss.WINTERTODT, 100], // no rate, 0 EHB
        [Boss.ZULRAH, 100] // 35 per hour, 2.85714 EHB
      ]);

      expect(ALGORITHMS.get(EfficiencyAlgorithmType.MAIN)!.calculateEHB(killcountMap)).toBeCloseTo(
        139.82981,
        4
      );

      const ehbSum = Array.from(killcountMap.keys())
        .map(b => ALGORITHMS.get(EfficiencyAlgorithmType.MAIN)!.calculateEHBMap(killcountMap).get(b)!)
        .reduce((acc, curr) => acc + curr);

      // The sum of every boss' individual EHB value should be the same as the player's total EHB
      expect(ALGORITHMS.get(EfficiencyAlgorithmType.MAIN)!.calculateEHB(killcountMap)).toBe(ehbSum);

      const unrankedKillcountMap = new Map([
        [Boss.CERBERUS, -1],
        [Boss.CORPOREAL_BEAST, -1],
        [Boss.NEX, -1],
        [Boss.TZKAL_ZUK, -1]
      ]);

      // Make sure unranked skills return 0 EHB (and definitely not negative numbers)
      expect(ALGORITHMS.get(EfficiencyAlgorithmType.MAIN)!.calculateEHB(unrankedKillcountMap)).toBe(0);
      expect(
        ALGORITHMS.get(EfficiencyAlgorithmType.MAIN)!.calculateEHBMap(unrankedKillcountMap).get('cerberus')
      ).toBe(0);
    });
  });

  describe('4 - List Rates', () => {
    it('should not list (invalid type)', async () => {
      const response = await api.get(`/efficiency/rates`).query({ type: 'zerker' });
      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid enum value for 'type'.");
    });

    it('should not list (invalid metric)', async () => {
      const response = await api.get(`/efficiency/rates`).query({ type: 'main', metric: 'something' });
      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid enum value for 'metric'. Expected ehp | ehb");
    });

    it('should list (EHP)', async () => {
      const response = await api.get(`/efficiency/rates`).query({ type: 'main', metric: 'ehp' });
      expect(response.status).toBe(200);
      expect(response.body[0]).toMatchObject({ skill: 'attack' }); // returning skilling metas
    });

    it('should list (EHB)', async () => {
      const response = await api.get(`/efficiency/rates`).query({ type: 'main', metric: 'ehb' });
      expect(response.status).toBe(200);
      expect(response.body[0]).toMatchObject({ boss: 'abyssal_sire' }); // returning bossing metas
    });
  });

  describe('5 - Calculate EHP/EHB rankings', () => {
    it('should compute > top 50 rank', async () => {
      const top60Player = (await prisma.player.findUnique({ where: { username: 'player 60' } }))!;
      const result = await computeEfficiencyRank(top60Player, 'ehp', top60Player.ehp);

      expect(result).toBe(61);
    });

    it('should compute < top 50 rank', async () => {
      const top7Player = (await prisma.player.findUnique({ where: { username: 'player 7' } }))!;
      const result = await computeEfficiencyRank(top7Player, 'ehp', top7Player.ehp);

      expect(result).toBe(7);
    });

    it('should compute > top 50 rank (ironman)', async () => {
      const top85Player = (await prisma.player.findUnique({ where: { username: 'player 85' } }))!;
      const result = await computeEfficiencyRank(top85Player, 'ehp', top85Player.ehp);

      expect(result).toBe(5); // this player has the 85th highest ehp, but the 5th highest for ironman
    });
  });

  describe('6 - Fetch Efficiency Leaderboards', () => {
    it('should not fetch leaderboards (invalid metric)', async () => {
      const response = await api.get(`/efficiency/leaderboard`).query({ metric: 'abc' });
      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid enum value for 'metric'. Expected ehp | ehb | ehp+ehb");
    });

    it('should not fetch leaderboards (invalid player type)', async () => {
      const response = await api.get(`/efficiency/leaderboard`).query({ metric: 'ehp', playerType: 'a' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid enum value for 'playerType'.");
    });

    it('should not fetch leaderboards (invalid player build)', async () => {
      const response = await api.get(`/efficiency/leaderboard`).query({ metric: 'ehp', playerBuild: 'a' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid enum value for 'playerBuild'.");
    });

    it('should not fetch leaderboards (invalid player country)', async () => {
      const response = await api.get(`/efficiency/leaderboard`).query({ metric: 'ehp', country: 'a' });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Invalid enum value for 'country'.");
    });

    it('should fetch EHP leaderboards (no player filters)', async () => {
      const response = await api.get(`/efficiency/leaderboard`).query({ metric: 'ehp' });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(20);

      expect(response.body[0]).toMatchObject({
        username: 'player 1',
        type: 'regular',
        ehp: 1000
      });

      // Should only contain "regular" type players (it's the default)
      expect([...new Set(response.body.map(r => r.type))].length).toBe(1);

      // Should only contain "main" build players (it's the default)
      expect([...new Set(response.body.map(r => r.build))].length).toBe(1);

      // Ensure the list is sorted by "ehp" descending
      for (let i = 0; i < response.body.length; i++) {
        if (i === 0) continue;
        expect(response.body[i].ehp <= response.body[i - 1].ehp).toBe(true);
      }
    });

    it('should fetch EHP leaderboards (with no archived players)', async () => {
      const response = await api.get(`/efficiency/leaderboard`).query({ metric: 'ehp' });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(20);

      expect(response.body[0]).toMatchObject({
        username: 'player 1',
        type: 'regular',
        ehp: 1000
      });

      // Ensure the list does not contain archived players
      for (let i = 0; i < response.body.length; i++) {
        if (i === 0) continue;
        expect(response.body[i].status).not.toBe('archived');
      }
    });

    it('should fetch EHP leaderboards (with player type filter)', async () => {
      const response = await api
        .get(`/efficiency/leaderboard`)
        .query({ metric: 'ehp', playerType: 'ironman' });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(12);

      const includedPlayerTypes = [...new Set(response.body.map(r => r.type))];
      const includedPlayerBuilds = [...new Set(response.body.map(r => r.build))];

      // Hardcores and Ultimates should be included in the leaderboards for "ironman"
      expect(includedPlayerTypes.length).toBe(3);
      expect(includedPlayerTypes.includes('ironman')).toBe(true);
      expect(includedPlayerTypes.includes('hardcore')).toBe(true);
      expect(includedPlayerTypes.includes('ultimate')).toBe(true);

      // Should only have the "main" player build
      expect(includedPlayerBuilds.length).toBe(1);
      expect(includedPlayerBuilds.includes('main')).toBe(true);

      // The ironmen were inserted on indices 80-90
      for (let i = 0; i < 10; i++) {
        expect(response.body[i]).toMatchObject({
          username: `player ${i + 81}`,
          ehp: 920 - i
        });
      }

      // Ensure the list is sorted by "ehp" descending
      for (let i = 0; i < response.body.length; i++) {
        if (i === 0) continue;
        expect(response.body[i].ehp <= response.body[i - 1].ehp).toBe(true);
      }

      expect(response.body[10]).toMatchObject({ username: 'player hcim', ehp: 2 });
    });

    it('should fetch EHB leaderboards (with player type + player build filters)', async () => {
      const firstResponse = await api
        .get(`/efficiency/leaderboard`)
        .query({ metric: 'ehb', playerType: 'hardcore', playerBuild: 'lvl3' });

      expect(firstResponse.status).toBe(200);
      expect(firstResponse.body.length).toBe(1);

      expect(firstResponse.body[0]).toMatchObject({
        username: 'player hcim2',
        type: 'hardcore',
        build: 'lvl3'
      });

      const secondResponse = await api
        .get(`/efficiency/leaderboard`)
        .query({ metric: 'ehb', playerType: 'hardcore', playerBuild: 'f2p' });

      expect(secondResponse.status).toBe(200);
      expect(secondResponse.body.length).toBe(0);
    });

    it('should fetch EHB leaderboards (with player country filter)', async () => {
      const response = await api.get(`/efficiency/leaderboard`).query({ metric: 'ehb', country: 'PT' });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);

      expect(response.body[0].username).toBe('player PT');
    });

    it('should fetch EHP+EHB leaderboards', async () => {
      const response = await api
        .get(`/efficiency/leaderboard`)
        .query({ metric: 'ehp+ehb', playerType: 'ironman', playerBuild: 'lvl3' });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);

      // Should contain "ultimate" and "hardcore" players
      expect([...new Set(response.body.map(r => r.type))].length).toBe(2);

      expect(response.body[0]).toMatchObject({
        username: 'player hcim2',
        type: 'hardcore',
        ehp: 2
      });

      // Ensure the list is sorted by "ehp+ehb" descending
      for (let i = 0; i < response.body.length; i++) {
        if (i === 0) continue;

        const cur = response.body[i];
        const prev = response.body[i - 1];

        expect(cur.ehp + cur.ehb <= prev.ehp + prev.ehb).toBe(true);
      }
    });

    it('should fetch EHP+EHB leaderboards (with no archived players)', async () => {
      const response = await api.get(`/efficiency/leaderboard`).query({ metric: 'ehp+ehb' });

      expect(response.status).toBe(200);

      // Ensure the list contains no archived players
      response.body.forEach(player => {
        expect(player.status).not.toBe('archived');
      });
    });

    it('should not fetch EHP leaderboards (negative offset)', async () => {
      const response = await api.get(`/efficiency/leaderboard`).query({ metric: 'ehp', offset: -5 });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'offset' must be >= 0.");
    });

    it('should not fetch EHP leaderboards (negative limit)', async () => {
      const response = await api.get(`/efficiency/leaderboard`).query({ metric: 'ehp', limit: -5 });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'limit' must be > 0.");
    });

    it('should not fetch EHB leaderboards (limit > 50)', async () => {
      const response = await api.get(`/efficiency/leaderboard`).query({ metric: 'ehb', limit: 1000 });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('The maximum results limit is 50');
    });

    it('should fetch EHB leaderboards (with limit and offset)', async () => {
      const response = await api.get(`/efficiency/leaderboard`).query({ metric: 'ehb', limit: 5, offset: 3 });

      expect(response.body[0]).toMatchObject({
        username: 'player 97',
        type: 'regular',
        ehb: 96
      });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(5);
    });
  });

  describe('7 - Assign Efficiency Algorithm', () => {
    it("should assign the correct rates for type='regular' players", () => {
      expect(getAlgorithm({ type: PlayerType.REGULAR, build: PlayerBuild.MAIN }).type).toBe(
        EfficiencyAlgorithmType.MAIN
      );

      expect(getAlgorithm({ type: PlayerType.REGULAR, build: PlayerBuild.F2P }).type).toBe(
        EfficiencyAlgorithmType.F2P
      );

      expect(getAlgorithm({ type: PlayerType.REGULAR, build: PlayerBuild.F2P_LVL3 }).type).toBe(
        EfficiencyAlgorithmType.F2P_LVL3
      );

      expect(getAlgorithm({ type: PlayerType.REGULAR, build: PlayerBuild.LVL3 }).type).toBe(
        EfficiencyAlgorithmType.LVL3
      );

      expect(getAlgorithm({ type: PlayerType.REGULAR, build: PlayerBuild.ZERKER }).type).toBe(
        EfficiencyAlgorithmType.MAIN
      );

      expect(getAlgorithm({ type: PlayerType.REGULAR, build: PlayerBuild.DEF1 }).type).toBe(
        EfficiencyAlgorithmType.MAIN
      );

      expect(getAlgorithm({ type: PlayerType.REGULAR, build: PlayerBuild.HP10 }).type).toBe(
        EfficiencyAlgorithmType.MAIN
      );
    });

    it("should assign the correct rates for type='ironman' players", () => {
      expect(getAlgorithm({ type: PlayerType.IRONMAN, build: PlayerBuild.MAIN }).type).toBe(
        EfficiencyAlgorithmType.IRONMAN
      );

      expect(getAlgorithm({ type: PlayerType.IRONMAN, build: PlayerBuild.F2P }).type).toBe(
        EfficiencyAlgorithmType.F2P_IRONMAN
      );

      expect(getAlgorithm({ type: PlayerType.IRONMAN, build: PlayerBuild.F2P_LVL3 }).type).toBe(
        EfficiencyAlgorithmType.F2P_LVL3_IRONMAN
      );

      expect(getAlgorithm({ type: PlayerType.IRONMAN, build: PlayerBuild.LVL3 }).type).toBe(
        EfficiencyAlgorithmType.IRONMAN
      );

      expect(getAlgorithm({ type: PlayerType.IRONMAN, build: PlayerBuild.ZERKER }).type).toBe(
        EfficiencyAlgorithmType.IRONMAN
      );

      expect(getAlgorithm({ type: PlayerType.IRONMAN, build: PlayerBuild.DEF1 }).type).toBe(
        EfficiencyAlgorithmType.IRONMAN
      );

      expect(getAlgorithm({ type: PlayerType.IRONMAN, build: PlayerBuild.HP10 }).type).toBe(
        EfficiencyAlgorithmType.IRONMAN
      );
    });

    it("should assign the correct rates for type='hardcore' players", () => {
      expect(getAlgorithm({ type: PlayerType.IRONMAN, build: PlayerBuild.MAIN }).type).toBe(
        EfficiencyAlgorithmType.IRONMAN
      );

      expect(getAlgorithm({ type: PlayerType.IRONMAN, build: PlayerBuild.F2P }).type).toBe(
        EfficiencyAlgorithmType.F2P_IRONMAN
      );

      expect(getAlgorithm({ type: PlayerType.IRONMAN, build: PlayerBuild.F2P_LVL3 }).type).toBe(
        EfficiencyAlgorithmType.F2P_LVL3_IRONMAN
      );

      expect(getAlgorithm({ type: PlayerType.IRONMAN, build: PlayerBuild.LVL3 }).type).toBe(
        EfficiencyAlgorithmType.IRONMAN
      );

      expect(getAlgorithm({ type: PlayerType.IRONMAN, build: PlayerBuild.ZERKER }).type).toBe(
        EfficiencyAlgorithmType.IRONMAN
      );

      expect(getAlgorithm({ type: PlayerType.IRONMAN, build: PlayerBuild.DEF1 }).type).toBe(
        EfficiencyAlgorithmType.IRONMAN
      );

      expect(getAlgorithm({ type: PlayerType.IRONMAN, build: PlayerBuild.HP10 }).type).toBe(
        EfficiencyAlgorithmType.IRONMAN
      );
    });

    it("should assign the correct rates for type='ultimate' players", () => {
      expect(getAlgorithm({ type: PlayerType.ULTIMATE, build: PlayerBuild.MAIN }).type).toBe(
        EfficiencyAlgorithmType.ULTIMATE
      );

      expect(getAlgorithm({ type: PlayerType.ULTIMATE, build: PlayerBuild.F2P }).type).toBe(
        EfficiencyAlgorithmType.F2P_IRONMAN
      );

      expect(getAlgorithm({ type: PlayerType.ULTIMATE, build: PlayerBuild.F2P_LVL3 }).type).toBe(
        EfficiencyAlgorithmType.F2P_LVL3_IRONMAN
      );

      expect(getAlgorithm({ type: PlayerType.ULTIMATE, build: PlayerBuild.LVL3 }).type).toBe(
        EfficiencyAlgorithmType.ULTIMATE
      );

      expect(getAlgorithm({ type: PlayerType.ULTIMATE, build: PlayerBuild.ZERKER }).type).toBe(
        EfficiencyAlgorithmType.ULTIMATE
      );

      expect(getAlgorithm({ type: PlayerType.ULTIMATE, build: PlayerBuild.DEF1 }).type).toBe(
        EfficiencyAlgorithmType.ULTIMATE
      );

      expect(getAlgorithm({ type: PlayerType.ULTIMATE, build: PlayerBuild.HP10 }).type).toBe(
        EfficiencyAlgorithmType.ULTIMATE
      );
    });
  });
});
