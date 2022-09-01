import axios from 'axios';
import supertest from 'supertest';
import MockAdapter from 'axios-mock-adapter';
import env from '../../../src/env';
import apiServer from '../../../src/api';
import { BOSSES, Metric, PlayerType } from '../../../src/utils';
import {
  registerCMLMock,
  registerHiscoresMock,
  resetDatabase,
  readFile,
  modifyRawHiscoresData,
  sleep,
  resetRedis
} from '../../utils';
import * as playerServices from '../../../src/api/modules/players/player.services';
import * as playerUtils from '../../../src/api/modules/players/player.utils';
import { EVENT_REGISTRY } from '../../../src/api/event-dispatcher';

const api = supertest(apiServer);
const axiosMock = new MockAdapter(axios, { onNoMatch: 'passthrough' });

const CML_FILE_PATH = `${__dirname}/../../data/cml/psikoi_cml.txt`;
const HISCORES_FILE_PATH = `${__dirname}/../../data/hiscores/psikoi_hiscores.txt`;

const globalData = {
  testPlayerId: -1,
  cmlRawData: '',
  hiscoresRawData: ''
};

beforeEach(() => {
  EVENT_REGISTRY.splice(0, EVENT_REGISTRY.length);
});

beforeAll(async done => {
  await resetDatabase();
  await resetRedis();

  globalData.cmlRawData = await readFile(CML_FILE_PATH);
  globalData.hiscoresRawData = await readFile(HISCORES_FILE_PATH);

  // Mock the history fetch from CML to always fail with a 404 status code
  registerCMLMock(axiosMock, 404);

  // Mock regular hiscores data, and block any ironman requests
  registerHiscoresMock(axiosMock, {
    [PlayerType.REGULAR]: { statusCode: 200, rawData: globalData.hiscoresRawData },
    [PlayerType.IRONMAN]: { statusCode: 404 }
  });

  done();
});

afterAll(() => {
  axiosMock.reset();
});

