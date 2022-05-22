import { MAX_SKILL_EXP, SKILL_EXP_AT_99 } from '@wise-old-man/utils';
import supertest from 'supertest';
import prisma, { BossEnum, Skills } from '../../src/prisma';
import apiServer from '../../src/api';
import { ALGORITHMS, buildAlgorithmCache } from '../../src/api/modules/efficiency/efficiency.utils';
import * as efficiencyServices from '../../src/api/modules/efficiency/efficiency.services';
import mainTestSkillingMetas from '../data/efficiency/configs/ehp/main-test.ehp';
import mainTestBossingMetas from '../data/efficiency/configs/ehb/main-test.ehb';
import ironmanTestSkillingMetas from '../data/efficiency/configs/ehp/ironman-test.ehp';
import ironmanTestBossingMetas from '../data/efficiency/configs/ehb/ironman-test.ehb';
import lvl3TestSkillingMetas from '../data/efficiency/configs/ehp/lvl3-test.ehp';
import lvl3TestBossingMetas from '../data/efficiency/configs/ehb/lvl3-test.ehb';
import f2pTestSkillingMetas from '../data/efficiency/configs/ehp/f2p-test.ehp';
import f2pTestBossingMetas from '../data/efficiency/configs/ehb/f2p-test.ehb';
import { resetDatabase, resetRedis } from '../utils';

const api = supertest(apiServer);

