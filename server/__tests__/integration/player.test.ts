import axios from 'axios';
import supertest from 'supertest';
import MockAdapter from 'axios-mock-adapter';
import { BOSSES, Metrics } from '@wise-old-man/utils';
import env from '../../src/env';
import apiServer from '../../src/api';
import { PlayerTypeEnum } from '../../src/prisma';
import {
  registerCMLMock,
  registerHiscoresMock,
  resetDatabase,
  readFile,
  modifyRawHiscoresData,
  sleep
} from '../utils';
import * as playerServices from '../../src/api/modules/players/player.services';
import * as playerUtils from '../../src/api/modules/players/player.utils';

const api = supertest(apiServer);
const axiosMock = new MockAdapter(axios, { onNoMatch: 'passthrough' });

const CML_FILE_PATH = `${__dirname}/../data/cml/psikoi_cml.txt`;
const HISCORES_FILE_PATH = `${__dirname}/../data/hiscores/psikoi_hiscores.txt`;

const globalData = {
  testPlayerId: -1,
  cmlRawData: '',
  hiscoresRawData: ''
};

beforeAll(async done => {
  await resetDatabase();

  globalData.cmlRawData = await readFile(CML_FILE_PATH);
  globalData.hiscoresRawData = await readFile(HISCORES_FILE_PATH);

  // Mock the history fetch from CML to always fail with a 404 status code
  registerCMLMock(axiosMock, 404);

  // Mock regular hiscores data, and block any ironman requests
  registerHiscoresMock(axiosMock, {
    [PlayerTypeEnum.REGULAR]: { statusCode: 200, rawData: globalData.hiscoresRawData },
    [PlayerTypeEnum.IRONMAN]: { statusCode: 404 }
  });

  done();
});

afterAll(async done => {
  axiosMock.reset();
  done();
});

