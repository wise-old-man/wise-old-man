import supertest from 'supertest';
import apiServer from '../../../src/api';
import { sleep } from '../../utils';

const api = supertest(apiServer.express);

afterAll(async () => {
  jest.useRealTimers();

  // Sleep for 5s to allow the server to shut down gracefully
  await apiServer.shutdown().then(() => sleep(5000));
}, 10_000);

describe('General tests', () => {
  test('API is alive', async () => {
    const response = await api.get('/');
    expect(response.status).toBe(200);
  });

  test('Invalid route redirects to 404', async () => {
    const response = await api.get('/invalid');
    expect(response.status).toBe(404);
  });
});
