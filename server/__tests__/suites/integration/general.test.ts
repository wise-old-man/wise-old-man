import supertest from 'supertest';
import { isCuid } from '@paralleldrive/cuid2';
import env from '../../../src/env';
import apiServer from '../../../src/api';
import prisma from '../../../src/prisma';
import redisService from '../../../src/api/services/external/redis.service';
import { resetDatabase, resetRedis, sleep } from '../../utils';

const api = supertest(apiServer.express);

beforeAll(async () => {
  await resetRedis();
  await resetDatabase();
});

afterAll(async () => {
  jest.useRealTimers();

  // Sleep for 5s to allow the server to shut down gracefully
  await apiServer.shutdown().then(() => sleep(5000));
}, 10_000);

describe('General API', () => {
  describe('Health checks', () => {
    test('API is alive', async () => {
      const response = await api.get('/');
      expect(response.status).toBe(200);
    });

    test('Invalid route redirects to 404', async () => {
      const response = await api.get('/invalid');
      expect(response.status).toBe(404);
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
      const response = await api.post(`/api-key`).send({ adminPassword: env.ADMIN_PASSWORD });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Parameter 'application' is undefined.");
    });

    it('should not create API key (undefined developer name)', async () => {
      const response = await api
        .post(`/api-key`)
        .send({ application: 'Some Website', adminPassword: env.ADMIN_PASSWORD });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Parameter 'developer' is undefined.");
    });

    it('should create API key', async () => {
      const response = await api.post(`/api-key`).send({
        application: 'Some Website',
        developer: 'aluminoti',
        adminPassword: env.ADMIN_PASSWORD
      });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        application: 'Some Website',
        developer: 'aluminoti',
        active: true
      });
      expect(isCuid(response.body.id)).toBe(true);

      // Make sure it's been stored in redis memory
      expect(await redisService.getValue('api-key', response.body.id)).toBe('true');
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

    it('should not allow more than 100 requests (no API key)', async () => {
      // Flush redis to reset rate limits
      await resetRedis();

      let successCount = 0;
      let rateLimitedCount = 0;

      // Rate limits are disabled in testing mode, so simulate production mode for a sec
      process.env.NODE_ENV = 'production';

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for (const i of Array.from(Array(150).keys())) {
        const response = await api.get('/');
        if (response.status === 200) successCount++;
        else if (response.status === 429) rateLimitedCount++;
      }

      process.env.NODE_ENV = 'test';

      expect(successCount).toBe(100);
      expect(rateLimitedCount).toBe(50);
    });

    it('should not allow more than 500 requests (with API key)', async () => {
      // Flush redis to reset rate limits
      await resetRedis();

      // Create new API key
      const apiKeyResponse = await api.post(`/api-key`).send({
        application: '123456',
        developer: 'psikoi',
        adminPassword: env.ADMIN_PASSWORD
      });
      expect(apiKeyResponse.status).toBe(201);

      let successCount = 0;
      let rateLimitedCount = 0;

      // Rate limits are disabled in testing mode, so simulate production mode for a sec
      process.env.NODE_ENV = 'production';

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for (const i of Array.from(Array(550).keys())) {
        const response = await api.get('/').set({ 'x-api-key': apiKeyResponse.body.id });

        if (response.status === 200) successCount++;
        else if (response.status === 429) rateLimitedCount++;
      }

      process.env.NODE_ENV = 'test';

      expect(successCount).toBe(500);
      expect(rateLimitedCount).toBe(50);
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
          metric: 'magic',
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
});
