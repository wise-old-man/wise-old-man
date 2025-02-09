import axios from 'axios';
import supertest from 'supertest';
import MockAdapter from 'axios-mock-adapter';
import apiServer from '../../../src/api';
import prisma from '../../../src/prisma';
import { PlayerType, Metric } from '../../../src/utils';
import {
  registerCMLMock,
  registerHiscoresMock,
  resetDatabase,
  resetRedis,
  readFile,
  modifyRawHiscoresData,
  sleep
} from '../../utils';

const api = supertest(apiServer.express);
const axiosMock = new MockAdapter(axios, { onNoMatch: 'passthrough' });

const HISCORES_FILE_PATH = `${__dirname}/../../data/hiscores/psikoi_hiscores.txt`;

const globalData = {
  hiscoresRawData: '',
  testEmptyGroupId: -1,
  testRegularGroupId: -1
};

beforeAll(async () => {
  await resetDatabase();
  await resetRedis();

  globalData.hiscoresRawData = await readFile(HISCORES_FILE_PATH);

  // Mock the history fetch from CML to always fail with a 404 status code
  registerCMLMock(axiosMock, 404);

  // Mock regular hiscores data, and block any ironman requests
  registerHiscoresMock(axiosMock, {
    [PlayerType.REGULAR]: { statusCode: 200, rawData: globalData.hiscoresRawData },
    [PlayerType.IRONMAN]: { statusCode: 404 }
  });
});

afterAll(async () => {
  jest.useRealTimers();
  axiosMock.reset();

  // Sleep for 5s to allow the server to shut down gracefully
  await apiServer.shutdown().then(() => sleep(5000));
}, 10_000);

