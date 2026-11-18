import supertest from 'supertest';
import APIInstance from '../../../src/api';
import prisma from '../../../src/prisma';
import { redisClient } from '../../../src/services/redis.service';

const server = new APIInstance().init().express.listen(0);
const api = supertest(server);
const developer = 'Lookup test / exact';
const discordId = '123456789012345678';
const developerEndpoint = `/api-keys?developer=${encodeURIComponent(developer)}`;
const discordEndpoint = `/api-keys?developerDiscordId=${discordId}`;
const keys: Awaited<ReturnType<typeof prisma.apiKey.create>>[] = [];

beforeAll(async () => {
  for (const data of [
    { developer, developerDiscordId: discordId, active: true, createdAt: null },
    { developer, developerDiscordId: discordId, active: false },
    { developer: 'Another lookup developer', developerDiscordId: discordId },
    { developer: developer.toLowerCase(), developerDiscordId: null },
    { developer: 'Unrelated lookup developer', developerDiscordId: '999999999999999999' }
  ]) {
    keys.push(await prisma.apiKey.create({ data: { ...data, application: 'Lookup integration test' } }));
  }
});

afterAll(async () => {
  await prisma.apiKey.deleteMany({ where: { id: { in: keys.map(key => key.id) } } });
  await prisma.$disconnect();
  redisClient.quit();
  server.close();
});

describe.each([developerEndpoint, discordEndpoint])('API key lookup %s', endpoint => {
  it('requires the admin password header', async () => {
    const missing = await api.get(endpoint);
    expect(missing.status).toBe(400);
    expect(missing.body.code).toBe('MISSING_ADMIN_PASSWORD');

    const incorrect = await api.get(endpoint).set('x-admin-password', 'incorrect');
    expect(incorrect.status).toBe(403);
    expect(incorrect.body.code).toBe('INCORRECT_ADMIN_PASSWORD');

    const query = await api.get(endpoint).query({ adminPassword: process.env.SHARED_ADMIN_PASSWORD });
    expect(query.status).toBe(400);
    expect(query.body.code).toBe('MISSING_ADMIN_PASSWORD');
  });
});

describe('API key lookup results', () => {
  it.each([
    [developerEndpoint, [0, 1]],
    [discordEndpoint, [0, 1, 2]],
    [`${developerEndpoint}&developerDiscordId=${discordId}`, [0, 1]]
  ] as const)('returns all exact matches including revoked keys for %s', async (endpoint, indices) => {
    const response = await api.get(endpoint).set('x-admin-password', process.env.SHARED_ADMIN_PASSWORD!);
    expect(response.status).toBe(200);
    const expected = indices.map(index => keys[index]).sort((a, b) => a.id.localeCompare(b.id));
    expect(response.body).toEqual(JSON.parse(JSON.stringify(expected)));
  });

  it.each([
    '/api-keys?developer=nonexistent-lookup-developer',
    '/api-keys?developerDiscordId=000',
    `${developerEndpoint}&developerDiscordId=999999999999999999`
  ])('returns an empty array when no keys match %s', async endpoint => {
    const response = await api.get(endpoint).set('x-admin-password', process.env.SHARED_ADMIN_PASSWORD!);
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it.each(['username', '123abc', ' 123', '12.3', '-1'])(
    'rejects malformed Discord ID %s',
    async discordId => {
      const response = await api
        .get('/api-keys')
        .query({ developerDiscordId: discordId })
        .set('x-admin-password', process.env.SHARED_ADMIN_PASSWORD!);
      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    }
  );

  it.each([
    {},
    { developer: '' },
    { developerDiscordId: '' },
    { unrelatedFilter: 'ignored' },
    { developer: ['first', 'second'] },
    { developerDiscordId: ['123', '456'] }
  ])('rejects missing or invalid filters %p', async query => {
    const response = await api
      .get('/api-keys')
      .query(query)
      .set('x-admin-password', process.env.SHARED_ADMIN_PASSWORD!);
    expect(response.status).toBe(400);
    expect(response.body.code).toBe('VALIDATION_ERROR');
  });
});
