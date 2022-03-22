import axios from 'axios';
import moment from 'moment';
import supertest from 'supertest';
import { PlayerType } from '@wise-old-man/utils';
import MockAdapter from 'axios-mock-adapter';
import api from '../../src/api';
import { ACHIEVEMENT_TEMPLATES } from '../../src/api/modules/achievements/achievement.templates';
import { registerCMLMock, registerHiscoresMock, resetDatabase, sleep, readFile } from '../utils';

const apiMock = supertest(api);
const axiosMock = new MockAdapter(axios, { onNoMatch: 'passthrough' });

const CML_FILE_PATH = `${__dirname}/../data/cml/psikoi_cml.txt`;
const ACHIEVEMENTS_FILE_PATH = `${__dirname}/../data/achievements/psikoi_achievements.json`;
const HISCORES_FILE_PATH_A = `${__dirname}/../data/hiscores/psikoi_hiscores.txt`;
const HISCORES_FILE_PATH_B = `${__dirname}/../data/hiscores/lynx_titan_hiscores.txt`;

const globalData = {
  cmlRawData: '',
  hiscoresRawDataA: '',
  hiscoresRawDataB: '',
  expectedAchievements: [],
  testPlayerId: -1
};

beforeAll(async done => {
  await resetDatabase();

  globalData.cmlRawData = await readFile(CML_FILE_PATH);
  globalData.hiscoresRawDataA = await readFile(HISCORES_FILE_PATH_A);
  globalData.hiscoresRawDataB = await readFile(HISCORES_FILE_PATH_B);
  globalData.expectedAchievements = JSON.parse(await readFile(ACHIEVEMENTS_FILE_PATH));

  // Mock the history fetch from CML to always fail with a 404 status code
  registerCMLMock(axiosMock, 404);

  // Mock regular hiscores data, and block any ironman requests
  registerHiscoresMock(axiosMock, {
    [PlayerType.REGULAR]: { statusCode: 200, rawData: globalData.hiscoresRawDataA },
    [PlayerType.IRONMAN]: { statusCode: 404 }
  });

  done();
});

afterAll(async done => {
  axiosMock.reset();
  done();
});

