import axios from 'axios';
import supertest from 'supertest';
import MockAdapter from 'axios-mock-adapter';
import env from '../../../src/env';
import apiServer from '../../../src/api';
import prisma from '../../../src/prisma';
import { PlayerType } from '../../../src/utils';
import * as groupEvents from '../../../src/api/modules/groups/group.events';
import {
  resetDatabase,
  resetRedis,
  registerCMLMock,
  registerHiscoresMock,
  readFile,
  modifyRawHiscoresData,
  registerTempleMock,
  sleep
} from '../../utils';

const api = supertest(apiServer.express);
const axiosMock = new MockAdapter(axios, { onNoMatch: 'passthrough' });

const onMembersLeftEvent = jest.spyOn(groupEvents, 'onMembersLeft');
const onMembersJoinedEvent = jest.spyOn(groupEvents, 'onMembersJoined');

const P_HISCORES_FILE_PATH = `${__dirname}/../../data/hiscores/psikoi_hiscores.txt`;
const LT_HISCORES_FILE_PATH = `${__dirname}/../../data/hiscores/lynx_titan_hiscores.txt`;
const TEMPLE_GROUP_FILE_PATH = `${__dirname}/../../data/temple/omnia_group.json`;
const CML_GROUP_FILE_PATH = `${__dirname}/../../data/cml/rspt_group_cml.txt`;

const globalData = {
  pHiscoresRawData: '',
  ltHiscoresRawData: '',
  templeGroupRawData: '',
  cmlGroupRawData: '',
  testGroupNoMembers: {
    id: -1,
    name: '',
    verificationCode: ''
  },
  testGroupNoLeaders: {
    id: -1,
    name: '',
    verificationCode: ''
  },
  testGroupOneLeader: {
    id: -1,
    name: '',
    verificationCode: ''
  },
  testDuplicates: {
    id: -1,
    name: '',
    verificationCode: ''
  }
};

beforeEach(() => {
  jest.resetAllMocks();
});

beforeAll(async () => {
  await resetDatabase();
  await resetRedis();

  globalData.pHiscoresRawData = await readFile(P_HISCORES_FILE_PATH);
  globalData.ltHiscoresRawData = await readFile(LT_HISCORES_FILE_PATH);
  globalData.templeGroupRawData = await readFile(TEMPLE_GROUP_FILE_PATH);
  globalData.cmlGroupRawData = await readFile(CML_GROUP_FILE_PATH);

  // Mock the history fetch from CML to always fail with a 404 status code
  registerCMLMock(axiosMock, 404);

  // Mock regular hiscores data, and block any ironman requests
  registerHiscoresMock(axiosMock, {
    [PlayerType.REGULAR]: { statusCode: 200, rawData: globalData.pHiscoresRawData },
    [PlayerType.IRONMAN]: { statusCode: 404 }
  });
});

afterAll(async () => {
  jest.useRealTimers();
  axiosMock.reset();

  // Sleep for 1s to allow the server to shut down gracefully
  await apiServer.shutdown().then(() => sleep(1000));
});

