import supertest from 'supertest';
import api from '../../src/api';
import { Player } from '../../src/database/models';
import { TestData } from '../types';
import { resetDatabase } from '../utils';

const request = supertest(api);

const TEST_DATA: TestData = {};

beforeAll(async done => {
  await resetDatabase();

  await Player.create({ id: 1000000, username: 'test player', displayName: 'Test Player' });
  await Player.create({ id: 200000, username: 'alt player', displayName: 'Alt Player' });

  done();
});

describe('Group API', () => {
  describe('Creating', () => {
    test('Do not create (invalid group name)', async done => {
      const response = await request.post('/api/groups').send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Invalid group name');

      done();
    });

    test('Do not create (empty group name)', async done => {
      const response = await request.post('/api/groups').send({ name: '' });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Invalid group name');

      done();
    });

    test('Do not create (invalid member roles)', async done => {
      const response = await request.post('/api/groups').send({
        name: 'A new test group',
        members: [
          { username: 'test player', role: 1 },
          { username: 'ALT PLAYER', role: 'random' },
          { username: 'zezima' }
        ]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Invalid member roles');

      done();
    });

    test('Create valid group (no members)', async done => {
      const response = await request
        .post('/api/groups')
        .send({ name: ' Some Group_', clanChat: ' Test ' });

      expect(response.status).toBe(201);
      expect(response.body.name).toMatch('Some Group');
      expect(response.body.clanChat).toMatch('Test');

      TEST_DATA.noMembers = response.body;

      done();
    });

    test('Create valid group (members, no leaders)', async done => {
      const response = await request.post('/api/groups').send({
        name: 'Cool Bois',
        members: [{ username: 'test player' }, { username: 'ALT PLAYER' }, { username: 'zezima' }]
      });

      expect(response.status).toBe(201);
      expect(response.body.members.length).toBe(3);
      expect(response.body.members.map(m => m.username)).toContain('alt player');
      expect(response.body.members.map(m => m.displayName)).toContain('Test Player');
      expect(response.body.members.filter(m => m.role === 'leader').length).toBe(0);

      TEST_DATA.membersNoLeaders = response.body;

      done();
    }, 10000);

    test('Create valid group (members, w/ leaders)', async done => {
      const response = await request.post('/api/groups').send({
        name: 'Cooler Bois',
        members: [
          { username: 'TEST player', role: 'leader' },
          { username: ' alt PLAYER ' },
          { username: 'zezima' }
        ]
      });

      expect(response.status).toBe(201);
      expect(response.body.members.length).toBe(3);
      expect(response.body.members.map(m => m.username)).toContain('alt player');
      expect(response.body.members.map(m => m.displayName)).toContain('Test Player');
      expect(response.body.members.filter(m => m.role === 'leader').length).toBe(1);

      TEST_DATA.membersOneLeader = response.body;

      done();
    }, 10000);

    test('Do not create (name already taken)', async done => {
      const response = await request.post('/api/groups').send({ name: 'Some Group' });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('is already taken');

      done();
    });

    test('Do not create (invalid members list format)', async done => {
      const response = await request.post('/api/groups').send({ name: 'RSPT', members: ['One', 'Two'] });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Invalid members list');

      done();
    });

    test('Do not create (invalid member in list)', async done => {
      const response = await request.post('/api/groups').send({
        name: 'RSPT',
        members: [
          { username: 'Test Player' },
          { username: 'Alt Player' },
          { username: 'Some really long username' }
        ]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Invalid usernames');
      expect(response.body.data).toContain('Some really long username');

      done();
    });
  });

  describe('Editing', () => {
    test('Do not edit (invalid verification code)', async done => {
      const response = await request.put('/api/groups/1000').send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Invalid verification code');

      done();
    });

    test('Do not edit (invalid params)', async done => {
      const response = await request.put('/api/groups/1000000').send({ verificationCode: 'XYZ' });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('You must either include');

      done();
    });

    test('Do not edit (group id does not exist)', async done => {
      const response = await request.put('/api/groups/1000000').send({
        name: 'RSPT',
        verificationCode: 'XYZ'
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('was not found');

      done();
    });

    test('Do not edit (group name is taken)', async done => {
      const response = await request.put(`/api/groups/${TEST_DATA.noMembers.id}`).send({
        name: 'Cool Bois',
        verificationCode: 'XYZ'
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('is already taken');

      done();
    });

    test('Do not edit (incorrect code)', async done => {
      const response = await request.put(`/api/groups/${TEST_DATA.noMembers.id}`).send({
        verificationCode: 'XYZ',
        members: [{ username: 'Psikoi', role: 'leader' }]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Incorrect verification code');

      done();
    });

    test('Do not edit (invalid member in list)', async done => {
      const response = await request.put(`/api/groups/${TEST_DATA.noMembers.id}`).send({
        verificationCode: TEST_DATA.noMembers.verificationCode,
        members: [{ username: 'Psikoi', role: 'leader' }, { username: 'Really long username' }]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Invalid usernames');
      expect(response.body.data).toContain('Really long username');

      done();
    });

    test('Edit (members list)', async done => {
      const response = await request.put(`/api/groups/${TEST_DATA.noMembers.id}`).send({
        verificationCode: TEST_DATA.noMembers.verificationCode,
        members: [{ username: 'Psikoi', role: 'leader' }, { username: 'zezIMA' }]
      });

      expect(response.status).toBe(200);
      expect(response.body.members.map(m => m.username)).toContain('psikoi');

      done();
    });

    test('Edit (name)', async done => {
      const response = await request.put(`/api/groups/${TEST_DATA.noMembers.id}`).send({
        name: 'WISE OLD MAN',
        verificationCode: TEST_DATA.noMembers.verificationCode
      });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('WISE OLD MAN');

      done();
    });

    test('Edit (clan chat)', async done => {
      const response = await request.put(`/api/groups/${TEST_DATA.noMembers.id}`).send({
        clanChat: 'TheBois ',
        verificationCode: TEST_DATA.noMembers.verificationCode
      });

      expect(response.status).toBe(200);
      expect(response.body.clanChat).toBe('TheBois');

      done();
    });
  });
});
