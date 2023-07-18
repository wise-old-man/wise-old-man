import supertest from 'supertest';
import { isCuid } from '@paralleldrive/cuid2';
import env from '../../../src/env';
import apiServer from '../../../src/api';
import redisService from '../../../src/api/services/external/redis.service';
import { sleep } from '../../utils';

const api = supertest(apiServer.express);

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
});
