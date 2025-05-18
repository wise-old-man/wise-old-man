import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {
  PlayerType,
  SKILLS,
  getMetricValueKey,
  getMetricRankKey,
  Metric,
  PeriodProps,
  Period
} from '../../../src/utils';
import * as utils from '../../../src/api/modules/snapshots/snapshot.utils';
import { resetDatabase, readFile, registerHiscoresMock, modifyRawHiscoresData } from '../../utils';
import { Snapshot } from '../../../src/api/modules/snapshots/snapshot.types';
import { findPlayerSnapshots } from '../../../src/api/modules/snapshots/services/FindPlayerSnapshotsService';
import { redisClient } from '../../../src/services/redis.service';
import { eventEmitter } from '../../../src/api/events';
import prisma from '../../../src/prisma';

const axiosMock = new MockAdapter(axios, { onNoMatch: 'passthrough' });

const HISCORES_FILE_PATH_P = `${__dirname}/../../data/hiscores/psikoi_hiscores.txt`;
const HISCORES_FILE_PATH_LT = `${__dirname}/../../data/hiscores/lynx_titan_hiscores.txt`;

const globalData = {
  hiscoresRawDataP: '',
  hiscoresRawDataLT: '',
  testPlayerId: -1,
  secondaryPlayerId: -1,
  testGroupId: -1,
  testGroupCode: '',
  snapshots: [] as Snapshot[]
};

beforeAll(async () => {
  eventEmitter.init();
  await resetDatabase();
  await redisClient.flushall();

  globalData.hiscoresRawDataP = await readFile(HISCORES_FILE_PATH_P);
  globalData.hiscoresRawDataLT = await readFile(HISCORES_FILE_PATH_LT);

  // Mock regular hiscores data, and block any ironman requests
  registerHiscoresMock(axiosMock, {
    [PlayerType.REGULAR]: { statusCode: 200, rawData: globalData.hiscoresRawDataP },
    [PlayerType.IRONMAN]: { statusCode: 404 }
  });
});

afterAll(() => {
  jest.useRealTimers();
  redisClient.quit();
});

