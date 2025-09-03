import { isCuid } from '@paralleldrive/cuid2';
import supertest from 'supertest';
import APIInstance from '../../../src/api';
import { eventEmitter } from '../../../src/api/events';
import prisma from '../../../src/prisma';
import { buildCompoundRedisKey, redisClient } from '../../../src/services/redis.service';
import { resetDatabase, sleep } from '../../utils';

const api = supertest(new APIInstance().init().express);

beforeAll(async () => {
  eventEmitter.init();
  await redisClient.flushall();
  await resetDatabase();
});

afterAll(() => {
  jest.useRealTimers();
  redisClient.quit();
});

describe('General API', () => {
  describe('Health checks', () => {
    test('API is alive', async () => {
      const response = await api.get('/');
      expect(response.status).toBe(200);
      expect(response.body).toBe(process.env.npm_package_version);
    });

    test('Invalid route redirects to 404', async () => {
      const response = await api.get('/invalid');
      expect(response.status).toBe(404);
    });
  });

  describe('Fetch global stats', () => {
    it('should create API key', async () => {
      const player = await prisma.player.create({
        data: {
          username: 'test9876',
          displayName: 'test9876'
        }
      });

      await prisma.snapshot.createMany({
        data: Array.from(Array(100).keys()).map(i => ({ playerId: player.id, overallExperience: i }))
      });

      await prisma.player.createMany({
        data: Array.from(Array(50).keys()).map(i => ({ username: String(i), displayName: String(i) }))
      });

      await prisma.group.createMany({
        data: Array.from(Array(15).keys()).map(i => ({ name: String(i), verificationHash: String(i) }))
      });

      await prisma.competition.createMany({
        data: Array.from(Array(30).keys()).map(i => ({
          title: String(i),
          verificationHash: String(i),
          startsAt: new Date(),
          endsAt: new Date()
        }))
      });

      // Run postgres analyze to update table statistics
      await prisma.$queryRaw`ANALYZE`;

      const response = await api.get(`/stats`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        players: 51,
        snapshots: 100,
        groups: 15,
        competitions: 30
      });
    });
  });

  describe('Create API key', () => {
    it('should not create API key (invalid admin password)', async () => {
      const response = await api.post(`/api-key`).send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Required parameter 'adminPassword' is undefined.");
    });

    it('should not create API key (incorrect admin password)', async () => {
      const response = await api.post(`/api-key`).send({ adminPassword: 'abc' });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Incorrect admin password.');
    });

    it('should not create API key (undefined application name)', async () => {
      const response = await api.post(`/api-key`).send({ adminPassword: process.env.ADMIN_PASSWORD });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Parameter 'application' is undefined.");
    });

    it('should not create API key (undefined developer name)', async () => {
      const response = await api
        .post(`/api-key`)
        .send({ application: 'Some Website', adminPassword: process.env.ADMIN_PASSWORD });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Parameter 'developer' is undefined.");
    });

    it('should create API key', async () => {
      const response = await api.post(`/api-key`).send({
        application: 'Some Website',
        developer: 'aluminoti',
        adminPassword: process.env.ADMIN_PASSWORD
      });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        application: 'Some Website',
        developer: 'aluminoti',
        master: false
      });
      expect(isCuid(response.body.id)).toBe(true);

      await sleep(100);

      // Make sure it's been stored in redis memory
      expect(await redisClient.get(buildCompoundRedisKey('api-key', response.body.id))).toBe('false');
    });
  });

  describe('API Rate Limits', () => {
    it('should not allow an invalid API key', async () => {
      // Rate limits are disabled in testing mode, so simulate production mode for a sec
      process.env.NODE_ENV = 'production';

      const response = await api.get('/').set({ 'x-api-key': 'abcdef' });
      expect(response.status).toBe(403);
      expect(response.body.message).toMatch('Invalid API Key.');

      process.env.NODE_ENV = 'test';
    });

    it('should not allow more than 20 requests per minute (no API key)', async () => {
      // Flush redis to reset rate limits
      await redisClient.flushall();

      let successCount = 0;
      let rateLimitedCount = 0;

      // Rate limits are disabled in testing mode, so simulate production mode for a sec
      process.env.NODE_ENV = 'production';

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for (const i of Array.from(Array(100).keys())) {
        const response = await api.get('/');
        if (response.status === 200) successCount++;
        else if (response.status === 429) rateLimitedCount++;
      }

      process.env.NODE_ENV = 'test';

      expect(successCount).toBe(20);
      expect(rateLimitedCount).toBe(80);
    });

    it('should not allow more than 100 requests per minute (with API key)', async () => {
      // Flush redis to reset rate limits
      await redisClient.flushall();

      // Create new API key
      const apiKeyResponse = await api.post(`/api-key`).send({
        application: '123456',
        developer: 'psikoi',
        adminPassword: process.env.ADMIN_PASSWORD
      });
      expect(apiKeyResponse.status).toBe(201);

      await sleep(100);

      let successCount = 0;
      let rateLimitedCount = 0;

      // Rate limits are disabled in testing mode, so simulate production mode for a sec
      process.env.NODE_ENV = 'production';

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for (const i of Array.from(Array(300).keys())) {
        const response = await api.get('/').set({ 'x-api-key': apiKeyResponse.body.id });

        if (response.status === 200) successCount++;
        else if (response.status === 429) rateLimitedCount++;
      }

      process.env.NODE_ENV = 'test';

      expect(successCount).toBe(100);
      expect(rateLimitedCount).toBe(200);
    });

    it('should allow more than 100 requests per minute (with master API key)', async () => {
      // Flush redis to reset rate limits
      await redisClient.flushall();

      // Create new API key
      const apiKeyResponse = await api.post(`/api-key`).send({
        application: 'xyzxyz',
        developer: 'Rorro',
        adminPassword: process.env.ADMIN_PASSWORD
      });
      expect(apiKeyResponse.status).toBe(201);

      await sleep(100);

      // Manually set this to a master key
      const updatedKey = await prisma.apiKey.update({
        where: { id: apiKeyResponse.body.id },
        data: { master: true }
      });

      await redisClient.set(buildCompoundRedisKey('api-key', updatedKey.id), String(updatedKey.master));

      let successCount = 0;
      let rateLimitedCount = 0;

      // Rate limits are disabled in testing mode, so simulate production mode for a sec
      process.env.NODE_ENV = 'production';

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for (const i of Array.from(Array(500).keys())) {
        const response = await api.get('/').set({ 'x-api-key': apiKeyResponse.body.id });

        if (response.status === 200) successCount++;
        else if (response.status === 429) rateLimitedCount++;
      }

      process.env.NODE_ENV = 'test';

      expect(successCount).toBe(500);
      expect(rateLimitedCount).toBe(0);
    });
  });
});
