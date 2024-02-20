import axios from 'axios';
import dayjs from 'dayjs';
import supertest from 'supertest';
import MockAdapter from 'axios-mock-adapter';
import prisma from '../../../src/prisma';
import env from '../../../src/env';
import apiServer from '../../../src/api';
import { Achievement, Metric, PlayerType, SKILL_EXP_AT_99 } from '../../../src/utils';
import * as achievementEvents from '../../../src/api/modules/achievements/achievement.events';
import { ACHIEVEMENT_TEMPLATES } from '../../../src/api/modules/achievements/achievement.templates';
import {
  registerCMLMock,
  registerHiscoresMock,
  resetDatabase,
  resetRedis,
  sleep,
  readFile,
  modifyRawHiscoresData
} from '../../utils';

const api = supertest(apiServer.express);
const axiosMock = new MockAdapter(axios, { onNoMatch: 'passthrough' });

const onAchievementsCreatedEvent = jest.spyOn(achievementEvents, 'onAchievementsCreated');

const CML_FILE_PATH = `${__dirname}/../../data/cml/psikoi_cml.txt`;
const ACHIEVEMENTS_FILE_PATH = `${__dirname}/../../data/achievements/psikoi_achievements.json`;
const HISCORES_FILE_PATH_A = `${__dirname}/../../data/hiscores/psikoi_hiscores.txt`;
const HISCORES_FILE_PATH_B = `${__dirname}/../../data/hiscores/lynx_titan_hiscores.txt`;

const globalData = {
  testPlayerId: -1,
  cmlRawData: '',
  hiscoresRawDataA: '',
  hiscoresRawDataB: '',
  expectedAchievements: []
};

beforeEach(() => {
  jest.resetAllMocks();
});

beforeAll(async () => {
  await resetDatabase();
  await resetRedis();

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
});

afterAll(async () => {
  jest.useRealTimers();
  axiosMock.reset();

  // Sleep for 5s to allow the server to shut down gracefully
  await apiServer.shutdown().then(() => sleep(5000));
}, 10_000);

