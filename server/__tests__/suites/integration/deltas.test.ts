import axios from 'axios';
import supertest from 'supertest';
import MockAdapter from 'axios-mock-adapter';
import { PlayerType, Metric } from '../../../src/utils';
import env from '../../../src/env';
import apiServer from '../../../src/api';
import {
  registerCMLMock,
  registerHiscoresMock,
  resetDatabase,
  resetRedis,
  sleep,
  readFile,
  modifyRawHiscoresData
} from '../../utils';
import prisma from '../../../src/prisma';
import * as services from '../../../src/api/modules/deltas/delta.services';

const api = supertest(apiServer);
const axiosMock = new MockAdapter(axios, { onNoMatch: 'passthrough' });

const HISCORES_FILE_PATH = `${__dirname}/../../data/hiscores/psikoi_hiscores.txt`;

const globalData = {
  hiscoresRawData: '',
  testGroupId: -1,
  testPlayerId: -1,
  secondaryTestPlayerId: -1
};

beforeAll(async done => {
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

  done();
});

afterAll(async done => {
  axiosMock.reset();
  done();
});

describe('Deltas API', () => {
  describe('1 - Syncing Player Deltas', () => {
    it('should sync player deltas', async () => {
      // Fake the current date to be 3 days ago
      jest.useFakeTimers('modern').setSystemTime(new Date(Date.now() - 86_400_000 * 3));

      const firstTrackResponse = await api.post(`/players/psikoi`);
      expect(firstTrackResponse.status).toBe(201);
      expect(firstTrackResponse.body.latestSnapshot.data.skills.smithing.experience).toBe(6_177_978);

      globalData.testPlayerId = firstTrackResponse.body.id;

      // Reset the timers to the current (REAL) time
      jest.useRealTimers();

      // Wait for the deltas to update
      await sleep(500);

      const firstDeltas = await prisma.delta.findMany({
        where: { playerId: firstTrackResponse.body.id }
      });

      // Player was only updated once, shouldn't have enough data to calculate deltas yet
      expect(firstDeltas.length).toBe(0);

      let modifiedRawData = modifyRawHiscoresData(globalData.hiscoresRawData, [
        { metric: Metric.LAST_MAN_STANDING, value: 500 },
        { metric: Metric.SMITHING, value: 6_177_978 + 50_000 },
        { metric: Metric.OVERALL, value: -1 },
        { metric: Metric.NEX, value: 53 }
      ]);

      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      const secondTrackResponse = await api.post(`/players/psikoi`);
      expect(secondTrackResponse.status).toBe(200);

      // Wait for the deltas to update
      await sleep(500);

      const secondDeltas = await prisma.delta.findMany({
        where: { playerId: firstTrackResponse.body.id }
      });

      const monthDeltas = secondDeltas.find(f => f.period === 'month');

      expect(secondDeltas.length).toBe(3);
      expect(secondDeltas.filter(d => d.ehp > 0.1).length).toBe(3);
      expect(secondDeltas.filter(d => d.ehb > 0.1).length).toBe(3);
      expect(secondDeltas.filter(d => d.nex === 4).length).toBe(3); // 53 - 49 (min kc) = 4
      expect(secondDeltas.filter(d => d.smithing === 50_000).length).toBe(3);
      expect(secondDeltas.filter(d => d.smithing === 50_000).map(d => d.period)).toContain('week');
      expect(secondDeltas.filter(d => d.smithing === 50_000).map(d => d.period)).toContain('month');
      expect(secondDeltas.filter(d => d.smithing === 50_000).map(d => d.period)).toContain('year');

      // All deltas' end snapshot is the latest one
      expect(secondDeltas.filter(d => Date.now() - d.endedAt.getTime() > 10_000).length).toBe(0);

      modifiedRawData = modifyRawHiscoresData(globalData.hiscoresRawData, [
        { metric: Metric.SMITHING, value: 6_177_978 + 50_000 },
        { metric: Metric.LAST_MAN_STANDING, value: 450 },
        { metric: Metric.NEX, value: 54 },
        { metric: Metric.TZKAL_ZUK, value: 1 },
        { metric: Metric.SOUL_WARS_ZEAL, value: 7 }
      ]);

      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      const thirdTrackResponse = await api.post(`/players/psikoi`);
      expect(thirdTrackResponse.status).toBe(200);

      // Setup mocks for HCIM for the second test player later on (hydrox6)
      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerType.IRONMAN]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerType.HARDCORE]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerType.ULTIMATE]: { statusCode: 404 }
      });

      // Wait for the deltas to update
      await sleep(500);

      const dayDeltas = await prisma.delta.findFirst({
        where: { playerId: firstTrackResponse.body.id, period: 'day' }
      });

      expect(dayDeltas.nex).toBe(1);
      expect(dayDeltas.tzkal_zuk).toBe(1);
      expect(dayDeltas.soul_wars_zeal).toBe(7); // soul wars went from -1 (unranked) to 7, make sure it's 7 gained, not 8
      expect(dayDeltas.last_man_standing).toBe(0); // LMS went DOWN from 500 to 450, don't show negative gains
      expect(dayDeltas.ehb).toBeLessThan(monthDeltas.ehb); // gained less boss kc, expect ehb gains to be lesser
      expect(parseInt(dayDeltas.overall.toString())).toBe(0); // overall went from -1 to 300m, show 0 gains
    });
  });

  describe('2 - Fetch Player Deltas', () => {
    it('should not fetch (invalid player id)', async () => {
      await expect(services.findPlayerDeltas({ id: null })).rejects.toThrow(
        "Parameter 'id' is not a valid number."
      );
    });

    it('should not fetch (player not found)', async () => {
      await expect(services.findPlayerDeltas({ id: 2_000_000, period: 'week' })).rejects.toThrow(
        'Player not found.'
      );
    });

    it('should not fetch (no snapshots found with player id)', async () => {
      // Create a brand new account, with no snapshots
      const testPlayer = await prisma.player.create({ data: { username: 'test', displayName: 'Test' } });

      const result = await services.findPlayerDeltas({ id: testPlayer.id, period: 'week' });

      // If there are no snapshots found for the given period, it'll return an empty diff
      expect(result.startsAt).toBe(null);
      expect(result.endsAt).toBe(null);
    });

    it('should not fetch (invalid period)', async () => {
      const response = await api.get(`/players/psikoi/gained`).query({ period: 'decade' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid period: decade.');
    });

    it('should not fetch (invalid period and dates)', async () => {
      const response = await api.get(`/players/psikoi/gained`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid period and start/end dates.');
    });

    it('should fetch (common periods + map formatting)', async () => {
      const weekResponse = await api
        .get(`/players/psikoi/gained`)
        .query({ period: 'week', formatting: 'map' });

      expect(weekResponse.status).toBe(200);

      const weekSmithingGains = weekResponse.body.data.skills.smithing;
      const weekEHPGains = weekResponse.body.data.virtuals.ehp;

      expect(weekSmithingGains.ehp.gained).toBeGreaterThan(0.1);
      expect(weekEHPGains.value.gained).toBe(weekSmithingGains.ehp.gained);
      expect(weekSmithingGains.experience).toMatchObject({ start: 6177978, end: 6227978, gained: 50_000 });

      const monthResponse = await api.get(`/players/psikoi/gained`).query({ period: 'month' });

      expect(monthResponse.status).toBe(200);

      const monthNexGains = monthResponse.body.data.bosses.nex;
      const monthZukGains = monthResponse.body.data.bosses.tzkal_zuk;
      const monthEhbGains = monthResponse.body.data.virtuals.ehb;
      const monthLmsGains = monthResponse.body.data.activities.last_man_standing;

      expect(monthNexGains.ehb.gained).toBeGreaterThan(0.1);
      expect(monthEhbGains.value.gained).toBe(monthNexGains.ehb.gained + monthZukGains.ehb.gained);
      expect(monthNexGains.kills).toMatchObject({ start: -1, end: 54, gained: 5 });
      expect(monthLmsGains.score).toMatchObject({ start: 500, end: 450, gained: 0 });

      const dayResponse = await api.get(`/players/psikoi/gained`).query({ period: 'day' });

      expect(dayResponse.status).toBe(200);

      const dayOverallGains = dayResponse.body.data.skills.overall;

      expect(dayOverallGains.experience).toMatchObject({ start: -1, end: 300192115, gained: 0 });
    });

    it('should fetch (custom period + array formatting)', async () => {
      const response = await api
        .get(`/players/psikoi/gained`)
        .query({ period: '5m2w3d', formatting: 'array' });

      expect(response.status).toBe(200);
      expect(response.body.data.skills.find(s => s.metric === 'smithing').experience.gained).toBe(50_000);
    });

    it('should not fetch deltas between (min date greater than max date)', async () => {
      const response = await api.get(`/players/psikoi/gained`).query({
        startDate: new Date('2021-12-14T04:15:36.000Z'),
        endDate: new Date('2015-12-14T04:15:36.000Z')
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Min date must be before the max date.');
    });

    it('should fetch deltas between (array formatting)', async () => {
      const response = await api.get(`/players/psikoi/gained`).query({
        startDate: new Date('2015-12-14T04:15:36.000Z'),
        endDate: new Date('2022-12-14T04:15:36.000Z'),
        formatting: 'array'
      });

      expect(response.status).toBe(200);
      expect(response.body.period).toBeUndefined();
      expect(response.body.data.skills.find(s => s.metric === 'smithing').experience.gained).toBe(50_000);
    });
  });

  describe('2 - Fetch Group Deltas', () => {
    it('should not fetch (invalid period)', async () => {
      const trackResponse = await api.post(`/players/hydrox6`);
      expect(trackResponse.status).toBe(201);
      expect(trackResponse.body.type).toBe('hardcore');

      globalData.secondaryTestPlayerId = trackResponse.body.id;

      const createGroupResponse = await api.post('/groups').send({
        name: 'Test Group',
        members: [{ username: 'psikoi' }, { username: 'hydrox6' }]
      });

      expect(createGroupResponse.status).toBe(201);
      expect(createGroupResponse.body.group.memberships.length).toBe(2);

      globalData.testGroupId = createGroupResponse.body.group.id;

      await expect(
        services.findGroupDeltas({
          id: globalData.testGroupId,
          metric: 'smithing',
          period: 'decade'
        })
      ).rejects.toThrow('Invalid period: decade.');
    });

    it('should not fetch (invalid metric)', async () => {
      await expect(
        services.findGroupDeltas({
          id: globalData.testGroupId,
          metric: 'sailing' as any,
          period: 'week'
        })
      ).rejects.toThrow("Invalid enum value for 'metric'");
    });

    it('should not fetch (group not found)', async () => {
      await expect(
        services.findGroupDeltas({
          id: 2_000_000,
          metric: 'smithing',
          period: 'week',
          limit: 20,
          offset: 0
        })
      ).rejects.toThrow('Group not found.');
    });

    it('should fetch group deltas (common period)', async () => {
      const directResponse = await services.findGroupDeltas({
        id: globalData.testGroupId,
        metric: 'smithing',
        period: 'week'
      });

      expect(directResponse[0]).toMatchObject({
        player: { username: 'psikoi' },
        data: { start: 6_177_978, end: 6_227_978, gained: 50_000 }
      });

      expect(directResponse[1]).toMatchObject({
        player: { username: 'hydrox6' },
        data: { start: 6227978, end: 6227978, gained: 0 }
      });

      expect(Date.now() - directResponse[0].startDate.getTime()).toBeLessThan(604_800_000);
      expect(Date.now() - directResponse[0].endDate.getTime()).toBeLessThan(10_000);
    });

    it('should fetch group deltas (custom period)', async () => {
      const directResponse = await services.findGroupDeltas({
        id: globalData.testGroupId,
        metric: 'smithing',
        period: '3d6h'
      });

      expect(directResponse[0]).toMatchObject({
        player: { username: 'psikoi' },
        data: { start: 6_177_978, end: 6227978, gained: 50_000 }
      });

      expect(directResponse[1]).toMatchObject({
        player: { username: 'hydrox6' },
        data: { start: 6227978, end: 6227978, gained: 0 }
      });

      expect(Date.now() - directResponse[0].startDate.getTime()).toBeLessThan(280_800_000);
      expect(Date.now() - directResponse[0].endDate.getTime()).toBeLessThan(10_000);
    });

    it('should not fetch deltas between (min date greater than max date)', async () => {
      await expect(
        services.findGroupDeltas({
          id: globalData.testGroupId,
          metric: 'smithing',
          minDate: new Date('2021-12-14T04:15:36.000Z'),
          maxDate: new Date('2015-12-14T04:15:36.000Z')
        })
      ).rejects.toThrow('Min date must be before the max date.');
    });

    it('should fetch group deltas (time range)', async () => {
      const emptyGains = await services.findGroupDeltas({
        id: globalData.testGroupId,
        metric: 'smithing',
        minDate: new Date('2015-12-14T04:15:36.000Z'),
        maxDate: new Date('2021-12-14T04:15:36.000Z')
      });

      expect(emptyGains.length).toBe(0);

      const recentGains = await services.findGroupDeltas({
        id: globalData.testGroupId,
        metric: 'smithing',
        minDate: new Date('2021-12-14T04:15:36.000Z'),
        maxDate: new Date('2025-12-14T04:15:36.000Z')
      });

      expect(recentGains[0]).toMatchObject({
        player: { username: 'psikoi' },
        data: { start: 6_177_978, end: 6227978, gained: 50_000 }
      });

      expect(recentGains[1]).toMatchObject({
        player: { username: 'hydrox6' },
        data: { start: 6227978, end: 6227978, gained: 0 }
      });

      expect(recentGains[0].startDate.getTime()).toBeGreaterThan(
        new Date('2021-12-14T04:15:36.000Z').getTime()
      );

      expect(recentGains[0].endDate.getTime()).toBeLessThan(new Date('2025-12-14T04:15:36.000Z').getTime());

      const apiResponse = await api.get(`/groups/${globalData.testGroupId}/gained`).query({
        metric: 'smithing',
        startDate: '2021-12-14T04:15:36.000Z',
        endDate: '2025-12-14T04:15:36.000Z'
      });

      expect(apiResponse.status).toBe(200);
      expect(JSON.stringify(apiResponse.body)).toEqual(JSON.stringify(recentGains));
    });

    it('should not fetch group deltas (negative offset)', async () => {
      const response = await api
        .get(`/groups/${globalData.testGroupId}/gained`)
        .query({ metric: 'smithing', period: 'week', offset: -5 });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'offset' must be >= 0.");
    });

    it('should not fetch group deltas (negative limit)', async () => {
      const response = await api
        .get(`/groups/${globalData.testGroupId}/gained`)
        .query({ metric: 'smithing', period: 'week', limit: -5 });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'limit' must be > 0.");
    });

    it('should fetch group deltas (with offset)', async () => {
      const result = await services.findGroupDeltas({
        id: globalData.testGroupId,
        metric: 'smithing',
        minDate: new Date('2021-12-14T04:15:36.000Z'),
        maxDate: new Date('2025-12-14T04:15:36.000Z'),
        limit: 1,
        offset: 1
      });

      expect(result.length).toBe(1);

      expect(result[0]).toMatchObject({
        player: { username: 'hydrox6' },
        data: { start: 6227978, end: 6227978, gained: 0 }
      });
    });
  });

  describe('3 - Fetch Group Monthly Top', () => {
    it('should not fetch group monthly top (group not found)', async () => {
      const response = await api.get('/groups/10000/monthly-top');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Group not found.');
    });

    it('should fetch group monthly top', async () => {
      const modifiedRawData = modifyRawHiscoresData(globalData.hiscoresRawData, [
        { metric: Metric.OVERALL, value: 500_000_000 },
        { metric: Metric.SMITHING, value: 7_000_000 },
        { metric: Metric.LAST_MAN_STANDING, value: 450 },
        { metric: Metric.NEX, value: 54 },
        { metric: Metric.TZKAL_ZUK, value: 1 },
        { metric: Metric.SOUL_WARS_ZEAL, value: 7 }
      ]);

      // Setup mocks for HCIM for the second test player later on (hydrox6)
      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerType.IRONMAN]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerType.HARDCORE]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerType.ULTIMATE]: { statusCode: 404 }
      });

      const trackResponse = await api.post(`/players/hydrox6`);
      expect(trackResponse.status).toBe(200);

      const response = await api.get(`/groups/${globalData.testGroupId}/monthly-top`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        player: { username: 'hydrox6' },
        data: { end: 500000000, gained: 199807885, start: 300192115 }
      });
    });

    it('should fetch group monthly top (empty group)', async () => {
      const emptyGroup = await prisma.group.create({
        data: { name: 'Empty Group', verificationHash: '' }
      });

      const response = await api.get(`/groups/${emptyGroup.id}/monthly-top`);

      expect(response.status).toBe(200);
      expect(response.body).toBeNull();
    });
  });

  describe('4 - Fetch Deltas Leaderboards', () => {
    it('should not fetch leaderboards (undefined period)', async () => {
      const response = await api.get(`/deltas/leaderboard`);
      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid enum value for 'period'.");
    });

    it('should not fetch leaderboards (invalid period)', async () => {
      const response = await api.get(`/deltas/leaderboard`).query({ period: 'decade' });
      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid enum value for 'period'.");
    });

    it('should not fetch leaderboards (undefined metric)', async () => {
      const response = await api.get(`/deltas/leaderboard`).query({ period: 'week' });
      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid enum value for 'metric'.");
    });

    it('should not fetch leaderboards (invalid metric)', async () => {
      const response = await api.get(`/deltas/leaderboard`).query({ period: 'week', metric: 'abc' });
      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid enum value for 'metric'.");
    });

    it('should not fetch leaderboards (invalid player type)', async () => {
      const response = await api
        .get(`/deltas/leaderboard`)
        .query({ period: 'week', metric: 'obor', playerType: 'a' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid enum value for 'playerType'.");
    });

    it('should not fetch leaderboards (invalid player build)', async () => {
      const response = await api
        .get(`/deltas/leaderboard`)
        .query({ period: 'week', metric: 'obor', playerBuild: 'a' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid enum value for 'playerBuild'.");
    });

    it('should not fetch leaderboards (invalid player country)', async () => {
      const response = await api
        .get(`/deltas/leaderboard`)
        .query({ period: 'week', metric: 'obor', country: 'a' });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Invalid enum value for 'country'.");
    });

    it('should fetch leaderboards (no player filters)', async () => {
      const modifiedRawData = modifyRawHiscoresData(globalData.hiscoresRawData, [
        { metric: Metric.OVERALL, value: 500_000_000 },
        { metric: Metric.SMITHING, value: 7_000_000 },
        { metric: Metric.LAST_MAN_STANDING, value: 450 },
        { metric: Metric.NEX, value: 54 },
        { metric: Metric.TZKAL_ZUK, value: 1 },
        { metric: Metric.SOUL_WARS_ZEAL, value: 7 }
      ]);

      // Setup mocks for HCIM for the second test player later on (hydrox6)
      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerType.IRONMAN]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerType.HARDCORE]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerType.ULTIMATE]: { statusCode: 404 }
      });

      const trackResponse = await api.post(`/players/hydrox6`);
      expect(trackResponse.status).toBe(200);
      expect(trackResponse.body.type).toBe('hardcore');
      expect(trackResponse.body.latestSnapshot.data.skills.smithing.experience).toBe(7_000_000);

      await sleep(500);

      const response = await api.get(`/deltas/leaderboard`).query({ period: 'week', metric: 'smithing' });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);

      expect(response.body[0]).toMatchObject({
        gained: 772_022,
        player: { username: 'hydrox6' }
      });

      expect(response.body[1]).toMatchObject({
        gained: 50_000,
        player: { username: 'psikoi' }
      });
    });

    it('should fetch leaderboards (with player type filter)', async () => {
      const response = await api
        .get(`/deltas/leaderboard`)
        .query({ period: 'week', metric: 'smithing', playerType: 'ironman' });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);

      // Hardcores and Ultimates should be included in the leaderboards for "ironman" (USBC is Hardcore)
      expect(response.body[0]).toMatchObject({
        gained: 772_022,
        player: { username: 'hydrox6', type: 'hardcore' }
      });
    });

    it('should fetch leaderboards (with player country filter)', async () => {
      const updateCountryResponse = await api
        .put('/players/psikoi/country')
        .send({ country: 'USA', adminPassword: env.ADMIN_PASSWORD });

      expect(updateCountryResponse.status).toBe(200);
      expect(updateCountryResponse.body).toMatchObject({
        username: 'psikoi',
        // USA is not a valid country code, but it is part of the few common aliases we accept
        // and should get replaced by US, so might as well test that it works
        country: 'US'
      });

      const response = await api
        .get(`/deltas/leaderboard`)
        .query({ period: 'month', metric: 'smithing', country: 'US' });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);

      expect(response.body[0]).toMatchObject({
        gained: 50_000,
        player: { username: 'psikoi' }
      });
    });
  });
});
