import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import supertest from 'supertest';
import APIInstance from '../../../src/api';
import { eventEmitter } from '../../../src/api/events';
import * as PlayerDeltaUpdatedEvent from '../../../src/api/events/handlers/player-delta-updated.event';
import { findGroupDeltas } from '../../../src/api/modules/deltas/services/FindGroupDeltasService';
import { findPlayerDeltas } from '../../../src/api/modules/deltas/services/FindPlayerDeltasService';
import prisma from '../../../src/prisma';
import { redisClient } from '../../../src/services/redis.service';
import { Metric, PlayerType } from '../../../src/types';
import { modifyRawHiscoresData, readFile, registerHiscoresMock, resetDatabase, sleep } from '../../utils';

const api = supertest(new APIInstance().init().express);
const axiosMock = new MockAdapter(axios, { onNoMatch: 'passthrough' });

const playerDeltaUpdatedEvent = jest.spyOn(PlayerDeltaUpdatedEvent, 'handler');

const globalData = {
  hiscoresRawData: '',
  testGroupId: -1,
  testPlayerId: -1,
  secondaryTestPlayerId: -1
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

  globalData.hiscoresRawData = await readFile(`${__dirname}/../../data/hiscores/psikoi_hiscores.json`);

  // Mock regular hiscores data, and block any ironman requests
  registerHiscoresMock(axiosMock, {
    [PlayerType.REGULAR]: { statusCode: 200, rawData: globalData.hiscoresRawData },
    [PlayerType.IRONMAN]: { statusCode: 404 }
  });
});

afterAll(() => {
  jest.useRealTimers();
  axiosMock.reset();
  redisClient.quit();
});

