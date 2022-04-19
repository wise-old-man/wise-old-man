import axios from 'axios';
import supertest from 'supertest';
import { Metrics, PlayerType } from '@wise-old-man/utils';
import MockAdapter from 'axios-mock-adapter';
import apiServer from '../../src/api';
import {
  registerCMLMock,
  registerHiscoresMock,
  resetDatabase,
  sleep,
  readFile,
  modifyRawHiscoresData
} from '../utils';
import prisma from '../../src/prisma';
import * as service from '../../src/api/services/internal/delta.service';

const api = supertest(apiServer);
const axiosMock = new MockAdapter(axios, { onNoMatch: 'passthrough' });

const HISCORES_FILE_PATH = `${__dirname}/../data/hiscores/psikoi_hiscores.txt`;

const globalData = {
  hiscoresRawData: '',
  testPlayerId: -1,
  secondaryTestPlayerId: -1
};

beforeAll(async done => {
  await resetDatabase();

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

      const firstTrackResponse = await api.post(`/api/players/track`).send({ username: 'psikoi' });
      expect(firstTrackResponse.status).toBe(201);
      expect(firstTrackResponse.body.latestSnapshot.smithing.experience).toBe(6_177_978);

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
        { metric: Metrics.LAST_MAN_STANDING, value: 500 },
        { metric: Metrics.SMITHING, value: 6_177_978 + 50_000 },
        { metric: Metrics.OVERALL, value: -1 },
        { metric: Metrics.NEX, value: 53 }
      ]);

      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      const secondTrackResponse = await api.post(`/api/players/track`).send({ username: 'psikoi' });
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
        { metric: Metrics.SMITHING, value: 6_177_978 + 50_000 },
        { metric: Metrics.LAST_MAN_STANDING, value: 450 },
        { metric: Metrics.NEX, value: 54 },
        { metric: Metrics.TZKAL_ZUK, value: 1 },
        { metric: Metrics.SOUL_WARS_ZEAL, value: 7 }
      ]);

      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      const thirdTrackResponse = await api.post(`/api/players/track`).send({ username: 'psikoi' });
      expect(thirdTrackResponse.status).toBe(200);

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
      await expect(service.getPlayerDeltas(undefined as number)).rejects.toThrow('Invalid player id.');
    });

    it.skip('should not fetch (player not found)', async () => {
      await expect(service.getPlayerDeltas(2_000_000)).rejects.toThrow('Invalid player id.');
    });

    it('should not fetch (no snapshots found with player id)', async () => {
      const result = await service.getPlayerDeltas(2_000_000);

      // All periods return an empty diff
      // TODO: they should throw an error instead?
      expect(Object.values(result).filter(r => r.endsAt && r.startsAt).length).toBe(0);
    });

    it('should fetch all player deltas', async () => {
      const response = await api.get(`/api/players/username/psikoi/gained`);

      expect(response.status).toBe(200);

      const { week, month, year, day } = response.body;

      expect(week).toBeDefined();
      expect(week.data.smithing.ehp.gained).toBeGreaterThan(0.1);
      expect(week.data.ehp.value.gained).toBe(week.data.smithing.ehp.gained);
      expect(week.data.smithing.experience).toMatchObject({ start: 6177978, end: 6227978, gained: 50_000 });

      expect(month).toBeDefined();
      expect(month.data.nex.ehb.gained).toBeGreaterThan(0.1);
      expect(month.data.ehb.value.gained).toBe(month.data.nex.ehb.gained + month.data.tzkal_zuk.ehb.gained);
      expect(month.data.nex.kills).toMatchObject({ start: -1, end: 54, gained: 5 });

      expect(year).toBeDefined();
      expect(year.data.last_man_standing.score).toMatchObject({ start: 500, end: 450, gained: 0 });

      expect(day).toBeDefined();
      expect(day.data.overall.experience).toMatchObject({ start: -1, end: 300192115, gained: 0 });

      expect(Object.keys(response.body)).toContain('5min');
      expect(Object.keys(response.body)).toContain('day');
      expect(Object.keys(response.body)).toContain('week');
      expect(Object.keys(response.body)).toContain('month');
      expect(Object.keys(response.body)).toContain('year');
    });

    it('should not fetch (invalid period)', async () => {
      const response = await api.get(`/api/players/username/psikoi/gained`).query({ period: 'decade' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid period: decade.');
    });

    it('should fetch (common period)', async () => {
      const response = await api.get(`/api/players/username/psikoi/gained`).query({ period: 'week' });

      expect(response.status).toBe(200);
      expect(response.body.period).toBe('week');
      expect(response.body.data.smithing.experience.gained).toBe(50_000);
    });

    it('should fetch (custom period)', async () => {
      const response = await api.get(`/api/players/username/psikoi/gained`).query({ period: '5m2w3d' });

      expect(response.status).toBe(200);
      expect(response.body.period).toBe('5m2w3d');
      expect(response.body.data.smithing.experience.gained).toBe(50_000);
    });

    it('should not fetch deltas between (min date greater than max date)', async () => {
      const response = await api.get(`/api/players/username/psikoi/gained`).query({
        startDate: new Date('2021-12-14T04:15:36.000Z'),
        endDate: new Date('2015-12-14T04:15:36.000Z')
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Start date must be before the End date.');
    });

    it('should fetch deltas between', async () => {
      const response = await api.get(`/api/players/username/psikoi/gained`).query({
        startDate: new Date('2015-12-14T04:15:36.000Z'),
        endDate: new Date('2022-12-14T04:15:36.000Z')
      });

      expect(response.status).toBe(200);
      expect(response.body.period).toBeUndefined();
      expect(response.body.data.smithing.experience.gained).toBe(50_000);
    });
  });

  describe('2 - Fetch Group Deltas', () => {
    it('should not fetch (invalid period)', async () => {
      const trackResponse = await api.post(`/api/players/track`).send({ username: 'hydrox6' });
      expect(trackResponse.status).toBe(201);

      globalData.secondaryTestPlayerId = trackResponse.body.id;
    });

    it('should not fetch (invalid playerIds)', async () => {
      await expect(
        service.getGroupPeriodDeltas('smithing', 'week', undefined, { limit: 20, offset: 0 })
      ).rejects.toThrow();
    });

    it('should fetch group deltas (common period)', async () => {
      const directResponse = await service.getGroupPeriodDeltas(
        'smithing',
        'week',
        [globalData.testPlayerId, globalData.secondaryTestPlayerId],
        { limit: 20, offset: 0 }
      );

      expect(directResponse[0]).toMatchObject({
        start: 6_177_978,
        end: 6_227_978,
        gained: 50_000,
        player: {
          username: 'psikoi'
        }
      });

      expect(Date.now() - directResponse[0].endDate.getTime()).toBeLessThan(10_000);

      expect(directResponse[1]).toMatchObject({
        start: 6227978,
        end: 6227978,
        gained: 0,
        player: {
          username: 'hydrox6'
        }
      });
    });

    it.todo('should fetch group deltas (custom period)');
    it.todo('should fetch group deltas (time range)');
    it.todo('should not fetch deltas between (min date greater than max date)');
  });
});
