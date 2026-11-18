import { isCuid } from '@paralleldrive/cuid2';
import supertest from 'supertest';
import APIInstance from '../../../src/api';
import { eventEmitter } from '../../../src/api/events';
import prisma from '../../../src/prisma';
import { buildCompoundRedisKey, redisClient } from '../../../src/services/redis.service';
import { resetDatabase, sleep } from '../../utils';

const server = new APIInstance().init().express.listen(0);
const api = supertest(server);

beforeAll(async () => {
  eventEmitter.init();
  await redisClient.flushall();
  await resetDatabase();
});

afterAll(() => {
  jest.useRealTimers();
  redisClient.quit();
  server.close();
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
        data: Array.from(Array(100).keys()).map(i => ({
          playerId: player.id,
          createdAt: new Date(Date.now() - i * 1000 * 60),
          overallExperience: i
        }))
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
      const response = await api.post(`/api-keys`).send({});

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({ code: 'MISSING_ADMIN_PASSWORD' });
    });

    it('should not create API key (incorrect admin password)', async () => {
      const response = await api.post(`/api-keys`).send({ adminPassword: 'abc' });

      expect(response.status).toBe(403);
      expect(response.body).toMatchObject({ code: 'INCORRECT_ADMIN_PASSWORD' });
    });

    it('should not create API key (undefined application name)', async () => {
      const response = await api.post(`/api-keys`).send({ adminPassword: process.env.SHARED_ADMIN_PASSWORD });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Parameter 'application' is undefined.");
    });

    it('should not create API key (undefined developer name)', async () => {
      const response = await api
        .post(`/api-keys`)
        .send({ application: 'Some Website', adminPassword: process.env.SHARED_ADMIN_PASSWORD });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Parameter 'developer' is undefined.");
    });

    it('should create API key', async () => {
      const response = await api.post(`/api-keys`).send({
        application: 'Some Website',
        developer: 'aluminoti',
        adminPassword: process.env.SHARED_ADMIN_PASSWORD
      });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        application: 'Some Website',
        developer: 'aluminoti',
        master: false
      });
      expect(isCuid(response.body.id)).toBe(true);
      expect(response.body.developerDiscordId).toBeNull();
      expect(typeof response.body.createdAt).toBe('string');
      expect(Number.isNaN(Date.parse(response.body.createdAt))).toBe(false);

      await sleep(100);

      // Make sure it's been stored in redis memory, with an expiration
      expect(await redisClient.get(buildCompoundRedisKey('api_key', response.body.id))).toBe('false');
      expect(await redisClient.ttl(buildCompoundRedisKey('api_key', response.body.id))).toBeGreaterThan(0);
    });
  });

  describe('Revoke API key', () => {
    it('should not revoke API key (invalid admin password)', async () => {
      const response = await api.put(`/api-keys/abc/revoke`).send({});

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({ code: 'MISSING_ADMIN_PASSWORD' });
    });

    it('should not revoke API key (incorrect admin password)', async () => {
      const response = await api.put(`/api-keys/abc/revoke`).send({ adminPassword: 'abc' });

      expect(response.status).toBe(403);
      expect(response.body).toMatchObject({ code: 'INCORRECT_ADMIN_PASSWORD' });
    });

    it('should not revoke API key (key not found)', async () => {
      const response = await api
        .put(`/api-keys/abc/revoke`)
        .send({ adminPassword: process.env.SHARED_ADMIN_PASSWORD });

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({ code: 'API_KEY_NOT_FOUND' });
    });

    it('should revoke API key', async () => {
      const createResponse = await api.post(`/api-keys`).send({
        application: 'Abusive App',
        developer: 'someone',
        adminPassword: process.env.SHARED_ADMIN_PASSWORD
      });

      expect(createResponse.status).toBe(201);

      const keyId = createResponse.body.id;

      await sleep(100);
      expect(await redisClient.get(buildCompoundRedisKey('api_key', keyId))).toBe('false');

      const response = await api
        .put(`/api-keys/${keyId}/revoke`)
        .send({ adminPassword: process.env.SHARED_ADMIN_PASSWORD });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: keyId,
        application: 'Abusive App',
        developer: 'someone',
        active: false
      });

      await sleep(100);

      // Removed from redis, so requests with it are rejected
      expect(await redisClient.get(buildCompoundRedisKey('api_key', keyId))).toBeNull();

      process.env.NODE_ENV = 'production';
      const rejectedResponse = await api.get('/').set({ 'x-api-key': keyId });
      process.env.NODE_ENV = 'test';

      expect(rejectedResponse.status).toBe(403);
      expect(rejectedResponse.body.message).toMatch('Invalid API Key.');
    });
  });

  describe('Revoke Discord developer API keys', () => {
    const developerDiscordId = '323456789012345678';
    const endpoint = `/api-keys/developer-discord/${developerDiscordId}/revoke`;

    it('should require admin authentication', async () => {
      const missing = await api.put(endpoint).send({});
      expect(missing.status).toBe(400);
      expect(missing.body.code).toBe('MISSING_ADMIN_PASSWORD');

      const incorrect = await api.put(endpoint).send({ adminPassword: 'incorrect' });
      expect(incorrect.status).toBe(403);
      expect(incorrect.body.code).toBe('INCORRECT_ADMIN_PASSWORD');
    });

    it.each(['username', '123abc', ' 123', '12.3', '-1'])(
      'should reject malformed Discord ID %s',
      async id => {
        const response = await api
          .put(`/api-keys/developer-discord/${encodeURIComponent(id)}/revoke`)
          .send({ adminPassword: process.env.SHARED_ADMIN_PASSWORD });
        expect(response.status).toBe(400);
        expect(response.body.code).toBe('VALIDATION_ERROR');
      }
    );

    it('should return zero when no keys match', async () => {
      const response = await api.put(endpoint).send({ adminPassword: process.env.SHARED_ADMIN_PASSWORD });
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ revokedCount: 0 });
    });

    it('should revoke all linked active keys, invalidate their cache, and allow repeated calls', async () => {
      const keys = await Promise.all(
        [
          { developerDiscordId, developer: 'Bulk revoke developer', active: true, master: false },
          { developerDiscordId, developer: 'Another developer name', active: true, master: true },
          { developerDiscordId, developer: 'Already revoked developer', active: false, master: false },
          { developerDiscordId: null, developer: 'Bulk revoke developer', active: true, master: false },
          {
            developerDiscordId: '423456789012345678',
            developer: 'Bulk revoke developer',
            active: true,
            master: false
          }
        ].map(data => prisma.apiKey.create({ data: { ...data, application: 'Bulk revoke test' } }))
      );

      for (const key of keys) {
        await redisClient.set(buildCompoundRedisKey('api_key', key.id), String(key.master));
      }

      for (const revokedCount of [2, 0]) {
        const response = await api.put(endpoint).send({
          adminPassword: process.env.SHARED_ADMIN_PASSWORD,
          active: true,
          developerDiscordId: '423456789012345678'
        });
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ revokedCount });

        for (const key of keys) {
          const matches = key.developerDiscordId === developerDiscordId;
          expect(await prisma.apiKey.findUnique({ where: { id: key.id } })).toEqual({
            ...key,
            active: matches ? false : key.active
          });
          expect(await redisClient.get(buildCompoundRedisKey('api_key', key.id))).toBe(
            matches ? null : String(key.master)
          );
          expect(response.text).not.toContain(key.id);
        }
      }

      process.env.NODE_ENV = 'production';
      try {
        for (const key of keys.slice(0, 2)) {
          const response = await api.get('/').set('x-api-key', key.id);
          expect(response.status).toBe(403);
          expect(response.body.message).toMatch('Invalid API Key.');
        }
      } finally {
        process.env.NODE_ENV = 'test';
      }
    });
  });

  describe('Update developer API keys', () => {
    const endpoint = '/api-keys/developer/kaithorpe';
    const developerDiscordId = '123456789012345678';

    it('should require admin authentication', async () => {
      const missing = await api.put(endpoint).send({ developerDiscordId });
      expect(missing.status).toBe(400);
      expect(missing.body.code).toBe('MISSING_ADMIN_PASSWORD');

      const incorrect = await api.put(endpoint).send({ developerDiscordId, adminPassword: 'incorrect' });
      expect(incorrect.status).toBe(403);
      expect(incorrect.body.code).toBe('INCORRECT_ADMIN_PASSWORD');
    });

    it.each([undefined, null, '', 'username', 123, '123abc', ' 123', '12.3'])(
      'should reject invalid Discord ID %p',
      async invalidId => {
        const response = await api.put(endpoint).send({
          adminPassword: process.env.SHARED_ADMIN_PASSWORD,
          developerDiscordId: invalidId
        });
        expect(response.status).toBe(400);
      }
    );

    it.each(['123', developerDiscordId, '1234567890123456789012345'])(
      'should accept digit strings of any length and return 404 when no keys match (%s)',
      async validId => {
        const response = await api.put('/api-keys/developer/nonexistent-developer').send({
          adminPassword: process.env.SHARED_ADMIN_PASSWORD,
          developerDiscordId: validId
        });
        expect(response.status).toBe(404);
        expect(response.body.code).toBe('API_KEY_NOT_FOUND');
      }
    );

    it('should link all exact matches including revoked keys and preserve other fields', async () => {
      const keys = await Promise.all(
        [
          { developer: 'kaithorpe', active: true },
          { developer: 'kaithorpe', active: false },
          { developer: 'Kaithorpe', active: true },
          { developer: 'another-developer', active: true }
        ].map(data => prisma.apiKey.create({ data: { ...data, application: 'Link test' } }))
      );

      for (let attempt = 0; attempt < 2; attempt++) {
        const response = await api.put(endpoint).send({
          adminPassword: process.env.SHARED_ADMIN_PASSWORD,
          developerDiscordId,
          active: false,
          master: true,
          application: 'Must not change'
        });
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ updatedCount: 2 });
      }

      for (const key of keys) {
        expect(await prisma.apiKey.findUnique({ where: { id: key.id } })).toEqual({
          ...key,
          developerDiscordId: key.developer === 'kaithorpe' ? developerDiscordId : null
        });
      }
    });

    it.each([{}, { active: false }, { createdAt: '' }, { createdAt: 'invalid-date' }, { createdAt: 123 }])(
      'should reject missing or invalid update fields %p',
      async fields => {
        const response = await api.put(endpoint).send({
          adminPassword: process.env.SHARED_ADMIN_PASSWORD,
          ...fields
        });
        expect(response.status).toBe(400);
        expect(response.body.code).toBe('VALIDATION_ERROR');
      }
    );

    it('should return 404 for a creation date update with no matching developer', async () => {
      const response = await api.put('/api-keys/developer/nonexistent-developer').send({
        adminPassword: process.env.SHARED_ADMIN_PASSWORD,
        createdAt: '2025-01-02T03:04:05.000Z'
      });
      expect(response.status).toBe(404);
      expect(response.body.code).toBe('API_KEY_NOT_FOUND');
    });

    it('should update or clear creation dates and optionally update Discord IDs', async () => {
      const developer = 'creation-date-test';
      const originalDate = new Date('2024-01-01T00:00:00.000Z');
      const keys = await Promise.all(
        [
          { developer, active: true },
          { developer, active: false },
          { developer: 'Creation-date-test', active: true }
        ].map(data =>
          prisma.apiKey.create({
            data: { ...data, application: 'Creation date test', createdAt: originalDate, developerDiscordId }
          })
        )
      );

      for (const fields of [
        { createdAt: '2025-01-02T03:04:05.000Z' },
        { createdAt: '2025-02-03T04:05:06.000Z', developerDiscordId: '456' },
        { createdAt: null }
      ]) {
        const response = await api.put(`/api-keys/developer/${developer}`).send({
          adminPassword: process.env.SHARED_ADMIN_PASSWORD,
          ...fields,
          active: false,
          master: true,
          application: 'Must not change'
        });
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ updatedCount: 2 });

        for (const key of keys) {
          const matches = key.developer === developer;
          if (matches) {
            key.createdAt = fields.createdAt === null ? null : new Date(fields.createdAt);
            if (fields.developerDiscordId !== undefined) key.developerDiscordId = fields.developerDiscordId;
          }
          expect(await prisma.apiKey.findUnique({ where: { id: key.id } })).toEqual(key);
        }
      }
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
      const apiKeyResponse = await api.post(`/api-keys`).send({
        application: '123456',
        developer: 'psikoi',
        adminPassword: process.env.SHARED_ADMIN_PASSWORD
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

    it('should report the minute window in rate limit headers (no API key)', async () => {
      // Flush redis to reset rate limits
      await redisClient.flushall();

      // Rate limits are disabled in testing mode, so simulate production mode for a sec
      process.env.NODE_ENV = 'production';

      const response = await api.get('/');

      process.env.NODE_ENV = 'test';

      expect(response.status).toBe(200);
      expect(response.headers['ratelimit-limit']).toBe('20');
      expect(response.headers['ratelimit-remaining']).toBe('19');
      expect(Number(response.headers['ratelimit-reset'])).toBeLessThanOrEqual(60);
    });

    it('should not allow more than 500 requests per hour (no API key)', async () => {
      // Flush redis to reset rate limits
      await redisClient.flushall();

      const ip = '1.2.3.4';

      let successCount = 0;
      let rateLimitedCount = 0;
      let lastResponse: supertest.Response | undefined;

      // Rate limits are disabled in testing mode, so simulate production mode for a sec
      process.env.NODE_ENV = 'production';

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for (const i of Array.from(Array(26).keys())) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const j of Array.from(Array(20).keys())) {
          lastResponse = await api.get('/').set({ 'cf-connecting-ip': ip });

          if (lastResponse.status === 200) successCount++;
          else if (lastResponse.status === 429) rateLimitedCount++;
        }

        // Reset the minute window, so that only the hourly window can be exhausted
        await redisClient.del(buildCompoundRedisKey('rl', 'default', 'minute', ip));
      }

      process.env.NODE_ENV = 'test';

      expect(successCount).toBe(500);
      expect(rateLimitedCount).toBe(20);

      expect(lastResponse?.headers['ratelimit-limit']).toBe('500');
      expect(lastResponse?.headers['ratelimit-remaining']).toBe('0');
      expect(Number(lastResponse?.headers['retry-after'])).toBeGreaterThan(60);
    });

    it('should not allow more than 20000 requests per day (with API key)', async () => {
      // Flush redis to reset rate limits
      await redisClient.flushall();

      // Create new API key
      const apiKeyResponse = await api.post(`/api-keys`).send({
        application: 'daily-limit',
        developer: 'psikoi',
        adminPassword: process.env.SHARED_ADMIN_PASSWORD
      });
      expect(apiKeyResponse.status).toBe(201);

      await sleep(100);

      // Simulate 19999 requests already made today
      await redisClient.set(
        buildCompoundRedisKey('rl', 'trusted', 'day', apiKeyResponse.body.id),
        19_999,
        'EX',
        24 * 60 * 60
      );

      // Rate limits are disabled in testing mode, so simulate production mode for a sec
      process.env.NODE_ENV = 'production';

      const lastAllowedResponse = await api.get('/').set({ 'x-api-key': apiKeyResponse.body.id });
      const rateLimitedResponse = await api.get('/').set({ 'x-api-key': apiKeyResponse.body.id });

      process.env.NODE_ENV = 'test';

      expect(lastAllowedResponse.status).toBe(200);
      expect(lastAllowedResponse.headers['ratelimit-limit']).toBe('20000');
      expect(lastAllowedResponse.headers['ratelimit-remaining']).toBe('0');

      expect(rateLimitedResponse.status).toBe(429);
      expect(rateLimitedResponse.headers['ratelimit-limit']).toBe('20000');
      expect(Number(rateLimitedResponse.headers['retry-after'])).toBeGreaterThan(60 * 60);
    });

    it('should allow more than 100 requests per minute (with master API key)', async () => {
      // Flush redis to reset rate limits
      await redisClient.flushall();

      // Create new API key
      const apiKeyResponse = await api.post(`/api-keys`).send({
        application: 'xyzxyz',
        developer: 'Rorro',
        adminPassword: process.env.SHARED_ADMIN_PASSWORD
      });
      expect(apiKeyResponse.status).toBe(201);

      await sleep(100);

      // Manually set this to a master key
      const updatedKey = await prisma.apiKey.update({
        where: { id: apiKeyResponse.body.id },
        data: { master: true }
      });

      await redisClient.set(buildCompoundRedisKey('api_key', updatedKey.id), String(updatedKey.master));

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
