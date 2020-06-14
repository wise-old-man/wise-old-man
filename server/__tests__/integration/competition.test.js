const supertest = require('supertest');
const api = require('../../src/api');
const { Player, Competition, Group, Membership } = require('../../src/database');
const { resetDatabase } = require('../utils');

const TEST_DATA = {};
const TEST_ID = 300000;
const TEST_GROUP_ID = 9001;

const TEST_VERIFICATION_CODE = '237-221-631';
const TEST_GROUP_VERIFICATION_CODE = '021-321-025';

const request = supertest(api);

beforeAll(async done => {
  await resetDatabase();

  const player1 = await Player.create({
    id: 1000000,
    username: 'test player',
    displayName: 'Test Player'
  });

  const player2 = await Player.create({
    id: 200000,
    username: 'alt player',
    displayName: 'Alt Player'
  });

  await Player.create({
    id: 400001,
    username: 'epic player',
    displayName: 'Epic Player'
  });

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + 3);

  await Competition.create({
    id: TEST_ID,
    title: 'test competition',
    metric: 'overall',
    startsAt: startDate,
    endsAt: endDate,
    verificationCode: TEST_VERIFICATION_CODE,
    verificationHash: '$2b$10$/gBSwiM.faftQVPIrKIG2OGLvhqoT9eTTvcge24t8qWMSCHNC9S6u'
  });

  const group = await Group.create({
    id: TEST_GROUP_ID,
    name: 'test-group',
    verificationCode: TEST_VERIFICATION_CODE,
    verificationHash: '$2b$10$IqRi3wdCEq7fb5AiRdEPaehzmS1sieygAnxVLk5sMRYDOe8CA0X6u'
  });

  await Membership.create({
    playerId: player1.id,
    groupId: group.id,
    role: 'leader'
  });

  await Membership.create({
    playerId: player2.id,
    groupId: group.id,
    role: 'member'
  });

  done();
});

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
      expect(response.body.message).toMatch('Start date must be before the end date.');

      done();
    });

    test('Do not create ( start & end date in the past )', async done => {
      const response = await request.post('/api/competitions').send({
        title: 'test',
        metric: 'overall',
        startsAt: '2019-05-17T22:00:00.000Z',
        endsAt: '2019-05-10T22:00:00.000Z'
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Start date must be before the end date.');

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

      TEST_DATA.minimal = response.body;

      done();
    });

    test('Create with group', async done => {
      const response = await request.post('/api/competitions').send({
        title: 'test',
        metric: 'overall',
        startsAt: '2025-05-17T22:00:00.000Z',
        endsAt: '2025-05-17T22:00:00.000Z',
        groupId: TEST_GROUP_ID,
        groupVerificationCode: TEST_GROUP_VERIFICATION_CODE
      });

      expect(response.status).toBe(201);
      expect(response.body.participants.length).toBe(2);

      TEST_DATA.group = response.body;

      done();
    });

    test('Do not create ( invalid group Id )', async done => {
      const response = await request.post('/api/competitions').send({
        title: 'test',
        metric: 'overall',
        startsAt: '2025-05-17T22:00:00.000Z',
        endsAt: '2025-05-17T22:00:00.000Z',
        groupId: 1337,
        groupVerificationCode: TEST_GROUP_VERIFICATION_CODE
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Invalid group id.');

      done();
    });

    test('Do not create ( no group verification )', async done => {
      const response = await request.post('/api/competitions').send({
        title: 'test',
        metric: 'overall',
        startsAt: '2025-05-17T22:00:00.000Z',
        endsAt: '2025-05-17T22:00:00.000Z',
        groupId: TEST_GROUP_ID
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Invalid verification code.');

      done();
    });

    test('Do not create (invalid participant type data)', async done => {
      const response = await request.post('/api/competitions').send({
        title: 'test',
        metric: 'overall',
        startsAt: '2025-05-17T22:00:00.000Z',
        endsAt: '2025-05-25T22:00:00.000Z',
        participants: [{}, 123, 'valid']
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain(
        '2 Invalid usernames: Names must be 1-12 characters long,'
      );

      done();
    });
  });

  describe('Viewing', () => {
    test('List competitions', async done => {
      const response = await request.get(`/api/competitions`).send();

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(3);

      done();
    });

    test('Search competitions ( invalid status )', async done => {
      const response = await request.get(`/api/competitions`).query({ status: 'invalid-status' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid status.');

      done();
    });

    test('Search competitions ( invalid metric )', async done => {
      const response = await request.get(`/api/competitions`).query({ metric: 'invalid-metric' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid metric.');

      done();
    });

    test('Search competitions ( with metric )', async done => {
      const response = await request.get(`/api/competitions`).query({ metric: 'OvErAlL' });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(3);

      response.body.map(c => expect(c.metric).toBe('overall'));

      done();
    });

    test('View competition', async done => {
      const response = await request.get(`/api/competitions/${TEST_ID}`).send();

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('test competition');
      expect(response.body.metric).toBe('overall');
      expect(response.body.duration).toBe('3 days');
      expect(response.body.verificationCode).toBe(undefined);

      done();
    });

    test('View competition ( doesnt exist )', async done => {
      const response = await request.get(`/api/competitions/9001`).send();

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Competition of id 9001 was not found.');

      done();
    });
  });

  describe('Updating', () => {
    test('Do not update ( incorrect verificationCode )', async done => {
      const response = await request.put(`/api/competitions/${TEST_DATA.minimal.id}`).send({
        title: 'update-title',
        verificationCode: '123-123'
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Incorrect verification code.');

      done();
    });

    test('Do not update ( no verificationCode )', async done => {
      const response = await request.put(`/api/competitions/${TEST_DATA.minimal.id}`).send({
        title: 'update-title'
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Invalid verification code.');

      done();
    });

    test('Update competition title ( including sanitization )', async done => {
      const response = await request.put(`/api/competitions/${TEST_DATA.minimal.id}`).send({
        title: 'updated-title',
        verificationCode: TEST_DATA.minimal.verificationCode
      });

      expect(response.status).toBe(200);
      expect(response.body.title).toMatch('updated title');

      done();
    });

    test('Update competition participants', async done => {
      const response = await request.put(`/api/competitions/${TEST_DATA.minimal.id}`).send({
        participants: ['test player', 'alt player'],
        verificationCode: TEST_DATA.minimal.verificationCode
      });

      expect(response.status).toBe(200);
      expect(response.body.participants.length).toBe(2);
      expect(response.body.participants.map(m => m.username)).toContain('alt player');
      expect(response.body.participants.map(m => m.displayName)).toContain('Test Player');

      done();
    });

    test('Do not update startDate ( Competition already started )', async done => {
      const response = await request.put(`/api/competitions/${TEST_ID}`).send({
        title: 'updated-title',
        startsAt: '2019-05-17T22:00:00.000Z',
        verificationCode: TEST_VERIFICATION_CODE
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(
        'The competition has started, the start date cannot be changed.'
      );

      done();
    });

    test('Do not update metric ( Competition already started )', async done => {
      const response = await request.put(`/api/competitions/${TEST_ID}`).send({
        title: 'updated-title',
        metric: 'woodcutting',
        verificationCode: TEST_VERIFICATION_CODE
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(
        'The competition has started, the metric cannot be changed.'
      );

      done();
    });

    test('Update competition ( title and participants )', async done => {
      const response = await request.put(`/api/competitions/${TEST_ID}`).send({
        title: 'my competition',
        participants: ['test player'],
        verificationCode: TEST_VERIFICATION_CODE
      });

      expect(response.status).toBe(200);
      expect(response.body.title).toMatch('my competition');
      expect(response.body.participants.length).toBe(1);
      expect(response.body.participants.map(m => m.username)).toContain('test player');

      done();
    });

    test('Add participant to competition', async done => {
      const response = await request
        .post(`/api/competitions/${TEST_DATA.minimal.id}/add-participants`)
        .send({
          participants: ['new player'],
          verificationCode: TEST_DATA.minimal.verificationCode
        });

      expect(response.status).toBe(200);
      expect(response.body.newParticipants.length).toBe(1);
      expect(response.body.newParticipants.map(m => m.username)).toContain('new player');

      done();
    });

    test('Do not add participant to competition ( already a participant )', async done => {
      const response = await request
        .post(`/api/competitions/${TEST_DATA.minimal.id}/add-participants`)
        .send({
          participants: ['new player'],
          verificationCode: TEST_DATA.minimal.verificationCode
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('All players given are already competing.');

      done();
    });

    test('Do not remove participant ( Competition not found )', async done => {
      const response = await request.post(`/api/competitions/1234/remove-participants`).send({
        participants: ['new player'],
        verificationCode: TEST_DATA.minimal.verificationCode
      });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Competition of id 1234 was not found.');

      done();
    });

    test('Do not remove participant ( No participants given )', async done => {
      const response = await request
        .post(`/api/competitions/${TEST_DATA.minimal.id}/remove-participants`)
        .send({
          participants: [],
          verificationCode: TEST_DATA.minimal.verificationCode
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid participants list.');

      done();
    });

    test('Do not remove participant ( Participants not in list )', async done => {
      const response = await request
        .post(`/api/competitions/${TEST_DATA.minimal.id}/remove-participants`)
        .send({
          participants: ['epic player'],
          verificationCode: TEST_DATA.minimal.verificationCode
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('None of the players given were competing.');

      done();
    });

    test('Remove participant', async done => {
      const response = await request
        .post(`/api/competitions/${TEST_DATA.minimal.id}/remove-participants`)
        .send({
          participants: ['new player'],
          verificationCode: TEST_DATA.minimal.verificationCode
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe(
        `Successfully removed 1 participants from competition of id: ${TEST_DATA.minimal.id}.`
      );

      done();
    });
  });

  describe('Deleting', () => {
    test('Do not delete ( Invalid verification code )', async done => {
      const response = await request.delete(`/api/competitions/${TEST_DATA.minimal.id}`).send({
        verificationCode: 'invalid'
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Incorrect verification code.');

      done();
    });

    test('Delete competition', async done => {
      const response = await request.delete(`/api/competitions/${TEST_DATA.minimal.id}`).send({
        verificationCode: TEST_DATA.minimal.verificationCode
      });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('Successfully deleted competition');

      const competitionResponse = await request.get(`/api/competitions/${TEST_DATA.minimal.id}`).send();
      expect(competitionResponse.status).toBe(404);

      done();
    });
  });
});