describe('Deltas API', () => {
  describe('1 - Syncing Player Deltas', () => {
    it('should not sync player deltas on (0 gains)', async () => {
      const firstTrackResponse = await api.post(`/players/jonxslays`);
      expect(firstTrackResponse.status).toBe(201);

      // Wait for the deltas to update
      await sleep(100);

      expect(playerDeltaUpdatedEvent).not.toHaveBeenCalled();

      const firstCachedDeltas = await prisma.cachedDelta.findMany({
        where: { playerId: firstTrackResponse.body.id }
      });

      // Player was only updated once, shouldn't have enough data to calculate deltas yet
      expect(firstCachedDeltas.length).toBe(0);

      const secondTrackResponse = await api.post(`/players/jonxslays`);
      expect(secondTrackResponse.status).toBe(200);

      // Wait for the deltas to update
      await sleep(100);

      expect(playerDeltaUpdatedEvent).not.toHaveBeenCalled();

      const secondCachedDeltas = await prisma.cachedDelta.findMany({
        where: { playerId: secondTrackResponse.body.id }
      });

      // Player now has enough snapshots, but no gains in between them, so delta calcs get skipped
      expect(secondCachedDeltas.length).toBe(0);
    });

    it('should sync player deltas', async () => {
      // Fake the current date to be 3 days ago
      jest.useFakeTimers().setSystemTime(new Date(Date.now() - 86_400_000 * 3));

      const firstTrackResponse = await api.post(`/players/psikoi`);
      expect(firstTrackResponse.status).toBe(201);
      expect(firstTrackResponse.body.latestSnapshot.data.skills.smithing.experience).toBe(6_177_978);
      expect(firstTrackResponse.body.latestSnapshot.data.skills.overall.experience).toBe(304_439_328);

      globalData.testPlayerId = firstTrackResponse.body.id;

      // Reset the timers to the current (REAL) time
      jest.useRealTimers();

      // Wait for the deltas to update
      await sleep(100);

      expect(playerDeltaUpdatedEvent).not.toHaveBeenCalled();

      const firstCachedDeltas = await prisma.cachedDelta.findMany({
        where: { playerId: firstTrackResponse.body.id }
      });

      // Player was only updated once, shouldn't have enough data to calculate deltas yet
      expect(firstCachedDeltas.length).toBe(0);

      let modifiedRawData = modifyRawHiscoresData(globalData.hiscoresRawData, [
        { hiscoresMetricName: 'LMS - Rank', value: 500 },
        { hiscoresMetricName: 'Smithing', value: 6_177_978 + 50_000 },
        { hiscoresMetricName: 'Overall', value: -1 },
        { hiscoresMetricName: 'Nex', value: 53 }
      ]);

      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      const secondTrackResponse = await api.post(`/players/psikoi`);
      expect(secondTrackResponse.status).toBe(200);

      expect(secondTrackResponse.body.latestSnapshot.data.skills.smithing.experience).toBe(
        6_177_978 + 50_000
      );

      expect(secondTrackResponse.body.latestSnapshot.data.skills.overall.experience).toBe(
        304_439_328 + 50_000
      ); // mocked as -1 overall, had to sum all skills' exp to use as the fallback

      // Wait for the deltas to update
      await sleep(100);

      // Only week, month and year deltas were updated, since the previous update was 3 days ago (> day & five_min)
      expect(playerDeltaUpdatedEvent).toHaveBeenCalledTimes(3);
      // On a player's first update, all their deltas are potential records
      expect(playerDeltaUpdatedEvent).toHaveBeenCalledWith(
        expect.objectContaining({ period: 'week', isPotentialRecord: true })
      );
      expect(playerDeltaUpdatedEvent).toHaveBeenCalledWith(
        expect.objectContaining({ period: 'month', isPotentialRecord: true })
      );
      expect(playerDeltaUpdatedEvent).toHaveBeenCalledWith(
        expect.objectContaining({ period: 'year', isPotentialRecord: true })
      );

      playerDeltaUpdatedEvent.mockClear();

      const secondCachedDeltas = await prisma.cachedDelta.findMany({
        where: { playerId: firstTrackResponse.body.id }
      });

      expect(secondCachedDeltas.length).toBe(15); // 5 periods * 3 metrics (ehp, ehb, nex, smithing, overall)
      expect(secondCachedDeltas.filter(c => c.metric === Metric.EHP && c.value > 0.1).length).toBe(3);
      expect(secondCachedDeltas.filter(c => c.metric === Metric.EHB && c.value > 0.1).length).toBe(3);
      expect(secondCachedDeltas.filter(c => c.metric === Metric.NEX && c.value === 49).length).toBe(3); // 53 - 4 (min kc is 5) = 49

      const smithingCachedDeltas = secondCachedDeltas.filter(c => c.metric === Metric.SMITHING);
      expect(smithingCachedDeltas.length).toBe(3);
      expect(smithingCachedDeltas.filter(c => c.value === 50_000).length).toBe(3);
      expect(smithingCachedDeltas.map(c => c.period)).toContain('week');
      expect(smithingCachedDeltas.map(c => c.period)).toContain('month');
      expect(smithingCachedDeltas.map(c => c.period)).toContain('year');
      const overallCachedDeltas = secondCachedDeltas.filter(c => c.metric === Metric.OVERALL);
      expect(overallCachedDeltas.length).toBe(3);
      expect(overallCachedDeltas.filter(c => c.value === 50_000).length).toBe(3);
      expect(overallCachedDeltas.map(c => c.period)).toContain('week');
      expect(overallCachedDeltas.map(c => c.period)).toContain('month');
      expect(overallCachedDeltas.map(c => c.period)).toContain('year');

      // All deltas' end snapshot is the latest one
      expect(secondCachedDeltas.filter(d => Date.now() - d.endedAt.getTime() > 10_000).length).toBe(0);

      const monthCachedDeltas = secondCachedDeltas.filter(c => c.period === 'month');

      modifiedRawData = modifyRawHiscoresData(globalData.hiscoresRawData, [
        { hiscoresMetricName: 'Overall', value: 304_439_328 + 50_000 },
        { hiscoresMetricName: 'Smithing', value: 6_177_978 + 50_000 },
        { hiscoresMetricName: 'LMS - Rank', value: 450 },
        { hiscoresMetricName: 'Nex', value: 54 },
        { hiscoresMetricName: 'TzKal-Zuk', value: 1 },
        { hiscoresMetricName: 'Soul Wars Zeal', value: 203 },
        { hiscoresMetricName: 'Bounty Hunter - Hunter', value: 5 }
      ]);

      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      const thirdTrackResponse = await api.post(`/players/psikoi`);
      expect(thirdTrackResponse.status).toBe(200);

      // Wait for the deltas to update
      await sleep(100);

      // All (5) new deltas are an improvement over the previous, so they should be considered for record checks
      expect(playerDeltaUpdatedEvent).toHaveBeenCalledTimes(5);
      // The player has now been updated within seconds of the last update, so their day and five_min deltas should update
      expect(playerDeltaUpdatedEvent).toHaveBeenCalledWith(
        expect.objectContaining({ period: 'five_min', isPotentialRecord: true })
      );
      expect(playerDeltaUpdatedEvent).toHaveBeenCalledWith(
        expect.objectContaining({ period: 'day', isPotentialRecord: true })
      );
      expect(playerDeltaUpdatedEvent).toHaveBeenCalledWith(
        expect.objectContaining({ period: 'week', isPotentialRecord: true })
      );
      expect(playerDeltaUpdatedEvent).toHaveBeenCalledWith(
        expect.objectContaining({ period: 'month', isPotentialRecord: true })
      );
      expect(playerDeltaUpdatedEvent).toHaveBeenCalledWith(
        expect.objectContaining({ period: 'year', isPotentialRecord: true })
      );

      playerDeltaUpdatedEvent.mockClear();

      const dayCachedDeltas = (await prisma.cachedDelta.findMany({
        where: { playerId: firstTrackResponse.body.id, period: 'day' }
      }))!;

      expect(dayCachedDeltas.find(c => c.metric === Metric.NEX)?.value).toBe(1);
      expect(dayCachedDeltas.find(c => c.metric === Metric.TZKAL_ZUK)?.value).toBe(1);
      expect(dayCachedDeltas.find(c => c.metric === Metric.BOUNTY_HUNTER_HUNTER)?.value).toBe(4); //  bh went from -1 (unranked) to 5 (min=2), make sure it's 4 gained, not 6
      expect(dayCachedDeltas.find(c => c.metric === Metric.SOUL_WARS_ZEAL)?.value).toBe(4); // soul wars went from -1 (unranked) to 203 (min=200), make sure it's 4 gained, not 204
      expect(dayCachedDeltas.find(c => c.metric === Metric.LAST_MAN_STANDING)).toBe(undefined); // LMS went DOWN from 500 to 450, we shouldn't show negative gains

      // gained less boss kc, expect ehb gains to be lesser
      expect(dayCachedDeltas.find(c => c.metric === Metric.EHB)?.value).toBeLessThan(
        monthCachedDeltas.find(c => c.metric === Metric.EHB)!.value
      );

      // Setup mocks for HCIM for the second test player later on (hydrox6)
      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerType.IRONMAN]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerType.HARDCORE]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerType.ULTIMATE]: { statusCode: 404 }
      });
    });
  });

  describe('2 - Fetch Player Deltas', () => {
    it('should not fetch (player not found)', async () => {
      await expect(findPlayerDeltas('woaaaaaah', 'week')).rejects.toThrow('Player not found.');
    });

    it('should not fetch (no snapshots found with player id)', async () => {
      // Create a brand new account, with no snapshots
      const testPlayer = await prisma.player.create({ data: { username: 'test', displayName: 'Test' } });

      const result = await findPlayerDeltas(testPlayer.username, 'week');

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
      const weekEHPGains = weekResponse.body.data.computed.ehp;

      expect(weekSmithingGains.ehp.gained).toBeGreaterThan(0.1);
      expect(weekEHPGains.value.gained).toBe(weekSmithingGains.ehp.gained);
      expect(weekSmithingGains.experience).toMatchObject({ start: 6177978, end: 6227978, gained: 50_000 });

      const monthResponse = await api.get(`/players/psikoi/gained`).query({ period: 'month' });

      expect(monthResponse.status).toBe(200);

      const monthNexGains = monthResponse.body.data.bosses.nex;
      const monthZukGains = monthResponse.body.data.bosses.tzkal_zuk;
      const monthEhbGains = monthResponse.body.data.computed.ehb;
      const monthLmsGains = monthResponse.body.data.activities.last_man_standing;

      expect(monthNexGains.ehb.gained).toBeGreaterThan(0.1);
      expect(monthEhbGains.value.gained).toBe(monthNexGains.ehb.gained + monthZukGains.ehb.gained);
      expect(monthNexGains.kills).toMatchObject({ start: -1, end: 54, gained: 50 });
      expect(monthLmsGains.score).toMatchObject({ start: 500, end: 450, gained: 0 });

      const dayResponse = await api.get(`/players/psikoi/gained`).query({ period: 'day' });

      expect(dayResponse.status).toBe(200);

      const dayOverallGains = dayResponse.body.data.skills.overall;

      expect(dayOverallGains.experience).toMatchObject({
        start: 304_489_328,
        end: 304_489_328,
        gained: 0
      });
    });

    it('should not fetch deltas between (min date greater than max date)', async () => {
      const response = await api.get(`/players/psikoi/gained`).query({
        startDate: new Date('2021-12-14T04:15:36.000Z'),
        endDate: new Date('2015-12-14T04:15:36.000Z')
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Min date must be before the max date.');
    });
  });

  describe('3 - Fetch Group Deltas', () => {
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

      await expect(findGroupDeltas(globalData.testGroupId, 'smithing', 'decade')).rejects.toThrow(
        'Invalid period: decade.'
      );
    });

    it('should not fetch (group not found)', async () => {
      await expect(
        findGroupDeltas(2_000_000, 'smithing', 'week', undefined, undefined, { limit: 20, offset: 0 })
      ).rejects.toThrow('Group not found.');
    });

    it('should fetch group deltas (common period)', async () => {
      const directResponse = await findGroupDeltas(globalData.testGroupId, 'smithing', 'week');

      expect(directResponse[0]).toMatchObject({
        player: { username: 'psikoi' },
        data: { gained: 50_000 }
      });

      expect(directResponse[1]).toMatchObject({
        player: { username: 'hydrox6' },
        data: { gained: 0 }
      });

      expect(Date.now() - directResponse[0].startDate.getTime()).toBeLessThan(604_800_000);
      expect(Date.now() - directResponse[0].endDate.getTime()).toBeLessThan(10_000);
    });

    it('should fetch group deltas (custom period)', async () => {
      const directResponse = await findGroupDeltas(globalData.testGroupId, 'smithing', '3d6h');

      expect(directResponse[0]).toMatchObject({
        player: { username: 'psikoi' },
        data: { gained: 50_000 }
      });

      expect(directResponse[1]).toMatchObject({
        player: { username: 'hydrox6' },
        data: { gained: 0 }
      });

      expect(Date.now() - directResponse[0].startDate.getTime()).toBeLessThan(280_800_000);
      expect(Date.now() - directResponse[0].endDate.getTime()).toBeLessThan(10_000);
    });

    it('should not fetch deltas between (min date greater than max date)', async () => {
      await expect(
        findGroupDeltas(
          globalData.testGroupId,
          'smithing',
          undefined,
          new Date('2021-12-14T04:15:36.000Z'),
          new Date('2015-12-14T04:15:36.000Z')
        )
      ).rejects.toThrow('Min date must be before the max date.');
    });

    it('should fetch group deltas (time range)', async () => {
      const emptyGains = await findGroupDeltas(
        globalData.testGroupId,
        'smithing',
        undefined,
        new Date('2015-12-14T04:15:36.000Z'),
        new Date('2021-12-14T04:15:36.000Z')
      );

      expect(emptyGains.length).toBe(0);

      const recentGains = await findGroupDeltas(
        globalData.testGroupId,
        'smithing',
        undefined,
        new Date('2021-12-14T04:15:36.000Z'),
        new Date('2025-12-14T04:15:36.000Z')
      );

      expect(recentGains[0]).toMatchObject({
        player: { username: 'psikoi' },
        data: { gained: 50_000 }
      });

      expect(recentGains[1]).toMatchObject({
        player: { username: 'hydrox6' },
        data: { gained: 0 }
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

      for (const gain of recentGains) {
        delete gain.player['latestSnapshot'];
      }

      expect(apiResponse.status).toBe(200);

      expect(apiResponse.body.length).toBe(recentGains.length);
      // expect(JSON.stringify(apiResponse.body)).toEqual(JSON.stringify(recentGains));

      for (let i = 0; i < apiResponse.body.length; i++) {
        expect(apiResponse.body[i].player.username).toEqual(recentGains[i].player.username);
        expect(apiResponse.body[i].startDate).toEqual(recentGains[i].startDate.toISOString());
        expect(apiResponse.body[i].endDate).toEqual(recentGains[i].endDate.toISOString());
        expect(apiResponse.body[i].data).toEqual(recentGains[i].data);
      }

      // Make sure latestSnapshot isn't leaking
      expect(apiResponse.body[0].player['latestSnapshot']).not.toBeDefined();
      expect(apiResponse.body[1].player['latestSnapshot']).not.toBeDefined();
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
      const result = await findGroupDeltas(
        globalData.testGroupId,
        'smithing',
        undefined,
        new Date('2021-12-14T04:15:36.000Z'),
        new Date('2025-12-14T04:15:36.000Z'),
        { limit: 1, offset: 1 }
      );

      expect(result.length).toBe(1);

      expect(result[0]).toMatchObject({
        player: { username: 'hydrox6' },
        data: { gained: 0 }
      });

      // Make sure latestSnapshot isn't leaking
      expect(result[0].player['latestSnapshot']).not.toBeDefined();
    });
  });

  describe('4 - Fetch Deltas Leaderboards', () => {
    it('should not fetch leaderboards (undefined period)', async () => {
      const response = await api.get(`/deltas/leaderboard`);
      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Parameter 'period' is undefined.");
    });

    it('should not fetch leaderboards (invalid period)', async () => {
      const response = await api.get(`/deltas/leaderboard`).query({ period: 'decade' });
      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid enum value for 'period'.");
    });

    it('should not fetch leaderboards (undefined metric)', async () => {
      const response = await api.get(`/deltas/leaderboard`).query({ period: 'week' });
      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Parameter 'metric' is undefined.");
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
        { hiscoresMetricName: 'Overall', value: 500_000_000 },
        { hiscoresMetricName: 'Smithing', value: 7_000_000 },
        { hiscoresMetricName: 'LMS - Rank', value: 450 },
        { hiscoresMetricName: 'Nex', value: 54 },
        { hiscoresMetricName: 'TzKal-Zuk', value: 1 },
        { hiscoresMetricName: 'Soul Wars Zeal', value: 203 },
        { hiscoresMetricName: 'Bounty Hunter - Hunter', value: 5 }
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

      await sleep(100);

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
        .send({ country: 'USA', adminPassword: process.env.ADMIN_PASSWORD });

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