describe('Player API', () => {
  describe('1. Tracking', () => {
    it('should not track player (invalid characters)', async () => {
      const response = await api.post(`/players/wow$~#`);

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(
        'Validation error: Username cannot contain any special characters'
      );

      expect(EVENT_REGISTRY.filter(e => e.type === 'PLAYER_UPDATED').length).toBe(0);
    });

    it('should not track player (lengthy username)', async () => {
      const response = await api.post(`/players/ALongUsername`);

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Validation error: Username must be between');

      expect(EVENT_REGISTRY.filter(e => e.type === 'PLAYER_UPDATED').length).toBe(0);
    });

    it('should not track player (hiscores failed)', async () => {
      // Mock the hiscores to fail
      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 500, rawData: '' }
      });

      const response = await api.post(`/players/hydroman`);

      expect(response.status).toBe(500);
      expect(response.body.message).toMatch('Failed to load hiscores: Connection refused.');

      expect(EVENT_REGISTRY.filter(e => e.type === 'PLAYER_UPDATED').length).toBe(0);

      // Mock regular hiscores data, and block any ironman requests
      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: globalData.hiscoresRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });
    });

    it('should track player', async () => {
      const response = await api.post(`/players/ PSIKOI_ `);

      expect(response.status).toBe(201);

      expect(response.body).toMatchObject({
        username: 'psikoi',
        displayName: 'PSIKOI',
        build: 'main',
        type: 'regular',
        lastImportedAt: null
      });

      expect(EVENT_REGISTRY.filter(e => e.type === 'PLAYER_UPDATED').length).toBe(1);
      expect(EVENT_REGISTRY.filter(e => e.type === 'PLAYER_UPDATED')[0]).toMatchObject({
        type: 'PLAYER_UPDATED',
        payload: {
          hasChanged: true,
          player: { username: 'psikoi' },
          snapshot: { playerId: response.body.id }
        }
      });

      expect(new Date(response.body.updatedAt).getTime()).toBeGreaterThan(Date.now() - 1000); // updated under a second ago
      expect(new Date(response.body.registeredAt).getTime()).toBeGreaterThan(Date.now() - 1000); // registered under a second ago
      expect(new Date(response.body.lastChangedAt).getTime()).toBeGreaterThan(Date.now() - 1000); // changed under a second ago

      expect(response.body.latestSnapshot).not.toBeNull();

      expect(response.body.ehp).toBe(response.body.latestSnapshot.data.virtuals.ehp.value);
      expect(response.body.ehb).toBe(response.body.latestSnapshot.data.virtuals.ehb.value);

      // Track again, stats shouldn't have changed
      await api.post(`/players/ PSIKOI_ `);

      expect(EVENT_REGISTRY.filter(e => e.type === 'PLAYER_UPDATED').length).toBe(2);
      expect(EVENT_REGISTRY.filter(e => e.type === 'PLAYER_UPDATED')[1]).toMatchObject({
        type: 'PLAYER_UPDATED',
        payload: {
          hasChanged: false,
          player: { username: 'psikoi' },
          snapshot: { playerId: response.body.id }
        }
      });

      globalData.testPlayerId = response.body.id;
    });

    it('should track player (1 def)', async () => {
      const data1Def = modifyRawHiscoresData(globalData.hiscoresRawData, [
        { metric: Metric.DEFENCE, value: 0 } // 1 defence
      ]);

      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: data1Def },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      const responseDef1 = await api.post(`/players/def1`);

      expect(responseDef1.status).toBe(201);
      expect(responseDef1.body.build).toBe('def1');

      expect(EVENT_REGISTRY.filter(e => e.type === 'PLAYER_UPDATED').length).toBe(1);
      expect(EVENT_REGISTRY.filter(e => e.type === 'PLAYER_UPDATED')[0]).toMatchObject({
        type: 'PLAYER_UPDATED',
        payload: {
          hasChanged: true,
          player: { username: 'def1' },
          snapshot: { playerId: responseDef1.body.id, defenceExperience: 0 }
        }
      });
    });

    it('should track player (zerker)', async () => {
      const dataZerker = modifyRawHiscoresData(globalData.hiscoresRawData, [
        { metric: Metric.DEFENCE, value: 61_512 } // 45 defence
      ]);

      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: dataZerker },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      const responseZerker = await api.post(`/players/zerker`);

      expect(responseZerker.status).toBe(201);
      expect(responseZerker.body.build).toBe('zerker');

      expect(EVENT_REGISTRY.filter(e => e.type === 'PLAYER_UPDATED').length).toBe(1);
      expect(EVENT_REGISTRY.filter(e => e.type === 'PLAYER_UPDATED')[0]).toMatchObject({
        type: 'PLAYER_UPDATED',
        payload: {
          hasChanged: true,
          player: { username: 'zerker' },
          snapshot: { playerId: responseZerker.body.id, defenceExperience: 61_512 }
        }
      });
    });

    it('should track player (10hp)', async () => {
      const data10HP = modifyRawHiscoresData(globalData.hiscoresRawData, [
        { metric: Metric.HITPOINTS, value: 1154 } // 10 Hitpoints
      ]);

      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: data10HP },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      const response10HP = await api.post(`/players/hp10`);

      expect(response10HP.status).toBe(201);
      expect(response10HP.body.build).toBe('hp10');

      expect(EVENT_REGISTRY.filter(e => e.type === 'PLAYER_UPDATED').length).toBe(1);
      expect(EVENT_REGISTRY.filter(e => e.type === 'PLAYER_UPDATED')[0]).toMatchObject({
        type: 'PLAYER_UPDATED',
        payload: {
          hasChanged: true,
          player: { username: 'hp10' },
          snapshot: { playerId: response10HP.body.id, hitpointsExperience: 1154 }
        }
      });
    });

    it('should track player (lvl3)', async () => {
      const dataLvl3 = modifyRawHiscoresData(globalData.hiscoresRawData, [
        { metric: Metric.ATTACK, value: 0 },
        { metric: Metric.STRENGTH, value: 0 },
        { metric: Metric.DEFENCE, value: 0 },
        { metric: Metric.HITPOINTS, value: 1154 },
        { metric: Metric.PRAYER, value: 0 },
        { metric: Metric.RANGED, value: 0 },
        { metric: Metric.MAGIC, value: 0 }
      ]);

      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: dataLvl3 },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      const responseLvl3 = await api.post(`/players/lvl3`);

      expect(responseLvl3.status).toBe(201);
      expect(responseLvl3.body.build).toBe('lvl3');

      expect(EVENT_REGISTRY.filter(e => e.type === 'PLAYER_UPDATED').length).toBe(1);
      expect(EVENT_REGISTRY.filter(e => e.type === 'PLAYER_UPDATED')[0]).toMatchObject({
        type: 'PLAYER_UPDATED',
        payload: {
          hasChanged: true,
          player: { username: 'lvl3' },
          snapshot: { playerId: responseLvl3.body.id, hitpointsExperience: 1154, prayerExperience: 0 }
        }
      });
    });

    it('should track player (f2p)', async () => {
      const dataF2P = modifyRawHiscoresData(globalData.hiscoresRawData, [
        { metric: Metric.AGILITY, value: 0 },
        { metric: Metric.CONSTRUCTION, value: 0 },
        { metric: Metric.FARMING, value: 0 },
        { metric: Metric.FLETCHING, value: 0 },
        { metric: Metric.HERBLORE, value: 0 },
        { metric: Metric.HUNTER, value: 0 },
        { metric: Metric.THIEVING, value: 0 },
        { metric: Metric.SLAYER, value: 0 },
        ...BOSSES.map(b => ({ metric: b, value: 0 })),
        { metric: Metric.BRYOPHYTA, value: 10 },
        { metric: Metric.OBOR, value: 10 }
      ]);

      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: dataF2P },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      const responseF2P = await api.post(`/players/f2p`);

      expect(responseF2P.status).toBe(201);
      expect(responseF2P.body.build).toBe('f2p');

      expect(EVENT_REGISTRY.filter(e => e.type === 'PLAYER_UPDATED').length).toBe(1);
      expect(EVENT_REGISTRY.filter(e => e.type === 'PLAYER_UPDATED')[0]).toMatchObject({
        type: 'PLAYER_UPDATED',
        payload: {
          hasChanged: true,
          player: { username: 'f2p' },
          snapshot: { playerId: responseF2P.body.id, bryophytaKills: 10, agilityExperience: 0 }
        }
      });
    });

    it('should track player (ironman)', async () => {
      // Mock the hiscores to mark the next tracked player as a regular ironman
      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: globalData.hiscoresRawData },
        [PlayerType.IRONMAN]: { statusCode: 200, rawData: globalData.hiscoresRawData },
        [PlayerType.HARDCORE]: { statusCode: 404 },
        [PlayerType.ULTIMATE]: { statusCode: 404 }
      });

      const response = await api.post(`/players/Hydrox6`);

      expect(response.status).toBe(201);

      expect(response.body).toMatchObject({
        username: 'hydrox6',
        displayName: 'Hydrox6',
        build: 'main',
        type: 'ironman'
      });

      expect(response.body.latestSnapshot).not.toBeNull();

      expect(EVENT_REGISTRY.filter(e => e.type === 'PLAYER_UPDATED').length).toBe(1);
      expect(EVENT_REGISTRY.filter(e => e.type === 'PLAYER_UPDATED')[0]).toMatchObject({
        type: 'PLAYER_UPDATED',
        payload: {
          hasChanged: true,
          player: { username: 'hydrox6', type: 'ironman' },
          snapshot: { playerId: response.body.id }
        }
      });

      // Revert the hiscores mocking back to "regular" player type
      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: globalData.hiscoresRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });
    });

    it('should not track player (too soon)', async () => {
      // This cooldown is set to 0 during testing by default
      playerUtils.setUpdateCooldown(60);

      const response = await api.post(`/players/hydrox6`);

      expect(response.status).toBe(429);
      expect(response.body.message).toMatch('Error: hydrox6 has been updated recently.');

      playerUtils.setUpdateCooldown(0);
    });

    it('should not track player (excessive gains)', async () => {
      const modifiedRawData = modifyRawHiscoresData(globalData.hiscoresRawData, [
        { metric: Metric.RUNECRAFTING, value: 100_000_000 } // player jumps to 100m RC exp
      ]);

      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      const response = await api.post(`/players/psikoi`);

      expect(response.status).toBe(500);
      expect(response.body.message).toMatch('Failed to update: Unregistered name change.');
    });

    it('should not track player (negative gains)', async () => {
      const modifiedRawData = modifyRawHiscoresData(globalData.hiscoresRawData, [
        { metric: Metric.RUNECRAFTING, value: 100_000 } // player's RC exp goes down to 100k
      ]);

      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      const response = await api.post(`/players/psikoi`);

      expect(response.status).toBe(500);
      expect(response.body.message).toMatch('Failed to update: Unregistered name change.');
    });

    it('should track player (new gains)', async () => {
      const modifiedRawData = modifyRawHiscoresData(globalData.hiscoresRawData, [
        { metric: Metric.ZULRAH, value: 1646 + 7 }, // player gains 7 zulrah kc
        { metric: Metric.SMITHING, value: 6_177_978 + 1337 } // player gains 1337 smithing exp
      ]);

      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      const response = await api.post(`/players/psikoi`);

      expect(response.status).toBe(200);
      expect(response.body.lastChangedAt).not.toBeNull();
      expect(new Date(response.body.lastChangedAt).getTime()).toBeGreaterThan(Date.now() - 1000); // changed under a second ago
    });
  });

  describe('2. Importing', () => {
    it('should not import player (player not found)', async () => {
      const response = await api.post(`/players/zezima/import-history`);

      expect(response.status).toBe(404);
      expect(response.body.message).toMatch('Player not found.');

      expect(EVENT_REGISTRY.filter(e => e.type === 'PLAYER_HISTORY_IMPORTED').length).toBe(0);
    });

    it('should not import player (CML failed)', async () => {
      // Mock the history fetch from CML
      registerCMLMock(axiosMock, 404);

      const response = await api.post(`/players/psikoi/import-history`);

      expect(response.status).toBe(500);
      expect(response.body.message).toMatch('Failed to load history from CML.');

      expect(EVENT_REGISTRY.filter(e => e.type === 'PLAYER_HISTORY_IMPORTED').length).toBe(0);
    });

    it('should import player', async () => {
      // Wait a second to ensure every previous track request fails to import
      await sleep(1000);

      // Setup the CML request to return our mock raw data
      registerCMLMock(axiosMock, 200, globalData.cmlRawData);

      const importResponse = await api.post(`/players/psikoi/import-history`);
      expect(importResponse.status).toBe(200);
      expect(importResponse.body).toMatchObject({
        count: 219,
        message: 'Sucessfully imported 219 snapshots from CML.'
      });

      expect(EVENT_REGISTRY.filter(e => e.type === 'PLAYER_HISTORY_IMPORTED').length).toBe(1);
      expect(EVENT_REGISTRY.filter(e => e.type === 'PLAYER_HISTORY_IMPORTED')[0]).toMatchObject({
        type: 'PLAYER_HISTORY_IMPORTED'
      });

      const detailsResponse = await api.get(`/players/psikoi`);
      expect(detailsResponse.status).toBe(200);
      expect(detailsResponse.body.lastImportedAt).not.toBeNull();

      const snapshotsResponse = await api.get(`/players/psikoi/snapshots`).query({
        startDate: new Date('2010-01-01'),
        endDate: new Date('2030-01-01')
      });

      expect(snapshotsResponse.status).toBe(200);
      expect(snapshotsResponse.body.length).toBe(222); // 219 imported, 3 tracked (during this test session)
      expect(snapshotsResponse.body.filter(s => s.importedAt !== null).length).toBe(219);
      expect(
        snapshotsResponse.body.filter(
          s => s.importedAt !== null && new Date(s.createdAt) > new Date('2020-05-10')
        ).length
      ).toBe(0); // there should be no imported snapshots from AFTER May 10th 2020

      // Mock the history fetch from CML
      registerCMLMock(axiosMock, 404);
    });

    it('should not import player (too soon)', async () => {
      // Setup the CML request to return our mock raw data
      registerCMLMock(axiosMock, 200, globalData.cmlRawData);

      const importResponse = await api.post(`/players/psikoi/import-history`);
      expect(importResponse.status).toBe(429);
      expect(importResponse.body.message).toMatch('Imported too soon, please wait');

      expect(EVENT_REGISTRY.filter(e => e.type === 'PLAYER_HISTORY_IMPORTED').length).toBe(0);

      // Mock the history fetch from CML
      registerCMLMock(axiosMock, 404);
    });
  });

  describe('3. Searching', () => {
    it('should not search players (undefined username)', async () => {
      const response = await api.get('/players/search').query({});

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'username' is undefined.");
    });

    it('should not search players (empty username)', async () => {
      const response = await api.get('/players/search').query({ username: '' });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'username' is undefined.");
    });

    it('should not search players (negative pagination limit)', async () => {
      const response = await api.get(`/players/search`).query({ username: 'hydro', limit: -5 });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'limit' must be > 0.");
    });

    it('should not search players (negative pagination offset)', async () => {
      const response = await api.get(`/players/search`).query({ username: 'hydro', offset: -5 });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'offset' must be >= 0.");
    });

    it('should search players (partial username w/ offset)', async () => {
      const firstResponse = await api.get('/players/search').query({ username: 'HYDRO' });

      expect(firstResponse.status).toBe(200);
      expect(firstResponse.body.length).toBe(2);

      expect(firstResponse.body[0]).toMatchObject({
        username: 'hydrox6',
        type: 'ironman'
      });

      expect(firstResponse.body[1]).toMatchObject({
        username: 'hydroman',
        type: 'unknown'
      });

      const secondResponse = await api.get('/players/search').query({ username: 'HYDRO', offset: 1 });

      expect(secondResponse.status).toBe(200);
      expect(secondResponse.body.length).toBe(1);

      expect(secondResponse.body[0]).toMatchObject({
        username: 'hydroman',
        type: 'unknown'
      });
    });

    it('should search players (unknown partial username)', async () => {
      const response = await api.get('/players/search').query({ username: 'zez' });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(0);
    });
  });

  describe('4. Viewing', () => {
    it('should not view player details (player not found)', async () => {
      const response = await api.get('/players/zezima');

      expect(response.status).toBe(404);
      expect(response.body.message).toMatch('Player not found.');
    });

    it('should view player details', async () => {
      const response = await api.get('/players/PsiKOI');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        username: 'psikoi',
        displayName: 'PSIKOI',
        type: 'regular',
        build: 'main'
      });
      expect(response.body.latestSnapshot).not.toBeNull();
    });
  });

  describe('5. Type Assertion', () => {
    it('should not assert player type (player not found)', async () => {
      const response = await api.post(`/players/zezima/assert-type`);

      expect(response.status).toBe(404);
      expect(response.body.message).toMatch('Player not found.');

      expect(EVENT_REGISTRY.filter(e => e.type === 'PLAYER_TYPE_CHANGED').length).toBe(0);
    });

    it('should not assert player type (player is flagged)', async () => {
      const modifiedRawData = modifyRawHiscoresData(globalData.hiscoresRawData, [
        { metric: Metric.ZULRAH, value: 100 } // player's zulrah kc drops below current kc
      ]);

      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      const trackResponse = await api.post(`/players/psikoi`);

      expect(trackResponse.status).toBe(500);
      expect(trackResponse.body.message).toMatch('Failed to update: Unregistered name change.');

      const detailsResponse = await api.get('/players/PsiKOI');

      expect(detailsResponse.status).toBe(200);
      expect(detailsResponse.body.flagged).toBe(true);

      const assertTypeResponse = await api.post(`/players/psikoi/assert-type`);

      expect(assertTypeResponse.status).toBe(400);
      expect(assertTypeResponse.body.message).toMatch('Type Assertion Not Allowed: Player is Flagged.');

      expect(EVENT_REGISTRY.filter(e => e.type === 'PLAYER_TYPE_CHANGED').length).toBe(0);
    });

    it('should assert player type (regular)', async () => {
      const modifiedRawData = modifyRawHiscoresData(globalData.hiscoresRawData, [
        { metric: Metric.ZULRAH, value: 1646 + 7 }, // restore the zulrah kc,
        { metric: Metric.SMITHING, value: 6_177_978 + 1337 } // restore the smithing exp
      ]);

      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      // Unflag the player
      const trackResponse = await api.post(`/players/psikoi`);
      expect(trackResponse.status).toBe(200);
      expect(trackResponse.body.flagged).toBe(false);

      // Mock regular hiscores data, and block any ironman requests
      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: globalData.hiscoresRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      const response = await api.post(`/players/psikoi/assert-type`);

      expect(response.status).toBe(200);
      expect(response.body.changed).toBe(false);
      expect(response.body.player).toMatchObject({ username: 'psikoi', type: 'regular' });

      // No type changes happened = no type change events were dispatched
      expect(EVENT_REGISTRY.filter(e => e.type === 'PLAYER_TYPE_CHANGED').length).toBe(0);
    });

    it('should assert player type (regular -> ultimate)', async () => {
      // Mock regular hiscores data, and block any ironman requests
      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: globalData.hiscoresRawData },
        [PlayerType.IRONMAN]: { statusCode: 200, rawData: globalData.hiscoresRawData },
        [PlayerType.ULTIMATE]: { statusCode: 200, rawData: globalData.hiscoresRawData },
        [PlayerType.HARDCORE]: { statusCode: 404 }
      });

      const assertTypeResponse = await api.post(`/players/psikoi/assert-type`);

      expect(assertTypeResponse.status).toBe(200);
      expect(assertTypeResponse.body.changed).toBe(true);
      expect(assertTypeResponse.body.player).toMatchObject({ username: 'psikoi', type: 'ultimate' });

      const detailsResponse = await api.get('/players/PsiKOI');

      expect(detailsResponse.status).toBe(200);
      expect(detailsResponse.body.type).toBe('ultimate');

      expect(EVENT_REGISTRY.filter(e => e.type === 'PLAYER_TYPE_CHANGED').length).toBe(1);
      expect(EVENT_REGISTRY.filter(e => e.type === 'PLAYER_TYPE_CHANGED')[0]).toMatchObject({
        type: 'PLAYER_TYPE_CHANGED',
        payload: {
          player: { username: 'psikoi', type: 'ultimate' },
          previousType: 'regular'
        }
      });
    });
  });

  describe('6. Updating Country', () => {
    it('should not update player country (invalid admin password)', async () => {
      const response = await api.put(`/players/psikoi/country`).send({ country: 'PT' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Required parameter 'adminPassword' is undefined.");
    });

    it('should not update player country (incorrect admin password)', async () => {
      const response = await api.put(`/players/psikoi/country`).send({ country: 'PT', adminPassword: 'abc' });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Incorrect admin password.');
    });

    it('should not update player country (undefined country)', async () => {
      const response = await api.put(`/players/psikoi/country`).send({ adminPassword: env.ADMIN_PASSWORD });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Parameter 'country' is undefined.");
    });

    it('should not update player country (empty country)', async () => {
      const response = await api
        .put(`/players/psikoi/country`)
        .send({ country: '', adminPassword: env.ADMIN_PASSWORD });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Parameter 'country' is undefined.");
    });

    it('should not update player country (player not found)', async () => {
      const response = await api
        .put(`/players/zezima/country`)
        .send({ country: 'PT', adminPassword: env.ADMIN_PASSWORD });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Player not found.');
    });

    it('should not update player country (invalid country)', async () => {
      const response = await api
        .put(`/players/PSIKOI/country`)
        .send({ country: 'XX', adminPassword: env.ADMIN_PASSWORD });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Invalid country.');
    });

    it('should update player country', async () => {
      const updateCountryResponse = await api
        .put(`/players/PSIKOI/country`)
        .send({ country: 'pt', adminPassword: env.ADMIN_PASSWORD });

      expect(updateCountryResponse.status).toBe(200);

      expect(updateCountryResponse.body).toMatchObject({
        username: 'psikoi',
        country: 'PT'
      });

      const detailsResponse = await api.get('/players/PsiKOI');

      expect(detailsResponse.status).toBe(200);
      expect(detailsResponse.body.username).toBe('psikoi');
      expect(detailsResponse.body.country).toBe('PT');
    });
  });

  describe('7. Deleting', () => {
    it('should not delete player (invalid admin password)', async () => {
      const response = await api.delete(`/players/psikoi`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Required parameter 'adminPassword' is undefined.");
    });

    it('should not delete player (incorrect admin password)', async () => {
      const response = await api.delete(`/players/psikoi`).send({ adminPassword: 'abc' });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Incorrect admin password.');
    });

    it('should not delete player (player not found)', async () => {
      const response = await api.delete(`/players/zezima`).send({ adminPassword: env.ADMIN_PASSWORD });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Player not found.');
    });

    it('should delete player', async () => {
      const deletePlayerResponse = await api
        .delete(`/players/psikoi`)
        .send({ adminPassword: env.ADMIN_PASSWORD });

      expect(deletePlayerResponse.status).toBe(200);
      expect(deletePlayerResponse.body.message).toMatch('Successfully deleted player: PSIKOI');

      const detailsResponse = await api.get('/players/PsiKOI');

      expect(detailsResponse.status).toBe(404);
      expect(detailsResponse.body.message).toBe('Player not found.');
    });
  });

  describe('8. Player Utils', () => {
    it('should sanitize usernames', () => {
      expect(playerUtils.sanitize('PSIKOI')).toBe('PSIKOI');
      expect(playerUtils.sanitize(' PSIKOI_')).toBe('PSIKOI');
      expect(playerUtils.sanitize('___psikoi  ')).toBe('psikoi');
    });

    it('should standardize usernames', () => {
      expect(playerUtils.standardize('HELLO WORLD')).toBe('hello world');
      expect(playerUtils.standardize(' HELLO   WORLD_')).toBe('hello   world');
      expect(playerUtils.standardize('___hello_WORLD123  ')).toBe('hello world123');
    });

    it('should check for username validity', () => {
      expect(playerUtils.isValidUsername('')).toBe(false);
      expect(playerUtils.isValidUsername('aLongUsername')).toBe(false);
      expect(playerUtils.isValidUsername('hello$#%')).toBe(false);
      expect(playerUtils.isValidUsername('HELLO WORLD')).toBe(true);
      expect(playerUtils.isValidUsername(' HELLO WORLD_')).toBe(true);
      expect(playerUtils.isValidUsername('___hello_WORLD  ')).toBe(true);
    });

    it('should find all players or create', async () => {
      const existingPlayers = await playerServices.findPlayers({
        usernames: ['PSIKOI', 'hydrox6', 'hydroman'],
        createIfNotFound: true
      });

      expect(existingPlayers.length).toBe(3);

      expect(existingPlayers[0].username).toBe('psikoi');
      expect(existingPlayers[1].username).toBe('hydrox6');
      expect(existingPlayers[2].username).toBe('hydroman');

      const oneNewPlayer = await playerServices.findPlayers({
        usernames: ['PSIKOI', '_hydrox6 ', 'hydroman', 'Zezima'],
        createIfNotFound: true
      });

      expect(oneNewPlayer.length).toBe(4);

      expect(oneNewPlayer[0].username).toBe('psikoi');
      expect(oneNewPlayer[1].username).toBe('hydrox6');
      expect(oneNewPlayer[2].username).toBe('hydroman');
      expect(oneNewPlayer[3].username).toBe('zezima');

      const [player, isNew] = await playerServices.findPlayer({ username: 'zezima' });

      expect(isNew).toBe(false);
      expect(player).not.toBeNull();
      expect(player.username).toBe('zezima');
      expect(player.displayName).toBe('Zezima');
    });
  });
});
