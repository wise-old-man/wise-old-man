import supertest from 'supertest';
import api from '../../../src/api';

const request = supertest(api);

describe('General tests', () => {
  test('API is alive', async done => {
    const response = await request.get('/');
    expect(response.status).toBe(200);

    done();
  });

  test('Invalid route redirects to 404', async done => {
    const response = await request.get('/invalid');
    expect(response.status).toBe(404);

    done();
  });
});
