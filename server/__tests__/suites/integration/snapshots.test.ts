import axios from 'axios';
import supertest from 'supertest';
import MockAdapter from 'axios-mock-adapter';
import { PlayerType, SKILLS, getMetricValueKey, getMetricRankKey, Metric } from '../../../src/utils';
import * as utils from '../../../src/api/modules/snapshots/snapshot.utils';
import apiServer from '../../../src/api';
import {
  resetDatabase,
  resetRedis,
  readFile,
  registerHiscoresMock,
  registerCMLMock,
  sleep,
  modifyRawHiscoresData
} from '../../utils';
import { Snapshot, SnapshotDataSource } from '../../../src/api/modules/snapshots/snapshot.types';
import { buildSnapshot } from '../../../src/api/modules/snapshots/services/BuildSnapshotService';
import { findPlayerSnapshots } from '../../../src/api/modules/snapshots/services/FindPlayerSnapshotsService';
import { saveAllSnapshots } from '../../../src/api/modules/players/services/ImportPlayerHistoryService';
import { resolveSequentially } from '../../../src/api/util/objects';

const api = supertest(apiServer.express);
const axiosMock = new MockAdapter(axios, { onNoMatch: 'passthrough' });

const HISCORES_FILE_PATH_P = `${__dirname}/../../data/hiscores/psikoi_hiscores.txt`;
const CML_FILE_PATH_P = `${__dirname}/../../data/cml/psikoi_cml.txt`;

const HISCORES_FILE_PATH_LT = `${__dirname}/../../data/hiscores/lynx_titan_hiscores.txt`;
const CML_FILE_PATH_LT = `${__dirname}/../../data/cml/lynx_titan_cml.txt`;

const globalData = {
  hiscoresRawDataP: '',
  hiscoresRawDataLT: '',
  cmlRawDataP: '',
  cmlRawDataLT: '',
  testPlayerId: -1,
  secondaryPlayerId: -1,
  testGroupId: -1,
  testGroupCode: '',
  snapshots: [] as Snapshot[]
};

beforeAll(async () => {
  await resetDatabase();
  await resetRedis();

  // Fake the current date to be May 8th 2020 (when the CML history ends)
  jest.useFakeTimers().setSystemTime(new Date('2020-05-08T17:14:00.000Z'));

  globalData.hiscoresRawDataP = await readFile(HISCORES_FILE_PATH_P);
  globalData.hiscoresRawDataLT = await readFile(HISCORES_FILE_PATH_LT);

  globalData.cmlRawDataP = await readFile(CML_FILE_PATH_P);
  globalData.cmlRawDataLT = await readFile(CML_FILE_PATH_LT);

  // Mock the history fetch from CML to always fail with a 404 status code
  registerCMLMock(axiosMock, 404);

  // Mock regular hiscores data, and block any ironman requests
  registerHiscoresMock(axiosMock, {
    [PlayerType.REGULAR]: { statusCode: 200, rawData: globalData.hiscoresRawDataP },
    [PlayerType.IRONMAN]: { statusCode: 404 }
  });
});

afterAll(async () => {
  jest.useRealTimers();

  // Sleep for 5s to allow the server to shut down gracefully
  await apiServer.shutdown().then(() => sleep(5000));
}, 10_000);