describe('Player API', () => {
  describe('1. Tracking', () => {
    it('should not track player (undefined username)', async () => {
      const response = await api.post(`/api/players/track`).send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'username' is undefined.");
    });

    it('should not track player (empty username)', async () => {
      const response = await api.post(`/api/players/track`).send({ username: '' });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'username' is undefined.");
    });

    it('should not track player (invalid characters)', async () => {
      const response = await api.post(`/api/players/track`).send({ username: 'wow$%#' });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(
        'Validation error: Username cannot contain any special characters'
      );
    });

    it('should not track player (lengthy username)', async () => {
      const response = await api.post(`/api/players/track`).send({ username: 'ALongUsername' });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Validation error: Username must be between');
    });

    it('should not track player (hiscores failed)', async () => {
      // Mock the hiscores to fail
      registerHiscoresMock(axiosMock, {
        [PlayerTypeEnum.REGULAR]: { statusCode: 500, rawData: '' }
      });

      const response = await api.post(`/api/players/track`).send({ username: 'hydroman' });

      expect(response.status).toBe(500);
      expect(response.body.message).toMatch('Failed to load hiscores: Connection refused.');

      // Mock regular hiscores data, and block any ironman requests
      registerHiscoresMock(axiosMock, {
        [PlayerTypeEnum.REGULAR]: { statusCode: 200, rawData: globalData.hiscoresRawData },
        [PlayerTypeEnum.IRONMAN]: { statusCode: 404 }
      });
    });

    it('should track player', async () => {
      const response = await api.post(`/api/players/track`).send({ username: ' PSIKOI_ ' });

      expect(response.status).toBe(201);

      expect(response.body).toMatchObject({
        username: 'psikoi',
        displayName: 'PSIKOI',
        build: 'main',
        type: 'regular',
        lastImportedAt: null
      });

      expect(new Date(response.body.updatedAt).getTime()).toBeGreaterThan(Date.now() - 1000); // updated under a second ago
      expect(new Date(response.body.registeredAt).getTime()).toBeGreaterThan(Date.now() - 1000); // registered under a second ago
      expect(new Date(response.body.lastChangedAt).getTime()).toBeGreaterThan(Date.now() - 1000); // changed under a second ago

      expect(response.body.latestSnapshot).not.toBeNull();

      globalData.testPlayerId = response.body.id;
    });

    it('should track player (1 def)', async () => {
      const data1Def = modifyRawHiscoresData(globalData.hiscoresRawData, [
        { metric: Metrics.DEFENCE, value: 0 } // 1 defence
      ]);

      registerHiscoresMock(axiosMock, {
        [PlayerTypeEnum.REGULAR]: { statusCode: 200, rawData: data1Def },
        [PlayerTypeEnum.IRONMAN]: { statusCode: 404 }
      });

      const responseDef1 = await api.post(`/api/players/track`).send({ username: 'def1' });

      expect(responseDef1.status).toBe(201);
      expect(responseDef1.body.build).toBe('def1');
    });

    it('should track player (zerker)', async () => {
      const dataZerker = modifyRawHiscoresData(globalData.hiscoresRawData, [
        { metric: Metrics.DEFENCE, value: 61_512 } // 45 defence
      ]);

      registerHiscoresMock(axiosMock, {
        [PlayerTypeEnum.REGULAR]: { statusCode: 200, rawData: dataZerker },
        [PlayerTypeEnum.IRONMAN]: { statusCode: 404 }
      });

      const responseZerker = await api.post(`/api/players/track`).send({ username: 'zerker' });

      expect(responseZerker.status).toBe(201);
      expect(responseZerker.body.build).toBe('zerker');
    });

    it('should track player (10hp)', async () => {
      const data10HP = modifyRawHiscoresData(globalData.hiscoresRawData, [
        { metric: Metrics.HITPOINTS, value: 1154 } // 10 Hitpoints
      ]);

      registerHiscoresMock(axiosMock, {
        [PlayerTypeEnum.REGULAR]: { statusCode: 200, rawData: data10HP },
        [PlayerTypeEnum.IRONMAN]: { statusCode: 404 }
      });

      const response10HP = await api.post(`/api/players/track`).send({ username: 'hp10' });

      expect(response10HP.status).toBe(201);
      expect(response10HP.body.build).toBe('hp10');
    });

    it('should track player (lvl3)', async () => {
      const dataLvl3 = modifyRawHiscoresData(globalData.hiscoresRawData, [
        { metric: Metrics.ATTACK, value: 0 },
        { metric: Metrics.STRENGTH, value: 0 },
        { metric: Metrics.DEFENCE, value: 0 },
        { metric: Metrics.HITPOINTS, value: 1154 },
        { metric: Metrics.PRAYER, value: 0 },
        { metric: Metrics.RANGED, value: 0 },
        { metric: Metrics.MAGIC, value: 0 }
      ]);

      registerHiscoresMock(axiosMock, {
        [PlayerTypeEnum.REGULAR]: { statusCode: 200, rawData: dataLvl3 },
        [PlayerTypeEnum.IRONMAN]: { statusCode: 404 }
      });

      const responseLvl3 = await api.post(`/api/players/track`).send({ username: 'lvl3' });

      expect(responseLvl3.status).toBe(201);
      expect(responseLvl3.body.build).toBe('lvl3');
    });

    it('should track player (f2p)', async () => {
      const dataF2P = modifyRawHiscoresData(globalData.hiscoresRawData, [
        { metric: Metrics.AGILITY, value: 0 },
        { metric: Metrics.CONSTRUCTION, value: 0 },
        { metric: Metrics.FARMING, value: 0 },
        { metric: Metrics.FLETCHING, value: 0 },
        { metric: Metrics.HERBLORE, value: 0 },
        { metric: Metrics.HUNTER, value: 0 },
        { metric: Metrics.THIEVING, value: 0 },
        { metric: Metrics.SLAYER, value: 0 },
        ...BOSSES.map(b => ({ metric: b, value: 0 })),
        { metric: Metrics.BRYOPHYTA, value: 10 },
        { metric: Metrics.OBOR, value: 10 }
      ]);

      registerHiscoresMock(axiosMock, {
        [PlayerTypeEnum.REGULAR]: { statusCode: 200, rawData: dataF2P },
        [PlayerTypeEnum.IRONMAN]: { statusCode: 404 }
      });

      const responseF2P = await api.post(`/api/players/track`).send({ username: 'f2p' });

      expect(responseF2P.status).toBe(201);
      expect(responseF2P.body.build).toBe('f2p');
    });

    it('should track player (ironman)', async () => {
      // Mock the hiscores to mark the next tracked player as a regular ironman
      registerHiscoresMock(axiosMock, {
        [PlayerTypeEnum.REGULAR]: { statusCode: 200, rawData: globalData.hiscoresRawData },
        [PlayerTypeEnum.IRONMAN]: { statusCode: 200, rawData: globalData.hiscoresRawData },
        [PlayerTypeEnum.HARDCORE]: { statusCode: 404 },
        [PlayerTypeEnum.ULTIMATE]: { statusCode: 404 }
      });

      const response = await api.post(`/api/players/track`).send({ username: 'Hydrox6' });

      expect(response.status).toBe(201);

      expect(response.body).toMatchObject({
        username: 'hydrox6',
        displayName: 'Hydrox6',
        build: 'main',
        type: 'ironman'
      });

      expect(response.body.latestSnapshot).not.toBeNull();

      // Revert the hiscores mocking back to "regular" player type
      registerHiscoresMock(axiosMock, {
        [PlayerTypeEnum.REGULAR]: { statusCode: 200, rawData: globalData.hiscoresRawData },
        [PlayerTypeEnum.IRONMAN]: { statusCode: 404 }
      });
    });

    it('should not track player (too soon)', async () => {
      // This cooldown is set to 0 during testing by default
      playerUtils.setUpdateCooldown(60);

      const response = await api.post(`/api/players/track`).send({ username: 'hydrox6' });

      expect(response.status).toBe(429);
      expect(response.body.message).toMatch('Error: hydrox6 has been updated recently.');

      playerUtils.setUpdateCooldown(0);
    });

    it('should not track player (excessive gains)', async () => {
      const modifiedRawData = modifyRawHiscoresData(globalData.hiscoresRawData, [
        { metric: Metrics.RUNECRAFTING, value: 100_000_000 } // player jumps to 100m RC exp
      ]);

      registerHiscoresMock(axiosMock, {
        [PlayerTypeEnum.REGULAR]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerTypeEnum.IRONMAN]: { statusCode: 404 }
      });

      const response = await api.post(`/api/players/track`).send({ username: 'psikoi' });

      expect(response.status).toBe(500);
      expect(response.body.message).toMatch('Failed to update: Unregistered name change.');
    });

    it('should not track player (negative gains)', async () => {
      const modifiedRawData = modifyRawHiscoresData(globalData.hiscoresRawData, [
        { metric: Metrics.RUNECRAFTING, value: 100_000 } // player's RC exp goes down to 100k
      ]);

      registerHiscoresMock(axiosMock, {
        [PlayerTypeEnum.REGULAR]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerTypeEnum.IRONMAN]: { statusCode: 404 }
      });

      const response = await api.post(`/api/players/track`).send({ username: 'psikoi' });

      expect(response.status).toBe(500);
      expect(response.body.message).toMatch('Failed to update: Unregistered name change.');
    });

    it('should track player (new gains)', async () => {
      const modifiedRawData = modifyRawHiscoresData(globalData.hiscoresRawData, [
        { metric: Metrics.ZULRAH, value: 1646 + 7 }, // player gains 7 zulrah kc
        { metric: Metrics.SMITHING, value: 6_177_978 + 1337 } // player gains 1337 smithing exp
      ]);

      registerHiscoresMock(axiosMock, {
        [PlayerTypeEnum.REGULAR]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerTypeEnum.IRONMAN]: { statusCode: 404 }
      });

      const response = await api.post(`/api/players/track`).send({ username: 'psikoi' });

      expect(response.status).toBe(200);
      expect(response.body.lastChangedAt).not.toBeNull();
      expect(new Date(response.body.lastChangedAt).getTime()).toBeGreaterThan(Date.now() - 1000); // changed under a second ago
    });
  });

  describe('2. Importing', () => {
    it('should not import player (undefined username)', async () => {
      const response = await api.post(`/api/players/import`).send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'username' is undefined.");
    });

    it('should not import player (empty username)', async () => {
      const response = await api.post(`/api/players/import`).send({ username: '' });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'username' is undefined.");
    });

    it('should not import player (player not found)', async () => {
      const response = await api.post(`/api/players/import`).send({ username: 'zezima' });

      expect(response.status).toBe(404);
      expect(response.body.message).toMatch('Player not found.');
    });

    it('should not import player (CML failed)', async () => {
      // Mock the history fetch from CML
      registerCMLMock(axiosMock, 404);

      const response = await api.post(`/api/players/import`).send({ username: 'psikoi' });

      expect(response.status).toBe(500);
      expect(response.body.message).toMatch('Failed to load history from CML.');
    });

    it('should import player', async () => {
      // Wait a second to ensure every previous track request fails to import
      await sleep(1000);

      // Setup the CML request to return our mock raw data
      registerCMLMock(axiosMock, 200, globalData.cmlRawData);

      const importResponse = await api.post(`/api/players/import`).send({ username: 'psikoi' });
      expect(importResponse.status).toBe(200);

      const detailsResponse = await api.get(`/api/players/username/psikoi`);
      expect(detailsResponse.status).toBe(200);
      expect(detailsResponse.body.lastImportedAt).not.toBeNull();

      const snapshotsResponse = await api.get(`/api/players/username/psikoi/snapshots`).query({
        startDate: new Date('2010-01-01'),
        endDate: new Date('2030-01-01')
      });

      expect(snapshotsResponse.status).toBe(200);
      expect(snapshotsResponse.body.length).toBe(221); // 219 imported, 2 tracked (during this test session)
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

      const importResponse = await api.post(`/api/players/import`).send({ username: 'psikoi' });
      expect(importResponse.status).toBe(429);
      expect(importResponse.body.message).toMatch('Imported too soon, please wait');

      // Mock the history fetch from CML
      registerCMLMock(axiosMock, 404);
    });
  });

  describe('3. Searching', () => {
    it('should not search players (undefined username)', async () => {
      const response = await api.get('/api/players/search').query({});

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'username' is undefined.");
    });

    it('should not search players (empty username)', async () => {
      const response = await api.get('/api/players/search').query({ username: '' });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'username' is undefined.");
    });

    it('should search players (partial username)', async () => {
      const response = await api.get('/api/players/search').query({ username: 'hydro' });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);

      expect(response.body[0]).toMatchObject({
        username: 'hydroman',
        type: 'unknown'
      });

      expect(response.body[1]).toMatchObject({
        username: 'hydrox6',
        type: 'ironman'
      });
    });

    it('should search players (unknown partial username)', async () => {
      const response = await api.get('/api/players/search').query({ username: 'zez' });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(0);
    });

    it.todo('should search players (with limit and offset)');
  });

  describe('4. Viewing', () => {
    it.todo('SUPPORT ID ENDPOINTS');

    it('should not view player details (player not found)', async () => {
      const response = await api.get('/api/players/username/zezima');

      expect(response.status).toBe(404);
      expect(response.body.message).toMatch('Player not found.');
    });

    it('should view player details', async () => {
      const response = await api.get('/api/players/username/PsiKOI');

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
    it('should not assert player type(undefined username)', async () => {
      const response = await api.post(`/api/players/assert-type`).send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'username' is undefined.");
    });

    it('should not assert player type(empty username)', async () => {
      const response = await api.post(`/api/players/assert-type`).send({ username: '' });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'username' is undefined.");
    });

    it('should not assert player type(player not found)', async () => {
      const response = await api.post(`/api/players/assert-type`).send({ username: 'zezima' });

      expect(response.status).toBe(404);
      expect(response.body.message).toMatch('Player not found.');
    });

    it('should not assert player type (player is flagged)', async () => {
      const modifiedRawData = modifyRawHiscoresData(globalData.hiscoresRawData, [
        { metric: Metrics.ZULRAH, value: 100 } // player's zulrah kc drops below current kc
      ]);

      registerHiscoresMock(axiosMock, {
        [PlayerTypeEnum.REGULAR]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerTypeEnum.IRONMAN]: { statusCode: 404 }
      });

      const trackResponse = await api.post(`/api/players/track`).send({ username: 'psikoi' });

      expect(trackResponse.status).toBe(500);
      expect(trackResponse.body.message).toMatch('Failed to update: Unregistered name change.');

      const detailsResponse = await api.get('/api/players/username/PsiKOI');

      expect(detailsResponse.status).toBe(200);
      expect(detailsResponse.body.flagged).toBe(true);

      const assertTypeResponse = await api.post(`/api/players/assert-type`).send({ username: 'psikoi' });

      expect(assertTypeResponse.status).toBe(400);
      expect(assertTypeResponse.body.message).toMatch('Type Assertion Not Allowed: Player is Flagged.');
    });

    it('should assert player type (regular)', async () => {
      const modifiedRawData = modifyRawHiscoresData(globalData.hiscoresRawData, [
        { metric: Metrics.ZULRAH, value: 1646 + 7 }, // restore the zulrah kc,
        { metric: Metrics.SMITHING, value: 6_177_978 + 1337 } // restore the smithing exp
      ]);

      registerHiscoresMock(axiosMock, {
        [PlayerTypeEnum.REGULAR]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerTypeEnum.IRONMAN]: { statusCode: 404 }
      });

      // Unflag the player
      const trackResponse = await api.post(`/api/players/track`).send({ username: 'psikoi' });
      expect(trackResponse.status).toBe(200);
      expect(trackResponse.body.flagged).toBe(false);

      // Mock regular hiscores data, and block any ironman requests
      registerHiscoresMock(axiosMock, {
        [PlayerTypeEnum.REGULAR]: { statusCode: 200, rawData: globalData.hiscoresRawData },
        [PlayerTypeEnum.IRONMAN]: { statusCode: 404 }
      });

      const response = await api.post(`/api/players/assert-type`).send({ username: 'psikoi' });

      expect(response.status).toBe(200);
      expect(response.body.type).toBe('regular');
    });

    it('should assert player type (regular -> ultimate)', async () => {
      // Mock regular hiscores data, and block any ironman requests
      registerHiscoresMock(axiosMock, {
        [PlayerTypeEnum.REGULAR]: { statusCode: 200, rawData: globalData.hiscoresRawData },
        [PlayerTypeEnum.IRONMAN]: { statusCode: 200, rawData: globalData.hiscoresRawData },
        [PlayerTypeEnum.ULTIMATE]: { statusCode: 200, rawData: globalData.hiscoresRawData },
        [PlayerTypeEnum.HARDCORE]: { statusCode: 404 }
      });

      const assertTypeResponse = await api.post(`/api/players/assert-type`).send({ username: 'psikoi' });

      expect(assertTypeResponse.status).toBe(200);
      expect(assertTypeResponse.body.type).toBe('ultimate');

      const detailsResponse = await api.get('/api/players/username/PsiKOI');

      expect(detailsResponse.status).toBe(200);
      expect(detailsResponse.body.type).toBe('ultimate');
    });
  });

  describe('6. Updating Country', () => {
    it('should not update player country (undefined country)', async () => {
      const response = await api.put(`/api/players/username/psikoi/country`).send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Parameter 'country' is undefined.");
    });

    it('should not update player country (empty country)', async () => {
      const response = await api.put(`/api/players/username/psikoi/country`).send({ country: '' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Parameter 'country' is undefined.");
    });

    it('should not update player country (invalid admin password)', async () => {
      const response = await api.put(`/api/players/username/psikoi/country`).send({ country: 'PT' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Required parameter 'adminPassword' is undefined.");
    });

    it('should not update player country (incorrect admin password)', async () => {
      const response = await api
        .put(`/api/players/username/psikoi/country`)
        .send({ country: 'PT', adminPassword: 'abc' });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Incorrect admin password.');
    });

    it('should not update player country (player not found)', async () => {
      const response = await api
        .put(`/api/players/username/zezima/country`)
        .send({ country: 'PT', adminPassword: env.ADMIN_PASSWORD });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Player not found.');
    });

    it('should not update player country (invalid country)', async () => {
      const response = await api
        .put(`/api/players/username/PSIKOI/country`)
        .send({ country: 'XX', adminPassword: env.ADMIN_PASSWORD });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Invalid country.');
    });

    it('should update player country', async () => {
      const updateCountryResponse = await api
        .put(`/api/players/username/PSIKOI/country`)
        .send({ country: 'pt', adminPassword: env.ADMIN_PASSWORD });

      expect(updateCountryResponse.status).toBe(200);
      expect(updateCountryResponse.body.message).toMatch('Successfully changed country to: Portugal (PT)');

      const detailsResponse = await api.get('/api/players/username/PsiKOI');

      expect(detailsResponse.status).toBe(200);
      expect(detailsResponse.body.country).toBe('PT');
    });
  });

  describe('7. Deleting', () => {
    it('should not delete player (invalid admin password)', async () => {
      const response = await api.delete(`/api/players/username/psikoi`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Required parameter 'adminPassword' is undefined.");
    });

    it('should not delete player (incorrect admin password)', async () => {
      const response = await api.delete(`/api/players/username/psikoi`).send({ adminPassword: 'abc' });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Incorrect admin password.');
    });

    it('should not delete player (player not found)', async () => {
      const response = await api
        .delete(`/api/players/username/zezima`)
        .send({ adminPassword: env.ADMIN_PASSWORD });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Player not found.');
    });

    it('should delete player', async () => {
      const deletePlayerResponse = await api
        .delete(`/api/players/username/psikoi`)
        .send({ adminPassword: env.ADMIN_PASSWORD });

      expect(deletePlayerResponse.status).toBe(200);
      expect(deletePlayerResponse.body.message).toMatch('Successfully deleted player: PSIKOI');

      const detailsResponse = await api.get('/api/players/username/PsiKOI');

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