beforeAll(async done => {
  await resetDatabase();
  await resetRedis();

  // Override the cache algorithms with these test rate configs, for consistent testing
  Object.assign(ALGORITHMS, {
    main: buildAlgorithmCache(mainTestSkillingMetas, mainTestBossingMetas),
    ironman: buildAlgorithmCache(ironmanTestSkillingMetas, ironmanTestBossingMetas),
    f2p: buildAlgorithmCache(f2pTestSkillingMetas, f2pTestBossingMetas),
    lvl3: buildAlgorithmCache(lvl3TestSkillingMetas, lvl3TestBossingMetas)
  });

  // Create 100 players, with staggered registration dates, and make sure some of them
  // are tied on EHP, and some players are ironman (to test the ranking calcs)
  await Promise.all(
    Array.from(Array(100).keys()).map(async i => {
      await prisma.player.create({
        data: {
          username: `player ${i + 1}`,
          displayName: `player ${i + 1}`,
          type: i >= 80 && i < 90 ? 'ironman' : 'regular',
          registeredAt: new Date(Date.now() + i * 10_000),
          ehp: i < 10 ? 1000 : 1000 - i,
          ehb: i
        }
      });
    })
  );

  // Add one HCIM lvl3 for later filtering checks
  await prisma.player.create({
    data: {
      username: `player hcim`,
      displayName: `player hcim`,
      type: 'hardcore',
      build: 'lvl3',
      ehp: 2
    }
  });

  // Add one Ultimate lvl3 for later filtering checks
  await prisma.player.create({
    data: {
      username: `player ult`,
      displayName: `player ult`,
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

  done();
});

describe('Efficiency API', () => {
  describe('1 - Maximum TTM and TT200m', () => {
    test('Check maximum TTM', () => {
      expect(ALGORITHMS.main.maxedEHP).toBeCloseTo(1009.3534010368603, 4);
      expect(ALGORITHMS.ironman.maxedEHP).toBeCloseTo(1762.2395881043994, 4);
      expect(ALGORITHMS.lvl3.maxedEHP).toBeCloseTo(882.1445120689223, 4);
      expect(ALGORITHMS.f2p.maxedEHP).toBeCloseTo(1843.5639973947145, 4);
    });

    test('Check maximum TT200m', () => {
      expect(ALGORITHMS.main.maximumEHP).toBeCloseTo(13524.420219560474, 4);
      expect(ALGORITHMS.ironman.maximumEHP).toBeCloseTo(22452.8113112858, 4);
      expect(ALGORITHMS.lvl3.maximumEHP).toBeCloseTo(11767.772868272423);
      expect(ALGORITHMS.f2p.maximumEHP).toBeCloseTo(25061.345909596945, 4);
    });
  });

  describe('2 - Player EHP calcs', () => {
    test('Maximum EHP calcs (main)', () => {
      const maximumStats = Object.fromEntries(Skills.map(s => [s, MAX_SKILL_EXP]));

      expect(ALGORITHMS.main.calculateEHP(maximumStats)).toBeCloseTo(ALGORITHMS.main.maximumEHP, 4);
      expect(ALGORITHMS.main.calculateTT200m(maximumStats)).toBeCloseTo(0, 4);

      const adjustedStats = {
        ...maximumStats,
        farming: maximumStats['farming'] - 1_900_000, // 1 hour of farming
        mining: maximumStats['mining'] - 125_000, // 1 hour of mining
        smithing: maximumStats['smithing'] - 10_000 // 0 hours of smithing (bonus exp from mining)
      };

      expect(ALGORITHMS.main.calculateEHP(adjustedStats)).toBeCloseTo(ALGORITHMS.main.maximumEHP - 2, 4);
      expect(ALGORITHMS.main.calculateTT200m(adjustedStats)).toBeCloseTo(2, 4);
    });

    test('Maximum EHP calcs (f2p)', () => {
      const maximumStats = Object.fromEntries(Skills.map(s => [s, MAX_SKILL_EXP]));

      expect(ALGORITHMS.f2p.calculateEHP(maximumStats)).toBeCloseTo(ALGORITHMS.f2p.maximumEHP, 4);
      expect(ALGORITHMS.f2p.calculateTT200m(maximumStats)).toBeCloseTo(0, 4);

      const adjustedStats = {
        ...maximumStats,
        // 1 hour of woodcutting
        woodcutting: maximumStats['woodcutting'] - 90_000,
        // for mains, ironmen and lvl3s, this would be bonus xp (20%) from woodcutting
        // but there's no infernal axe in f2p so this will need to be trained manually
        // which at the rate of 293_625 fm exp per hour, would take an extra 0.0613 hours (3min40s)
        firemaking: maximumStats['firemaking'] - 18_000,
        // bonus exp from firemaking (12.5%)
        prayer: maximumStats['prayer'] - 2250
      };

      expect(ALGORITHMS.f2p.calculateEHP(adjustedStats)).toBeCloseTo(ALGORITHMS.f2p.maximumEHP - 1.0613, 4);
      expect(ALGORITHMS.f2p.calculateTT200m(adjustedStats)).toBeCloseTo(1.0613, 4);
    });

    test('Maxed EHP calcs', () => {
      const maxedStats = Object.fromEntries(Skills.map(s => [s, SKILL_EXP_AT_99]));

      expect(ALGORITHMS.main.calculateEHP(maxedStats)).toBeCloseTo(ALGORITHMS.main.maxedEHP, 4);
      expect(ALGORITHMS.main.calculateTTM(maxedStats)).toBeCloseTo(0, 4);

      const adjustedStats = {
        ...maxedStats,
        farming: maxedStats['farming'] - 1_900_000, // 1 hour of farming
        prayer: maxedStats['prayer'] - 1_800_000 // 1 hour of prayer
      };

      expect(ALGORITHMS.main.calculateEHP(adjustedStats)).toBeCloseTo(ALGORITHMS.main.maxedEHP - 2, 4);
      expect(ALGORITHMS.main.calculateTTM(adjustedStats)).toBeCloseTo(2, 4);
    });

    test('Skill EHP calcs', () => {
      const maximumStats = Object.fromEntries(Skills.map(s => [s, MAX_SKILL_EXP]));

      expect(
        ALGORITHMS.main.calculateSkillEHP('woodcutting', { ...maximumStats, woodcutting: 0 })
      ).toBeCloseTo(0, 4);

      // Woodcutting WITH bonuses (infernal axe 20%), would have taken 1008.99494 hours
      // and would have gotten us an extra 39.939m firemaking exp, saving us 79.0882 hours of fm
      // however this bonus firemaking exp won't include the cooking bonus exp (firebwan 70%)
      // so we'd have to manually train another 27.95m cooking exp, adding an extra 29,42913 hours of cooking

      expect(
        ALGORITHMS.main.calculateSkillEHP('woodcutting', {
          ...maximumStats,
          firemaking: 0,
          cooking: 0
        })
      ).toBeCloseTo(1008.9949484021762 - 79.0882027723 + 29.4291365053, 4);

      // But if the player already has Firemaking and Cooking at 200m, that means
      // they manually trained those skills and the WC bonus exp will be wasted efficiency
      // and won't shave off any time from their total EHP, so Woodcutting will contribute
      // the full 1008 hours to the player's EHP

      expect(ALGORITHMS.main.calculateSkillEHP('woodcutting', maximumStats)).toBeCloseTo(1008.994948, 4);

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

      // As said above, usually through Woodcutting, we save firemaking 79.0882 hours from bonuses,
      // meaning firemaking to 200m WITH Woodcutting would take 320.16709 hours.

      expect(
        ALGORITHMS.main.calculateSkillEHP('firemaking', { ...maximumStats, woodcutting: 0 })
      ).toBeCloseTo(320.16709, 4);

      // In addition, training it manually to 200m (WITHOUT Woodcutting) would have also gotten
      // us 139,929,066 bonus Cooking exp from firebwans, which would have saved us
      // 147,2937536842 hours of 1t karambwans

      expect(
        ALGORITHMS.main.calculateSkillEHP('firemaking', {
          ...maximumStats,
          cooking: 0
        })
      ).toBeCloseTo(399.25525 - 147.29375, 4);
    });
  });

  describe('3 - Player EHB calcs', () => {
    test('EHB calcs (main)', () => {
      const killcountMap = {
        barrows_chests: 100, // no rate, 0 EHB
        cerberus: 100, // 61 per hour, 1.63934 EHB
        corporeal_beast: 100, // 50 per hour, 2 EHB
        nex: 100, // 12 per hour, 8.33333 EHB
        tzkal_zuk: 100, // 0.8 per hour, 125 EHB
        wintertodt: 100, // no rate, 0 EHB
        zulrah: 100 // 35 per hour, 2.85714 EHB
      };

      expect(ALGORITHMS.main.calculateEHB(killcountMap)).toBeCloseTo(139.82981, 4);

      const ehbSum = Object.keys(killcountMap)
        .map(b => ALGORITHMS.main.calculateBossEHB(b as BossEnum, killcountMap))
        .reduce((acc, curr) => acc + curr);

      // The sum of every boss' individual EHB value should be the same as the player's total EHB
      expect(ALGORITHMS.main.calculateEHB(killcountMap)).toBe(ehbSum);
    });

    test('EHB calcs (ironman)', () => {
      const killcountMap = {
        barrows_chests: 100, // 18 per hour, 5.55555 EHB
        cerberus: 100, // 54 per hour, 1.85185 EHB
        corporeal_beast: 100, // 6.5 per hour, 15.38461 EHB
        nex: 100, // 12 per hour, 8.33333 EHB
        tzkal_zuk: 100, // 0.8 per hour, 125 EHB
        wintertodt: 100, // no rate, 0 EHB
        zulrah: 100 // 32 per hour, 3.125 EHB
      };

      expect(ALGORITHMS.ironman.calculateEHB(killcountMap)).toBeCloseTo(159.25034, 4);

      const ehbSum = Object.keys(killcountMap)
        .map(b => ALGORITHMS.ironman.calculateBossEHB(b as BossEnum, killcountMap))
        .reduce((acc, curr) => acc + curr);

      // The sum of every boss' individual EHB value should be the same as the player's total EHB
      expect(ALGORITHMS.ironman.calculateEHB(killcountMap)).toBe(ehbSum);
    });
  });

  describe('4 - List Rates', () => {
    it('should not list (invalid type)', async () => {
      const response = await api.get(`/api/efficiency/rates`).query({ type: 'zerker' });
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Incorrect type: zerker. Must be one of [main, ironman, lvl3, f2p]');
    });

    it('should list (invalid metric, default to EHP)', async () => {
      const response = await api.get(`/api/efficiency/rates`).query({ type: 'main', metric: 'something' });
      expect(response.status).toBe(200);
      expect(response.body[0]).toMatchObject({ skill: 'attack' }); // returning skilling metas
    });

    it('should list (EHP)', async () => {
      const response = await api.get(`/api/efficiency/rates`).query({ type: 'main', metric: 'ehp' });
      expect(response.status).toBe(200);
      expect(response.body[0]).toMatchObject({ skill: 'attack' }); // returning skilling metas
    });

    it('should list (EHB)', async () => {
      const response = await api.get(`/api/efficiency/rates`).query({ type: 'main', metric: 'ehb' });
      expect(response.status).toBe(200);
      expect(response.body[0]).toMatchObject({ boss: 'abyssal_sire' }); // returning bossing metas
    });
  });

  describe('5 - Calculate EHP/EHB rankings', () => {
    it('should compute > top 50 rank', async () => {
      const top60Player = await prisma.player.findUnique({ where: { username: 'player 60' } });

      const result = await efficiencyServices.computeEfficiencyRank({
        player: top60Player,
        value: top60Player.ehp,
        metric: 'ehp'
      });

      expect(result).toBe(60);
    });

    it('should compute < top 50 rank', async () => {
      const top7Player = await prisma.player.findUnique({ where: { username: 'player 7' } });

      const result = await efficiencyServices.computeEfficiencyRank({
        player: top7Player,
        value: top7Player.ehp,
        metric: 'ehp'
      });

      expect(result).toBe(7);
    });

    it('should compute > top 50 rank (ironman)', async () => {
      const top85Player = await prisma.player.findUnique({ where: { username: 'player 85' } });

      const result = await efficiencyServices.computeEfficiencyRank({
        player: top85Player,
        value: top85Player.ehp,
        metric: 'ehp'
      });

      expect(result).toBe(5); // this player has the 85th highest ehp, but the 5th highest for ironman
    });
  });

  describe('6 - Fetch Efficiency Leaderboards', () => {
    it('should not fetch leaderboards (invalid metric)', async () => {
      const response = await api.get(`/api/efficiency/leaderboard`).query({ metric: 'abc' });
      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid enum value for 'metric'. Expected ehp | ehb | ehp+ehb");
    });

    it('should not fetch leaderboards (invalid player type)', async () => {
      const response = await api.get(`/api/efficiency/leaderboard`).query({ metric: 'ehp', playerType: 'a' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid enum value for 'playerType'.");
    });

    it('should not fetch leaderboards (invalid player build)', async () => {
      const response = await api
        .get(`/api/efficiency/leaderboard`)
        .query({ metric: 'ehp', playerBuild: 'a' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid enum value for 'playerBuild'.");
    });

    it('should not fetch leaderboards (invalid player country)', async () => {
      const response = await api.get(`/api/efficiency/leaderboard`).query({ metric: 'ehp', country: 'a' });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Invalid enum value for 'country'.");
    });

    it('should fetch EHP leaderboards (no player filters)', async () => {
      const response = await api.get(`/api/efficiency/leaderboard`).query({ metric: 'ehp' });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(20);

      expect(response.body[0]).toMatchObject({
        username: 'player 1',
        type: 'regular',
        ehp: 1000
      });

      // Should only contain "regular" players
      expect([...new Set(response.body.map(r => r.type))].length).toBe(1);

      // Ensure the list is sorted by "ehp" descending
      for (let i = 0; i < response.body.length; i++) {
        if (i === 0) continue;
        expect(response.body[i].ehp <= response.body[i - 1].ehp).toBe(true);
      }
    });

    it('should fetch EHP leaderboards (with player type filter)', async () => {
      const response = await api
        .get(`/api/efficiency/leaderboard`)
        .query({ metric: 'ehp', playerType: 'ironman' });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(12);

      const includedPlayerTypes = [...new Set(response.body.map(r => r.type))];

      // Hardcores and Ultimates should be included in the leaderboards for "ironman"
      expect(includedPlayerTypes.length).toBe(3);
      expect(includedPlayerTypes.includes('ironman')).toBe(true);
      expect(includedPlayerTypes.includes('hardcore')).toBe(true);
      expect(includedPlayerTypes.includes('ultimate')).toBe(true);

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
        .get(`/api/efficiency/leaderboard`)
        .query({ metric: 'ehb', playerType: 'hardcore', playerBuild: 'lvl3' });

      expect(firstResponse.status).toBe(200);
      expect(firstResponse.body.length).toBe(1);

      expect(firstResponse.body[0]).toMatchObject({
        username: 'player hcim',
        type: 'hardcore',
        build: 'lvl3'
      });

      const secondResponse = await api
        .get(`/api/efficiency/leaderboard`)
        .query({ metric: 'ehb', playerType: 'hardcore', playerBuild: 'f2p' });

      expect(secondResponse.status).toBe(200);
      expect(secondResponse.body.length).toBe(0);
    });

    it('should fetch EHB leaderboards (with player country filter)', async () => {
      const response = await api.get(`/api/efficiency/leaderboard`).query({ metric: 'ehb', country: 'PT' });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);

      expect(response.body[0].username).toBe('player PT');
    });

    it('should fetch EHP+EHB leaderboards', async () => {
      const response = await api
        .get(`/api/efficiency/leaderboard`)
        .query({ metric: 'ehp+ehb', playerType: 'ironman', playerBuild: 'lvl3' });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);

      // Should contain "ultimate" and "hardcore" players
      expect([...new Set(response.body.map(r => r.type))].length).toBe(2);

      expect(response.body[0]).toMatchObject({
        username: 'player hcim',
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

    it('should not fetch EHP leaderboards (negative offset)', async () => {
      const response = await api.get(`/api/efficiency/leaderboard`).query({ metric: 'ehp', offset: -5 });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'offset' must be >= 0.");
    });

    it('should not fetch EHP leaderboards (negative limit)', async () => {
      const response = await api.get(`/api/efficiency/leaderboard`).query({ metric: 'ehp', limit: -5 });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'limit' must be > 0.");
    });

    it('should not fetch EHB leaderboards (limit > 50)', async () => {
      const response = await api.get(`/api/efficiency/leaderboard`).query({ metric: 'ehb', limit: 1000 });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('The maximum results limit is 50');
    });

    it('should fetch EHB leaderboards (with limit and offset)', async () => {
      const response = await api
        .get(`/api/efficiency/leaderboard`)
        .query({ metric: 'ehb', limit: 5, offset: 3 });

      expect(response.body[0]).toMatchObject({
        username: 'player 97',
        type: 'regular',
        ehb: 96
      });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(5);
    });
  });
});