describe('Group API', () => {
  describe('1 - Create', () => {
    it('should not create (invalid name)', async () => {
      const response = await api.post('/groups').send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'name' is undefined.");

      expect(onMembersJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not create (empty name)', async () => {
      const response = await api.post('/groups').send({ name: '' });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Group name must have at least one character.');

      expect(onMembersJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not create (name too long)', async () => {
      const response = await api
        .post('/groups')
        .send({ name: 'jklasjhfklsdhnfkjsdnfkdjsnfkdjsnfkjsdnfksdjnfksdjn' });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Group name cannot be longer than 30 characters.');

      expect(onMembersJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not create (invalid clanChat)', async () => {
      const response = await api.post('/groups').send({
        name: 'ooops',
        clanChat: '#hey_',
        members: []
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Invalid 'clanChat'");

      expect(onMembersJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not create (clanChat too long)', async () => {
      const response = await api.post('/groups').send({
        name: 'ooops',
        clanChat: 'jklasjhfklsdhnfkjsdnfkdjsnfkdjsnfkjsdnfksdjnfksdjn',
        members: []
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Invalid 'clanChat'");

      expect(onMembersJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not create (description too long)', async () => {
      const response = await api.post('/groups').send({
        name: 'ooops',
        description:
          'jklasjhfklsdhnfkjsdnfkdjsnfkdjsnfkjsdnfksdjnfksdjnjklasjhfklsdhnfkjsdnfkdjsnfkdjsnfkjsdnfksdjnfksdjn1'
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Description cannot be longer than 100 characters.');

      expect(onMembersJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not create (invalid member object shape)', async () => {
      const response = await api.post('/groups').send({
        name: 'A new test group',
        members: ['test player', 'alt player']
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(
        'Invalid members list. Must be an array of { username: string; role?: string; }.'
      );

      expect(onMembersJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not create (invalid member role)', async () => {
      const response = await api.post('/groups').send({
        name: 'A new test group',
        members: [
          { username: 'test player', role: 'idk' },
          { username: 'ALT PLAYER', role: 'random' },
          { username: 'zezima' }
        ]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Invalid enum value for 'role'.");

      expect(onMembersJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not create (invalid member name)', async () => {
      const response = await api.post('/groups').send({
        name: 'A new test group',
        members: [{ username: 'reallyreallylongusername', role: 'leader' }, { username: 'zezima' }]
      });

      expect(response.status).toBe(400);
      expect(response.body.data).toEqual(['reallyreallylongusername']);
      expect(response.body.message).toMatch('Found 1 invalid usernames:');

      expect(onMembersJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not create (invalid homeworld type)', async () => {
      const response = await api.post('/groups').send({
        name: ' Some Group_',
        description: 'Test',
        clanChat: ' Test ',
        homeworld: 'BadType',
        members: []
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'homeworld' is not a valid number.");

      expect(onMembersJoinedEvent).not.toHaveBeenCalled();
    });

    it('should create (no members)', async () => {
      const response = await api.post('/groups').send({
        name: ' Some Group_',
        description: 'Test123',
        clanChat: ' Test ',
        homeworld: 492,
        members: []
      });

      expect(response.status).toBe(201);
      expect(response.body.group).toMatchObject({
        name: 'Some Group',
        clanChat: 'Test',
        description: 'Test123',
        homeworld: 492,
        memberCount: 0
      });
      expect(response.body.group.memberships.length).toBe(0);
      expect(response.body.group.verificationHash).not.toBeDefined();
      expect(response.body.verificationCode).toBeDefined();

      expect(onMembersJoinedEvent).not.toHaveBeenCalled();

      globalData.testGroupNoMembers = {
        id: response.body.group.id,
        name: response.body.group.name,
        verificationCode: response.body.verificationCode
      };
    });

    it('should create (members w/ default roles)', async () => {
      const response = await api.post('/groups').send({
        name: ' heyy_',
        members: [
          { username: '  Test_Player' },
          { username: '  ALT PLAYER' },
          { username: 'alexsuperfly' },
          { username: 'alt player   ' },
          { username: '__ zezima ' },
          { username: 'Jakesterwars' }
        ]
      });

      expect(response.status).toBe(201);
      expect(response.body.group.name).toBe('heyy');
      expect(response.body.group.clanChat).toBe(null);
      expect(response.body.group.description).toBe(null);
      expect(response.body.group.homeworld).toBe(null);
      expect(response.body.group.memberCount).toBe(5);
      expect(response.body.group.memberships.length).toBe(5);
      expect(response.body.group.memberships[0].player.displayName).toContain('Test Player');
      expect(response.body.group.memberships[1].player.username).toBe('alt player');
      expect(response.body.group.memberships[2].player.username).toBe('alexsuperfly');
      expect(response.body.group.memberships[3].player.username).toBe('zezima');
      expect(response.body.group.memberships[4].player.username).toBe('jakesterwars');
      expect(response.body.group.memberships.filter(m => m.role !== 'member').length).toBe(0);
      expect(response.body.group.verificationHash).not.toBeDefined();
      expect(response.body.verificationCode).toBeDefined();

      expect(onMembersJoinedEvent).toHaveBeenCalledWith(expect.objectContaining({ length: 5 }));

      globalData.testGroupNoLeaders = {
        id: response.body.group.id,
        name: response.body.group.name,
        verificationCode: response.body.verificationCode
      };
    });

    it('should create (members w/ roles)', async () => {
      const response = await api.post('/groups').send({
        name: 'woaaahh',
        members: [
          { username: 'TEST player', role: 'leader' },
          { username: ' alt PLAYER ', role: 'captain' },
          { username: 'swampletics', role: 'artisan' },
          { username: 'zezima' }
        ]
      });

      expect(response.status).toBe(201);
      expect(response.body.group.memberships.length).toBe(4);
      expect(response.body.group.memberCount).toBe(4);
      expect(response.body.group.memberships.map(m => m.player.username)).toContain('alt player');
      expect(response.body.group.memberships.map(m => m.player.displayName)).toContain('Test Player');
      expect(response.body.group.memberships.filter(m => m.role === 'leader').length).toBe(1);
      expect(response.body.group.memberships.filter(m => m.role === 'captain').length).toBe(1);
      expect(response.body.group.memberships.filter(m => m.role === 'member').length).toBe(1);
      expect(response.body.group.memberships.filter(m => m.role === 'artisan').length).toBe(1);

      expect(onMembersJoinedEvent).toHaveBeenCalledWith(expect.objectContaining({ length: 4 }));

      globalData.testGroupOneLeader = {
        id: response.body.group.id,
        name: response.body.group.name,
        verificationCode: response.body.verificationCode
      };
    });

    it('should not create (name already taken)', async () => {
      const response = await api.post('/groups').send({ name: 'Some Group', members: [] });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('is already taken');

      expect(onMembersJoinedEvent).not.toHaveBeenCalled();
    });

    it('should create and correctly handle duplicate usernames', async () => {
      const response = await api.post('/groups').send({
        name: 'woaaahh 2',
        members: [
          { username: 'TEST player', role: 'leader' },
          { username: ' alt PLAYER ', role: 'captain' },
          { username: 'test player', role: 'ruby' },
          { username: 'zezima' }
        ]
      });

      globalData.testDuplicates = {
        id: response.body.group.id,
        name: response.body.group.name,
        verificationCode: response.body.verificationCode
      };

      expect(response.status).toBe(201);
      expect(response.body.group.memberships.length).toBe(3);

      expect(response.body.group.memberships[0]).toMatchObject({
        player: { username: 'alt player' },
        role: 'captain'
      });

      expect(response.body.group.memberships[1]).toMatchObject({
        player: { username: 'zezima' },
        role: 'member'
      });

      expect(response.body.group.memberships[2]).toMatchObject({
        player: { username: 'test player' },
        role: 'ruby'
      });

      expect(onMembersJoinedEvent).toHaveBeenCalledWith(expect.objectContaining({ length: 3 }));
    });
  });

  describe('2 - Edit', () => {
    it('should not edit (invalid verification code)', async () => {
      const response = await api.put(`/groups/${globalData.testGroupNoMembers.id}`).send({ name: 'idk' });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'verificationCode' is required.");

      expect(onMembersLeftEvent).not.toHaveBeenCalled();
      expect(onMembersJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not edit (incorrect verification code)', async () => {
      const response = await api
        .put(`/groups/${globalData.testGroupNoMembers.id}`)
        .send({ verificationCode: 'XYZ', name: 'ABC' });

      expect(response.status).toBe(403);
      expect(response.body.message).toMatch('Incorrect verification code');

      expect(onMembersLeftEvent).not.toHaveBeenCalled();
      expect(onMembersJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not edit (empty params)', async () => {
      const response = await api
        .put(`/groups/${globalData.testGroupNoMembers.id}`)
        .send({ verificationCode: globalData.testGroupNoMembers.verificationCode });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Nothing to update.');

      expect(onMembersLeftEvent).not.toHaveBeenCalled();
      expect(onMembersJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not edit (group not found)', async () => {
      const response = await api.put('/groups/1000').send({ verificationCode: 'XYZ', name: 'ABC' });

      expect(response.status).toBe(404);
      expect(response.body.message).toMatch('Group not found.');

      expect(onMembersLeftEvent).not.toHaveBeenCalled();
      expect(onMembersJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not edit (name already taken)', async () => {
      const response = await api.put(`/groups/${globalData.testGroupNoMembers.id}`).send({
        verificationCode: globalData.testGroupNoMembers.verificationCode,
        name: ` ${globalData.testGroupNoLeaders.name}__`
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(
        `Group name '${globalData.testGroupNoLeaders.name}' is already taken.`
      );

      expect(onMembersLeftEvent).not.toHaveBeenCalled();
      expect(onMembersJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not edit (invalid member object shape)', async () => {
      const response = await api.put(`/groups/${globalData.testGroupNoMembers.id}`).send({
        verificationCode: globalData.testGroupNoMembers.verificationCode,
        members: ['One', 'Two']
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(
        'Invalid members list. Must be an array of { username: string; role?: string; }.'
      );

      expect(onMembersLeftEvent).not.toHaveBeenCalled();
      expect(onMembersJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not edit (invalid member role)', async () => {
      const response = await api.put(`/groups/${globalData.testGroupNoMembers.id}`).send({
        verificationCode: globalData.testGroupNoMembers.verificationCode,
        members: [{ username: 'Test Player', role: 'what' }, { username: 'Alt Player' }]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Invalid enum value for 'role'.");
    });

    it('should not edit (invalid members list)', async () => {
      const response = await api.put(`/groups/${globalData.testGroupNoMembers.id}`).send({
        verificationCode: globalData.testGroupNoMembers.verificationCode,
        members: 123
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'members' is not a valid array.");

      expect(onMembersLeftEvent).not.toHaveBeenCalled();
      expect(onMembersJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not edit (invalid member name)', async () => {
      const response = await api.put(`/groups/${globalData.testGroupNoMembers.id}`).send({
        verificationCode: globalData.testGroupNoMembers.verificationCode,
        members: [
          { username: 'Test Player' },
          { username: 'Alt Player' },
          { username: 'Some really long username' }
        ]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Found 1 invalid usernames');
      expect(response.body.data).toEqual(['Some really long username']);

      expect(onMembersLeftEvent).not.toHaveBeenCalled();
      expect(onMembersJoinedEvent).not.toHaveBeenCalled();
    });

    it('should edit members list', async () => {
      const response = await api.put(`/groups/${globalData.testGroupOneLeader.id}`).send({
        verificationCode: globalData.testGroupOneLeader.verificationCode,
        members: [
          { username: 'Psikoi', role: 'achiever' },
          { username: ' ZezIMA___', role: 'collector' },
          { username: 'swampletics', role: 'artisan' },
          { username: 'alexsuperfly', role: 'leader' },
          { username: 'zezIMA', role: 'firemaker' },
          { username: 'rorro' }
        ]
      });

      expect(response.status).toBe(200);
      expect(new Date(response.body.updatedAt).getTime()).toBeGreaterThan(Date.now() - 1000);
      expect(response.body.memberCount).toBe(5);
      expect(response.body.memberships.map(m => m.player.username)).toContain('psikoi');
      expect(response.body.memberships.map(m => m.player.username)).toContain('zezima');
      expect(response.body.memberships.map(m => m.player.username)).toContain('alexsuperfly');
      expect(response.body.memberships.map(m => m.player.username)).toContain('rorro');
      expect(response.body.memberships.filter(m => m.role === 'achiever').length).toBe(1);
      expect(response.body.memberships.filter(m => m.role === 'firemaker').length).toBe(1);
      expect(response.body.memberships.filter(m => m.role === 'member').length).toBe(1);
      expect(response.body.memberships.filter(m => m.role === 'leader').length).toBe(1);

      // 2 players removed
      expect(onMembersLeftEvent).toHaveBeenCalledWith(
        globalData.testGroupOneLeader.id,
        expect.objectContaining({ length: 2 })
      );
      // 3 new players added
      expect(onMembersJoinedEvent).toHaveBeenCalledWith(expect.objectContaining({ length: 3 }));
    });

    it('should edit name', async () => {
      const response = await api.put(`/groups/${globalData.testGroupOneLeader.id}`).send({
        verificationCode: globalData.testGroupOneLeader.verificationCode,
        name: '__New name! '
      });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('New name!');
      expect(response.body.memberCount).toBe(5); // shouldn't change
      expect(new Date(response.body.updatedAt).getTime()).toBeGreaterThan(Date.now() - 1000);

      expect(onMembersLeftEvent).not.toHaveBeenCalled();
      expect(onMembersJoinedEvent).not.toHaveBeenCalled();
    });

    it('should edit clanchat, homeworld & description', async () => {
      const response = await api.put(`/groups/${globalData.testGroupOneLeader.id}`).send({
        verificationCode: globalData.testGroupOneLeader.verificationCode,
        clanChat: 'wiseoldman  ',
        description: ' when I was a young boy, my father took me into the city to see a marching band  ',
        homeworld: 302
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        clanChat: 'wiseoldman',
        description: 'when I was a young boy, my father took me into the city to see a marching band',
        homeworld: 302,
        memberCount: 5 // shouldn't change
      });
      expect(new Date(response.body.updatedAt).getTime()).toBeGreaterThan(Date.now() - 1000);

      expect(onMembersLeftEvent).not.toHaveBeenCalled();
      expect(onMembersJoinedEvent).not.toHaveBeenCalled();
    });
  });

  describe('3 - Search Groups', () => {
    it('should search groups', async () => {
      await prisma.group.update({
        where: { id: globalData.testGroupOneLeader.id },
        data: { score: 100 }
      });

      await prisma.group.update({
        where: { id: globalData.testDuplicates.id },
        data: { score: 30 }
      });

      const response = await api.get('/groups');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(4);

      // Hashes shouldn't be exposed to the API consumer
      expect(response.body.filter(g => !!g.verificationHash).length).toBe(0);

      // These should be ordered by score, then id
      expect(response.body[0]).toMatchObject({
        id: globalData.testGroupOneLeader.id,
        memberCount: 5
      });

      expect(response.body[1]).toMatchObject({
        id: globalData.testDuplicates.id,
        memberCount: 3
      });

      expect(response.body[2]).toMatchObject({
        id: globalData.testGroupNoMembers.id,
        memberCount: 0
      });

      expect(response.body[3]).toMatchObject({
        id: globalData.testGroupNoLeaders.id,
        memberCount: 5
      });
    });

    it('should search groups (w/ name query)', async () => {
      const response = await api.get('/groups').query({ name: 'ey' });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].id).toBe(globalData.testGroupNoLeaders.id);

      // Hashes shouldn't be exposed to the API consumer
      expect(response.body.filter(g => !!g.verificationHash).length).toBe(0);
    });

    it('should search groups (w/ limit)', async () => {
      const response = await api.get('/groups').query({ limit: 1 });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].id).toBe(globalData.testGroupOneLeader.id);

      // Hashes shouldn't be exposed to the API consumer
      expect(response.body.filter(g => !!g.verificationHash).length).toBe(0);
    });

    it('should search groups (w/ limit & offset)', async () => {
      const response = await api.get('/groups').query({ limit: 1, offset: 1 });

      // Hashes shouldn't be exposed to the API consumer
      expect(response.body.filter(g => !!g.verificationHash).length).toBe(0);

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].id).toBe(globalData.testDuplicates.id);
    });

    it('should not search groups (negative offset)', async () => {
      const response = await api.get(`/groups`).query({ offset: -5 });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'offset' must be >= 0.");
    });

    it('should not search groups (negative limit)', async () => {
      const response = await api.get(`/groups`).query({ limit: -5 });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'limit' must be > 0.");
    });

    it('should not search groups (limit > 50)', async () => {
      const response = await api.get(`/groups`).query({ limit: 1000 });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('The maximum results limit is 50');
    });
  });

  describe('4 - Add Members', () => {
    it('should not add members (group not found)', async () => {
      const response = await api.post('/groups/1000/members').send({
        verificationCode: 'XYZ',
        members: [{ username: 'elvard', role: 'leader' }]
      });

      expect(response.status).toBe(404);
      expect(response.body.message).toMatch('Group not found.');

      expect(onMembersJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not add members (invalid verification code)', async () => {
      const response = await api
        .post(`/groups/${globalData.testGroupNoLeaders.id}/members`)
        .send({ members: [] });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'verificationCode' is required.");

      expect(onMembersJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not add members (incorrect verification code)', async () => {
      const response = await api.post(`/groups/${globalData.testGroupNoLeaders.id}/members`).send({
        verificationCode: 'xxx-xxx-xxx',
        members: [{ username: 'elvard', role: 'leader' }]
      });

      expect(response.status).toBe(403);
      expect(response.body.message).toMatch('Incorrect verification code.');

      expect(onMembersJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not add members (invalid members list)', async () => {
      const response = await api.post(`/groups/${globalData.testGroupNoLeaders.id}/members`).send({
        verificationCode: globalData.testGroupNoLeaders.verificationCode,
        members: 123
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'members' is not a valid array.");

      expect(onMembersJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not add members (empty members list)', async () => {
      const response = await api.post(`/groups/${globalData.testGroupNoLeaders.id}/members`).send({
        verificationCode: globalData.testGroupNoLeaders.verificationCode,
        members: []
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Empty members list.');

      expect(onMembersJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not add members (invalid member object shape)', async () => {
      const response = await api.post(`/groups/${globalData.testGroupNoLeaders.id}/members`).send({
        verificationCode: globalData.testGroupNoLeaders.verificationCode,
        members: ['elvard@invalid']
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Invalid members list.');

      expect(onMembersJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not add members (invalid member name)', async () => {
      const response = await api.post(`/groups/${globalData.testGroupNoLeaders.id}/members`).send({
        verificationCode: globalData.testGroupNoLeaders.verificationCode,
        members: [{ username: 'elvard@invalid' }, { username: 'alright' }]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Found 1 invalid usernames:');
      expect(response.body.data.length).toBe(1);
      expect(response.body.data).toContain('elvard@invalid');

      expect(onMembersJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not add members (invalid member role)', async () => {
      const response = await api.post(`/groups/${globalData.testGroupNoLeaders.id}/members`).send({
        verificationCode: globalData.testGroupNoLeaders.verificationCode,
        members: [{ username: 'alexsuperfly', role: 'invalid' }]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Invalid enum value for 'role'.");

      expect(onMembersJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not add members (already members)', async () => {
      const response = await api.post(`/groups/${globalData.testGroupNoLeaders.id}/members`).send({
        verificationCode: globalData.testGroupNoLeaders.verificationCode,
        members: [{ username: 'zezima' }]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('All players given are already members.');

      expect(onMembersJoinedEvent).not.toHaveBeenCalled();
    });

    it('should add members', async () => {
      const before = await api.get(`/groups/${globalData.testGroupNoLeaders.id}`);
      expect(before.status).toBe(200);

      const response = await api.post(`/groups/${globalData.testGroupNoLeaders.id}/members`).send({
        verificationCode: globalData.testGroupNoLeaders.verificationCode,
        members: [
          { username: 'zezima' }, // should ignore this username, since it's already a member
          { username: ' sethmare___', role: 'magician' },
          { username: 'RRO', role: 'ranger' },
          { username: 'lynx titan', role: 'magician' }
        ]
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        count: 3,
        message: 'Successfully added 3 members.'
      });

      expect(onMembersJoinedEvent).toHaveBeenCalledWith(expect.objectContaining({ length: 3 }));

      const after = await api.get(`/groups/${globalData.testGroupNoLeaders.id}`);
      expect(after.status).toBe(200);
      expect(after.body.memberCount).toBe(8); // had 5 previously

      // ensure group.updatedAt has been updated
      expect(new Date(after.body.updatedAt).getTime()).toBeGreaterThan(
        new Date(before.body.updatedAt).getTime()
      );
    });
  });

  describe('5 - Change Role', () => {
    it('should not change role (group not found)', async () => {
      const response = await api.put(`/groups/123456789/role`).send({
        verificationCode: 'xxx-xxx-xxx',
        username: 'elvard',
        role: 'ranger'
      });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Group not found.');
    });

    it('should not change role (invalid verification code)', async () => {
      const response = await api.put(`/groups/123456789/role`).send({
        username: 'elvard',
        role: 'ranger'
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Parameter 'verificationCode' is required.");
    });

    it('should not change role (incorrect verification code)', async () => {
      const response = await api.put(`/groups/${globalData.testGroupNoLeaders.id}/role`).send({
        verificationCode: 'xxx-xxx-xxx',
        username: 'elvard',
        role: 'ranger'
      });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Incorrect verification code.');
    });

    it('should not change role (undefined username)', async () => {
      const response = await api.put(`/groups/${globalData.testGroupNoLeaders.id}/role`).send({
        verificationCode: globalData.testGroupNoLeaders.verificationCode
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Parameter 'username' is undefined.");
    });

    it('should not change role (undefined role)', async () => {
      const response = await api
        .put(`/groups/${globalData.testGroupNoLeaders.id}/role`)
        .send({ username: 'idk', verificationCode: globalData.testGroupNoLeaders.verificationCode });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid enum value for 'role'.");
    });

    it('should not change role (empty role)', async () => {
      const response = await api.put(`/groups/${globalData.testGroupNoLeaders.id}/role`).send({
        username: 'idk',
        role: '',
        verificationCode: globalData.testGroupNoLeaders.verificationCode
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid enum value for 'role'.");
    });

    it('should not change role (invalid role)', async () => {
      const response = await api.put(`/groups/${globalData.testGroupNoLeaders.id}/role`).send({
        verificationCode: globalData.testGroupNoLeaders.verificationCode,
        username: 'zezima___',
        role: 'idk'
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid enum value for 'role'.");
    });

    it('should not change role (not a member)', async () => {
      const response = await api.put(`/groups/${globalData.testGroupNoLeaders.id}/role`).send({
        verificationCode: globalData.testGroupNoLeaders.verificationCode,
        username: 'usbc',
        role: 'beast'
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(`usbc is not a member of ${globalData.testGroupNoLeaders.name}.`);
    });

    it('should not change role (already has role)', async () => {
      const response = await api.put(`/groups/${globalData.testGroupNoLeaders.id}/role`).send({
        verificationCode: globalData.testGroupNoLeaders.verificationCode,
        username: 'sethmare',
        role: 'magician'
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('sethmare is already a magician.');
    });

    it('should change role', async () => {
      const before = await api.get(`/groups/${globalData.testGroupNoLeaders.id}`);
      expect(before.status).toBe(200);

      const response = await api.put(`/groups/${globalData.testGroupNoLeaders.id}/role`).send({
        verificationCode: globalData.testGroupNoLeaders.verificationCode,
        username: 'sethmare',
        role: 'dragon'
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        role: 'dragon',
        player: { username: 'sethmare' }
      });

      const after = await api.get(`/groups/${globalData.testGroupNoLeaders.id}`);
      expect(after.status).toBe(200);

      // ensure group.updatedAt has been updated
      expect(new Date(after.body.updatedAt).getTime()).toBeGreaterThan(
        new Date(before.body.updatedAt).getTime()
      );
    });
  });

  describe('6 - List Player Groups', () => {
    it('should not list player groups (player not found)', async () => {
      const usernameResponse = await api.get(`/players/raaandooom/groups`);

      expect(usernameResponse.status).toBe(404);
      expect(usernameResponse.body.message).toMatch('Player not found.');

      const idResponse = await api.get(`/players/id/100000/groups`);

      expect(idResponse.status).toBe(404);
      expect(idResponse.body.message).toMatch('Player not found.');
    });

    it('should not list player groups (negative offset)', async () => {
      const response = await api.get(`/players/psikoi/groups`).query({ offset: -5 });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'offset' must be >= 0.");
    });

    it('should not list player groups (negative limit)', async () => {
      const response = await api.get(`/players/psikoi/groups`).query({ limit: -5 });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'limit' must be > 0.");
    });

    it('should not list player groups (limit > 50)', async () => {
      const response = await api.get(`/players/psikoi/groups`).query({ limit: 1000 });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('The maximum results limit is 50');
    });

    it('should list player groups', async () => {
      const response = await api.get(`/players/zezima/groups`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(3);

      // Hashes shouldn't be exposed to the API consumer
      expect(response.body.filter(pg => !!pg.group.verificationHash).length).toBe(0);

      expect(response.body[0]).toMatchObject({
        role: 'firemaker',
        group: {
          id: globalData.testGroupOneLeader.id,
          memberCount: 5,
          score: 100
        }
      });

      expect(response.body[1]).toMatchObject({
        role: 'member',
        group: {
          id: globalData.testDuplicates.id,
          memberCount: 3,
          score: 30
        }
      });

      expect(response.body[2]).toMatchObject({
        role: 'member',
        group: {
          id: globalData.testGroupNoLeaders.id,
          memberCount: 8,
          score: 0
        }
      });
    });

    it('should list player groups (w/ limit & offset)', async () => {
      const response = await api.get(`/players/zezima/groups`).query({ limit: 1, offset: 1 });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);

      // Hashes shouldn't be exposed to the API consumer
      expect(response.body.filter(pg => !!pg.group.verificationHash).length).toBe(0);

      expect(response.body[0]).toMatchObject({
        role: 'member',
        group: {
          id: globalData.testDuplicates.id,
          memberCount: 3,
          score: 30
        }
      });
    });
  });

  describe('7 - Remove Members', () => {
    it('should not remove members (group not found)', async () => {
      const response = await api.delete(`/groups/123456789/members`).send({
        verificationCode: 'xxx-xxx-xxx',
        members: ['sethmare']
      });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Group not found.');

      expect(onMembersLeftEvent).not.toHaveBeenCalled();
    });

    it('should not remove members (invalid verification code)', async () => {
      const response = await api.delete(`/groups/${globalData.testGroupNoLeaders.id}/members`).send({
        members: ['sethmare']
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Parameter 'verificationCode' is required.");

      expect(onMembersLeftEvent).not.toHaveBeenCalled();
    });

    it('should not remove members (incorrect verification code)', async () => {
      const response = await api.delete(`/groups/${globalData.testGroupNoLeaders.id}/members`).send({
        verificationCode: 'xxx-xxx-xxx',
        members: ['sethmare']
      });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Incorrect verification code.');

      expect(onMembersLeftEvent).not.toHaveBeenCalled();
    });

    it('should not remove members (invalid members list)', async () => {
      const response = await api.delete(`/groups/${globalData.testGroupNoLeaders.id}/members`).send({
        verificationCode: globalData.testGroupNoLeaders.verificationCode,
        members: 123
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Parameter 'members' is not a valid array.");

      expect(onMembersLeftEvent).not.toHaveBeenCalled();
    });

    it('should not remove members (empty members list)', async () => {
      const response = await api.delete(`/groups/${globalData.testGroupNoLeaders.id}/members`).send({
        verificationCode: globalData.testGroupNoLeaders.verificationCode,
        members: []
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Empty members list.');

      expect(onMembersLeftEvent).not.toHaveBeenCalled();
    });

    it('should not remove members (no valid players found)', async () => {
      const response = await api.delete(`/groups/${globalData.testGroupNoLeaders.id}/members`).send({
        verificationCode: globalData.testGroupNoLeaders.verificationCode,
        members: ['boom_']
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('No valid tracked players were given.');

      expect(onMembersLeftEvent).not.toHaveBeenCalled();
    });

    it('should not remove members (not members)', async () => {
      const response = await api.delete(`/groups/${globalData.testGroupNoLeaders.id}/members`).send({
        verificationCode: globalData.testGroupNoLeaders.verificationCode,
        members: ['swampletics']
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('None of the players given were members of that group.');

      expect(onMembersLeftEvent).not.toHaveBeenCalled();
    });

    it('should remove members', async () => {
      const before = await api.get(`/groups/${globalData.testGroupNoLeaders.id}`);
      expect(before.status).toBe(200);

      const response = await api.delete(`/groups/${globalData.testGroupNoLeaders.id}/members`).send({
        verificationCode: globalData.testGroupNoLeaders.verificationCode,
        members: ['SETHmare  ', 'ZEZIMA', '__BOOM'] // boom should get ignored
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        count: 2,
        message: 'Successfully removed 2 members.'
      });

      expect(onMembersLeftEvent).toHaveBeenCalledWith(
        globalData.testGroupNoLeaders.id,
        expect.objectContaining({ length: 2 })
      );

      const after = await api.get(`/groups/${globalData.testGroupNoLeaders.id}`);
      expect(after.status).toBe(200);
      expect(after.body.memberCount).toBe(6); // had 8 previously

      // ensure group.updatedAt has been updated
      expect(new Date(after.body.updatedAt).getTime()).toBeGreaterThan(
        new Date(before.body.updatedAt).getTime()
      );
    });
  });

  describe('8 - Delete', () => {
    it('should not delete (group not found)', async () => {
      const response = await api.delete(`/groups/123456789`).send({
        verificationCode: 'xxx-xxx-xxx'
      });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Group not found.');
    });

    it('should not delete (invalid verification code)', async () => {
      const response = await api.delete(`/groups/123456789`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Parameter 'verificationCode' is required.");
    });

    it('should not delete (incorrect verification code)', async () => {
      const response = await api.delete(`/groups/${globalData.testGroupNoLeaders.id}`).send({
        verificationCode: 'xxx-xxx-xxx'
      });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Incorrect verification code.');
    });

    it('should delete', async () => {
      const response = await api.delete(`/groups/${globalData.testGroupNoLeaders.id}`).send({
        verificationCode: globalData.testGroupNoLeaders.verificationCode
      });

      expect(response.status).toBe(200);
      expect(response.body.message).toMatch('Successfully deleted group:');

      const fetchConfirmResponse = await api.get(`/groups/${globalData.testGroupNoLeaders.id}`);
      expect(fetchConfirmResponse.status).toBe(404);
      expect(fetchConfirmResponse.body.message).toBe('Group not found.');
    });
  });

  describe('9 - View Details', () => {
    it('should not view details (group not found)', async () => {
      const response = await api.get('/groups/9999');

      expect(response.status).toBe(404);
      expect(response.body.message).toMatch('Group not found.');
    });

    it('should view details (empty group)', async () => {
      const response = await api.get(`/groups/${globalData.testGroupNoMembers.id}`);

      expect(response.status).toBe(200);

      expect(response.body).toMatchObject({
        name: 'Some Group',
        description: 'Test123',
        clanChat: 'Test',
        homeworld: 492,
        memberCount: 0
      });

      expect(response.body.memberships.length).toBe(0);
    });

    it('should view details', async () => {
      const response = await api.get(`/groups/${globalData.testGroupOneLeader.id}`);

      expect(response.status).toBe(200);

      expect(response.body.verificationHash).not.toBeDefined();

      expect(response.body).toMatchObject({
        clanChat: 'wiseoldman',
        description: 'when I was a young boy, my father took me into the city to see a marching band',
        homeworld: 302,
        memberCount: 5
      });

      expect(response.body.memberships.length).toBe(5);

      // "leader" is a priviledged role, should be ranked first
      expect(response.body.memberships[0]).toMatchObject({
        role: 'leader',
        player: { username: 'alexsuperfly' }
      });

      expect(response.body.memberships[1]).toMatchObject({
        role: 'achiever',
        player: { username: 'psikoi' }
      });

      expect(response.body.memberships[2]).toMatchObject({
        role: 'artisan',
        player: { username: 'swampletics' }
      });

      expect(response.body.memberships[3]).toMatchObject({
        role: 'firemaker',
        player: { username: 'zezima' }
      });

      expect(response.body.memberships[4]).toMatchObject({
        role: 'member',
        player: { username: 'rorro' }
      });
    });
  });

  describe('10 - View Hiscores', () => {
    it('should not view hiscores (undefined metric)', async () => {
      const response = await api.get(`/groups/100000/hiscores`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid enum value for 'metric'.");
    });

    it('should not view hiscores (empty metric)', async () => {
      const response = await api.get(`/groups/100000/hiscores`).query({ metric: '' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid enum value for 'metric'.");
    });

    it('should not view hiscores (group not found)', async () => {
      const response = await api.get(`/groups/100000/hiscores`).query({ metric: 'ranged' });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Group not found.');
    });

    it('should not view hiscores (invalid metric)', async () => {
      const response = await api
        .get(`/groups/${globalData.testGroupOneLeader.id}/hiscores`)
        .query({ metric: 'sailing' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid enum value for 'metric'.");
    });

    it('should not view hiscores (empty group)', async () => {
      const response = await api
        .get(`/groups/${globalData.testGroupNoMembers.id}/hiscores`)
        .query({ metric: 'magic' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should view hiscores', async () => {
      const trackResponse = await api.post('/players/psikoi');
      expect(trackResponse.status).toBe(200);

      const modifiedRawData = modifyRawHiscoresData(globalData.pHiscoresRawData, [
        { metric: 'zulrah', value: 100 },
        { metric: 'magic', value: 5_500_000 }
      ]);

      // Change the mock hiscores data to return 100 zulrah kc
      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      const secTrackResponse = await api.post('/players/zezima');
      expect(secTrackResponse.status).toBe(200);

      // Change the mock hiscores data to Lynx Titan
      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: globalData.ltHiscoresRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      const anotherTrackResponse = await api.post('/players/alexsuperfly');
      expect(anotherTrackResponse.status).toBe(200);

      expect(anotherTrackResponse.body.ttm).toBe(0);
      expect(anotherTrackResponse.body.ehp).toBeGreaterThan(trackResponse.body.ehp);

      const skillHiscoresResponse = await api
        .get(`/groups/${globalData.testGroupOneLeader.id}/hiscores`)
        .query({ metric: 'magic' });

      expect(skillHiscoresResponse.status).toBe(200);
      expect(skillHiscoresResponse.body.length).toBe(3);

      expect(skillHiscoresResponse.body[0]).toMatchObject({
        player: { username: 'alexsuperfly' },
        data: {
          experience: 200_000_000,
          level: 99
        }
      });

      expect(skillHiscoresResponse.body[1]).toMatchObject({
        player: { username: 'psikoi' },
        data: {
          experience: 19_288_604,
          level: 99
        }
      });

      expect(skillHiscoresResponse.body[2]).toMatchObject({
        player: { username: 'zezima' },
        data: {
          experience: 5_500_000,
          level: 90
        }
      });

      const activityHiscoresResponse = await api
        .get(`/groups/${globalData.testGroupOneLeader.id}/hiscores`)
        .query({ metric: 'clue_scrolls_all' });

      expect(activityHiscoresResponse.status).toBe(200);
      expect(activityHiscoresResponse.body.length).toBe(3);
      expect(activityHiscoresResponse.body[0].data.score).toBeDefined();
      expect(activityHiscoresResponse.body[0].data.rank).toBeDefined();

      const computedMetricsHiscoresResponse = await api
        .get(`/groups/${globalData.testGroupOneLeader.id}/hiscores`)
        .query({ metric: 'ehp' });

      expect(computedMetricsHiscoresResponse.status).toBe(200);
      expect(computedMetricsHiscoresResponse.body.length).toBe(3);
      expect(computedMetricsHiscoresResponse.body[0].data.value).toBeDefined();
      expect(computedMetricsHiscoresResponse.body[0].data.rank).toBeDefined();
    });

    it('should view hiscores (w/ limit & offset)', async () => {
      const response = await api
        .get(`/groups/${globalData.testGroupOneLeader.id}/hiscores`)
        .query({ metric: 'zulrah', limit: 1, offset: 1 });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);

      expect(response.body[0]).toMatchObject({
        player: { username: 'zezima' },
        data: {
          kills: 100
        }
      });
    });

    it('should not view hiscores (negative offset)', async () => {
      const response = await api
        .get(`/groups/${globalData.testGroupOneLeader.id}/hiscores`)
        .query({ metric: 'magic', offset: -5 });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'offset' must be >= 0.");
    });

    it('should not view hiscores (negative limit)', async () => {
      const response = await api
        .get(`/groups/${globalData.testGroupOneLeader.id}/hiscores`)
        .query({ metric: 'magic', limit: -5 });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'limit' must be > 0.");
    });

    it('should not view hiscores (limit > 50)', async () => {
      const response = await api
        .get(`/groups/${globalData.testGroupOneLeader.id}/hiscores`)
        .query({ metric: 'magic', limit: 1000 });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('The maximum results limit is 50');
    });
  });

  describe('11 - View Statistics', () => {
    it('should not view statistics (group not found)', async () => {
      const response = await api.get(`/groups/100000/statistics`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Group not found.');
    });

    it('should not view statistics (empty group)', async () => {
      const response = await api.get(`/groups/${globalData.testGroupNoMembers.id}/statistics`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Couldn't find any stats for this group.");
    });

    it('should view statistics', async () => {
      const response = await api.get(`/groups/${globalData.testGroupOneLeader.id}/statistics`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        maxedCombatCount: 1,
        maxedTotalCount: 1,
        maxed200msCount: 23,
        averageStats: {
          data: {
            bosses: {
              abyssal_sire: {
                kills: 699 // (1049 + 1049 + 0) / 3
              },
              zulrah: {
                kills: 582 // (1646 + 100 + 0) / 3
              }
            },
            skills: {
              magic: {
                experience: 74929535 // (19288604 + 200000000 + 5500000) / 3
              }
            }
          }
        }
      });
    });
  });

  describe('12 - Update All', () => {
    it('should not update all (invalid verification code)', async () => {
      const response = await api.post(`/groups/123456789/update-all`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Parameter 'verificationCode' is required.");
    });

    it('should not update all (group not found)', async () => {
      const response = await api.post(`/groups/123456789/update-all`).send({
        verificationCode: 'xxx-xxx-xxx'
      });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Group not found.');
    });

    it('should not update all (incorrect verification code)', async () => {
      const response = await api.post(`/groups/${globalData.testGroupOneLeader.id}/update-all`).send({
        verificationCode: 'xxx-xxx-xxx'
      });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Incorrect verification code.');
    });

    it('should not update all (no outdated members)', async () => {
      const response = await api.post(`/groups/${globalData.testGroupOneLeader.id}/update-all`).send({
        verificationCode: globalData.testGroupOneLeader.verificationCode
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('This group has no outdated members (updated over 24h ago).');
    });

    it('should update all', async () => {
      const dayOldDate = new Date(Date.now() - 1000 - 24 * 60 * 60 * 1000);

      // Force this player's last update timestamp to be a day ago
      await prisma.player.update({
        where: { username: 'psikoi' },
        data: { updatedAt: dayOldDate }
      });

      const response = await api.post(`/groups/${globalData.testGroupOneLeader.id}/update-all`).send({
        verificationCode: globalData.testGroupOneLeader.verificationCode
      });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe(
        '1 outdated (updated > 24h ago) players are being updated. This can take up to a few minutes.'
      );
    });
  });

  describe('13 - Reset Verification Code', () => {
    it('should not reset code (invalid admin password)', async () => {
      const response = await api.put(`/groups/100000/reset-code`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Required parameter 'adminPassword' is undefined.");
    });

    it('should not reset code (invalid admin password)', async () => {
      const response = await api.put(`/groups/100000/reset-code`).send({
        adminPassword: 'abcdef'
      });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Incorrect admin password.');
    });

    it('should not reset code (group not found)', async () => {
      const response = await api.put(`/groups/100000/reset-code`).send({
        adminPassword: env.ADMIN_PASSWORD
      });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Group not found.');
    });

    it('should reset code', async () => {
      const response = await api.put(`/groups/${globalData.testGroupOneLeader.id}/reset-code`).send({
        adminPassword: env.ADMIN_PASSWORD
      });

      expect(response.status).toBe(200);
      expect(response.body.newCode).toBeDefined();

      // try to edit the group with the old code
      const failEditAttempt = await api.put(`/groups/${globalData.testGroupOneLeader.id}`).send({
        name: 'wow',
        verificationCode: globalData.testGroupOneLeader.verificationCode
      });

      expect(failEditAttempt.status).toBe(403);
      expect(failEditAttempt.body.message).toBe('Incorrect verification code.');

      // try to edit the group with the new code
      const editAttempt = await api.put(`/groups/${globalData.testGroupOneLeader.id}`).send({
        name: 'worked',
        verificationCode: response.body.newCode
      });

      expect(editAttempt.status).toBe(200);
      expect(editAttempt.body.name).toBe('worked');
    });
  });

  describe('14 - Verify', () => {
    it('should not verify group (invalid admin password)', async () => {
      const response = await api.put(`/groups/100000/verify`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Required parameter 'adminPassword' is undefined.");
    });

    it('should not verify group (invalid admin password)', async () => {
      const response = await api.put(`/groups/100000/verify`).send({
        adminPassword: 'abcdef'
      });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Incorrect admin password.');
    });

    it('should not verify group (group not found)', async () => {
      const response = await api.put(`/groups/100000/verify`).send({
        adminPassword: env.ADMIN_PASSWORD
      });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Group not found.');
    });

    it('should verify group', async () => {
      const response = await api.put(`/groups/${globalData.testGroupOneLeader.id}/verify`).send({
        adminPassword: env.ADMIN_PASSWORD
      });

      expect(response.status).toBe(200);
      expect(response.body.verificationHash).not.toBeDefined();
      expect(response.body).toMatchObject({
        id: globalData.testGroupOneLeader.id,
        verified: true
      });
    });
  });

  describe('15 - Migrate from Temple', () => {
    it('should not migrate from temple (404 error)', async () => {
      // Setup the TempleOSRS request to return our mock raw data
      registerTempleMock(axiosMock, 404);

      const response = await api.get('/groups/migrate/temple/3');
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Found no TempleOSRS members to import.');
    });

    it('should not migrate from temple (503 error)', async () => {
      // Setup the TempleOSRS request to return our mock raw data
      registerTempleMock(axiosMock, 503);

      const response = await api.get('/groups/migrate/temple/3');
      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Failed to load TempleOSRS. Possible server failure on their end.');
    });

    it('should migrate from temple', async () => {
      // Setup the TempleOSRS request to return our mock raw data
      registerTempleMock(axiosMock, 200, globalData.templeGroupRawData);

      const response = await api.get('/groups/migrate/temple/3');

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Omnia');
      expect(response.body.members.length).toBe(89);
      expect(response.body.leaders.length).toBe(4);
    });
  });

  describe('16 - Migrate from CML', () => {
    it('should not migrate from cml (404 error)', async () => {
      // Setup the CML request to return our mock raw data
      registerCMLMock(axiosMock, 404);

      const response = await api.get('/groups/migrate/cml/3');
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Found no CrystalMathLabs members to import.');
    });

    it('should not migrate from cml (empty data)', async () => {
      // Setup the CML request to return our mock raw data
      registerCMLMock(axiosMock, 200);

      const response = await api.get('/groups/migrate/cml/3');
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Found no CrystalMathLabs members to import.');
    });

    it('should not migrate from cml (no players link found)', async () => {
      // Setup the CML request to return our mock raw data
      registerCMLMock(axiosMock, 200, 'random page content');

      const response = await api.get('/groups/migrate/cml/3');
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Found no CrystalMathLabs members to import.');
    });

    it('should migrate from cml', async () => {
      // Setup the CML request to return our mock raw data
      registerCMLMock(axiosMock, 200, globalData.cmlGroupRawData);

      const response = await api.get('/groups/migrate/cml/3');
      expect(response.status).toBe(200);
      expect(response.body.name).toBe('RSPT MEMBERLIST');
      expect(response.body.members.length).toBe(52);
    });
  });
});