describe('Achievements API', () => {
  describe('Achievements Sync', () => {
    test('Fetch Achievement from unknown player', async () => {
      const firstResponse = await api.get(`/players/idk/achievements`);
      expect(firstResponse.status).toBe(404);
      expect(firstResponse.body.message).toBe('Player not found.');

      const secondResponse = await api.get(`/players/idk/achievements/progress`);
      expect(secondResponse.status).toBe(404);
      expect(secondResponse.body.message).toBe('Player not found.');
    });

    test('Track Player (first time, all achievements (unknown dates))', async () => {
      const modifiedRawData = modifyRawHiscoresData(globalData.hiscoresRawDataA, [
        { metric: Metric.GUARDIANS_OF_THE_RIFT, value: 50 }
      ]);

      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      // Track player (first time)
      const trackResponse = await api.post(`/players/Psikoi`);

      expect(trackResponse.status).toBe(201);
      expect(trackResponse.body.username).toBe('psikoi');
      expect(trackResponse.body.type).toBe('regular');

      globalData.testPlayerId = trackResponse.body.id;

      // Wait a bit for the onPlayerUpdated hook to fire
      await sleep(500);

      expect(onAchievementsCreatedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          length: 37
        })
      );

      // Check their achievements
      const fetchResponse = await api.get(`/players/psikoi/achievements`);

      expect(fetchResponse.status).toBe(200);
      expect(fetchResponse.body.length).toBe(37);
      expect(fetchResponse.body.filter(a => a.accuracy === null).length).toBe(37);
      expect(fetchResponse.body.filter(a => new Date(a.createdAt).getTime() === 0).length).toBe(37);
    });

    test('Track Player (second time, no new achievements)', async () => {
      // Force some gains (+1 GOTR) so that achievements sync is triggered
      const modifiedRawData = modifyRawHiscoresData(globalData.hiscoresRawDataA, [
        { metric: Metric.GUARDIANS_OF_THE_RIFT, value: 51 }
      ]);

      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      // Track player (second time)
      const trackResponse = await api.post(`/players/Psikoi`);

      expect(trackResponse.status).toBe(200);
      expect(trackResponse.body.username).toBe('psikoi');

      // Wait a bit for the onPlayerUpdated hook to fire
      await sleep(500);

      expect(onAchievementsCreatedEvent).not.toHaveBeenCalled();

      // Check their achievements (again)
      const fetchResponse = await api.get(`/players/psikoi/achievements`);

      expect(fetchResponse.status).toBe(200);
      expect(fetchResponse.body.length).toBe(37);
    });

    test('Check Achievements Match (unknown dates)', async () => {
      const fetchResponse = await api.get(`/players/psikoi/achievements`);

      expect(fetchResponse.status).toBe(200);
      expect(fetchResponse.body.length).toBe(globalData.expectedAchievements.length);

      // Check each expected achievement to ensure they exist in the achievements fetch response
      globalData.expectedAchievements.forEach(ea => {
        expect(fetchResponse.body.map(a => a.name).includes(ea.name)).toBe(true);
      });

      expect(fetchResponse.body.filter(a => a.accuracy === null).length).toBe(37);
      expect(fetchResponse.body.filter(a => new Date(a.createdAt).getTime() === 0).length).toBe(37);
    });

    test('Import Player History, all achievements, some known dates', async () => {
      // Setup the CML request to return our mock raw data
      registerCMLMock(axiosMock, 200, globalData.cmlRawData);

      // Import player history
      const importResponse = await api
        .post(`/players/Psikoi/import-history`)
        .send({ adminPassword: env.ADMIN_PASSWORD });

      expect(importResponse.status).toBe(200);

      // Wait a bit for the onPlayerImported hook to fire
      await sleep(500);

      // Manually change one achievement's date
      await prisma.achievement.update({
        data: { createdAt: new Date('2017-12-01T00:00:00.000Z') },
        where: {
          playerId_name: {
            playerId: globalData.testPlayerId,
            name: '99 Magic'
          }
        }
      });

      // Check their achievements
      const fetchResponse = await api.get(`/players/psikoi/achievements`);

      expect(fetchResponse.status).toBe(200);
      expect(fetchResponse.body.length).toBe(37);

      // Make sure all achievements have correct dates
      checkAchievementMatch(fetchResponse.body);

      // All "dated" achievements should also have an accuracy value
      expect(fetchResponse.body.filter(a => new Date(a.createdAt).getTime() > 0).length).toBe(
        fetchResponse.body.filter(a => a.accuracy !== null).length
      );

      // All non-"dated" achievements should have null accuracy
      expect(fetchResponse.body.filter(a => new Date(a.createdAt).getTime() === 0).length).toBe(
        fetchResponse.body.filter(a => a.accuracy === null).length
      );
    }, 30_000);

    test('Check Achievements Progress', async () => {
      const fetchResponse = await api.get(`/players/psikoi/achievements/progress`);

      // Calculate the number of possible achievements, from the templates
      let achievementCount = 0;
      ACHIEVEMENT_TEMPLATES.forEach(a => (achievementCount += a.thresholds.length));

      expect(fetchResponse.status).toBe(200);
      expect(fetchResponse.body.length).toBe(achievementCount);
      expect(fetchResponse.body.filter(a => a.absoluteProgress === 1).length).toBe(37);
      expect(fetchResponse.body.filter(a => a.relativeProgress === 1).length).toBe(37);

      const progressMap = Object.fromEntries(fetchResponse.body.map(a => [a.name, a]));

      const _100mOverallExp = progressMap['100m Overall Exp.'];

      expect(_100mOverallExp.createdAt).toBe('2015-12-14T04:15:36.000Z');

      // The "prev" snapshot for this achievement is on December 5th 2015, so the accuracy should be
      // the difference between the two dates (prev and current) in milliseconds
      expect(_100mOverallExp.accuracy).toBe(
        new Date(_100mOverallExp.createdAt).getTime() - new Date('2015-12-05T03:56:16.000Z').getTime()
      );

      expect(progressMap['99 Attack'].createdAt).toBe('2015-12-05T03:56:16.000Z');
      expect(progressMap['99 Defence'].createdAt).toBe('2016-09-17T10:00:24.000Z');
      expect(progressMap['99 Slayer'].createdAt).toBe('2018-08-03T18:33:56.000Z');

      expect(progressMap['10k Barrows Chests'].accuracy).toBe(null);
      expect(progressMap['10k Barrows Chests'].createdAt).toBe(null);

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

      expect(progressMap['Base 80 Stats']).toMatchObject({
        currentValue: 45_679_564, // 1_986_068 (lvl 80) * 23 skills
        absoluteProgress: 1, // 100% done with this achievement - (45_679_564 / 45_679_564) = 1
        relativeProgress: 1 // 100% done between Base 70 and Base 80 - ((45_679_564 - 16_965_421) / (45_679_564 - 16_965_421)) >= 1
      });

      expect(progressMap['Base 90 Stats']).toMatchObject({
        // there's 2 skills under 90, agility and construction
        currentValue: 121_252_498, // (5_346_332 * 21 skills) + 4_537_106 (construction) + 4_442_420 (agility)
        absoluteProgress: 0.9861, // 100% done with this achievement - (121_252_498 / 122_965_636) = 0.9861
        relativeProgress: 0.9778 // 19.3% done between Base 80 and Base 90 - ((121_252_498 - 45_679_564) / (122_965_636 - 45_679_564)) = 0.9778
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

      const failedFetchResponse = await api.get(`/groups/200000000/achievements`);
      expect(failedFetchResponse.status).toBe(404);
      expect(failedFetchResponse.body.message).toBe('Group not found.');

      let modifiedRawData = modifyRawHiscoresData(globalData.hiscoresRawDataB, [
        { metric: Metric.GUARDIANS_OF_THE_RIFT, value: 50 }
      ]);

      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      // Track player
      const firstTrackResponse = await api.post(`/players/Lynx Titan`);

      expect(firstTrackResponse.status).toBe(201);
      expect(firstTrackResponse.body.username).toBe('lynx titan');

      // Force some gains (+1 GOTR) so that achievements sync is triggered
      // Note: this should be reviewed in the future, as it would make sense to still
      // sync and back date achievements on the first ever player update
      modifiedRawData = modifyRawHiscoresData(globalData.hiscoresRawDataB, [
        { metric: Metric.GUARDIANS_OF_THE_RIFT, value: 51 }
      ]);

      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      // Track player (again)
      const secondTrackResponse = await api.post(`/players/Lynx Titan`);

      expect(secondTrackResponse.status).toBe(200);
      expect(secondTrackResponse.body.username).toBe('lynx titan');

      // Wait a bit for the onPlayerUpdated hook to fire
      await sleep(500);

      const payload = {
        name: 'Achievements Test Group',
        members: [{ username: 'psikoi' }, { username: 'lynx titan' }]
      };

      // Create group
      const createGroupResponse = await api.post('/groups').send(payload);

      expect(createGroupResponse.status).toBe(201);
      expect(createGroupResponse.body.group.memberships.map(m => m.player.username)).toContain('psikoi');
      expect(createGroupResponse.body.group.memberships.map(m => m.player.username)).toContain('lynx titan');

      // Fetch 1-50
      const firstFetchResponse = await api
        .get(`/groups/${createGroupResponse.body.group.id}/achievements`)
        .query({ limit: 50 });

      expect(firstFetchResponse.status).toBe(200);
      expect(firstFetchResponse.body.length).toBe(50); // should return the maximum defined by the limit param

      // Fetch 51-100
      const secondFetchResponse = await api
        .get(`/groups/${createGroupResponse.body.group.id}/achievements`)
        .query({ limit: 50, offset: 50 });

      expect(secondFetchResponse.status).toBe(200);
      expect(secondFetchResponse.body.length).toBe(50); // should return the maximum defined by the limit param

      // Fetch 101-140
      const thirdFetchResponse = await api
        .get(`/groups/${createGroupResponse.body.group.id}/achievements`)
        .query({ limit: 50, offset: 100 });

      expect(thirdFetchResponse.status).toBe(200);
      expect(thirdFetchResponse.body.length).toBeLessThan(50);

      const totalCount =
        firstFetchResponse.body.length + secondFetchResponse.body.length + thirdFetchResponse.body.length;

      expect(totalCount).toBe(140); // 37 achievements from Psikoi, 103 from Lynx Titan
    });

    test('Track player again, test new achievements', async () => {
      // Change attack to 50.5m
      const modifiedRawData = modifyRawHiscoresData(globalData.hiscoresRawDataA, [
        { metric: Metric.ATTACK, value: 50_585_985 }
      ]);

      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      // Track player (third time)
      const trackResponse = await api.post(`/players/Psikoi`);

      expect(trackResponse.status).toBe(200);
      expect(trackResponse.body.username).toBe('psikoi');

      // Wait a bit for the onPlayerUpdated hook to fire
      await sleep(500);

      // Check their achievements (again)
      const fetchResponse = await api.get(`/players/psikoi/achievements`);

      expect(fetchResponse.status).toBe(200);
      expect(fetchResponse.body.length).toBe(38);
      expect(fetchResponse.body.filter(a => new Date(a.createdAt).getTime() === 0).length).toBe(20);

      expect(fetchResponse.body.map(a => a.name)).toContain('50m Attack');
      expect(fetchResponse.body.find(a => a.name === '50m Attack').createdAt).not.toBe(0);
      // accuracy should be less than 10 seconds, since we just updated the player (plus/minus async request delays and such)
      expect(fetchResponse.body.find(a => a.name === '50m Attack').accuracy).toBeLessThan(10_000);
    });

    it('should not count very-close achievements as complete', async () => {
      const modifiedRawData = modifyRawHiscoresData(globalData.hiscoresRawDataA, [
        { metric: Metric.AGILITY, value: SKILL_EXP_AT_99 - 50 } // 50 exp away from 99
      ]);

      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      const trackResponse = await api.post(`/players/nightfirecat`);
      expect(trackResponse.status).toBe(201);

      const fetchResponse = await api.get(`/players/nightfirecat/achievements/progress`);
      expect(fetchResponse.status).toBe(200);

      const agilityAchievements = fetchResponse.body.filter(a => a.metric === Metric.AGILITY);

      // Ensure the 99 agility achievement is not marked as at 100% completion (none should be tbh)
      expect(agilityAchievements.filter(a => a.relativeProgress === 1).length).toBe(0);
      expect(agilityAchievements.filter(a => a.absoluteProgress === 1).length).toBe(0);
    });
  });
});

