import axios from 'axios';
import supertest from 'supertest';
import MockAdapter from 'axios-mock-adapter';
import { getMetricValueKey, getMetricRankKey, SKILLS, Metrics, PlayerType } from '@wise-old-man/utils';
import * as service from '../../src/api/services/internal/snapshot.service';
import apiServer from '../../src/api';
import { resetDatabase, readFile, registerHiscoresMock, registerCMLMock } from '../utils';

const api = supertest(apiServer);
const axiosMock = new MockAdapter(axios, { onNoMatch: 'passthrough' });

const HISCORES_FILE_PATH_P = `${__dirname}/../data/hiscores/psikoi_hiscores.txt`;
const CML_FILE_PATH_P = `${__dirname}/../data/cml/psikoi_cml.txt`;

const HISCORES_FILE_PATH_LT = `${__dirname}/../data/hiscores/lynx_titan_hiscores.txt`;
const CML_FILE_PATH_LT = `${__dirname}/../data/cml/lynx_titan_cml.txt`;

const globalData = {
  hiscoresRawDataP: '',
  hiscoresRawDataLT: '',
  cmlRawDataP: '',
  cmlRawDataLT: '',
  testPlayerId: -1,
  secondaryPlayerId: -1,
  snapshots: []
};

beforeAll(async done => {
  await resetDatabase();

  // Fake the current date to be May 8th 2020 (when the CML history ends)
  jest.useFakeTimers('modern').setSystemTime(new Date('2020-05-08T17:14:00.000Z'));

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

  done();
});

afterAll(() => {
  // Reset the timers to the current (REAL) time
  jest.useRealTimers();
});