describe('Snapshots API', () => {
  describe('1 - Creating from OSRS Hiscores', () => {
    it('should not create snapshot (hiscores change)', async () => {
      const [firstLine, ...rest] = globalData.hiscoresRawDataLT.split('\n');
      const rawDataMinusOneLine = rest.join('\n');
      const rawDataPlusOneLine = `${globalData.hiscoresRawDataLT}\n${firstLine}`;

      await expect(buildSnapshot(1, rawDataMinusOneLine)).rejects.toThrow(
        'The OSRS Hiscores were updated. Please wait for a fix.'
      );

      await expect(buildSnapshot(1, rawDataPlusOneLine)).rejects.toThrow(
        'The OSRS Hiscores were updated. Please wait for a fix.'
      );
    });

    it('should create snapshot (Lynx Titan)', async () => {
      const snapshot = await buildSnapshot(1, globalData.hiscoresRawDataLT);

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
      const snapshot = await buildSnapshot(1, globalData.hiscoresRawDataP);

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

      const newSnapshot = await buildSnapshot(1, modifiedRawData);

      // Now these shouldn't be unranked
      expect(newSnapshot.bounty_hunter_rogueScore).toBe(45);
      expect(newSnapshot.bounty_hunter_hunterScore).toBe(17);
    });
  });

  describe('2 - Creating from CrystalMathLabs', () => {
    it('should not create snapshot (invalid input)', async () => {
      await expect(buildSnapshot(1, '', SnapshotDataSource.CRYSTAL_MATH_LABS)).rejects.toThrow();
    });

    it('should not create snapshot (CML changed)', async () => {
      const missingData = globalData.cmlRawDataLT
        .split('\n')
        .filter(r => r.length)[0]
        .slice(0, -5);

      await expect(buildSnapshot(1, missingData, SnapshotDataSource.CRYSTAL_MATH_LABS)).rejects.toThrow(
        'The CML API was updated. Please wait for a fix.'
      );

      const excessiveData = globalData.cmlRawDataLT.split('\n').filter(r => r.length)[0] + ',1';

      await expect(buildSnapshot(1, excessiveData, SnapshotDataSource.CRYSTAL_MATH_LABS)).rejects.toThrow(
        'The CML API was updated. Please wait for a fix.'
      );
    });

    it('should create snapshot (Lynx Titan)', async () => {
      const data = globalData.cmlRawDataLT.split('\n').filter(r => r.length)[0];

      const snapshot = await buildSnapshot(1, data, SnapshotDataSource.CRYSTAL_MATH_LABS);

      expect(snapshot.playerId).toBe(1);
      expect(snapshot.importedAt).not.toBeUndefined();

      SKILLS.forEach(skill => {
        if (skill === Metric.OVERALL) {
          expect(snapshot.overallRank).toBe(1);
          expect(snapshot.overallExperience).toBe((SKILLS.length - 1) * 200000000);
        } else {
          expect(snapshot[getMetricRankKey(skill)]).toBeLessThan(1000);
          expect(snapshot[getMetricValueKey(skill)]).toBe(200000000);
        }
      });
    });

    it('should create snapshot (Psikoi)', async () => {
      const data = globalData.cmlRawDataP.split('\n').filter(r => r.length)[0];

      const snapshot = await buildSnapshot(1, data, SnapshotDataSource.CRYSTAL_MATH_LABS);

      expect(snapshot.playerId).toBe(1);
      expect(snapshot.createdAt.getTime()).toBe(1588939931000);
      expect(snapshot.importedAt).not.toBeUndefined();

      SKILLS.forEach(skill => {
        if (skill === Metric.OVERALL) {
          expect(snapshot.overallRank).toBe(30156);
          expect(snapshot.overallExperience).toBe(279142172);
        } else {
          expect(snapshot[getMetricRankKey(skill)]).toBeLessThan(260_000);
          expect(snapshot[getMetricValueKey(skill)]).toBeGreaterThan(3_000_000);
        }
      });
    });

    it('should save all CML history as snapshots', async () => {
      const trackResponse = await api.post(`/players/psikoi`);
      expect(trackResponse.status).toBe(201);

      globalData.testPlayerId = trackResponse.body.id;

      const cml = globalData.cmlRawDataP.split('\n').filter(r => r.length);

      const snapshots = await resolveSequentially(
        cml.map(row => buildSnapshot(globalData.testPlayerId, row, SnapshotDataSource.CRYSTAL_MATH_LABS))
      );

      const { count } = await saveAllSnapshots(snapshots);
      expect(count).toBe(219);

      const snapshotResponse = await findPlayerSnapshots(
        trackResponse.body.id,
        undefined,
        new Date('2010-01-01T00:00:00.000Z'),
        new Date('2030-01-01T00:00:00.000Z')
      );

      globalData.snapshots = snapshotResponse.slice(1);

      expect(snapshotResponse.length).toBe(220); // 219 imported + 1 tracked

      snapshotResponse.forEach(snapshot => {
        expect(snapshot.playerId).toBe(globalData.testPlayerId);
      });
    });
  });

  describe('3 - Snapshot Utils', () => {
    it('should detect changes between snapshots', () => {
      // No changes between these
      expect(utils.hasChanged(globalData.snapshots[1], globalData.snapshots[0])).toBe(false);
      // Some changes between these
      expect(utils.hasChanged(globalData.snapshots[10], globalData.snapshots[0])).toBe(true);
      // EHP and EHB changed shouldn't count, as they can fluctuate without the player's envolvement
      const ehpChanged = { ...globalData.snapshots[0], ehpValue: 1, ehbValue: 1 };
      expect(utils.hasChanged(globalData.snapshots[0], ehpChanged)).toBe(false);
    });

    it('should detect negative gains between snapshots', () => {
      // No changes between these
      expect(utils.getNegativeGains(globalData.snapshots[1], globalData.snapshots[0])).toBeNull();

      // Positive changes between these
      expect(utils.getNegativeGains(globalData.snapshots[10], globalData.snapshots[0])).toBeNull();

      // Negative last_man_standing gains
      const negativeLmsStart = { ...globalData.snapshots[0], last_man_standingScore: 1000 };
      const negativeLmsEnd = { ...globalData.snapshots[0], last_man_standingScore: 700 };
      expect(utils.getNegativeGains(negativeLmsStart, negativeLmsEnd)).toBeNull(); // LMS score can decrease, so it shouldn't count as negative gains

      // Negative pvp_arena gains
      const negativePvpArenaStart = { ...globalData.snapshots[0], pvp_arenaScore: 1000 };
      const negativePvpArenaEnd = { ...globalData.snapshots[0], pvp_arenaScore: 700 };
      expect(utils.getNegativeGains(negativePvpArenaStart, negativePvpArenaEnd)).toBeNull(); // PVP Arena score can decrease, so it shouldn't count as negative gains

      // Negative firemaking and magic gains
      const negativeFiremaking = { ...globalData.snapshots[0], firemakingExperience: 1, magicExperience: 5 };
      expect(utils.getNegativeGains(globalData.snapshots[10], negativeFiremaking)).toEqual({
        firemaking: -6397195,
        magic: -19219575
      });

      // Unranked farming exp., shouldn't count (farming became unranked)
      const unrankedFarming = { ...globalData.snapshots[0], farmingExperience: -1 };
      expect(utils.getNegativeGains(globalData.snapshots[10], unrankedFarming)).toBeNull();

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
          { ...globalData.snapshots[0], bounty_hunter_hunterScore: 70 },
          { ...globalData.snapshots[0], createdAt: new Date('2024-01-01'), bounty_hunter_hunterScore: 10 }
        )
      ).toBeNull();
    });

    it('should detect excessive gains between snapshots', () => {
      // No changes between these
      expect(utils.getExcessiveGains(globalData.snapshots[1], globalData.snapshots[0])).toBeNull();

      // Small changes between these
      expect(utils.getExcessiveGains(globalData.snapshots[10], globalData.snapshots[0])).toBeNull();

      // Excessive changes between these
      const bigGains = {
        ...globalData.snapshots[0],
        runecraftingExperience: 200_000_000,
        zulrahKills: 5000
      };

      const result = utils.getExcessiveGains(globalData.snapshots[10], bigGains);

      if (!result) {
        expect(result).not.toBeNull();
      } else {
        expect(result.ehbDiff + result.ehpDiff).toBeGreaterThan(result.hoursDiff);
      }
    });
  });

  describe('4 - Get Player Snapshots', () => {
    it('should not fetch all (player not found)', async () => {
      const result = await findPlayerSnapshots(2_000_000);
      expect(result.length).toBe(0);
    });

    it('should fetch all snapshots (high limit)', async () => {
      const result = await findPlayerSnapshots(globalData.testPlayerId);

      expect(result.length).toBe(220);
      expect(result.filter(r => r.importedAt === null).length).toBe(1);
      expect(result.filter(r => r.playerId !== globalData.testPlayerId).length).toBe(0);
      expect(result[0].createdAt.getTime() - Date.now()).toBeLessThan(365_000);
      expect(result[0].zulrahKills).toBe(1646);

      // Ensure the list is sorted by "createdAt" descending
      for (let i = 0; i < result.length; i++) {
        if (i === 0) continue;
        expect(result[i].createdAt < result[i - 1].createdAt).toBe(true);
      }
    });

    it('should fetch all snapshots (limited)', async () => {
      const result = await findPlayerSnapshots(globalData.testPlayerId, undefined, undefined, undefined, {
        limit: 10,
        offset: 0
      });

      expect(result.length).toBe(10);
      expect(result.filter(r => r.importedAt === null).length).toBe(1);
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
      const startDate = new Date('2019-07-03T21:13:56.000Z');
      const endDate = new Date('2020-04-14T21:08:55.000Z');

      const result = await findPlayerSnapshots(globalData.testPlayerId, undefined, startDate, endDate);

      expect(result.length).toBe(85);
      expect(result.filter(r => r.createdAt >= startDate && r.createdAt <= endDate).length).toBe(85);
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

      expect(results.length).toBe(7);
      expect(results[6].createdAt.toISOString()).toBe('2020-05-01T20:24:34.000Z');
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
      const results = await findPlayerSnapshots(globalData.testPlayerId, '2w3d');

      expect(results.length).toBe(12);
      expect(results[11].createdAt.toISOString()).toBe('2020-04-21T23:58:48.000Z');
      expect(results.filter(r => r.playerId !== globalData.testPlayerId).length).toBe(0);
      expect(results.filter(r => r.createdAt > now).length).toBe(0);
      expect(results.filter(r => now.getTime() - r.createdAt.getTime() > 1_468_800_000).length).toBe(0); // no snapshots over 17 days old

      // Ensure the list is sorted by "createdAt" descending
      for (let i = 0; i < results.length; i++) {
        if (i === 0) continue;
        expect(results[i].createdAt < results[i - 1].createdAt).toBe(true);
      }
    });
  });
});