describe('Records API', () => {
  describe('1 - Syncing Player Records', () => {
    it('should create player records (year, month, week)', async () => {
      // Fake the current date to be 3 days ago
      jest.useFakeTimers().setSystemTime(new Date(Date.now() - 86_400_000 * 3));

      const firstTrackResponse = await api.post(`/players/psikoi`);
      expect(firstTrackResponse.status).toBe(201);
      expect(firstTrackResponse.body.latestSnapshot.data.skills.smithing.experience).toBe(6_177_978);

      // Reset the timers to the current (REAL) time
      jest.useRealTimers();

      const modifiedRawData = modifyRawHiscoresData(globalData.hiscoresRawData, [
        { metric: Metric.SMITHING, value: 6_177_978 + 50_000 }
      ]);

      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      const secondtrackResponse = await api.post(`/players/psikoi`);
      expect(secondtrackResponse.status).toBe(200);

      // Wait for the deltas to update, followed by the records
      await sleep(500);

      const recordsResponse = await api.get(`/players/psikoi/records`);
      expect(recordsResponse.status).toBe(200);
      expect(recordsResponse.body.length).toBe(9); // 3 each from smithing, overall and ehp
      expect(recordsResponse.body.filter(r => r.value === 50_000).length).toBe(6); // 3 each from smithing and overall
      expect(recordsResponse.body.filter(r => r.metric === Metric.OVERALL).length).toBe(3);
      expect(recordsResponse.body.filter(r => r.metric === Metric.SMITHING).length).toBe(3);
      expect(recordsResponse.body.filter(r => r.metric === Metric.EHP).length).toBe(3);
      expect(recordsResponse.body.filter(r => r.metric === Metric.EHP)[0].value).toBeLessThan(1);
      expect(recordsResponse.body.map(r => r.period)).not.toContain('day');
      expect(recordsResponse.body.map(r => r.period)).not.toContain('five_min');
    });

    it('should replace & create player records (day, five_min)', async () => {
      const modifiedRawData = modifyRawHiscoresData(globalData.hiscoresRawData, [
        { metric: Metric.SMITHING, value: 6_177_978 + 50_000 + 20_000 }
      ]);

      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      const trackResponse = await api.post(`/players/psikoi`);
      expect(trackResponse.status).toBe(200);

      // Wait for the deltas to update, followed by the records
      await sleep(500);

      const recordsResponse = await api.get(`/players/psikoi/records`);
      expect(recordsResponse.status).toBe(200);
      expect(recordsResponse.body.length).toBe(15); // 5 each from smithing, overall and ehp
      expect(recordsResponse.body.filter(r => r.value === 70_000).length).toBe(6); // 3 each from smithing and overall
      expect(recordsResponse.body.filter(r => r.value === 20_000).length).toBe(4); // 2 each from smithing and overall
      expect(recordsResponse.body.filter(r => r.value < 1 && r.metric === Metric.EHP).length).toBe(5);
      expect(recordsResponse.body.filter(r => r.metric === Metric.SMITHING).length).toBe(5);
      expect(recordsResponse.body.map(r => r.period)).toContain('day');
      expect(recordsResponse.body.map(r => r.period)).toContain('five_min');
    });

    it('should not replace existing player records (lower value)', async () => {
      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: globalData.hiscoresRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      const firstTrackResponse = await api.post(`/players/sethmare`);
      expect(firstTrackResponse.status).toBe(201);
      expect(firstTrackResponse.body.latestSnapshot.data.bosses.zulrah.kills).toBe(1646);

      // Create records manually
      await prisma.record.createMany({
        data: [
          { playerId: firstTrackResponse.body.id, metric: Metric.ZULRAH, value: 100, period: 'day' },
          { playerId: firstTrackResponse.body.id, metric: Metric.ZULRAH, value: 100, period: 'week' },
          { playerId: firstTrackResponse.body.id, metric: Metric.ZULRAH, value: 100, period: 'month' },
          { playerId: firstTrackResponse.body.id, metric: Metric.ZULRAH, value: 100, period: 'year' }
        ]
      });

      const modifiedRawData = modifyRawHiscoresData(globalData.hiscoresRawData, [
        { metric: Metric.ZULRAH, value: 1646 + 10 }
      ]);

      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      const secondtrackResponse = await api.post(`/players/sethmare`);
      expect(secondtrackResponse.status).toBe(200);

      // Wait for the deltas to update, followed by the records
      await sleep(500);

      const recordsResponse = await api.get(`/players/sethmare/records`);
      expect(recordsResponse.status).toBe(200);
      expect(recordsResponse.body.map(r => r.period)).toContain('five_min');
      expect(recordsResponse.body.filter(r => r.metric === Metric.ZULRAH).length).toBe(5);
      expect(recordsResponse.body.filter(r => r.metric === Metric.EHB && r.value < 1).length).toBe(5);
      expect(recordsResponse.body.filter(r => r.value === 10).length).toBe(1); // none of the day+ records updated, only five_min was added
    });

    it('should not create collection log records (added to the hiscores way after in-game release)', async () => {
      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: globalData.hiscoresRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      const firstTrackResponse = await api.post(`/players/eren`);
      expect(firstTrackResponse.status).toBe(201);
      expect(firstTrackResponse.body.latestSnapshot.data.bosses.zulrah.kills).toBe(1646);

      let modifiedRawData = modifyRawHiscoresData(globalData.hiscoresRawData, [
        { metric: Metric.COLLECTIONS_LOGGED, value: 623 }
      ]);

      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      const secondtrackResponse = await api.post(`/players/eren`);
      expect(secondtrackResponse.status).toBe(200);

      // Wait for the deltas to update, followed by the records
      await sleep(500);

      const firstRecordsResponse = await api.get(`/players/eren/records`);
      expect(firstRecordsResponse.status).toBe(200);
      expect(firstRecordsResponse.body.length).toBe(0);

      modifiedRawData = modifyRawHiscoresData(globalData.hiscoresRawData, [
        { metric: Metric.COLLECTIONS_LOGGED, value: 627 }
      ]);

      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      const thirdTrackResponse = await api.post(`/players/eren`);
      expect(thirdTrackResponse.status).toBe(200);

      // Wait for the deltas to update, followed by the records
      await sleep(500);

      const secondRecordsResponse = await api.get(`/players/eren/records`);
      expect(secondRecordsResponse.status).toBe(200);
      expect(secondRecordsResponse.body.length).toBe(0);
    });
  });

  describe('2 - Fetch Player Records', () => {
    it('should not fetch records (player not found)', async () => {
      const firstResponse = await api.get(`/players/unknown_username/records`);

      expect(firstResponse.status).toBe(404);
      expect(firstResponse.body.message).toBe('Player not found.');
    });

    it('should not fetch records (invalid period)', async () => {
      const response = await api.get(`/players/psikoi/records`).query({ period: 'decade' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid enum value for 'period'.");
    });

    it('should not fetch records (invalid metric)', async () => {
      const response = await api.get(`/players/psikoi/records`).query({ metric: 'sailing' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid enum value for 'metric'.");
    });

    it('should fetch records (no filters)', async () => {
      const response = await api.get(`/players/psikoi/records`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(15);
      expect(response.body.map(r => r.metric)).toContain(Metric.OVERALL);
      expect(response.body.map(r => r.metric)).toContain(Metric.SMITHING);
      expect(response.body.map(r => r.metric)).toContain(Metric.EHP);
    });

    it('should fetch records (undefined filters, ignored)', async () => {
      const response = await api
        .get(`/players/sethmare/records`)
        .query({ metric: undefined, period: undefined }); // The API should ignore these params

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(10);
      expect(response.body.map(r => r.metric)).toContain(Metric.ZULRAH);
      expect(response.body.map(r => r.metric)).toContain(Metric.EHB);
      expect(response.body.filter(r => r.metric === Metric.EHB)[0].value).toBeLessThan(1);
    });

    it('should fetch records (with filters)', async () => {
      const response = await api
        .get(`/players/sethmare/records`)
        .query({ metric: Metric.ZULRAH, period: 'week' });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0]).toMatchObject({ value: 100, metric: Metric.ZULRAH, period: 'week' });
    });
  });

  describe('3 - Fetch Group Records', () => {
    it('should not fetch records (undefined metric)', async () => {
      const response = await api.get(`/groups/2000000000/records`).query({ period: 'day' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Parameter 'metric' is undefined.");
    });

    it('should not fetch records (undefined period)', async () => {
      const response = await api.get(`/groups/2000000000/records`).query({ metric: 'a' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Parameter 'period' is undefined.");
    });

    it('should not fetch records (group not found)', async () => {
      const response = await api
        .get(`/groups/2000000000/records`)
        .query({ metric: 'zulrah', period: 'week' });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Group not found.');
    });

    it('should not fetch records (invalid period)', async () => {
      const createGroupResponse = await api.post('/groups').send({ name: 'Test (empty)', members: [] });

      globalData.testEmptyGroupId = createGroupResponse.body.group.id;

      expect(createGroupResponse.status).toBe(201);
      expect(createGroupResponse.body.group.memberships).toEqual([]);

      const response = await api
        .get(`/groups/${globalData.testEmptyGroupId}/records`)
        .query({ metric: 'a', period: 'b' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid enum value for 'period'.");
    });

    it('should not fetch records (invalid metric)', async () => {
      const response = await api
        .get(`/groups/${globalData.testEmptyGroupId}/records`)
        .query({ metric: 'a', period: 'day' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid enum value for 'metric'.");
    });

    it('should fetch records (empty group)', async () => {
      const response = await api
        .get(`/groups/${globalData.testEmptyGroupId}/records`)
        .query({ metric: 'ranged', period: 'day' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should fetch records', async () => {
      // Mock the hiscores to mark the next tracked player as a regular ironman
      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: globalData.hiscoresRawData },
        [PlayerType.IRONMAN]: { statusCode: 200, rawData: globalData.hiscoresRawData },
        [PlayerType.HARDCORE]: { statusCode: 404 },
        [PlayerType.ULTIMATE]: { statusCode: 404 }
      });

      // Track Jakesterwars as ironman
      const firstTrackResponse = await api.post(`/players/Jakesterwars`);

      expect(firstTrackResponse.status).toBe(201);
      expect(firstTrackResponse.body.type).toBe('ironman');
      expect(firstTrackResponse.body.username).toBe('jakesterwars');

      // Add zulrah and smithing gains
      const modifiedRawData = modifyRawHiscoresData(globalData.hiscoresRawData, [
        { metric: Metric.ZULRAH, value: 1646 + 7 },
        { metric: Metric.SMITHING, value: 6_177_978 + 1337 }
      ]);

      // Mock the hiscores to mark the next tracked player as a regular ironman (and modified data)
      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerType.IRONMAN]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerType.HARDCORE]: { statusCode: 404 },
        [PlayerType.ULTIMATE]: { statusCode: 404 }
      });

      // Track Jakesterwars again
      const secondtrackResponse = await api.post(`/players/Jakesterwars`);
      expect(secondtrackResponse.status).toBe(200);

      // Wait for the deltas to update, followed by the records
      await sleep(500);

      // Create new group, with 3 members
      const createGroupResponse = await api.post('/groups').send({
        name: 'Test',
        members: ['Psikoi', 'sethmare', 'jakesterwars'].map(username => ({ username }))
      });

      globalData.testRegularGroupId = createGroupResponse.body.group.id;

      const rangedRecordsResponse = await api
        .get(`/groups/${globalData.testRegularGroupId}/records`)
        .query({ metric: 'ranged', period: 'day' });

      expect(rangedRecordsResponse.status).toBe(200);
      expect(rangedRecordsResponse.body.length).toBe(0);

      const smithingRecordsResponse = await api
        .get(`/groups/${globalData.testRegularGroupId}/records`)
        .query({ metric: 'smithing', period: 'day' });

      expect(smithingRecordsResponse.status).toBe(200);
      expect(smithingRecordsResponse.body.length).toBe(2);
      expect(smithingRecordsResponse.body.filter(r => r.metric !== 'smithing').length).toBe(0);
      expect(smithingRecordsResponse.body.filter(r => r.period !== 'day').length).toBe(0);

      expect(smithingRecordsResponse.body[0]).toMatchObject({
        metric: 'smithing',
        period: 'day',
        value: 20_000,
        player: {
          username: 'psikoi',
          type: 'regular'
        }
      });

      expect(smithingRecordsResponse.body[1]).toMatchObject({
        metric: 'smithing',
        period: 'day',
        value: 1337,
        player: {
          username: 'jakesterwars',
          type: 'ironman'
        }
      });
    });

    it('should fetch records (and correctly parse computed metrics)', async () => {
      const response = await api
        .get(`/groups/${globalData.testRegularGroupId}/records`)
        .query({ metric: 'ehp', period: 'day' });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
      expect(response.body.filter(r => r.value < 1).length).toBe(2);
    });

    it('should fetch records (with pagination)', async () => {
      const response = await api
        .get(`/groups/${globalData.testRegularGroupId}/records`)
        .query({ metric: 'smithing', period: 'day', limit: 1, offset: 1 });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body.filter(r => r.metric !== 'smithing').length).toBe(0);
      expect(response.body.filter(r => r.period !== 'day').length).toBe(0);

      expect(response.body[0]).toMatchObject({
        metric: 'smithing',
        period: 'day',
        value: 1337,
        player: {
          username: 'jakesterwars',
          type: 'ironman'
        }
      });
    });
  });

  describe('4 - Leaderboards', () => {
    it('should not fetch leaderboards (undefined period)', async () => {
      const response = await api.get(`/records/leaderboard`);
      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Parameter 'period' is undefined.");
    });

    it('should not fetch leaderboards (invalid period)', async () => {
      const response = await api.get(`/records/leaderboard`).query({ period: 'decade' });
      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid enum value for 'period'.");
    });

    it('should not fetch leaderboards (undefined metric)', async () => {
      const response = await api.get(`/records/leaderboard`).query({ period: 'week' });
      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Parameter 'metric' is undefined.");
    });

    it('should not fetch leaderboards (invalid metric)', async () => {
      const response = await api.get(`/records/leaderboard`).query({ period: 'week', metric: 'abc' });
      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid enum value for 'metric'.");
    });

    it('should not fetch leaderboards (invalid player type)', async () => {
      const response = await api
        .get(`/records/leaderboard`)
        .query({ period: 'week', metric: 'obor', playerType: 'a' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid enum value for 'playerType'.");
    });

    it('should not fetch leaderboards (invalid player build)', async () => {
      const response = await api
        .get(`/records/leaderboard`)
        .query({ period: 'week', metric: 'obor', playerBuild: 'a' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid enum value for 'playerBuild'.");
    });

    it('should not fetch leaderboards (invalid player country)', async () => {
      const response = await api
        .get(`/records/leaderboard`)
        .query({ period: 'week', metric: 'obor', country: 'a' });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Invalid enum value for 'country'.");
    });

    it('should fetch leaderboards (no player filters)', async () => {
      // Mock the hiscores to mark the next tracked player as a regular ironman
      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: globalData.hiscoresRawData },
        [PlayerType.IRONMAN]: { statusCode: 200, rawData: globalData.hiscoresRawData },
        [PlayerType.HARDCORE]: { statusCode: 200, rawData: globalData.hiscoresRawData },
        [PlayerType.ULTIMATE]: { statusCode: 404 }
      });

      // Track Jakesterwars as ironman
      const firstTrackResponse = await api.post(`/players/USBC`);

      expect(firstTrackResponse.status).toBe(201);
      expect(firstTrackResponse.body.type).toBe('hardcore');
      expect(firstTrackResponse.body.username).toBe('usbc');

      // Add zulrah and smithing gains
      const modifiedRawData = modifyRawHiscoresData(globalData.hiscoresRawData, [
        { metric: Metric.ZULRAH, value: 1646 + 70 },
        { metric: Metric.SMITHING, value: 6_177_978 + 620_000 }
      ]);

      // Mock the hiscores to mark the next tracked player as a regular ironman (and modified data)
      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerType.IRONMAN]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerType.HARDCORE]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerType.ULTIMATE]: { statusCode: 404 }
      });

      // Track Jakesterwars again
      const secondtrackResponse = await api.post(`/players/usbc`);
      expect(secondtrackResponse.status).toBe(200);

      // Wait for the deltas to update, followed by the records
      await sleep(500);

      const response = await api.get(`/records/leaderboard`).query({ period: 'week', metric: 'smithing' });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(3);

      expect(response.body[0]).toMatchObject({
        metric: 'smithing',
        period: 'week',
        value: 620_000,
        player: { username: 'usbc' }
      });

      expect(response.body[1]).toMatchObject({
        metric: 'smithing',
        period: 'week',
        value: 70_000,
        player: { username: 'psikoi' }
      });

      expect(response.body[2]).toMatchObject({
        metric: 'smithing',
        period: 'week',
        value: 1337,
        player: { username: 'jakesterwars' }
      });
    });

    it('should fetch leaderboards (with player type filter)', async () => {
      const response = await api
        .get(`/records/leaderboard`)
        .query({ period: 'day', metric: 'smithing', playerType: 'ironman' });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);

      // Hardcores and Ultimates should be included in the leaderboards for "ironman" (USBC is Hardcore)
      expect(response.body[0]).toMatchObject({
        metric: 'smithing',
        period: 'day',
        value: 620_000,
        player: { username: 'usbc' }
      });

      expect(response.body[1]).toMatchObject({
        metric: 'smithing',
        period: 'day',
        value: 1337,
        player: { username: 'jakesterwars' }
      });
    });

    it('should fetch leaderboards (with player country filter)', async () => {
      const updateCountryResponse = await api
        .put('/players/usbc/country')
        .send({ country: 'SE', adminPassword: process.env.ADMIN_PASSWORD });

      expect(updateCountryResponse.status).toBe(200);
      expect(updateCountryResponse.body).toMatchObject({ username: 'usbc', country: 'SE' });

      const response = await api
        .get(`/records/leaderboard`)
        .query({ period: 'month', metric: 'smithing', country: 'SE' });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);

      expect(response.body[0]).toMatchObject({
        metric: 'smithing',
        period: 'month',
        value: 620_000,
        player: { username: 'usbc' }
      });
    });

    it('should fetch leaderboards (and correctly parse computed metrics)', async () => {
      const response = await api.get(`/records/leaderboard`).query({ period: 'month', metric: 'ehp' });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(3);
      expect(response.body.filter(r => r.value < 3).length).toBe(3);
    });
  });
});