describe('Snapshots API', () => {
  describe('1 - Creating from OSRS Hiscores', () => {
    it('should not create snapshot (invalid input)', async () => {
      await expect(async () => await service.fromRS(1, null)).rejects.toThrow();
    });

    it('should not create snapshot (hiscores change)', async () => {
      const [firstLine, ...rest] = globalData.hiscoresRawDataLT.split('\n');
      const rawDataMinusOneLine = rest.join('\n');
      const rawDataPlusOneLine = `${globalData.hiscoresRawDataLT}\n${firstLine}`;

      await expect(async () => await service.fromRS(1, rawDataMinusOneLine)).rejects.toThrow(
        'The OSRS Hiscores were updated. Please wait for a fix.'
      );

      await expect(async () => await service.fromRS(1, rawDataPlusOneLine)).rejects.toThrow(
        'The OSRS Hiscores were updated. Please wait for a fix.'
      );
    });

    it('should create snapshot (Lynx Titan)', async () => {
      const snapshot = await service.fromRS(1, globalData.hiscoresRawDataLT);

      expect(snapshot.playerId).toBe(1);
      expect(snapshot.importedAt).toBeUndefined();

      SKILLS.forEach(skill => {
        if (skill === Metrics.OVERALL) {
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
      const snapshot = await service.fromRS(1, globalData.hiscoresRawDataP);

      expect(snapshot.playerId).toBe(1);
      expect(snapshot.importedAt).toBeUndefined();

      SKILLS.forEach(skill => {
        if (skill === Metrics.OVERALL) {
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
    });
  });

  describe('2 - Creating from CrystalMathLabs', () => {
    it('should not create snapshot (invalid input)', async () => {
      expect(async () => await service.fromCML(1, null)).rejects.toThrow();
    });

    it('should not create snapshot (CML changed)', async () => {
      const missingData = globalData.cmlRawDataLT
        .split('\n')
        .filter(r => r.length)[0]
        .slice(0, -5);

      await expect(async () => await service.fromCML(1, missingData)).rejects.toThrow(
        'The CML API was updated. Please wait for a fix.'
      );

      const excessiveData = globalData.cmlRawDataLT.split('\n').filter(r => r.length)[0] + ',1';

      await expect(async () => await service.fromCML(1, excessiveData)).rejects.toThrow(
        'The CML API was updated. Please wait for a fix.'
      );
    });

    it('should create snapshot (Lynx Titan)', async () => {
      const data = globalData.cmlRawDataLT.split('\n').filter(r => r.length)[0];
      const snapshot: any = await service.fromCML(1, data);

      expect(snapshot.playerId).toBe(1);
      expect(snapshot.importedAt).not.toBeUndefined();

      SKILLS.forEach(skill => {
        if (skill === Metrics.OVERALL) {
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
      const snapshot: any = await service.fromCML(1, data);

      expect(snapshot.playerId).toBe(1);
      expect(snapshot.createdAt.getTime()).toBe(1588939931000);
      expect(snapshot.importedAt).not.toBeUndefined();

      SKILLS.forEach(skill => {
        if (skill === Metrics.OVERALL) {
          expect(snapshot.overallRank).toBe(30156);
          expect(snapshot.overallExperience).toBe(279142172);
        } else {
          expect(snapshot[getMetricRankKey(skill)]).toBeLessThan(260_000);
          expect(snapshot[getMetricValueKey(skill)]).toBeGreaterThan(3_000_000);
        }
      });
    });

    it('should save all CML history as snapshots', async () => {
      const trackResponse = await api.post(`/api/players/track`).send({ username: 'psikoi' });
      expect(trackResponse.status).toBe(201);

      globalData.testPlayerId = trackResponse.body.id;

      const cml = globalData.cmlRawDataP.split('\n').filter(r => r.length);

      const snapshots = await Promise.all(cml.map(row => service.fromCML(globalData.testPlayerId, row)));

      const saved = await service.saveAll(snapshots);

      globalData.snapshots = saved;

      expect(saved.length).toBe(219);

      saved.forEach(snapshot => {
        expect(snapshot.playerId).toBe(globalData.testPlayerId);
      });
    });
  });

  describe('3 - Snapshot Utils', () => {
    it('should detect changes between snapshots', () => {
      // Invalid params
      expect(service.hasChanged(null, globalData.snapshots[0])).toBe(true);
      expect(service.hasChanged(globalData.snapshots[0], null)).toBe(false);
      // No changes between these
      expect(service.hasChanged(globalData.snapshots[1], globalData.snapshots[0])).toBe(false);
      // Some changes between these
      expect(service.hasChanged(globalData.snapshots[10], globalData.snapshots[0])).toBe(true);
      // EHP and EHB changed shouldn't count, as they can fluctuate without the player's envolvement
      const ehpChanged = { ...globalData.snapshots[0].toJSON(), ehpValue: 1, ehbValue: 1 };
      expect(service.hasChanged(globalData.snapshots[0], ehpChanged)).toBe(false);
    });

    it('should detect negative gains between snapshots', () => {
      // No changes between these
      expect(service.hasNegativeGains(globalData.snapshots[1], globalData.snapshots[0])).toBe(false);
      // Positive changes between these
      expect(service.hasNegativeGains(globalData.snapshots[10], globalData.snapshots[0])).toBe(false);
      // Negative firemaking gains
      const negativeFiremaking = { ...globalData.snapshots[0].toJSON(), firemakingExperience: 1 };
      expect(service.hasNegativeGains(globalData.snapshots[10], negativeFiremaking)).toBe(true);
      // Unranked farming exp., shouldn't count
      const unrankedFarming = { ...globalData.snapshots[0].toJSON(), farmingExperience: -1 };
      expect(service.hasNegativeGains(globalData.snapshots[10], unrankedFarming)).toBe(false);
    });

    it('should detect excessive gains between snapshots', async () => {
      // No changes between these
      expect(service.hasExcessiveGains(globalData.snapshots[1], globalData.snapshots[0])).toBe(false);
      // Small changes between these
      expect(service.hasExcessiveGains(globalData.snapshots[10], globalData.snapshots[0])).toBe(false);
      // Excessive changes between these
      const bigGains = { ...globalData.snapshots[0].toJSON(), runecraftingExperience: 200_000_000 };
      expect(service.hasExcessiveGains(globalData.snapshots[10], bigGains)).toBe(true);
    });
  });

  describe('4 - Get Player Snapshots', () => {
    it('should not fetch latest snapshot (invalid player id)', async () => {
      await expect(async () => await service.findLatest(undefined)).rejects.toThrow('Invalid player id.');
    });

    it('should not fetch latest snapshot (player not found)', async () => {
      const result = await service.findLatest(2000000);

      expect(result).toBe(null);
    });

    it('should fetch latest snapshot', async () => {
      const result = await service.findLatest(globalData.testPlayerId);

      expect(result.createdAt.getTime() - Date.now()).toBeLessThan(365_000);
      expect(result.zulrahKills).toBe(1646);
    });

    it('should fetch latest snapshot (w/ max date)', async () => {
      const result = await service.findLatest(globalData.testPlayerId, new Date('2018-11-01T18:00:00.000Z'));

      expect(result.createdAt.toISOString()).toBe('2018-11-01T17:27:44.000Z');
      expect(result.zulrahKills).toBe(-1);
    });

    it('should not fetch latest snapshot (invalid max date)', async () => {
      await expect(async () => await service.findLatest(1, null)).rejects.toThrow('Invalid maximum date.');
    });

    it('should not fetch first snapshot since (invalid player id)', async () => {
      const startDate = new Date('2019-03-28T19:00:00.000Z');

      await expect(async () => await service.findFirstSince(null, startDate)).rejects.toThrow(
        'Invalid player id.'
      );
    });

    it('should not fetch first snapshot since (invalid date)', async () => {
      await expect(async () => await service.findFirstSince(1, null)).rejects.toThrow('Invalid start date.');
    });

    it('should fetch first snapshot since', async () => {
      const startDate = new Date('2019-03-28T19:00:00.000Z');
      const result = await service.findFirstSince(globalData.testPlayerId, startDate);

      expect(result.createdAt.toISOString()).toBe('2019-03-28T23:32:40.000Z');
    });

    it('should not fetch all (invalid player id)', async () => {
      await expect(async () => await service.findAll(undefined, 1)).rejects.toThrow('Invalid player id.');
    });

    it('should not fetch all (player not found)', async () => {
      const result = await service.findAll(2000000, 10);

      expect(result.length).toBe(0);
    });

    it('should fetch all snapshots (high limit)', async () => {
      const result = await service.findAll(globalData.testPlayerId, 10_000);

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
      const result = await service.findAll(globalData.testPlayerId, 10);

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

    it('should not fetch snapshots between (invalid player id)', async () => {
      const startDate = new Date('2019-07-03T21:13:56.000Z');
      const endDate = new Date('2020-04-14T21:08:55.000Z');

      await expect(async () => await service.findAllBetween(undefined, startDate, endDate)).rejects.toThrow(
        'Invalid player ids.'
      );
    });

    it('should not fetch snapshots between (invalid start date)', async () => {
      const endDate = new Date('2020-04-14T21:08:55.000Z');

      await expect(async () => await service.findAllBetween([1], null, endDate)).rejects.toThrow(
        'Invalid start date.'
      );
    });

    it('should not fetch snapshots between (invalid end date)', async () => {
      const startDate = new Date('2019-07-03T21:13:56.000Z');

      await expect(async () => await service.findAllBetween([1], startDate, null)).rejects.toThrow(
        'Invalid end date.'
      );
    });

    it('should not fetch snapshots between (player not found)', async () => {
      const startDate = new Date('2019-07-03T21:13:56.000Z');
      const endDate = new Date('2020-04-14T21:08:55.000Z');

      const result = await service.findAllBetween([2000000], startDate, endDate);

      expect(result.length).toBe(0);
    });

    it('should not fetch snapshots between (player not found)', async () => {
      const startDate = new Date('2019-07-03T21:13:56.000Z');
      const endDate = new Date('2020-04-14T21:08:55.000Z');

      const result = await service.findAllBetween([2000000], startDate, endDate);

      expect(result.length).toBe(0);
    });

    it('should fetch snapshots between', async () => {
      const startDate = new Date('2019-07-03T21:13:56.000Z');
      const endDate = new Date('2020-04-14T21:08:55.000Z');

      const result = await service.findAllBetween([globalData.testPlayerId], startDate, endDate);

      expect(result.length).toBe(85);
      expect(result.filter(r => r.createdAt >= startDate && r.createdAt <= endDate).length).toBe(85);
      expect(result.filter(r => r.playerId !== globalData.testPlayerId).length).toBe(0);

      // Ensure the list is sorted by "createdAt" ascending
      for (let i = 0; i < result.length; i++) {
        if (i === 0) continue;
        expect(result[i].createdAt > result[i - 1].createdAt).toBe(true);
      }
    });

    it('should not fetch period snapshots (undefined period)', async () => {
      await expect(async () => {
        await service.getPlayerPeriodSnapshots(globalData.testPlayerId, null);
      }).rejects.toThrow('Invalid period.');
    });

    it('should not fetch period snapshots (invalid period)', async () => {
      await expect(async () => {
        await service.getPlayerPeriodSnapshots(globalData.testPlayerId, 'idk');
      }).rejects.toThrow('Invalid period: idk.');
    });

    it('should fetch period snapshots (common period)', async () => {
      const now = new Date();
      const results = await service.getPlayerPeriodSnapshots(globalData.testPlayerId, 'week');

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
      const results = await service.getPlayerPeriodSnapshots(globalData.testPlayerId, '2w3d');

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

  describe('5 - Get Group Snapshots', () => {
    it('should fetch group snapshots between', async () => {
      const trackResponse = await api.post(`/api/players/track`).send({ username: 'jakesterwars' });
      expect(trackResponse.status).toBe(201);

      globalData.secondaryPlayerId = trackResponse.body.id;

      const startDate = new Date('2020-04-16T22:00:00.000Z');
      const endDate = new Date('2021-04-14T21:08:55.000Z');

      const result = await service.findAllBetween(
        [globalData.testPlayerId, globalData.secondaryPlayerId],
        startDate,
        endDate
      );

      expect(result.length).toBe(19);
      expect(result[18].playerId).toBe(globalData.secondaryPlayerId);
      expect(result.filter(r => r.playerId === globalData.testPlayerId).length).toBe(18);
      expect(result.filter(r => r.playerId === globalData.secondaryPlayerId).length).toBe(1);

      // Ensure the list is sorted by "createdAt" ascending
      for (let i = 0; i < result.length; i++) {
        if (i === 0) continue;
        expect(result[i].createdAt >= result[i - 1].createdAt).toBe(true);
      }
    });

    it('should fetch group last snapshots', async () => {
      // Reset the timers to the current (REAL) time
      jest.useRealTimers();

      const result = await service.getGroupLastSnapshots(
        [globalData.testPlayerId, globalData.secondaryPlayerId],
        new Date()
      );

      expect(result.length).toBe(2);

      expect(result[0]).toMatchObject({
        playerId: globalData.testPlayerId,
        createdAt: new Date('2020-05-08T17:14:00.000Z')
      });

      expect(result[1]).toMatchObject({
        playerId: globalData.secondaryPlayerId,
        createdAt: new Date('2020-05-08T17:14:00.000Z')
      });

      expect(result[0].zulrahKills).toBeDefined(); // by default this query selects every attribute
    });

    it('should fetch group last snapshots (w/ attribute selector)', async () => {
      const result = await service.getGroupLastSnapshots(
        [globalData.testPlayerId, globalData.secondaryPlayerId],
        new Date(),
        '"scorpiaKills"'
      );

      expect(result.length).toBe(2);

      expect(result[0]).toMatchObject({
        playerId: globalData.testPlayerId,
        createdAt: new Date('2020-05-08T17:14:00.000Z')
      });

      expect(result[1]).toMatchObject({
        playerId: globalData.secondaryPlayerId,
        createdAt: new Date('2020-05-08T17:14:00.000Z')
      });

      expect(result[0].zulrahKills).toBeUndefined();
      expect(result[0].scorpiaKills).toBeDefined();
      expect(result[0].createdAt).toBeDefined();
      expect(result[0].playerId).toBeDefined();
    });

    it('should fetch group first snapshots', async () => {
      const result = await service.getGroupFirstSnapshots(
        [globalData.testPlayerId, globalData.secondaryPlayerId],
        new Date('2020-04-16T18:00:00.000Z')
      );

      expect(result.length).toBe(2);

      expect(result[0]).toMatchObject({
        playerId: globalData.testPlayerId,
        createdAt: new Date('2020-04-16T19:54:23.000Z')
      });

      expect(result[1]).toMatchObject({
        playerId: globalData.secondaryPlayerId,
        createdAt: new Date('2020-05-08T17:14:00.000Z')
      });

      expect(result[0].attackExperience).toBeDefined(); // by default this query selects every attribute
    });

    it('should fetch group first snapshots (w/ attribute selector)', async () => {
      const result = await service.getGroupFirstSnapshots(
        [globalData.testPlayerId, globalData.secondaryPlayerId],
        new Date('2020-04-16T18:00:00.000Z'),
        '"attackExperience"'
      );

      expect(result.length).toBe(2);

      expect(result[0]).toMatchObject({
        playerId: globalData.testPlayerId,
        createdAt: new Date('2020-04-16T19:54:23.000Z')
      });

      expect(result[1]).toMatchObject({
        playerId: globalData.secondaryPlayerId,
        createdAt: new Date('2020-05-08T17:14:00.000Z')
      });

      expect(result[0].zulrahKills).toBeUndefined();
      expect(result[0].attackExperience).toBeDefined();
      expect(result[0].createdAt).toBeDefined();
      expect(result[0].playerId).toBeDefined();
    });
  });
});