function checkAchievementMatch(achievements: Achievement[]) {
  // 17 out of the 37 achievements have now been back-dated
  expect(achievements.filter(a => a.accuracy === null).length).toBe(20);
  expect(achievements.filter(a => new Date(a.createdAt).getTime() === 0).length).toBe(20);

  // Check if all previously dated achievements have been correctly dated
  const achievementMap = Object.fromEntries(achievements.map(a => [a.name, a]));

  const _100mOverallExp = achievementMap['100m Overall Exp.'];

  expect(_100mOverallExp.createdAt).toBe('2015-12-14T04:15:36.000Z');

  // The "prev" snapshot for this achievement is on December 5th 2015, so the accuracy should be
  // the difference between the two dates (prev and current) in milliseconds
  expect(_100mOverallExp.accuracy).toBe(
    new Date(_100mOverallExp.createdAt).getTime() - new Date('2015-12-05T03:56:16.000Z').getTime()
  );

  const _200mOverallExp = achievementMap['200m Overall Exp.'];
  expect(_200mOverallExp.createdAt).toBe('2018-08-03T18:33:56.000Z');

  // The "prev" snapshot for this achievement is on January 21st 2018, so the accuracy should be
  // the difference between the two dates (prev and current) in milliseconds
  expect(_200mOverallExp.accuracy).toBe(
    new Date(_200mOverallExp.createdAt).getTime() - new Date('2018-01-21T18:02:52.000Z').getTime()
  );

  expect(achievementMap['99 Attack'].createdAt).toBe('2015-12-05T03:56:16.000Z');
  expect(achievementMap['99 Attack'].accuracy).toBe(14126316000);

  expect(achievementMap['99 Defence'].createdAt).toBe('2016-09-17T10:00:24.000Z');
  expect(achievementMap['99 Defence'].accuracy).toBe(24039888000);

  expect(achievementMap['99 Farming'].createdAt).toBe('2019-11-03T02:15:05.000Z');
  expect(achievementMap['99 Farming'].accuracy).toBe(1558087000);

  expect(achievementMap['99 Hitpoints'].createdAt).toBe('2015-12-05T03:56:16.000Z');
  expect(achievementMap['99 Hitpoints'].accuracy).toBe(14126316000);

  expect(achievementMap['99 Magic'].createdAt).toBe('2017-12-01T00:00:00.000Z');
  expect(achievementMap['99 Magic'].accuracy).toBe(24039888000);

  expect(achievementMap['99 Ranged'].createdAt).toBe('2016-09-17T10:00:24.000Z');
  expect(achievementMap['99 Ranged'].accuracy).toBe(24039888000);

  expect(achievementMap['99 Slayer'].createdAt).toBe('2018-08-03T18:33:56.000Z');
  expect(achievementMap['99 Slayer'].accuracy).toBe(16763464000);

  expect(achievementMap['99 Strength'].createdAt).toBe('2016-09-17T10:00:24.000Z');
  expect(achievementMap['99 Strength'].accuracy).toBe(24039888000);

  expect(achievementMap['Base 60 Stats'].createdAt).toBe('2015-05-03T01:29:04.000Z');
  expect(achievementMap['Base 60 Stats'].accuracy).toBe(790524000);

  expect(achievementMap['Base 70 Stats'].createdAt).toBe('2016-09-17T10:00:24.000Z');
  expect(achievementMap['Base 70 Stats'].accuracy).toBe(24039888000);

  expect(achievementMap['Base 80 Stats'].createdAt).toBe('2018-09-14T04:33:00.000Z');
  expect(achievementMap['Base 80 Stats'].accuracy).toBe(1312092000);

  const now = dayjs();

  // These achievements should be from today (within the last hour)
  expect(dayjs(achievementMap['99 Cooking'].createdAt).isSame(now, 'hour'));
  expect(dayjs(achievementMap['99 Woodcutting'].createdAt).isSame(now, 'hour'));
  expect(dayjs(achievementMap['99 Firemaking'].createdAt).isSame(now, 'hour'));
  expect(dayjs(achievementMap['99 Fletching'].createdAt).isSame(now, 'hour'));
}
