import axios from 'axios';
import supertest from 'supertest';
import MockAdapter from 'axios-mock-adapter';
import apiServer from '../../../src/api';
import { Achievement, Metric, PlayerType, SKILL_EXP_AT_99 } from '../../../src/utils';
import { ACHIEVEMENT_TEMPLATES } from '../../../src/api/modules/achievements/achievement.templates';
import { registerHiscoresMock, resetDatabase, sleep, readFile, modifyRawHiscoresData } from '../../utils';
import { redisClient } from '../../../src/services/redis.service';
import { eventEmitter } from '../../../src/api/events';
import * as PlayerAchievementsCreatedEvent from '../../../src/api/events/handlers/player-achievements-created.event';

const api = supertest(apiServer.express);
const axiosMock = new MockAdapter(axios, { onNoMatch: 'passthrough' });

const playerAchievementsCreatedEvent = jest.spyOn(PlayerAchievementsCreatedEvent, 'handler');

const ACHIEVEMENTS_FILE_PATH = `${__dirname}/../../data/achievements/psikoi_achievements.json`;
const HISCORES_FILE_PATH_A = `${__dirname}/../../data/hiscores/psikoi_hiscores.txt`;
const HISCORES_FILE_PATH_B = `${__dirname}/../../data/hiscores/lynx_titan_hiscores.txt`;

const globalData = {
  testPlayerId: -1,
  hiscoresRawDataA: '',
  hiscoresRawDataB: '',
  expectedAchievements: [] as Achievement[]
};

beforeEach(() => {
  jest.resetAllMocks();

  // re-init the event emitter to re-attach the mocked event handlers
  eventEmitter.init();
});

beforeAll(async () => {
  eventEmitter.init();
  await resetDatabase();
  await redisClient.flushall();

  globalData.hiscoresRawDataA = await readFile(HISCORES_FILE_PATH_A);
  globalData.hiscoresRawDataB = await readFile(HISCORES_FILE_PATH_B);
  globalData.expectedAchievements = JSON.parse(await readFile(ACHIEVEMENTS_FILE_PATH)) as Achievement[];

  // Mock regular hiscores data, and block any ironman requests
  registerHiscoresMock(axiosMock, {
    [PlayerType.REGULAR]: { statusCode: 200, rawData: globalData.hiscoresRawDataA },
    [PlayerType.IRONMAN]: { statusCode: 404 }
  });
});

afterAll(() => {
  jest.useRealTimers();
  axiosMock.reset();
  redisClient.quit();
});

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

      // Wait a bit for the "player updated" event to fire
      await sleep(100);

      expect(playerAchievementsCreatedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'psikoi',
          achievements: expect.objectContaining({
            length: 37
          })
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

      // Wait a bit for the "player updated" event to fire
      await sleep(100);

      expect(playerAchievementsCreatedEvent).not.toHaveBeenCalled();

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

      // Wait a bit for the "player updated" event to fire
      await sleep(100);

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
      let modifiedRawData = modifyRawHiscoresData(globalData.hiscoresRawDataA, [
        { metric: Metric.ATTACK, value: 50_585_985 },
        { metric: Metric.GUARDIANS_OF_THE_RIFT, value: 51 },
        { metric: Metric.SOUL_WARS_ZEAL, value: 5500 }, // This should trigger a new achievement
        { metric: Metric.COLLECTIONS_LOGGED, value: 653 } // This should trigger a new achievement with unknown date (added to the hiscores way after release)
      ]);

      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      // Track player (third time)
      const trackResponse = await api.post(`/players/Psikoi`);

      expect(trackResponse.status).toBe(200);
      expect(trackResponse.body.username).toBe('psikoi');

      // Wait a bit for the "player updated" event to fire
      await sleep(100);

      // Check their achievements (again)
      const fetchResponse = await api.get(`/players/psikoi/achievements`);

      expect(fetchResponse.status).toBe(200);
      expect(fetchResponse.body.length).toBe(40); // 2 new achievements
      expect(fetchResponse.body.filter(a => new Date(a.createdAt).getTime() === 0).length).toBe(38); // 1 new "unknown" date achievement

      const attackAchievement = fetchResponse.body.find(a => a.name === '50m Attack');

      expect(attackAchievement).not.toBeUndefined();
      expect(new Date(attackAchievement.createdAt).getTime()).not.toBe(0);
      // accuracy should be less than 10 seconds, since we just updated the player (plus/minus async request delays and such)
      expect(attackAchievement.accuracy).toBeLessThan(10_000);

      const soulWarsAchievement = fetchResponse.body.find(a => a.name === '5k Soul Wars Zeal');

      expect(soulWarsAchievement).not.toBeUndefined();
      expect(new Date(soulWarsAchievement.createdAt).getTime()).not.toBe(0);
      // accuracy should be less than 10 seconds, since we just updated the player (plus/minus async request delays and such)
      expect(soulWarsAchievement.accuracy).toBeLessThan(10_000);

      const collectionLogAchievement = fetchResponse.body.find(a => a.name === '500 Collections Logged');

      expect(collectionLogAchievement).not.toBeUndefined();
      expect(new Date(collectionLogAchievement.createdAt).getTime()).toBe(0);
      expect(collectionLogAchievement.accuracy).toBeNull();

      // Change attack to 50.5m
      modifiedRawData = modifyRawHiscoresData(globalData.hiscoresRawDataA, [
        { metric: Metric.ATTACK, value: 50_585_985 },
        { metric: Metric.GUARDIANS_OF_THE_RIFT, value: 51 },
        { metric: Metric.SOUL_WARS_ZEAL, value: 5500 },
        { metric: Metric.COLLECTIONS_LOGGED, value: 660 } // Gained 7 more collections
      ]);

      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      // Track player (third time)
      const secondTrackResponse = await api.post(`/players/Psikoi`);

      expect(secondTrackResponse.status).toBe(200);
      expect(secondTrackResponse.body.username).toBe('psikoi');

      // Wait a bit for the "player updated" event to fire
      await sleep(100);

      // Check their achievements (again)
      const secondFetchResponse = await api.get(`/players/psikoi/achievements`);
      expect(secondFetchResponse.status).toBe(200);

      // Nothing should have changed
      expect(secondFetchResponse.body.length).toBe(40);
      expect(secondFetchResponse.body.filter(a => new Date(a.createdAt).getTime() === 0).length).toBe(38);
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
