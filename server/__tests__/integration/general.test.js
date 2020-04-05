const supertest = require('supertest');
const api = require('../../src/api');
const { resetDatabase } = require('../utils');

const request = supertest(api);

beforeAll(async () => {
  await resetDatabase();
});

describe('General tests', () => {
  /*
  test('Test api health', async () => {
    const response = await request(api)
      .get('/api/')
      .send();

    expect(response.status).toBe(200);
  });

  test('Test invalid endpoint', async () => {
    const response = await request(api)
      .get('/api/invalid/')
      .send();

    expect(response.status).toBe(404);
  });
  */

  it('Testing to see if Jest works', async done => {
    const res = await request.get('/api');

    expect(res.status).toBe(200);
    expect(res.body).toBe(true);

    done();
  });

  it('Testing to see if Jest works 2', async done => {
    const body = {
      // title: 'hello',
      metric: 'fishing',
      startsAt: '2020-05-20T19:00:00.000Z',
      endsAt: '2020-05-26T19:05:00.000Z'
    };

    const res = await request.post('/api/competitions').send(body);

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('hello');

    done();
  });

  it('Testing to see if Jest works 3', async done => {
    const res = await request.get('/api/competitions');

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);

    done();
  });
  /*

  test('Test invalid grtgtrhyhjhy', () => {
    console.time('BR');

    const body = {
      title: 'hello',
      metric: 'fishing',
      startsAt: '2020-05-20T19:00:00.000Z',
      endsAt: '2020-05-26T19:05:00.000Z',
      participants: ['Zezima', 'Psikoi']
    };

    expect.assertions(1);

    request(api)
      .post('/api/competitions')
      .send(body)
      .then(r => expect(r.body.title).toBe('hello'));
  }, 15000);

  /*
  test('Test invalid endpoint', async () => {
    const response = await request(api)
      .get('/api/competitions')
      .send();

    console.log(response.body);

    expect(response.status).toBe(200);
  });
  */
});
