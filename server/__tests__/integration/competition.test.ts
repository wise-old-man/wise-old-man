import supertest from 'supertest';
import api from '../../src/api';
import { Competition, Group, Membership, Player } from '../../src/database/models';
import { TestData } from '../types';
import { resetDatabase } from '../utils';

const TEST_DATA: TestData = {};
const TEST_ID = 300000;
const TEST_GROUP_ID = 9001;

const TEST_VERIFICATION_CODE = '237-221-631';
const TEST_GROUP_VERIFICATION_CODE = '021-321-025';

const BASE_URL = '/api/competitions';

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
  describe('1. Creating', () => {
    test("1.1 - DON'T create (invalid competition title)", async done => {
      const response = await request.post(BASE_URL).send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'title' is undefined.");

      done();
    });

    test("1.2 - DON'T create (empty competition title)", async done => {
      const response = await request.post(BASE_URL).send({ title: '' });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'title' is undefined.");

      done();
    });

    test("1.3 - DON'T create (invalid metric)", async done => {
      const body = { title: 'test' };
      const response = await request.post(BASE_URL).send(body);

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'metric' is undefined.");

      done();
    });

    test("1.4 - DON'T create (invalid start date)", async done => {
      const body = { title: 'test', metric: 'overall', startsAt: 'invalid-start-date' };
      const response = await request.post(BASE_URL).send(body);

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'startsAt' is not a valid date.");

      done();
    });

    test("1.5 - DON'T create (invalid end date)", async done => {
      const body = {
        title: 'test',
        metric: 'overall',
        startsAt: '2020-05-17T22:00:00.000Z',
        endsAt: 'invalid-end-date'
      };

      const response = await request.post(BASE_URL).send(body);

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'endsAt' is not a valid date.");

      done();
    });

    test("1.6 - DON'T create (end date before start date)", async done => {
      const body = {
        title: 'test',
        metric: 'overall',
        startsAt: '2025-05-17T22:00:00.000Z',
        endsAt: '2025-05-10T22:00:00.000Z'
      };

      const response = await request.post(BASE_URL).send(body);

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Start date must be before the end date.');

      done();
    });

    test("1.7 - DON'T create (start & end date in the past)", async done => {
      const body = {
        title: 'test',
        metric: 'overall',
        startsAt: '2019-05-17T22:00:00.000Z',
        endsAt: '2019-05-10T22:00:00.000Z'
      };

      const response = await request.post(BASE_URL).send(body);

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Start date must be before the end date.');

      done();
    });

    test('1.8 - Create with minimal requirements', async done => {
      const body = {
        title: 'test',
        metric: 'overall',
        startsAt: '2025-05-17T22:00:00.000Z',
        endsAt: '2025-05-17T22:00:00.000Z',
        participants: ['test player', 'alt player']
      };

      const response = await request.post(BASE_URL).send(body);

      expect(response.status).toBe(201);
      expect(response.body.title).toMatch('test');
      expect(response.body.type).toMatch('classic');
      expect(response.body.metric).toMatch('overall');
      expect(response.body.startsAt).toMatch('2025-05-17T22:00:00.000Z');
      expect(response.body.endsAt).toMatch('2025-05-17T22:00:00.000Z');
      expect(response.body.participants.length).toBe(2);
      expect(response.body.participants[0].username).toBe('test player');
      expect(response.body.participants[1].username).toBe('alt player');
      expect(response.body.verificationCode).not.toBe(undefined);
      expect(response.body.verificationHash).toBe(undefined);

      TEST_DATA.minimal = response.body;

      done();
    });

    test('1.9 - Create with group', async done => {
      const body = {
        title: 'test',
        metric: 'overall',
        startsAt: '2025-05-17T22:00:00.000Z',
        endsAt: '2025-05-17T22:00:00.000Z',
        groupId: TEST_GROUP_ID,
        groupVerificationCode: TEST_GROUP_VERIFICATION_CODE
      };

      const response = await request.post(BASE_URL).send(body);

      expect(response.status).toBe(201);
      expect(response.body.type).toMatch('classic');
      expect(response.body.participants.length).toBe(2);
      expect(response.body.groupId).toBe(TEST_GROUP_ID);
      expect(response.body.verificationCode).toBe(undefined);
      expect(response.body.verificationHash).toBe(undefined);

      TEST_DATA.group = response.body;

      done();
    });

    test("1.10 - DON'T create (invalid group id)", async done => {
      const body = {
        title: 'test',
        metric: 'overall',
        startsAt: '2025-05-17T22:00:00.000Z',
        endsAt: '2025-05-17T22:00:00.000Z',
        groupId: 1337,
        groupVerificationCode: TEST_GROUP_VERIFICATION_CODE
      };

      const response = await request.post(BASE_URL).send(body);

      expect(response.status).toBe(404);
      expect(response.body.message).toMatch('Group not found.');

      done();
    });

    test("1.11 - DON'T create (no group verification)", async done => {
      const body = {
        title: 'test',
        metric: 'overall',
        startsAt: '2025-05-17T22:00:00.000Z',
        endsAt: '2025-05-17T22:00:00.000Z',
        groupId: TEST_GROUP_ID
      };

      const response = await request.post(BASE_URL).send(body);

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Invalid verification code.');

      done();
    });

    test("1.12 - DON'T create (invalid participant type data)", async done => {
      const body = {
        title: 'test',
        metric: 'overall',
        startsAt: '2025-05-17T22:00:00.000Z',
        endsAt: '2025-05-25T22:00:00.000Z',
        participants: [{}, 123, 'valid']
      };

      const response = await request.post(BASE_URL).send(body);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain(
        '2 Invalid usernames: Names must be 1-12 characters long,'
      );

      done();
    });

    test("1.14 - DON'T create (including participants and groupId)", async done => {
      const body = {
        title: 'test',
        metric: 'overall',
        startsAt: '2025-05-17T22:00:00.000Z',
        endsAt: '2025-05-17T22:00:00.000Z',
        groupId: TEST_GROUP_ID,
        groupVerificationCode: TEST_GROUP_VERIFICATION_CODE,
        participants: ['Psikoi', 'zezima', 'lynx titan']
      };

      const response = await request.post(BASE_URL).send(body);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Cannot include both');

      done();
    });

    test("1.15 - DON'T create (including participants and teams)", async done => {
      const body = {
        title: 'test',
        metric: 'overall',
        startsAt: '2025-05-17T22:00:00.000Z',
        endsAt: '2025-05-17T22:00:00.000Z',
        participants: ['Psikoi', 'zezima', 'lynx titan'],
        teams: [{}]
      };

      const response = await request.post(BASE_URL).send(body);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Cannot include both');

      done();
    });

    test("1.16 - DON'T create (invalid teams list)", async done => {
      const body = {
        title: 'test',
        metric: 'overall',
        startsAt: '2025-05-17T22:00:00.000Z',
        endsAt: '2025-05-17T22:00:00.000Z',
        teams: ['hey', 123, {}]
      };

      const response = await request.post(BASE_URL).send(body);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('All teams must have a name property');

      done();
    });

    test("1.17 - DON'T create (repeated team names)", async done => {
      const body = {
        title: 'test',
        metric: 'overall',
        startsAt: '2025-05-17T22:00:00.000Z',
        endsAt: '2025-05-17T22:00:00.000Z',
        teams: [{ name: 'Warriors' }, { name: 'warriors ' }]
      };

      const response = await request.post(BASE_URL).send(body);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Found repeated team names:');

      done();
    });

    test("1.18 - DON'T create (invalid team participants list)", async done => {
      const body = {
        title: 'test',
        metric: 'overall',
        startsAt: '2025-05-17T22:00:00.000Z',
        endsAt: '2025-05-17T22:00:00.000Z',
        teams: [
          { name: 'Warriors', participants: [] },
          { name: 'Spartans', participants: undefined }
        ]
      };

      const response = await request.post(BASE_URL).send(body);

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(
        'All teams must have a valid (non-empty) array of participants.'
      );

      done();
    });

    test("1.19 - DON'T create (invalid team participants)", async done => {
      const body = {
        title: 'test',
        metric: 'overall',
        startsAt: '2025-05-17T22:00:00.000Z',
        endsAt: '2025-05-17T22:00:00.000Z',
        teams: [
          { name: 'Warriors', participants: [123, {}] },
          { name: 'Spartans', participants: ['hey'] }
        ]
      };

      const response = await request.post(BASE_URL).send(body);

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('All participant names must be valid strings.');

      done();
    });

    test("1.20 - DON'T create (repeated team participants)", async done => {
      const body = {
        title: 'test',
        metric: 'overall',
        startsAt: '2025-05-17T22:00:00.000Z',
        endsAt: '2025-05-17T22:00:00.000Z',
        teams: [
          { name: 'Warriors', participants: ['Psikoi', 'Cometz'] },
          { name: 'Spartans', participants: ['psikOI  ', 'Zezima'] }
        ]
      };

      const response = await request.post(BASE_URL).send(body);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Found repeated usernames:');

      done();
    });

    test('1.21 - Create team competition', async done => {
      const body = {
        title: 'test',
        metric: 'firemaking',
        startsAt: '2025-05-17T22:00:00.000Z',
        endsAt: '2025-05-17T22:00:00.000Z',
        teams: [
          {
            name: 'Warriors',
            participants: ['test player']
          },
          {
            name: 'Spartans',
            participants: ['alt player']
          }
        ]
      };

      const response = await request.post(BASE_URL).send(body);

      TEST_DATA.team = response.body;

      expect(response.status).toBe(201);
      expect(response.body.type).toBe('team');
      expect(response.body.participants.length).toBe(2);

      expect(response.body.participants.filter(p => p.teamName === 'Warriors').length).toBe(1);
      expect(response.body.participants.filter(p => p.teamName === 'Spartans').length).toBe(1);

      done();
    }, 10000);
  });

  describe('2. Searching', () => {
    test('2.1 - Search competitions (no query)', async done => {
      const response = await request.get(BASE_URL).send();

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(4);

      expect(response.body.filter(c => c.type === 'classic').length).toBe(3);
      expect(response.body.filter(c => c.type === 'team').length).toBe(1);

      done();
    });

    test('2.2 - Search competitions (invalid status)', async done => {
      const query = { status: 'invalid-status' };
      const response = await request.get(BASE_URL).query(query);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid status.');

      done();
    });

    test('2.3 - Search competitions (invalid metric)', async done => {
      const query = { metric: 'invalid-metric' };
      const response = await request.get(BASE_URL).query(query);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid metric.');

      done();
    });

    test('2.4 - Search competitions (with metric)', async done => {
      const query = { metric: 'OvErAlL' };
      const response = await request.get(BASE_URL).query(query);

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(3);

      response.body.map(c => expect(c.metric).toBe('overall'));

      done();
    });

    test('2.5 - Search competitions (with type)', async done => {
      const query = { type: 'CLASSIC' };
      const response = await request.get(BASE_URL).query(query);

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(3);

      response.body.map(c => expect(c.type).toBe('classic'));

      done();
    });
  });

  describe('3. Viewing', () => {
    test('3.1 - View competition', async done => {
      const response = await request.get(`${BASE_URL}/${TEST_ID}`).send();

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('test competition');
      expect(response.body.metric).toBe('overall');
      expect(response.body.type).toBe('classic');
      expect(response.body.duration).toBe('3 days');
      expect(response.body.verificationCode).toBe(undefined);

      done();
    });

    test('3.2 - View competition (unknown id)', async done => {
      const response = await request.get(`${BASE_URL}/9001`).send();

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Competition not found.');

      done();
    });
  });

  describe('4. Updating', () => {
    test("4.1 - DON'T update (incorrect verificationCode)", async done => {
      const url = `${BASE_URL}/${TEST_DATA.minimal.id}`;
      const body = { title: 'update-title', verificationCode: '123-123' };

      const response = await request.put(url).send(body);

      expect(response.status).toBe(403);
      expect(response.body.message).toMatch('Incorrect verification code.');

      done();
    });

    test("4.2 - DON'T update (no verification code)", async done => {
      const url = `${BASE_URL}/${TEST_DATA.minimal.id}`;
      const body = { title: 'update-title' };

      const response = await request.put(url).send(body);

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'verificationCode' is undefined.");

      done();
    });

    test('4.3 - Update competition title (including sanitization)', async done => {
      const url = `${BASE_URL}/${TEST_DATA.minimal.id}`;
      const body = { title: 'updated-title', verificationCode: TEST_DATA.minimal.verificationCode };

      const response = await request.put(url).send(body);

      expect(response.status).toBe(200);
      expect(response.body.title).toMatch('updated title');

      done();
    });

    test('4.4 - Update competition participants', async done => {
      const url = `${BASE_URL}/${TEST_DATA.minimal.id}`;

      const body = {
        participants: ['test player', 'alt player'],
        verificationCode: TEST_DATA.minimal.verificationCode
      };

      const response = await request.put(url).send(body);

      expect(response.status).toBe(200);
      expect(response.body.participants.length).toBe(2);
      expect(response.body.participants.map(m => m.username)).toContain('alt player');
      expect(response.body.participants.map(m => m.displayName)).toContain('Test Player');

      done();
    });

    test("4.5 - DON'T update startDate (already started)", async done => {
      const url = `${BASE_URL}/${TEST_ID}`;

      const body = {
        title: 'updated-title',
        startsAt: '2019-05-17T22:00:00.000Z',
        verificationCode: TEST_VERIFICATION_CODE
      };

      const response = await request.put(url).send(body);

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(
        'The competition has started, the start date cannot be changed.'
      );

      done();
    });

    test("4.6 - DON'T update metric (already started)", async done => {
      const url = `${BASE_URL}/${TEST_ID}`;

      const body = {
        title: 'updated-title',
        metric: 'woodcutting',
        verificationCode: TEST_VERIFICATION_CODE
      };

      const response = await request.put(url).send(body);

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(
        'The competition has started, the metric cannot be changed.'
      );

      done();
    });

    test('4.7 - Update competition (title and participants)', async done => {
      const url = `${BASE_URL}/${TEST_ID}`;

      const body = {
        title: 'my competition',
        participants: ['test player'],
        verificationCode: TEST_VERIFICATION_CODE
      };

      const response = await request.put(url).send(body);

      expect(response.status).toBe(200);
      expect(response.body.title).toMatch('my competition');
      expect(response.body.participants.length).toBe(1);
      expect(response.body.participants.map(m => m.username)).toContain('test player');

      done();
    });

    test("4.8 - DON'T update (cannot change type after competition started)", async done => {
      const url = `${BASE_URL}/${TEST_ID}`;

      const body = {
        title: 'my competition',
        teams: [{ name: 'Warriors', participants: ['test player'] }],
        verificationCode: TEST_VERIFICATION_CODE
      };

      const response = await request.put(url).send(body);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('The competition type cannot be changed');

      done();
    });

    test("4.9 - DON'T update (invalid participant type data)", async done => {
      const url = `${BASE_URL}/${TEST_ID}`;

      const body = {
        title: 'my competition',
        verificationCode: TEST_VERIFICATION_CODE,
        participants: [{}, 123, 'valid']
      };

      const response = await request.put(url).send(body);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain(
        '2 Invalid usernames: Names must be 1-12 characters long,'
      );

      done();
    });

    test("4.10 - DON'T update (invalid teams list)", async done => {
      const url = `${BASE_URL}/${TEST_DATA.team.id}`;

      const body = {
        teams: ['hey', 123, {}],
        verificationCode: TEST_DATA.team.verificationCode
      };

      const response = await request.put(url).send(body);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('All teams must have a name property');

      done();
    });

    test("4.11 - DON'T update (repeated team names)", async done => {
      const url = `${BASE_URL}/${TEST_DATA.team.id}`;

      const body = {
        teams: [{ name: 'Warriors' }, { name: 'warriors ' }],
        verificationCode: TEST_DATA.team.verificationCode
      };

      const response = await request.put(url).send(body);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Found repeated team names:');

      done();
    });

    test("4.12 - DON'T update (invalid team participants list)", async done => {
      const url = `${BASE_URL}/${TEST_DATA.team.id}`;

      const body = {
        verificationCode: TEST_DATA.team.verificationCode,
        teams: [
          { name: 'Warriors', participants: [] },
          { name: 'Spartans', participants: undefined }
        ]
      };

      const response = await request.put(url).send(body);

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(
        'All teams must have a valid (non-empty) array of participants.'
      );

      done();
    });

    test("4.13 - DON'T update (invalid team participants)", async done => {
      const url = `${BASE_URL}/${TEST_DATA.team.id}`;

      const body = {
        verificationCode: TEST_DATA.team.verificationCode,
        teams: [
          { name: 'Warriors', participants: [123, {}] },
          { name: 'Spartans', participants: ['hey'] }
        ]
      };

      const response = await request.put(url).send(body);

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('All participant names must be valid strings.');

      done();
    });

    test("4.14 - DON'T update (repeated team participants)", async done => {
      const url = `${BASE_URL}/${TEST_DATA.team.id}`;

      const body = {
        verificationCode: TEST_DATA.team.verificationCode,
        teams: [
          { name: 'Warriors', participants: ['Psikoi', 'Cometz'] },
          { name: 'Spartans', participants: ['psikOI  ', 'Zezima'] }
        ]
      };

      const response = await request.put(url).send(body);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Found repeated usernames:');

      done();
    });

    test('4.14 - Update teams', async done => {
      const url = `${BASE_URL}/${TEST_DATA.team.id}`;

      const body = {
        verificationCode: TEST_DATA.team.verificationCode,
        teams: [
          {
            name: 'Warriors',
            participants: ['test player', 'epic player']
          },
          {
            name: 'Spartans',
            participants: ['alt player']
          }
        ]
      };

      const response = await request.put(url).send(body);

      expect(response.status).toBe(200);
      expect(response.body.participants.length).toBe(3);

      expect(response.body.participants.filter(p => p.teamName === 'Warriors').length).toBe(2);
      expect(response.body.participants.filter(p => p.teamName === 'Spartans').length).toBe(1);

      done();
    });
  });

  describe('5. Adding participants', () => {
    test("5.1 - DON'T add participant to competition (incorrect code)", async done => {
      const url = `${BASE_URL}/${TEST_DATA.minimal.id}/add-participants`;

      const body = {
        participants: ['new player'],
        verificationCode: 'xxx-xxx-xxx'
      };

      const response = await request.post(url).send(body);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Incorrect verification code.');

      done();
    });

    test('5.2 - Add participant to competition', async done => {
      const url = `${BASE_URL}/${TEST_DATA.minimal.id}/add-participants`;

      const body = {
        participants: ['new player'],
        verificationCode: TEST_DATA.minimal.verificationCode
      };

      const response = await request.post(url).send(body);

      expect(response.status).toBe(200);
      expect(response.body.newParticipants.length).toBe(1);
      expect(response.body.newParticipants.map(m => m.username)).toContain('new player');

      done();
    });

    test("5.3 - DON'T add participant to competition (already a participant)", async done => {
      const url = `${BASE_URL}/${TEST_DATA.minimal.id}/add-participants`;

      const body = {
        participants: ['new player'],
        verificationCode: TEST_DATA.minimal.verificationCode
      };

      const response = await request.post(url).send(body);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('All players given are already competing.');

      done();
    });

    test("5.4 - DON'T add participant to a team competition", async done => {
      const url = `${BASE_URL}/${TEST_DATA.team.id}/add-participants`;

      const body = {
        participants: ['new player'],
        verificationCode: TEST_DATA.team.verificationCode
      };

      const response = await request.post(url).send(body);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Cannot add participants to a team competition');

      done();
    });
  });

  describe('6. Removing participants', () => {
    test("6.1 - DON'T remove participant (competition not found)", async done => {
      const url = `${BASE_URL}/1234/remove-participants`;

      const body = {
        participants: ['new player'],
        verificationCode: TEST_DATA.minimal.verificationCode
      };

      const response = await request.post(url).send(body);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Competition not found.');

      done();
    });

    test("6.2 - DON'T remove participant (incorrect code)", async done => {
      const url = `${BASE_URL}/${TEST_DATA.minimal.id}/remove-participants`;

      const body = {
        participants: ['new player'],
        verificationCode: 'xxx-xxx-xxx'
      };

      const response = await request.post(url).send(body);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Incorrect verification code.');

      done();
    });

    test("6.3 - DON'T remove participant (no participants given)", async done => {
      const url = `${BASE_URL}/${TEST_DATA.minimal.id}/remove-participants`;

      const body = {
        participants: [],
        verificationCode: TEST_DATA.minimal.verificationCode
      };

      const response = await request.post(url).send(body);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Empty participants list.');

      done();
    });

    test("6.4 - DON'T remove participant (no valid participants)", async done => {
      const url = `${BASE_URL}/${TEST_DATA.minimal.id}/remove-participants`;

      const body = {
        participants: ['epic player'],
        verificationCode: TEST_DATA.minimal.verificationCode
      };

      const response = await request.post(url).send(body);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('None of the players given were competing.');

      done();
    });

    test("6.5 - DON'T remove participant from a team competition", async done => {
      const url = `${BASE_URL}/${TEST_DATA.team.id}/remove-participants`;

      const body = {
        participants: ['test player'],
        verificationCode: TEST_DATA.team.verificationCode
      };

      const response = await request.post(url).send(body);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Cannot remove participants from a team competition');

      done();
    });

    test('6.6 - Remove participant', async done => {
      const url = `${BASE_URL}/${TEST_DATA.minimal.id}/remove-participants`;

      const body = {
        participants: ['new player'],
        verificationCode: TEST_DATA.minimal.verificationCode
      };

      const response = await request.post(url).send(body);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain(`Successfully removed 1 participants`);

      done();
    });
  });

  describe('7. Adding teams', () => {
    test("7.1 - DON'T add teams (undefined verification code)", async done => {
      const url = `${BASE_URL}/${TEST_DATA.team.id}/add-teams`;

      const response = await request.post(url).send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'verificationCode' is undefined.");

      done();
    });

    test("7.2 - DON'T add teams (incorrect verification code)", async done => {
      const url = `${BASE_URL}/${TEST_DATA.team.id}/add-teams`;
      const body = { verificationCode: 'invalid' };

      const response = await request.post(url).send(body);

      expect(response.status).toBe(403);
      expect(response.body.message).toMatch('Incorrect verification code.');

      done();
    });

    test("7.3 - DON'T add teams (undefined teams list)", async done => {
      const url = `${BASE_URL}/${TEST_DATA.team.id}/add-teams`;
      const body = { verificationCode: TEST_DATA.team.verificationCode };

      const response = await request.post(url).send(body);

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Empty teams list.');

      done();
    });

    test("7.4 - DON'T add teams (empty teams list)", async done => {
      const url = `${BASE_URL}/${TEST_DATA.team.id}/add-teams`;

      const body = {
        verificationCode: TEST_DATA.team.verificationCode,
        teams: []
      };

      const response = await request.post(url).send(body);

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Empty teams list.');

      done();
    });

    test("7.5 - DON'T add teams (competition is classic)", async done => {
      const url = `${BASE_URL}/${TEST_DATA.minimal.id}/add-teams`;

      const body = {
        verificationCode: TEST_DATA.minimal.verificationCode,
        teams: [{}]
      };

      const response = await request.post(url).send(body);

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Teams can't be added to a classic competition.");

      done();
    });

    test("7.6 - DON'T add teams (invalid teams list)", async done => {
      const url = `${BASE_URL}/${TEST_DATA.team.id}/add-teams`;

      const body = {
        verificationCode: TEST_DATA.team.verificationCode,
        teams: ['hey', 123, {}]
      };

      const response = await request.post(url).send(body);

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('All teams must have a name property.');

      done();
    });

    test("7.7 - DON'T add teams (repeated team names)", async done => {
      const url = `${BASE_URL}/${TEST_DATA.team.id}/add-teams`;

      const body = {
        verificationCode: TEST_DATA.team.verificationCode,
        teams: [{ name: 'Warriors' }, { name: 'warriors ' }]
      };

      const response = await request.post(url).send(body);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Found repeated team names:');

      done();
    });

    test("7.8 - DON'T add teams (repeated team names)", async done => {
      const url = `${BASE_URL}/${TEST_DATA.team.id}/add-teams`;

      const body = {
        verificationCode: TEST_DATA.team.verificationCode,
        teams: [
          { name: 'Warriors', participants: [] },
          { name: 'Spartans', participants: undefined }
        ]
      };

      const response = await request.post(url).send(body);

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(
        'All teams must have a valid (non-empty) array of participants.'
      );

      done();
    });

    test("7.9 - DON'T add teams (invalid team participants)", async done => {
      const url = `${BASE_URL}/${TEST_DATA.team.id}/add-teams`;

      const body = {
        verificationCode: TEST_DATA.team.verificationCode,
        teams: [
          { name: 'Warriors', participants: [123, {}] },
          { name: 'Spartans', participants: ['hey'] }
        ]
      };

      const response = await request.post(url).send(body);

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('All participant names must be valid strings.');

      done();
    });

    test("7.10 - DON'T add teams (repeated team participants)", async done => {
      const url = `${BASE_URL}/${TEST_DATA.team.id}/add-teams`;

      const body = {
        verificationCode: TEST_DATA.team.verificationCode,
        teams: [
          { name: 'Warriors', participants: ['Psikoi', 'Cometz'] },
          { name: 'Spartans', participants: ['psikOI  ', 'Zezima'] }
        ]
      };

      const response = await request.post(url).send(body);

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Found repeated usernames:');

      done();
    });
  });

  describe('8. Removing teams', () => {
    test("8.1 - DON'T remove teams (undefined verification code)", async done => {
      const url = `${BASE_URL}/${TEST_DATA.minimal.id}/remove-teams`;
      const response = await request.post(url).send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'verificationCode' is undefined.");

      done();
    });

    test("8.2 - DON'T remove teams (undefined team names)", async done => {
      const url = `${BASE_URL}/${TEST_DATA.minimal.id}/remove-teams`;
      const body = { verificationCode: 'something' };

      const response = await request.post(url).send(body);

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'teamNames' is undefined.");

      done();
    });

    test("8.3 - DON'T remove teams (incorrect verification code)", async done => {
      const url = `${BASE_URL}/${TEST_DATA.minimal.id}/remove-teams`;
      const body = { verificationCode: 'invalid', teamNames: [] };

      const response = await request.post(url).send(body);

      expect(response.status).toBe(403);
      expect(response.body.message).toMatch('Incorrect verification code.');

      done();
    });

    test("8.4 - DON'T remove teams (classic competition)", async done => {
      const url = `${BASE_URL}/${TEST_DATA.minimal.id}/remove-teams`;
      const body = { verificationCode: TEST_DATA.minimal.verificationCode, teamNames: [] };

      const response = await request.post(url).send(body);

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Cannot remove teams from a classic competition.');

      done();
    });

    test("8.5 - DON'T remove teams (empty team names list)", async done => {
      const url = `${BASE_URL}/${TEST_DATA.team.id}/remove-teams`;
      const body = { verificationCode: TEST_DATA.team.verificationCode, teamNames: [] };

      const response = await request.post(url).send(body);

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Empty team names list.');

      done();
    });

    test("8.6 - DON'T remove teams (invalid team names list)", async done => {
      const url = `${BASE_URL}/${TEST_DATA.team.id}/remove-teams`;
      const body = { verificationCode: TEST_DATA.team.verificationCode, teamNames: [123, {}, 'hey'] };

      const response = await request.post(url).send(body);

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('All teams must have a name property.');

      done();
    });

    test('8.7 - Remove teams', async done => {
      const url = `${BASE_URL}/${TEST_DATA.team.id}/remove-teams`;
      const body = { verificationCode: TEST_DATA.team.verificationCode, teamNames: ['Warriors'] };

      const response = await request.post(url).send(body);

      expect(response.status).toBe(200);
      expect(response.body.message).toMatch('Successfully removed 2 participants from test.');

      done();
    });
  });

  describe('9. Deleting', () => {
    test("9.1 - DON'T delete (undefined verification code)", async done => {
      const url = `${BASE_URL}/${TEST_DATA.minimal.id}`;
      const response = await request.delete(url).send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'verificationCode' is undefined.");

      done();
    });

    test("9.2 - DON'T delete (invalid verification code)", async done => {
      const url = `${BASE_URL}/${TEST_DATA.minimal.id}`;
      const body = { verificationCode: 'invalid' };

      const response = await request.delete(url).send(body);

      expect(response.status).toBe(403);
      expect(response.body.message).toMatch('Incorrect verification code.');

      done();
    });

    test('9.3 - Delete competition', async done => {
      const url = `${BASE_URL}/${TEST_DATA.minimal.id}`;
      const body = { verificationCode: TEST_DATA.minimal.verificationCode };

      const response = await request.delete(url).send(body);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('Successfully deleted competition');

      const competitionResponse = await request.get(url).send();
      expect(competitionResponse.status).toBe(404);

      done();
    });
  });
});