describe('Achievements API', () => {
  describe('Achievements Sync', () => {
    test('Track Player (first time), no achievements', async () => {
      // Track player (first time)
      const trackResponse = await apiMock.post(`/api/players/track`).send({ username: 'Psikoi' });

      expect(trackResponse.status).toBe(201);
      expect(trackResponse.body.username).toBe('psikoi');
      expect(trackResponse.body.type).toBe('regular');

      // Check their achievements
      const fetchResponse = await apiMock.get(`/api/players/${trackResponse.body.id}/achievements`);

      expect(fetchResponse.status).toBe(200);
      expect(fetchResponse.body.length).toBe(0);

      globalData.testPlayerId = trackResponse.body.id;
    });

    test('Track Player (second time), all achievements (unknown dates)', async () => {
      // Track player (second time)
      const trackResponse = await apiMock.post(`/api/players/track`).send({ username: 'Psikoi' });

      expect(trackResponse.status).toBe(200);
      expect(trackResponse.body.username).toBe('psikoi');

      // Wait a bit for the onPlayerUpdated hook to fire
      await sleep(500);

      // Check their achievements (again)
      const fetchResponse = await apiMock.get(`/api/players/${trackResponse.body.id}/achievements`);

      expect(fetchResponse.status).toBe(200);
      expect(fetchResponse.body.length).toBe(37);
      expect(fetchResponse.body.filter(a => new Date(a.createdAt).getTime() === 0).length).toBe(37);
    });

    test('Check Achievements Match (unknown dates)', async () => {
      const fetchResponse = await apiMock.get(`/api/players/${globalData.testPlayerId}/achievements`);

      expect(fetchResponse.status).toBe(200);
      expect(fetchResponse.body.length).toBe(globalData.expectedAchievements.length);

      // Check each expected achievement to ensure they exist in the achievements fetch response
      globalData.expectedAchievements.forEach(ea => {
        expect(fetchResponse.body.map(a => a.name).includes(ea.name)).toBe(true);
      });
    });

    test('Import Player History, all achievements, some known dates', async () => {
      // Setup the CML request to return our mock raw data
      registerCMLMock(axiosMock, 200, globalData.cmlRawData);

      // Import player history
      const importResponse = await apiMock.post(`/api/players/import`).send({ username: 'Psikoi' });
      expect(importResponse.status).toBe(200);

      // Wait a bit for the onPlayerImported hook to fire
      await sleep(500);

      // Check their achievements
      const fetchResponse = await apiMock.get(`/api/players/${globalData.testPlayerId}/achievements`);

      expect(fetchResponse.status).toBe(200);
      expect(fetchResponse.body.length).toBe(37);
      // 17 out of the 37 achievements have now been back-dated
      expect(fetchResponse.body.filter(a => new Date(a.createdAt).getTime() === 0).length).toBe(20);

      // Check if all previously dated achievements have been correctly dated
      const achievementDateMap = Object.fromEntries(fetchResponse.body.map(a => [a.name, a.createdAt]));

      // These achievements should be all dated before May 2020
      expect(achievementDateMap['100m Overall Exp.']).toBe('2015-12-14T04:15:36.000Z');
      expect(achievementDateMap['200m Overall Exp.']).toBe('2018-08-03T17:33:56.000Z');
      expect(achievementDateMap['99 Attack']).toBe('2015-12-05T03:56:16.000Z');
      expect(achievementDateMap['99 Defence']).toBe('2016-09-17T09:00:24.000Z');
      expect(achievementDateMap['99 Farming']).toBe('2019-11-03T02:15:05.000Z');
      expect(achievementDateMap['99 Hitpoints']).toBe('2015-12-05T03:56:16.000Z');
      expect(achievementDateMap['99 Magic']).toBe('2016-09-17T09:00:24.000Z');
      expect(achievementDateMap['99 Ranged']).toBe('2016-09-17T09:00:24.000Z');
      expect(achievementDateMap['99 Slayer']).toBe('2018-08-03T17:33:56.000Z');
      expect(achievementDateMap['99 Strength']).toBe('2016-09-17T09:00:24.000Z');
      expect(achievementDateMap['Base 60 Stats']).toBe('2015-05-03T00:29:04.000Z');
      expect(achievementDateMap['Base 70 Stats']).toBe('2016-09-17T09:00:24.000Z');
      expect(achievementDateMap['Base 80 Stats']).toBe('2018-09-14T03:33:00.000Z');

      // These achievements should be from today (within the last hour)
      expect(moment(achievementDateMap['99 Cooking']).isSame(moment(), 'hour'));
      expect(moment(achievementDateMap['99 Woodcutting']).isSame(moment(), 'hour'));
      expect(moment(achievementDateMap['99 Firemaking']).isSame(moment(), 'hour'));
      expect(moment(achievementDateMap['99 Fletching']).isSame(moment(), 'hour'));
    }, 30_000);

    test('Check Achievements Progress', async () => {
      const fetchResponse = await apiMock.get(
        `/api/players/${globalData.testPlayerId}/achievements/progress`
      );

      // Calculate the number of possible achievements, from the templates
      let achievementCount = 0;
      ACHIEVEMENT_TEMPLATES.forEach(a => (achievementCount += a.thresholds.length));

      expect(fetchResponse.status).toBe(200);
      expect(fetchResponse.body.length).toBe(achievementCount);
      expect(fetchResponse.body.filter(a => a.absoluteProgress === 1).length).toBe(37);
      expect(fetchResponse.body.filter(a => a.relativeProgress === 1).length).toBe(37);

      const progressMap = Object.fromEntries(fetchResponse.body.map(a => [a.name, a]));

      expect(progressMap['1k Barrows Chests']).toMatchObject({
        currentValue: 1773,
        absoluteProgress: 1, // 100% done with this achievement - (1773 / 1000) >= 1
        relativeProgress: 1 // 100% done between 500 and 1k kc - ((1773 - 500) / (1000 - 500)) >= 1
      });

      expect(progressMap['5k Barrows Chests']).toMatchObject({
        currentValue: 1773,
        absoluteProgress: 0.3546, // 35.5% done with this achievement - (1773 / 5000) = 0.3546
        relativeProgress: 0.1933 // 19.3% done between 1k and 5k kc - ((1773 - 1000) / (5000 - 1000)) = 0.1933
      });

      expect(progressMap['10k Barrows Chests']).toMatchObject({
        currentValue: 1773,
        absoluteProgress: 0.1773, // 17.7% done with this achievement - (1773 / 10000) = 0.1773
        relativeProgress: 0 // 0% done between 5k and 10k kc - ((1773 - 1000) / (5000 - 1000)) <= 0
      });
    });

    test('Create Group and check all group achievements', async () => {
      // Mock the history fetch from CML
      registerCMLMock(axiosMock, 404);

      // Change the mock hiscores data ro "B" (Lynx Titan));
      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: globalData.hiscoresRawDataB },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      const failedFetchResponse = await apiMock.get(`/api/groups/200000000/achievements`);
      expect(failedFetchResponse.status).toBe(404);
      expect(failedFetchResponse.body.message).toBe('Group not found.');

      // Track player
      const firstTrackResponse = await apiMock.post(`/api/players/track`).send({ username: 'Lynx Titan' });

      expect(firstTrackResponse.status).toBe(201);
      expect(firstTrackResponse.body.username).toBe('lynx titan');

      // Track player (again)
      const secondTrackResponse = await apiMock.post(`/api/players/track`).send({ username: 'Lynx Titan' });

      expect(secondTrackResponse.status).toBe(200);
      expect(secondTrackResponse.body.username).toBe('lynx titan');

      // Wait a bit for the onPlayerUpdated hook to fire
      await sleep(500);

      const payload = {
        name: 'Achievements Test Group',
        members: [{ username: 'psikoi' }, { username: 'lynx titan' }]
      };

      // Create group
      const createGroupResponse = await apiMock.post('/api/groups').send(payload);

      expect(createGroupResponse.status).toBe(201);
      expect(createGroupResponse.body.members.map(m => m.username)).toContain('psikoi');
      expect(createGroupResponse.body.members.map(m => m.username)).toContain('lynx titan');

      const groupId = createGroupResponse.body.id;
      const fetchResponse = await apiMock
        .get(`/api/groups/${groupId}/achievements`)
        .query({ limit: 200, offset: 'abc' }); // the invalid offset value should be ignored by the API

      expect(fetchResponse.body.length).toBe(140); // 37 achievements from Psikoi, 103 from Lynx Titan
    });

    test('Track player again, test new achievements', async () => {
      // Change construction to 99 (15m exp)
      const modifiedRawData = globalData.hiscoresRawDataA
        .split('\n')
        .map((row, index) => (index === 23 ? '80761,99,15000000' : row))
        .join('\n');

      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      // Track player (third time)
      const trackResponse = await apiMock.post(`/api/players/track`).send({ username: 'Psikoi' });

      expect(trackResponse.status).toBe(200);
      expect(trackResponse.body.username).toBe('psikoi');

      // Wait a bit for the onPlayerUpdated hook to fire
      await sleep(500);

      // Check their achievements (again)
      const fetchResponse = await apiMock.get(`/api/players/${trackResponse.body.id}/achievements`);

      expect(fetchResponse.status).toBe(200);
      expect(fetchResponse.body.length).toBe(38);
      expect(fetchResponse.body.map(a => a.name)).toContain('99 Construction');
      expect(fetchResponse.body.filter(a => new Date(a.createdAt).getTime() === 0).length).toBe(20);
    });
  });
});