describe('Snapshots API', () => {
  describe('1 - Creating from OSRS Hiscores', () => {
    it('should not create snapshot (hiscores change)', async () => {
      const [firstLine, ...rest] = globalData.hiscoresRawDataLT.split('\n');
      const rawDataMinusOneLine = rest.join('\n');
      const rawDataPlusOneLine = `${globalData.hiscoresRawDataLT}\n${firstLine}`;

      await expect(utils.parseHiscoresSnapshot(1, rawDataMinusOneLine)).rejects.toThrow(
        'The OSRS Hiscores were updated. Please wait for a fix.'
      );

      await expect(utils.parseHiscoresSnapshot(1, rawDataPlusOneLine)).rejects.toThrow(
        'The OSRS Hiscores were updated. Please wait for a fix.'
      );
    });

    it('should create snapshot (Lynx Titan)', async () => {
      const snapshot = await utils.parseHiscoresSnapshot(1, globalData.hiscoresRawDataLT);

      expect(snapshot.playerId).toBe(1);
      expect(snapshot.importedAt).toBeUndefined();

      SKILLS.forEach(skill => {
        if (skill === Metric.OVERALL) {
          expect(snapshot.overallRank).toBe(1);
          expect(snapshot.overallExperience).toBe((SKILLS.length - 1) * 200000000);
        } else {
          expect(snapshot[getMetricRankKey(skill)]).toBeLessThan(1000);
          expect(snapshot[getMetricValueKey(skill)]).toBe(200000000);
        }
      });

      expect(snapshot.clue_scrolls_allScore).toBe(22);
      expect(snapshot.zulrahKills).toBe(-1);
      expect(snapshot.kalphite_queenKills).toBe(-1);
      expect(snapshot.barrows_chestsKills).toBe(-1);
      expect(snapshot.commander_zilyanaKills).toBe(-1);
    });

    it('should create snapshot (Psikoi)', async () => {
      const snapshot = await utils.parseHiscoresSnapshot(1, globalData.hiscoresRawDataP);

      expect(snapshot.playerId).toBe(1);
      expect(snapshot.importedAt).toBeUndefined();

      SKILLS.forEach(skill => {
        if (skill === Metric.OVERALL) {
          expect(snapshot.overallRank).toBe(51181);
          expect(snapshot.overallExperience).toBe(300_192_115);
        } else {
          expect(snapshot[getMetricRankKey(skill)]).toBeLessThan(260_000);
          expect(snapshot[getMetricValueKey(skill)]).toBeGreaterThan(4_000_000);
        }
      });

      expect(snapshot.clue_scrolls_allScore).toBe(585);
      expect(snapshot.zulrahKills).toBe(1646);
      expect(snapshot.kalphite_queenKills).toBe(293);
      expect(snapshot.barrows_chestsKills).toBe(1773);
      expect(snapshot.commander_zilyanaKills).toBe(1350);

      // The legacy BH metrics are set to 100/200 score on the CSV
      // but we should be ignoring those when parsing the CSV, and instead
      // use the new BH metrics for the snapshot (which are both unranked at -1)
      expect(snapshot.bounty_hunter_rogueScore).toBe(-1);
      expect(snapshot.bounty_hunter_hunterScore).toBe(-1);

      // Now simulate gains in the new BH metrics
      const modifiedRawData = modifyRawHiscoresData(globalData.hiscoresRawDataP, [
        { metric: Metric.BOUNTY_HUNTER_HUNTER, value: 17 },
        { metric: Metric.BOUNTY_HUNTER_ROGUE, value: 45 }
      ]);

      const newSnapshot = await utils.parseHiscoresSnapshot(1, modifiedRawData);

      // Now these shouldn't be unranked
      expect(newSnapshot.bounty_hunter_rogueScore).toBe(45);
      expect(newSnapshot.bounty_hunter_hunterScore).toBe(17);

      const player = await prisma.player.create({
        data: {
          username: 'psikoi',
          displayName: 'Psikoi'
        }
      });

      globalData.testPlayerId = player.id;

      const snapshots = [
        {
          ...snapshot,
          playerId: player.id,
          createdAt: new Date(Date.now() - PeriodProps[Period.DAY].milliseconds * 5)
        },
        {
          ...snapshot,
          playerId: player.id,
          createdAt: new Date(Date.now() - PeriodProps[Period.DAY].milliseconds)
        },
        { ...newSnapshot, playerId: player.id }
      ];

      await prisma.snapshot.createMany({
        data: [
          {
            ...snapshot,
            playerId: player.id,
            createdAt: new Date(Date.now() - PeriodProps[Period.DAY].milliseconds * 5)
          },
          {
            ...snapshot,
            playerId: player.id,
            createdAt: new Date(Date.now() - PeriodProps[Period.DAY].milliseconds)
          },
          { ...newSnapshot, playerId: player.id }
        ]
      });

      globalData.snapshots = snapshots;
    });
  });

  describe('2 - Snapshot Utils', () => {
    it('should detect changes between snapshots', () => {
      // No changes between these
      expect(utils.hasChanged(globalData.snapshots[0], globalData.snapshots[0])).toBe(false);

      // Some changes between these
      expect(
        utils.hasChanged(globalData.snapshots[0], {
          ...globalData.snapshots[0],
          magicExperience: globalData.snapshots[0].magicExperience + 50
        })
      ).toBe(true);

      // EHP and EHB changed shouldn't count, as they can fluctuate without the player's envolvement

      expect(
        utils.hasChanged(globalData.snapshots[0], { ...globalData.snapshots[0], ehpValue: 1, ehbValue: 1 })
      ).toBe(false);
    });

    it('should detect negative gains between snapshots', () => {
      // No changes between these
      expect(utils.getNegativeGains(globalData.snapshots[0], globalData.snapshots[0])).toBeNull();

      // Positive changes between these
      expect(
        utils.getNegativeGains(globalData.snapshots[0], {
          ...globalData.snapshots[0],
          magicExperience: globalData.snapshots[0].magicExperience + 5000
        })
      ).toBeNull();

      // Negative last_man_standing gains
      expect(
        utils.getNegativeGains(
          { ...globalData.snapshots[0], last_man_standingScore: 1000 },
          { ...globalData.snapshots[0], last_man_standingScore: 700 }
        )
      ).toBeNull(); // LMS score can decrease, so it shouldn't count as negative gains

      // Negative pvp_arena gains
      expect(
        utils.getNegativeGains(
          { ...globalData.snapshots[0], pvp_arenaScore: 1000 },
          { ...globalData.snapshots[0], pvp_arenaScore: 700 }
        )
      ).toBeNull(); // PVP Arena score can decrease, so it shouldn't count as negative gains

      // Negative firemaking and magic gains
      expect(
        utils.getNegativeGains(globalData.snapshots[0], {
          ...globalData.snapshots[0],
          firemakingExperience: 1,
          magicExperience: 5
        })
      ).toEqual({
        firemaking: -13034873,
        magic: -19288599
      });

      // Unranked farming exp., shouldn't count (farming became unranked)
      expect(
        utils.getNegativeGains(globalData.snapshots[0], {
          ...globalData.snapshots[0],
          farmingExperience: -1
        })
      ).toBeNull();

      // Negative BH score (not allowed, happened before the BH update on May 24th 2023)
      expect(
        utils.getNegativeGains(
          { ...globalData.snapshots[0], bounty_hunter_hunterScore: 70 },
          { ...globalData.snapshots[0], bounty_hunter_hunterScore: 10 }
        )
      ).toEqual({
        bounty_hunter_hunter: -60
      });

      // Negative BH score (allowed, the BH update on May 24th 2023 reset people's BH scores, so negative gains are acceptable)
      expect(
        utils.getNegativeGains(
          { ...globalData.snapshots[0], createdAt: new Date('2023-01-01'), bounty_hunter_hunterScore: 70 },
          { ...globalData.snapshots[0], createdAt: new Date('2024-01-01'), bounty_hunter_hunterScore: 10 }
        )
      ).toBeNull();
    });

    it('should detect excessive gains between snapshots', () => {
      // No changes between these
      expect(utils.getExcessiveGains(globalData.snapshots[0], globalData.snapshots[0])).toBeNull();

      // Small changes between these
      expect(
        utils.getExcessiveGains(globalData.snapshots[0], {
          ...globalData.snapshots[0],
          magicExperience: globalData.snapshots[0].magicExperience + 50
        })
      ).toBeNull();

      // Excessive changes between these
      const result = utils.getExcessiveGains(globalData.snapshots[0], {
        ...globalData.snapshots[0],
        runecraftingExperience: 200_000_000,
        zulrahKills: 5000
      });

      if (!result) {
        expect(result).not.toBeNull();
      } else {
        expect(result.ehbDiff + result.ehpDiff).toBeGreaterThan(result.hoursDiff);
      }
    });
  });

  describe('3 - Get Player Snapshots', () => {
    it('should not fetch all (player not found)', async () => {
      const result = await findPlayerSnapshots(2_000_000);
      expect(result.length).toBe(0);
    });

    it('should fetch all snapshots (limited)', async () => {
      const result = await findPlayerSnapshots(globalData.testPlayerId, undefined, undefined, undefined, {
        limit: 10,
        offset: 0
      });

      expect(result.length).toBe(3);
      expect(result.filter(r => r.importedAt === null).length).toBe(3);
      expect(result.filter(r => r.playerId !== globalData.testPlayerId).length).toBe(0);
      expect(result[0].createdAt.getTime() - Date.now()).toBeLessThan(365_000);
      expect(result[0].zulrahKills).toBe(1646);

      // Ensure the list is sorted by "createdAt" descending
      for (let i = 0; i < result.length; i++) {
        if (i === 0) continue;
        expect(result[i].createdAt < result[i - 1].createdAt).toBe(true);
      }
    });

    it('should not fetch snapshots between (player not found)', async () => {
      const result = await findPlayerSnapshots(
        2_000_000,
        undefined,
        new Date('2019-07-03T21:13:56.000Z'),
        new Date('2020-04-14T21:08:55.000Z')
      );

      expect(result.length).toBe(0);
    });

    it('should not fetch snapshots between (min date greater than max date)', async () => {
      await expect(
        findPlayerSnapshots(
          2_000_000,
          undefined,
          new Date('2020-04-14T21:08:55.000Z'),
          new Date('2019-07-03T21:13:56.000Z')
        )
      ).rejects.toThrow();
    });

    it('should fetch snapshots between', async () => {
      const startDate = new Date(Date.now() - PeriodProps[Period.DAY].milliseconds * 2);
      const endDate = new Date();

      const result = await findPlayerSnapshots(globalData.testPlayerId, undefined, startDate, endDate);

      expect(result.length).toBe(2);
      expect(result.filter(r => r.createdAt >= startDate && r.createdAt <= endDate).length).toBe(2);
      expect(result.filter(r => r.playerId !== globalData.testPlayerId).length).toBe(0);

      // Ensure the list is sorted by "createdAt" descending
      for (let i = 0; i < result.length; i++) {
        if (i === 0) continue;
        expect(result[i].createdAt <= result[i - 1].createdAt).toBe(true);
      }
    });

    it('should not fetch period snapshots (invalid period)', async () => {
      await expect(findPlayerSnapshots(globalData.testPlayerId, 'idk')).rejects.toThrow(
        'Invalid period: idk.'
      );
    });

    it('should fetch period snapshots (common period)', async () => {
      const now = new Date();
      const results = await findPlayerSnapshots(globalData.testPlayerId, 'week');

      expect(results.length).toBe(3);
      expect((Date.now() - results[2].createdAt.getTime()) / 86_400_000).toBeCloseTo(5);
      expect(results.filter(r => r.playerId !== globalData.testPlayerId).length).toBe(0);
      expect(results.filter(r => r.createdAt > now).length).toBe(0);
      expect(results.filter(r => now.getTime() - r.createdAt.getTime() > 604_800_000).length).toBe(0); // no snapshots over a week old

      // Ensure the list is sorted by "createdAt" descending
      for (let i = 0; i < results.length; i++) {
        if (i === 0) continue;
        expect(results[i].createdAt < results[i - 1].createdAt).toBe(true);
      }
    });

    it('should fetch period snapshots (custom period)', async () => {
      const now = new Date();
      const results = await findPlayerSnapshots(globalData.testPlayerId, '2d3h');

      expect(results.length).toBe(2);
      expect((Date.now() - results[1].createdAt.getTime()) / 86_400_000).toBeCloseTo(1);
      expect(results.filter(r => r.playerId !== globalData.testPlayerId).length).toBe(0);
      expect(results.filter(r => r.createdAt > now).length).toBe(0);
      expect(results.filter(r => now.getTime() - r.createdAt.getTime() > 183_600_000).length).toBe(0); // no snapshots over 51 hours old

      // Ensure the list is sorted by "createdAt" descending
      for (let i = 0; i < results.length; i++) {
        if (i === 0) continue;
        expect(results[i].createdAt < results[i - 1].createdAt).toBe(true);
      }
    });
  });
});
