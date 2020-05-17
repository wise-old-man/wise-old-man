const supertest = require('supertest');
const api = require('../../src/api');

const request = supertest(api);

describe('Competition API', () => {
  describe('Creating', () => {
    test('Do not create (invalid competition title)', async done => {
      const response = await request.post('/api/competitions').send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Invalid competition title.');

      done();
    });

    test('Do not create (empty competition title)', async done => {
      const response = await request.post('/api/competitions').send({ title: '' });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Invalid competition title.');

      done();
    });

    test('Do not create (invalid metric)', async done => {
      const response = await request.post('/api/competitions').send({ title: 'test' });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Invalid competition metric.');

      done();
    });

    test('Do not create (invalid start date)', async done => {
      const response = await request.post('/api/competitions').send({
        title: 'test',
        metric: 'overall',
        startsAt: 'invalid-start-date'
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Invalid start date.');

      done();
    });

    test('Do not create (invalid end date)', async done => {
      const response = await request.post('/api/competitions').send({
        title: 'test',
        metric: 'overall',
        startsAt: '2020-05-17T22:00:00.000Z',
        endsAt: 'invalid-end-date'
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Invalid end date');

      done();
    });

    test('Do not create (end date before start date)', async done => {
      const response = await request.post('/api/competitions').send({
        title: 'test',
        metric: 'overall',
        startsAt: '2025-05-17T22:00:00.000Z',
        endsAt: '2025-05-10T22:00:00.000Z'
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Validation error: Start date must be before the end date.');

      done();
    });

    test('Create with minimal requirements', async done => {
      const response = await request.post('/api/competitions').send({
        title: 'test',
        metric: 'overall',
        startsAt: '2025-05-17T22:00:00.000Z',
        endsAt: '2025-05-17T22:00:00.000Z'
      });

      expect(response.status).toBe(201);
      expect(response.body.title).toMatch('test');
      expect(response.body.metric).toMatch('overall');
      expect(response.body.startsAt).toMatch('2025-05-17T22:00:00.000Z');
      expect(response.body.endsAt).toMatch('2025-05-17T22:00:00.000Z');

      done();
    });
  });
});
