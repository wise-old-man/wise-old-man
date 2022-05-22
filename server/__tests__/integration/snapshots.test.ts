import axios from 'axios';
import supertest from 'supertest';
import MockAdapter from 'axios-mock-adapter';
import { getMetricValueKey, getMetricRankKey, SKILLS, Metrics } from '@wise-old-man/utils';
import { PlayerTypeEnum } from '../../src/prisma';
import * as service from '../../src/api/services/internal/snapshot.service';
import * as services from '../../src/api/modules/snapshots/snapshot.services';
import * as utils from '../../src/api/modules/snapshots/snapshot.utils';
import apiServer from '../../src/api';
import { resetDatabase, resetRedis, readFile, registerHiscoresMock, registerCMLMock } from '../utils';

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
  testGroupId: -1,
  testGroupCode: '',
  snapshots: []
};

beforeAll(async done => {
  await resetDatabase();
  await resetRedis();

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
    [PlayerTypeEnum.REGULAR]: { statusCode: 200, rawData: globalData.hiscoresRawDataP },
    [PlayerTypeEnum.IRONMAN]: { statusCode: 404 }
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
      await expect(services.buildSnapshot({ playerId: 1, rawCSV: null })).rejects.toThrow();
    });

    it('should not create snapshot (hiscores change)', async () => {
      const [firstLine, ...rest] = globalData.hiscoresRawDataLT.split('\n');
      const rawDataMinusOneLine = rest.join('\n');
      const rawDataPlusOneLine = `${globalData.hiscoresRawDataLT}\n${firstLine}`;

      await expect(services.buildSnapshot({ playerId: 1, rawCSV: rawDataMinusOneLine })).rejects.toThrow(
        'The OSRS Hiscores were updated. Please wait for a fix.'
      );

      await expect(services.buildSnapshot({ playerId: 1, rawCSV: rawDataPlusOneLine })).rejects.toThrow(
        'The OSRS Hiscores were updated. Please wait for a fix.'
      );
    });

    it('should create snapshot (Lynx Titan)', async () => {
      const snapshot = await services.buildSnapshot({ playerId: 1, rawCSV: globalData.hiscoresRawDataLT });

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
      const snapshot = await services.buildSnapshot({ playerId: 1, rawCSV: globalData.hiscoresRawDataP });

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
      await expect(
        services.buildSnapshot({
          playerId: 1,
          rawCSV: null,
          source: services.SnapshotDataSource.CRYSTAL_MATH_LABS
        })
      ).rejects.toThrow();
    });

    it('should not create snapshot (CML changed)', async () => {
      const missingData = globalData.cmlRawDataLT
        .split('\n')
        .filter(r => r.length)[0]
        .slice(0, -5);

      await expect(
        services.buildSnapshot({
          playerId: 1,
          rawCSV: missingData,
          source: services.SnapshotDataSource.CRYSTAL_MATH_LABS
        })
      ).rejects.toThrow('The CML API was updated. Please wait for a fix.');

      const excessiveData = globalData.cmlRawDataLT.split('\n').filter(r => r.length)[0] + ',1';

      await expect(
        services.buildSnapshot({
          playerId: 1,
          rawCSV: excessiveData,
          source: services.SnapshotDataSource.CRYSTAL_MATH_LABS
        })
      ).rejects.toThrow('The CML API was updated. Please wait for a fix.');
    });

    it('should create snapshot (Lynx Titan)', async () => {
      const data = globalData.cmlRawDataLT.split('\n').filter(r => r.length)[0];

      const snapshot: any = await services.buildSnapshot({
        playerId: 1,
        rawCSV: data,
        source: services.SnapshotDataSource.CRYSTAL_MATH_LABS
      });

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

      const snapshot: any = await services.buildSnapshot({
        playerId: 1,
        rawCSV: data,
        source: services.SnapshotDataSource.CRYSTAL_MATH_LABS
      });

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

      const snapshots = await Promise.all(
        cml.map(row => {
          return services.buildSnapshot({
            playerId: globalData.testPlayerId,
            rawCSV: row,
            source: services.SnapshotDataSource.CRYSTAL_MATH_LABS
          });
        })
      );

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
      expect(utils.hasChanged(null, globalData.snapshots[0])).toBe(true);
      expect(utils.hasChanged(globalData.snapshots[0], null)).toBe(false);
      // No changes between these
      expect(utils.hasChanged(globalData.snapshots[1], globalData.snapshots[0])).toBe(false);
      // Some changes between these
      expect(utils.hasChanged(globalData.snapshots[10], globalData.snapshots[0])).toBe(true);
      // EHP and EHB changed shouldn't count, as they can fluctuate without the player's envolvement
      const ehpChanged = { ...globalData.snapshots[0].toJSON(), ehpValue: 1, ehbValue: 1 };
      expect(utils.hasChanged(globalData.snapshots[0], ehpChanged)).toBe(false);
    });

    it('should detect negative gains between snapshots', () => {
      // No changes between these
      expect(utils.hasNegativeGains(globalData.snapshots[1], globalData.snapshots[0])).toBe(false);
      // Positive changes between these
      expect(utils.hasNegativeGains(globalData.snapshots[10], globalData.snapshots[0])).toBe(false);
      // Negative firemaking gains
      const negativeFiremaking = { ...globalData.snapshots[0].toJSON(), firemakingExperience: 1 };
      expect(utils.hasNegativeGains(globalData.snapshots[10], negativeFiremaking)).toBe(true);
      // Unranked farming exp., shouldn't count
      const unrankedFarming = { ...globalData.snapshots[0].toJSON(), farmingExperience: -1 };
      expect(utils.hasNegativeGains(globalData.snapshots[10], unrankedFarming)).toBe(false);
    });

    it('should detect excessive gains between snapshots', () => {
      // No changes between these
      expect(utils.hasExcessiveGains(globalData.snapshots[1], globalData.snapshots[0])).toBe(false);
      // Small changes between these
      expect(utils.hasExcessiveGains(globalData.snapshots[10], globalData.snapshots[0])).toBe(false);
      // Excessive changes between these
      const bigGains = { ...globalData.snapshots[0].toJSON(), runecraftingExperience: 200_000_000 };
      expect(utils.hasExcessiveGains(globalData.snapshots[10], bigGains)).toBe(true);
    });
  });

  describe('4 - Get Player Snapshots', () => {
    it('should not fetch latest snapshot (invalid player id)', async () => {
      await expect(services.findPlayerSnapshot({ id: null })).rejects.toThrow(
        "Parameter 'id' is not a valid number."
      );
    });

    it('should not fetch latest snapshot (player not found)', async () => {
      const result = await services.findPlayerSnapshot({ id: 2_000_000 });

      expect(result).toBe(null);
    });

    it('should fetch latest snapshot', async () => {
      const result = await services.findPlayerSnapshot({ id: globalData.testPlayerId });

      expect(result.createdAt.getTime() - Date.now()).toBeLessThan(365_000);
      expect(result.zulrahKills).toBe(1646);
    });

    it('should fetch latest snapshot (w/ max date)', async () => {
      const result = await services.findPlayerSnapshot({
        id: globalData.testPlayerId,
        maxDate: new Date('2018-11-01T18:00:00.000Z')
      });

      expect(result.createdAt.toISOString()).toBe('2018-11-01T17:27:44.000Z');
      expect(result.zulrahKills).toBe(-1);
    });

    it('should not fetch latest snapshot (invalid max date)', async () => {
      await expect(services.findPlayerSnapshot({ id: 1, maxDate: null })).rejects.toThrow(
        'Expected date, received null'
      );
    });

    it('should not fetch first snapshot since (invalid player id)', async () => {
      const startDate = new Date('2019-03-28T19:00:00.000Z');

      await expect(services.findPlayerSnapshot({ id: null, minDate: startDate })).rejects.toThrow(
        "Parameter 'id' is not a valid number."
      );
    });

    it('should not fetch first snapshot since (invalid date)', async () => {
      await expect(services.findPlayerSnapshot({ id: 1, minDate: null })).rejects.toThrow(
        'Expected date, received null'
      );
    });

    it('should fetch first snapshot since', async () => {
      const result = await services.findPlayerSnapshot({
        id: globalData.testPlayerId,
        minDate: new Date('2019-03-28T19:00:00.000Z')
      });

      expect(result.createdAt.toISOString()).toBe('2019-03-28T23:32:40.000Z');
    });

    it('should not fetch all (invalid player id)', async () => {
      await expect(services.findPlayerSnapshots({ id: null })).rejects.toThrow(
        "Parameter 'id' is not a valid number."
      );
    });

    it('should not fetch all (player not found)', async () => {
      const result = await services.findPlayerSnapshots({ id: 2_000_000 });

      expect(result.length).toBe(0);
    });

    it('should fetch all snapshots (high limit)', async () => {
      const result = await services.findPlayerSnapshots({ id: globalData.testPlayerId });

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
      const result = await services.findPlayerSnapshots({ id: globalData.testPlayerId, limit: 10 });

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

      await expect(
        services.findPlayerSnapshots({ id: undefined, minDate: startDate, maxDate: endDate })
      ).rejects.toThrow("Parameter 'id' is not a valid number.");
    });

    it('should not fetch snapshots between (invalid start date)', async () => {
      const endDate = new Date('2020-04-14T21:08:55.000Z');

      await expect(services.findPlayerSnapshots({ id: 1, minDate: null, maxDate: endDate })).rejects.toThrow(
        'Expected date, received null'
      );
    });

    it('should not fetch snapshots between (invalid end date)', async () => {
      const startDate = new Date('2019-07-03T21:13:56.000Z');

      await expect(
        services.findPlayerSnapshots({ id: 1, minDate: startDate, maxDate: null })
      ).rejects.toThrow('Expected date, received null');
    });

    it('should not fetch snapshots between (player not found)', async () => {
      const result = await services.findPlayerSnapshots({
        id: 2_000_000,
        minDate: new Date('2019-07-03T21:13:56.000Z'),
        maxDate: new Date('2020-04-14T21:08:55.000Z')
      });

      expect(result.length).toBe(0);
    });

    it('should not fetch snapshots between (min date greater than max date)', async () => {
      await expect(
        services.findPlayerSnapshots({
          id: 2_000_000,
          minDate: new Date('2020-04-14T21:08:55.000Z'),
          maxDate: new Date('2019-07-03T21:13:56.000Z')
        })
      ).rejects.toThrow();
    });

    it('should fetch snapshots between', async () => {
      const startDate = new Date('2019-07-03T21:13:56.000Z');
      const endDate = new Date('2020-04-14T21:08:55.000Z');

      const result = await services.findPlayerSnapshots({
        id: globalData.testPlayerId,
        minDate: startDate,
        maxDate: endDate
      });

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
      await expect(
        services.findPlayerSnapshots({ id: globalData.testPlayerId, period: 'idk' })
      ).rejects.toThrow('Invalid period: idk.');
    });

    it('should fetch period snapshots (common period)', async () => {
      const now = new Date();
      const results = await services.findPlayerSnapshots({ id: globalData.testPlayerId, period: 'week' });

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
      const results = await services.findPlayerSnapshots({ id: globalData.testPlayerId, period: '2w3d' });

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
    it('should not fetch (invalid group id and player ids)', async () => {
      await expect(services.findGroupSnapshots({})).rejects.toThrow();
    });

    it('should not fetch (group not found)', async () => {
      await expect(services.findGroupSnapshots({ groupId: 2_000_000 })).rejects.toThrow('Group not found.');
    });

    it('should not fetch (dates not provided)', async () => {
      // Create a test group
      const createGroupResponse = await api.post('/api/groups').send({
        name: 'Test Group',
        members: [{ username: 'Psikoi' }]
      });

      globalData.testGroupId = createGroupResponse.body.id;
      globalData.testGroupCode = createGroupResponse.body.verificationCode;

      await expect(
        services.findGroupSnapshots({ groupId: globalData.testGroupId, includeAllBetween: true })
      ).rejects.toThrow();
    });

    it('should fetch group snapshots between (group id)', async () => {
      // Add 30 secs to the previous fake timer, just to make sure this track request
      // is the last snapshot that gets added
      jest.useFakeTimers('modern').setSystemTime(new Date('2020-05-08T17:14:30.000Z'));

      const trackResponse = await api.post(`/api/players/track`).send({ username: 'jakesterwars' });
      expect(trackResponse.status).toBe(201);

      globalData.secondaryPlayerId = trackResponse.body.id;

      const addToGroupResponse = await api.post(`/api/groups/${globalData.testGroupId}/add-members`).send({
        verificationCode: globalData.testGroupCode,
        members: [{ username: 'jakesterwars' }]
      });
      expect(addToGroupResponse.status).toBe(200);

      // Reset the timers to the current (REAL) time
      jest.useRealTimers();

      const result = await services.findGroupSnapshots({
        groupId: globalData.testGroupId,
        includeAllBetween: true,
        minDate: new Date('2020-04-16T22:00:00.000Z'),
        maxDate: new Date('2021-04-14T21:08:55.000Z')
      });

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

    it('should fetch group snapshots between (player ids array)', async () => {
      const result = await services.findGroupSnapshots({
        playerIds: [globalData.testPlayerId, globalData.secondaryPlayerId],
        includeAllBetween: true,
        minDate: new Date('2020-04-16T22:00:00.000Z'),
        maxDate: new Date('2021-04-14T21:08:55.000Z')
      });

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

    it('should fetch group last snapshots (by group id)', async () => {
      const results = await services.findGroupSnapshots({
        groupId: globalData.testGroupId,
        maxDate: new Date()
      });

      expect(results.length).toBe(2);

      expect(results[0]).toMatchObject({
        playerId: globalData.testPlayerId,
        createdAt: new Date('2020-05-08T17:14:00.000Z')
      });

      expect(results[1]).toMatchObject({
        playerId: globalData.secondaryPlayerId,
        createdAt: new Date('2020-05-08T17:14:30.000Z')
      });
    });

    it('should fetch group last snapshots (by player id array)', async () => {
      const results = await services.findGroupSnapshots({
        playerIds: [globalData.testPlayerId, globalData.secondaryPlayerId],
        maxDate: new Date()
      });

      expect(results.length).toBe(2);

      expect(results[0]).toMatchObject({
        playerId: globalData.testPlayerId,
        createdAt: new Date('2020-05-08T17:14:00.000Z')
      });

      expect(results[1]).toMatchObject({
        playerId: globalData.secondaryPlayerId,
        createdAt: new Date('2020-05-08T17:14:30.000Z')
      });
    });

    it('should fetch group first snapshots (by group id)', async () => {
      const results = await services.findGroupSnapshots({
        groupId: globalData.testGroupId,
        minDate: new Date('2020-04-16T18:00:00.000Z')
      });

      expect(results.length).toBe(2);

      expect(results[0]).toMatchObject({
        playerId: globalData.testPlayerId,
        createdAt: new Date('2020-04-16T19:54:23.000Z')
      });

      expect(results[1]).toMatchObject({
        playerId: globalData.secondaryPlayerId,
        createdAt: new Date('2020-05-08T17:14:30.000Z')
      });
    });

    it('should fetch group first snapshots (by player id array)', async () => {
      const results = await services.findGroupSnapshots({
        playerIds: [globalData.testPlayerId, globalData.secondaryPlayerId],
        minDate: new Date('2020-04-16T18:00:00.000Z')
      });

      expect(results.length).toBe(2);

      expect(results[0]).toMatchObject({
        playerId: globalData.testPlayerId,
        createdAt: new Date('2020-04-16T19:54:23.000Z')
      });

      expect(results[1]).toMatchObject({
        playerId: globalData.secondaryPlayerId,
        createdAt: new Date('2020-05-08T17:14:30.000Z')
      });
    });
  });
});
