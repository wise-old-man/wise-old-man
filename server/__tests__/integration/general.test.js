const supertest = require('supertest');
const api = require('../../src/api');

const request = supertest(api);

describe('General tests', () => {
  test('API is alive', async done => {
    const response = await request.get('/api/');
    expect(response.status).toBe(200);

    done();
  });

  test('Invalid route redirects to 404', async done => {
    const response = await request.get('/api/invalid');
    expect(response.status).toBe(404);

    done();
  });

  test('This should fail, delete later', async done => {
    expect(1).toBe(2);
    done();
  });
});
