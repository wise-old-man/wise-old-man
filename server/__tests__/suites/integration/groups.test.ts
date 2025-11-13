import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import supertest from 'supertest';
import APIInstance from '../../../src/api';
import { eventEmitter } from '../../../src/api/events';
import * as GroupMembersJoinedEvent from '../../../src/api/events/handlers/group-members-joined.event';
import * as GroupMembersLeftEvent from '../../../src/api/events/handlers/group-members-left.event';
import * as GroupMembersRolesChangedEvent from '../../../src/api/events/handlers/group-members-roles-changed.event';
import prisma from '../../../src/prisma';
import { redisClient } from '../../../src/services/redis.service';
import { PlayerAnnotationType, PlayerType } from '../../../src/types';
import { modifyRawHiscoresData, readFile, registerHiscoresMock, resetDatabase } from '../../utils';

const api = supertest(new APIInstance().init().express);
const axiosMock = new MockAdapter(axios, { onNoMatch: 'passthrough' });

const groupMembersLeftEvent = jest.spyOn(GroupMembersLeftEvent, 'handler');
const groupMembersJoinedEvent = jest.spyOn(GroupMembersJoinedEvent, 'handler');
const groupMembersRolesChangedEvent = jest.spyOn(GroupMembersRolesChangedEvent, 'handler');

const globalData = {
  pHiscoresRawData: '',
  ltHiscoresRawData: '',
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

  // re-init the event emitter to re-attach the mocked event handlers
  eventEmitter.init();
});

beforeAll(async () => {
  eventEmitter.init();
  await resetDatabase();
  await redisClient.flushall();

  globalData.pHiscoresRawData = await readFile(`${__dirname}/../../data/hiscores/psikoi_hiscores.json`);
  globalData.ltHiscoresRawData = await readFile(`${__dirname}/../../data/hiscores/lynx_titan_hiscores.json`);

  // Mock regular hiscores data, and block any ironman requests
  registerHiscoresMock(axiosMock, {
    [PlayerType.REGULAR]: { statusCode: 200, rawData: globalData.pHiscoresRawData },
    [PlayerType.IRONMAN]: { statusCode: 404 }
  });
});

afterAll(() => {
  jest.useRealTimers();
  axiosMock.reset();
  redisClient.quit();
});

describe('Group API', () => {
  describe('1 - Create', () => {
    it('should not create (invalid name)', async () => {
      const response = await api.post('/groups').send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'name' is undefined.");

      expect(groupMembersJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not create (empty name)', async () => {
      const response = await api.post('/groups').send({ name: '' });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'name' must have a minimum of 1 character(s).");

      expect(groupMembersJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not create (name too long)', async () => {
      const response = await api
        .post('/groups')
        .send({ name: 'jklasjhfklsdhnfkjsdnfkdjsnfkdjsnfkjsdnfksdjnfksdjn' });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'name' must have a maximum of 30 character(s).");

      expect(groupMembersJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not create (invalid clanChat)', async () => {
      const response = await api.post('/groups').send({
        name: 'ooops',
        clanChat: '#hey_',
        members: []
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Invalid 'clanChat'");

      expect(groupMembersJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not create (clanChat too long)', async () => {
      const response = await api.post('/groups').send({
        name: 'ooops',
        clanChat: 'jklasjhfklsdhnfkjsdnfkdjsnfkdjsnfkjsdnfksdjnfksdjn',
        members: []
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'clanChat' must have a maximum of 12 character(s).");

      expect(groupMembersJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not create (description too long)', async () => {
      const response = await api.post('/groups').send({
        name: 'ooops',
        description:
          'jklasjhfklsdhnfkjsdnfkdjsnfkdjsnfkjsdnfksdjnfksdjnjklasjhfklsdhnfkjsdnfkdjsnfkdjsnfkjsdnfksdjnfksdjn1'
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(
        "Parameter 'description' must have a maximum of 100 character(s)."
      );

      expect(groupMembersJoinedEvent).not.toHaveBeenCalled();
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

      expect(groupMembersJoinedEvent).not.toHaveBeenCalled();
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

      expect(groupMembersJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not create (invalid member name)', async () => {
      const response = await api.post('/groups').send({
        name: 'A new test group',
        members: [{ username: 'reallyreallylongusername', role: 'leader' }, { username: 'zezima' }]
      });

      expect(response.status).toBe(400);
      expect(response.body.data).toEqual(['reallyreallylongusername']);
      expect(response.body.message).toMatch('Found 1 invalid usernames:');

      expect(groupMembersJoinedEvent).not.toHaveBeenCalled();
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

      expect(groupMembersJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not create (a player has opted out)', async () => {
      await prisma.player.create({
        data: {
          username: 'carmen',
          displayName: 'Carmen',
          annotations: {
            create: [{ type: PlayerAnnotationType.OPT_OUT }]
          }
        }
      });

      await prisma.player.create({
        data: {
          username: 'richie',
          displayName: 'Richie',
          annotations: {
            create: [{ type: PlayerAnnotationType.OPT_OUT_GROUPS }]
          }
        }
      });

      const createGroupResponse = await api.post(`/groups`).send({
        name: 'test',
        members: [
          { username: 'sydney', role: 'cook' },
          { username: 'carmen', role: 'cook' },
          { username: 'richie', role: 'legend' },
          { username: 'fak', role: 'legend' }
        ]
      });

      expect(createGroupResponse.status).toBe(403);
      expect(createGroupResponse.body.message).toMatch('One or more players have opted out');
      expect(createGroupResponse.body.data.includes('Carmen')).toBe(true);
      expect(createGroupResponse.body.data.includes('Richie')).toBe(true);
    });

    it('should create (no members)', async () => {
      const response = await api.post('/groups').send({
        name: ' Some   Group',
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

      expect(groupMembersJoinedEvent).not.toHaveBeenCalled();

      globalData.testGroupNoMembers = {
        id: response.body.group.id,
        name: response.body.group.name,
        verificationCode: response.body.verificationCode
      };
    });

    it('should create (members w/ default roles)', async () => {
      const response = await api.post('/groups').send({
        name: ' heyy    ',
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

      expect(groupMembersJoinedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          groupId: response.body.group.id,
          members: expect.objectContaining({ length: 5 })
        })
      );

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

      expect(groupMembersJoinedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          groupId: response.body.group.id,
          members: expect.objectContaining({ length: 4 })
        })
      );

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

      expect(groupMembersJoinedEvent).not.toHaveBeenCalled();
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

      expect(groupMembersJoinedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          groupId: response.body.group.id,
          members: expect.objectContaining({ length: 3 })
        })
      );
    });
  });

  describe('2 - Edit', () => {
    it('should not edit (invalid verification code)', async () => {
      const response = await api.put(`/groups/${globalData.testGroupNoMembers.id}`).send({ name: 'idk' });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'verificationCode' is required.");

      expect(groupMembersLeftEvent).not.toHaveBeenCalled();
      expect(groupMembersJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not edit (incorrect verification code)', async () => {
      const response = await api
        .put(`/groups/${globalData.testGroupNoMembers.id}`)
        .send({ verificationCode: 'XYZ', name: 'ABC' });

      expect(response.status).toBe(403);
      expect(response.body.message).toMatch('Incorrect verification code');

      expect(groupMembersLeftEvent).not.toHaveBeenCalled();
      expect(groupMembersJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not edit (no dashes in verification code, but empty params)', async () => {
      const dashlessCode = globalData.testGroupNoMembers.verificationCode.replaceAll('-', '');

      const response = await api
        .put(`/groups/${globalData.testGroupNoMembers.id}`)
        .send({ verificationCode: dashlessCode });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Nothing to update.');

      expect(groupMembersLeftEvent).not.toHaveBeenCalled();
      expect(groupMembersJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not edit (white spaces in verification code, but empty params)', async () => {
      const codeWithWhitespace = ` ${globalData.testGroupNoMembers.verificationCode} `;

      const response = await api
        .put(`/groups/${globalData.testGroupNoMembers.id}`)
        .send({ verificationCode: codeWithWhitespace });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Nothing to update.');

      expect(groupMembersLeftEvent).not.toHaveBeenCalled();
      expect(groupMembersJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not edit (empty params)', async () => {
      const response = await api
        .put(`/groups/${globalData.testGroupNoMembers.id}`)
        .send({ verificationCode: globalData.testGroupNoMembers.verificationCode });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Nothing to update.');

      expect(groupMembersLeftEvent).not.toHaveBeenCalled();
      expect(groupMembersJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not edit (group not found)', async () => {
      const response = await api.put('/groups/1000').send({ verificationCode: 'XYZ', name: 'ABC' });

      expect(response.status).toBe(404);
      expect(response.body.message).toMatch('Group not found.');

      expect(groupMembersLeftEvent).not.toHaveBeenCalled();
      expect(groupMembersJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not edit (name already taken)', async () => {
      const response = await api.put(`/groups/${globalData.testGroupNoMembers.id}`).send({
        verificationCode: globalData.testGroupNoMembers.verificationCode,
        name: ` ${globalData.testGroupNoLeaders.name}  `
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(
        `Group name '${globalData.testGroupNoLeaders.name}' is already taken.`
      );

      expect(groupMembersLeftEvent).not.toHaveBeenCalled();
      expect(groupMembersJoinedEvent).not.toHaveBeenCalled();
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

      expect(groupMembersLeftEvent).not.toHaveBeenCalled();
      expect(groupMembersJoinedEvent).not.toHaveBeenCalled();
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

      expect(groupMembersLeftEvent).not.toHaveBeenCalled();
      expect(groupMembersJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not edit (invalid banner image url)', async () => {
      const response = await api.put(`/groups/${globalData.testGroupNoMembers.id}`).send({
        verificationCode: globalData.testGroupNoMembers.verificationCode,
        bannerImage: 'wrong'
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'bannerImage' is not a valid URL.");

      expect(groupMembersLeftEvent).not.toHaveBeenCalled();
      expect(groupMembersJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not edit (over max length for banner image url)', async () => {
      let str = '';
      for (let i = 0; i < 300; i++) {
        str += '.';
      }

      const response = await api.put(`/groups/${globalData.testGroupNoMembers.id}`).send({
        verificationCode: globalData.testGroupNoMembers.verificationCode,
        bannerImage: str
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(
        "Parameter 'bannerImage' must have a maximum of 255 character(s)."
      );

      expect(groupMembersLeftEvent).not.toHaveBeenCalled();
      expect(groupMembersJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not edit (invalid profile image url)', async () => {
      const response = await api.put(`/groups/${globalData.testGroupNoMembers.id}`).send({
        verificationCode: globalData.testGroupNoMembers.verificationCode,
        profileImage: 'wrong'
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'profileImage' is not a valid URL.");

      expect(groupMembersLeftEvent).not.toHaveBeenCalled();
      expect(groupMembersJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not edit (over max length for profile image url)', async () => {
      let str = '';
      for (let i = 0; i < 300; i++) {
        str += '.';
      }

      const response = await api.put(`/groups/${globalData.testGroupNoMembers.id}`).send({
        verificationCode: globalData.testGroupNoMembers.verificationCode,
        profileImage: str
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(
        "Parameter 'profileImage' must have a maximum of 255 character(s)."
      );

      expect(groupMembersLeftEvent).not.toHaveBeenCalled();
      expect(groupMembersJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not edit profile image (not a patron)', async () => {
      const response = await api.put(`/groups/${globalData.testGroupNoMembers.id}`).send({
        verificationCode: globalData.testGroupNoMembers.verificationCode,
        profileImage: 'https://avatars.githubusercontent.com/u/65183441?s=200&v=4'
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(
        'Banner or profile images can only be uploaded by patron groups.'
      );

      expect(groupMembersLeftEvent).not.toHaveBeenCalled();
      expect(groupMembersJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not edit banner image (not a patron)', async () => {
      const response = await api.put(`/groups/${globalData.testGroupNoMembers.id}`).send({
        verificationCode: globalData.testGroupNoMembers.verificationCode,
        bannerImage: 'https://avatars.githubusercontent.com/u/65183441?s=200&v=4'
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(
        'Banner or profile images can only be uploaded by patron groups.'
      );

      expect(groupMembersLeftEvent).not.toHaveBeenCalled();
      expect(groupMembersJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not edit (invalid social link url)', async () => {
      const response = await api.put(`/groups/${globalData.testGroupNoMembers.id}`).send({
        verificationCode: globalData.testGroupNoMembers.verificationCode,
        socialLinks: {
          twitter: 'wrong'
        }
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'socialLinks.twitter' is not a valid URL.");

      expect(groupMembersLeftEvent).not.toHaveBeenCalled();
      expect(groupMembersJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not edit social links (not a patron)', async () => {
      const response = await api.put(`/groups/${globalData.testGroupNoMembers.id}`).send({
        verificationCode: globalData.testGroupNoMembers.verificationCode,
        socialLinks: {
          twitter: 'https://twitter.com/RubenPsikoi'
        }
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Social links can only be added to patron groups.');

      expect(groupMembersLeftEvent).not.toHaveBeenCalled();
      expect(groupMembersJoinedEvent).not.toHaveBeenCalled();
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

      expect(groupMembersLeftEvent).not.toHaveBeenCalled();
      expect(groupMembersJoinedEvent).not.toHaveBeenCalled();
      expect(groupMembersRolesChangedEvent).not.toHaveBeenCalled();
    });

    it('should not edit profile image (unauthorized image source)', async () => {
      // Force this group to be a patron
      await prisma.group.update({
        where: {
          id: globalData.testGroupOneLeader.id
        },
        data: {
          patron: true
        }
      });

      const response = await api.put(`/groups/${globalData.testGroupOneLeader.id}`).send({
        verificationCode: globalData.testGroupOneLeader.verificationCode,
        profileImage: 'https://avatars.githubusercontent.com/u/65183441?s=200&v=4'
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        'Cannot upload images from external sources. Please upload an image via the website.'
      );

      expect(groupMembersLeftEvent).not.toHaveBeenCalled();
      expect(groupMembersJoinedEvent).not.toHaveBeenCalled();
      expect(groupMembersRolesChangedEvent).not.toHaveBeenCalled();
    });

    it('should not edit banner image (unauthorized image source)', async () => {
      // Force this group to be a patron
      await prisma.group.update({
        where: {
          id: globalData.testGroupOneLeader.id
        },
        data: {
          patron: true
        }
      });

      const response = await api.put(`/groups/${globalData.testGroupOneLeader.id}`).send({
        verificationCode: globalData.testGroupOneLeader.verificationCode,
        bannerImage: 'https://avatars.githubusercontent.com/u/65183441?s=200&v=4'
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        'Cannot upload images from external sources. Please upload an image via the website.'
      );

      expect(groupMembersLeftEvent).not.toHaveBeenCalled();
      expect(groupMembersJoinedEvent).not.toHaveBeenCalled();
      expect(groupMembersRolesChangedEvent).not.toHaveBeenCalled();
    });

    it('should not edit members list (a player has opted out)', async () => {
      const player = await prisma.player.create({
        data: {
          username: 'tanno',
          displayName: 'Tanno'
        }
      });

      const createGroupResponse = await api.post(`/groups`).send({
        name: 'test',
        members: [
          { username: 'Tanno', role: 'legend' },
          { username: 'Jonas', role: 'legend' },
          { username: 'Ulrich', role: 'cook' }
        ]
      });

      expect(createGroupResponse.status).toBe(201);

      await prisma.playerAnnotation.create({
        data: {
          playerId: player.id,
          type: PlayerAnnotationType.OPT_OUT
        }
      });

      await prisma.player.create({
        data: {
          username: 'noah',
          displayName: 'Noah',
          annotations: {
            create: [{ type: PlayerAnnotationType.OPT_OUT }]
          }
        }
      });

      await prisma.player.create({
        data: {
          username: 'claudia',
          displayName: 'Claudia',
          annotations: {
            create: [{ type: PlayerAnnotationType.OPT_OUT_GROUPS }]
          }
        }
      });

      const editResponse = await api.put(`/groups/${createGroupResponse.body.group.id}`).send({
        verificationCode: createGroupResponse.body.verificationCode,
        members: [
          { username: 'Martha' },
          { username: 'Noah' },
          { username: 'Bartosz' },
          { username: 'claudia' },
          { username: 'tanno' }
        ]
      });

      expect(editResponse.status).toBe(403);
      expect(editResponse.body.message).toMatch('One or more players have opted out');
      expect(editResponse.body.data).toEqual(['Noah', 'Claudia']);

      const deleteGroupResponse = await api.delete(`/groups/${createGroupResponse.body.group.id}`).send({
        verificationCode: createGroupResponse.body.verificationCode
      });

      expect(deleteGroupResponse.status).toBe(200);
    });

    it('should edit members list', async () => {
      const before = await api.get(`/groups/${globalData.testGroupNoLeaders.id}`);
      expect(before.status).toBe(200);

      // Removing "alt player" and "test player"
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
      expect(groupMembersLeftEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          groupId: globalData.testGroupOneLeader.id,
          members: expect.objectContaining({ length: 2 })
        })
      );

      const leftEvents = groupMembersLeftEvent.mock.calls[0][0].members;

      expect(leftEvents.length).toBe(2);

      expect(leftEvents[0]).toEqual({
        playerId: before.body.memberships.find(m => m.player.username === 'test player').playerId
      });

      expect(leftEvents[1]).toEqual({
        playerId: before.body.memberships.find(m => m.player.username === 'alt player').playerId
      });

      // 3 new players added
      expect(groupMembersJoinedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          groupId: globalData.testGroupOneLeader.id,
          members: expect.objectContaining({ length: 3 })
        })
      );

      const joinedEvents = groupMembersJoinedEvent.mock.calls[0][0].members;
      expect(joinedEvents.length).toBe(3);

      expect(joinedEvents[0]).toEqual({
        playerId: response.body.memberships.find(m => m.player.username === 'psikoi').playerId,
        role: 'achiever'
      });

      expect(joinedEvents[1]).toEqual({
        playerId: response.body.memberships.find(m => m.player.username === 'alexsuperfly').playerId,
        role: 'leader'
      });

      expect(joinedEvents[2]).toEqual({
        playerId: response.body.memberships.find(m => m.player.username === 'rorro').playerId,
        role: 'member'
      });

      // 1 player changed role
      expect(groupMembersRolesChangedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          groupId: response.body.id,
          members: expect.objectContaining({ length: 1 })
        })
      );

      const roleChangeEvent = groupMembersRolesChangedEvent.mock.calls[0][0].members[0];
      const changedMembershipZezima = response.body.memberships.find(m => m.player.username === 'zezima');

      expect(roleChangeEvent).toEqual({
        playerId: changedMembershipZezima.playerId,
        role: 'firemaker',
        previousRole: 'member'
      });

      const latestActivities = await prisma.memberActivity.findMany({
        where: { groupId: globalData.testGroupOneLeader.id },
        orderBy: { createdAt: 'desc' },
        take: 6
      });

      expect(latestActivities.map(a => a.type)).toEqual([
        'left',
        'left',
        'joined',
        'joined',
        'joined',
        'changed_role'
      ]);

      expect(latestActivities[0]).toMatchObject({
        playerId: before.body.memberships.find(m => m.player.username === 'test player').playerId,
        role: 'leader'
      });

      expect(latestActivities[1]).toMatchObject({
        playerId: before.body.memberships.find(m => m.player.username === 'alt player').playerId,
        role: 'captain'
      });

      expect(latestActivities[2]).toMatchObject({
        playerId: response.body.memberships.find(m => m.player.username === 'psikoi').playerId,
        role: 'achiever'
      });

      expect(latestActivities[3]).toMatchObject({
        playerId: response.body.memberships.find(m => m.player.username === 'alexsuperfly').playerId,
        role: 'leader'
      });

      expect(latestActivities[4]).toMatchObject({
        playerId: response.body.memberships.find(m => m.player.username === 'rorro').playerId,
        role: 'member'
      });

      expect(latestActivities[5]).toMatchObject({
        playerId: response.body.memberships.find(m => m.player.username === 'zezima').playerId,
        role: 'firemaker',
        previousRole: 'member'
      });
    });

    it('should edit name', async () => {
      const response = await api.put(`/groups/${globalData.testGroupOneLeader.id}`).send({
        verificationCode: globalData.testGroupOneLeader.verificationCode,
        name: '  New name! '
      });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('New name!');
      expect(response.body.memberCount).toBe(5); // shouldn't change
      expect(new Date(response.body.updatedAt).getTime()).toBeGreaterThan(Date.now() - 1000);

      expect(groupMembersLeftEvent).not.toHaveBeenCalled();
      expect(groupMembersJoinedEvent).not.toHaveBeenCalled();
      expect(groupMembersRolesChangedEvent).not.toHaveBeenCalled();

      globalData.testGroupOneLeader.name = response.body.name;
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

      expect(groupMembersLeftEvent).not.toHaveBeenCalled();
      expect(groupMembersJoinedEvent).not.toHaveBeenCalled();
      expect(groupMembersRolesChangedEvent).not.toHaveBeenCalled();
    });

    it('should edit name (capitalization)', async () => {
      const response = await api.put(`/groups/${globalData.testGroupOneLeader.id}`).send({
        name: ` ${globalData.testGroupOneLeader.name.toUpperCase()}  `,
        verificationCode: globalData.testGroupOneLeader.verificationCode
      });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(globalData.testGroupOneLeader.name.toUpperCase());

      expect(groupMembersLeftEvent).not.toHaveBeenCalled();
      expect(groupMembersJoinedEvent).not.toHaveBeenCalled();
      expect(groupMembersRolesChangedEvent).not.toHaveBeenCalled();
    });

    it('should edit (only add players)', async () => {
      const createResponse = await api.post('/groups').send({
        name: `Delete soon ${Date.now()}`,
        members: [{ username: 'psikoi', role: 'magician' }]
      });
      expect(createResponse.status).toBe(201);

      jest.resetAllMocks();

      const editResponse = await api.put(`/groups/${createResponse.body.group.id}`).send({
        members: [
          { username: 'psikoi', role: 'magician' },
          { username: 'cookmeplox', role: 'cook' },
          { username: 'riblet', role: 'deputy_owner' }
        ], // adding cookmeplox and riblet
        verificationCode: createResponse.body.verificationCode
      });

      expect(editResponse.status).toBe(200);
      expect(editResponse.body).toMatchObject({ memberCount: 3 });

      expect(editResponse.body.memberships.length).toBe(3);
      expect(editResponse.body.memberships[0].player.username).toBe('riblet');
      expect(editResponse.body.memberships[1].player.username).toBe('cookmeplox');
      expect(editResponse.body.memberships[2].player.username).toBe('psikoi');

      const joinedEvents = groupMembersJoinedEvent.mock.calls[0][0].members;
      expect(joinedEvents.length).toBe(2);

      const { memberships } = editResponse.body;

      expect(joinedEvents[0]).toEqual({
        role: 'cook',
        playerId: memberships.find(m => m.player.username === 'cookmeplox').playerId
      });

      expect(joinedEvents[1]).toEqual({
        role: 'deputy_owner',
        playerId: memberships.find(m => m.player.username === 'riblet').playerId
      });

      expect(groupMembersLeftEvent).not.toHaveBeenCalled();
      expect(groupMembersRolesChangedEvent).not.toHaveBeenCalled();

      const deleteResponse = await api.delete(`/groups/${createResponse.body.group.id}`).send({
        verificationCode: createResponse.body.verificationCode
      });
      expect(deleteResponse.status).toBe(200);
    });

    it('should edit (only remove players)', async () => {
      const createResponse = await api.post('/groups').send({
        name: `Delete soon ${Date.now()}`,
        members: [
          { username: 'cookmeplox', role: 'cook' },
          { username: 'riblet', role: 'deputy_owner' },
          { username: 'psikoi', role: 'magician' }
        ]
      });
      expect(createResponse.status).toBe(201);

      jest.resetAllMocks();

      const editResponse = await api.put(`/groups/${createResponse.body.group.id}`).send({
        members: [{ username: 'psikoi', role: 'magician' }], // removing cookmeplox and riblet
        verificationCode: createResponse.body.verificationCode
      });

      expect(editResponse.status).toBe(200);
      expect(editResponse.body).toMatchObject({ memberCount: 1 });

      expect(editResponse.body.memberships.length).toBe(1);
      expect(editResponse.body.memberships[0].player.username).toBe('psikoi');

      const leftEvents = groupMembersLeftEvent.mock.calls[0][0].members;
      expect(leftEvents.length).toBe(2);

      const { memberships } = createResponse.body.group;

      expect(leftEvents[0]).toEqual({
        playerId: memberships.find(m => m.player.username === 'cookmeplox').playerId
      });

      expect(leftEvents[1]).toEqual({
        playerId: memberships.find(m => m.player.username === 'riblet').playerId
      });

      expect(groupMembersJoinedEvent).not.toHaveBeenCalled();
      expect(groupMembersRolesChangedEvent).not.toHaveBeenCalled();

      const deleteResponse = await api.delete(`/groups/${createResponse.body.group.id}`).send({
        verificationCode: createResponse.body.verificationCode
      });
      expect(deleteResponse.status).toBe(200);
    });

    it('should edit (only change roles)', async () => {
      const createResponse = await api.post('/groups').send({
        name: `Delete soon ${Date.now()}`,
        members: [
          { username: 'psikoi', role: 'member' },
          { username: 'cookmeplox', role: 'owner' },
          { username: 'riblet', role: 'deputy_owner' }
        ]
      });
      expect(createResponse.status).toBe(201);

      jest.resetAllMocks();

      const editResponse = await api.put(`/groups/${createResponse.body.group.id}`).send({
        members: [
          { username: 'psikoi', role: 'owner' },
          { username: 'cookmeplox', role: 'cook' },
          { username: 'riblet', role: 'deputy_owner' }
        ], // changing roles for psikoi and cookmeplox
        verificationCode: createResponse.body.verificationCode
      });

      expect(editResponse.status).toBe(200);
      expect(editResponse.body).toMatchObject({ memberCount: 3 });

      expect(editResponse.body.memberships.length).toBe(3);
      expect(editResponse.body.memberships[0].player.username).toBe('psikoi');
      expect(editResponse.body.memberships[1].player.username).toBe('riblet');
      expect(editResponse.body.memberships[2].player.username).toBe('cookmeplox');

      const changedRoleEvents = groupMembersRolesChangedEvent.mock.calls[0][0].members;
      expect(changedRoleEvents.length).toBe(2);

      const { memberships } = editResponse.body;

      const changedMembershipPsikoi = memberships.find(m => m.player.username === 'psikoi');
      expect(changedRoleEvents[0]).toEqual({
        role: 'owner',
        previousRole: 'member',
        playerId: changedMembershipPsikoi.playerId
      });

      const changedMembershipCookmeplox = memberships.find(m => m.player.username === 'cookmeplox');
      expect(changedRoleEvents[1]).toEqual({
        role: 'cook',
        previousRole: 'owner',
        playerId: changedMembershipCookmeplox.playerId
      });

      expect(groupMembersJoinedEvent).not.toHaveBeenCalled();
      expect(groupMembersLeftEvent).not.toHaveBeenCalled();

      const deleteResponse = await api.delete(`/groups/${createResponse.body.group.id}`).send({
        verificationCode: createResponse.body.verificationCode
      });
      expect(deleteResponse.status).toBe(200);
    });

    it('should edit members (with pending name changes)', async () => {
      const createResponse = await api.post('/groups').send({
        name: `Delete soon ${Date.now()}`,
        members: [{ username: 'A' }, { username: 'K' }, { username: 'X' }, { username: 'Z' }]
      });
      expect(createResponse.status).toBe(201);

      jest.resetAllMocks();

      const trackResponse = await api.post(`/players/T`);
      expect(trackResponse.status).toBe(201);

      const bulkSubmitResponse = await api.post('/names/bulk').send([
        { oldName: 'A', newName: 'B' },
        { oldName: 'X', newName: 'Y' },
        { oldName: 'T', newName: 'H' }
      ]);

      expect(bulkSubmitResponse.status).toBe(201);
      expect(bulkSubmitResponse.body.nameChangesSubmitted).toBe(3);
      expect(bulkSubmitResponse.body.message).toMatch('Successfully submitted 3/3 name changes.');

      const editResponse = await api.put(`/groups/${createResponse.body.group.id}`).send({
        members: [
          { username: 'Z' },
          { username: 'B' },
          { username: 'Y' },
          { username: 'H' },
          { username: 'T' }
        ],
        verificationCode: createResponse.body.verificationCode
      });

      expect(editResponse.status).toBe(200);
      expect(editResponse.body).toMatchObject({ memberCount: 5 });
      expect(editResponse.body.memberships.length).toBe(5);
      expect(editResponse.body.memberships[0].player.username).toBe('z');
      expect(editResponse.body.memberships[1].player.username).toBe('b');
      expect(editResponse.body.memberships[2].player.username).toBe('y');
      expect(editResponse.body.memberships[3].player.username).toBe('h');
      expect(editResponse.body.memberships[4].player.username).toBe('t');

      const { memberships } = editResponse.body;

      const joinedEvents = groupMembersJoinedEvent.mock.calls[0][0].members;
      expect(joinedEvents.length).toBe(2);

      expect(joinedEvents[0]).toEqual({
        role: 'member',
        playerId: memberships.find(m => m.player.username === 'h').playerId
      });

      expect(joinedEvents[1]).toEqual({
        role: 'member',
        playerId: memberships.find(m => m.player.username === 't').playerId
      });

      const leftEvents = groupMembersLeftEvent.mock.calls[0][0].members;
      expect(leftEvents.length).toBe(1);

      expect(leftEvents[0]).toEqual({
        playerId: createResponse.body.group.memberships.find(m => m.player.username === 'k').playerId
      });

      const deleteResponse = await api.delete(`/groups/${createResponse.body.group.id}`).send({
        verificationCode: createResponse.body.verificationCode
      });
      expect(deleteResponse.status).toBe(200);
    });

    it('should edit profile image', async () => {
      // Force this group to be a patron
      await prisma.group.update({
        where: {
          id: globalData.testGroupOneLeader.id
        },
        data: {
          patron: true
        }
      });

      const response = await api.put(`/groups/${globalData.testGroupOneLeader.id}`).send({
        verificationCode: globalData.testGroupOneLeader.verificationCode,
        profileImage: 'https://img.wiseoldman.net/some_fake_profile_image.png'
      });

      expect(response.status).toBe(200);
      expect(response.body.profileImage).toBe('https://img.wiseoldman.net/some_fake_profile_image.png');

      expect(groupMembersLeftEvent).not.toHaveBeenCalled();
      expect(groupMembersJoinedEvent).not.toHaveBeenCalled();
      expect(groupMembersRolesChangedEvent).not.toHaveBeenCalled();
    });

    it('should edit banner image', async () => {
      // Force this group to be a patron
      await prisma.group.update({
        where: {
          id: globalData.testGroupOneLeader.id
        },
        data: {
          patron: true
        }
      });

      const response = await api.put(`/groups/${globalData.testGroupOneLeader.id}`).send({
        verificationCode: globalData.testGroupOneLeader.verificationCode,
        bannerImage: 'https://img.wiseoldman.net/some_fake_banner_image.png'
      });

      expect(response.status).toBe(200);
      expect(response.body.bannerImage).toBe('https://img.wiseoldman.net/some_fake_banner_image.png');

      expect(groupMembersLeftEvent).not.toHaveBeenCalled();
      expect(groupMembersJoinedEvent).not.toHaveBeenCalled();
      expect(groupMembersRolesChangedEvent).not.toHaveBeenCalled();
    });

    it('should edit social links', async () => {
      // Force this group to be a patron
      await prisma.group.update({
        where: {
          id: globalData.testGroupOneLeader.id
        },
        data: {
          patron: true
        }
      });

      const firstResponse = await api.put(`/groups/${globalData.testGroupOneLeader.id}`).send({
        verificationCode: globalData.testGroupOneLeader.verificationCode,
        socialLinks: {
          twitter: 'https://twitter.com/RubenPsikoi',
          youtube: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          twitch: 'https://www.twitch.tv/oldschoolrs',
          discord: 'https://discord.gg/wiseoldman'
        }
      });

      expect(firstResponse.status).toBe(200);
      expect(firstResponse.body.socialLinks).toMatchObject({
        twitter: 'https://twitter.com/RubenPsikoi',
        youtube: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        twitch: 'https://www.twitch.tv/oldschoolrs'
      });

      // Try again, but now override the existing twitter link, unset twitch, youtube shouldn't change

      const secondResponse = await api.put(`/groups/${globalData.testGroupOneLeader.id}`).send({
        verificationCode: globalData.testGroupOneLeader.verificationCode,
        socialLinks: {
          twitter: 'https://twitter.com/OldSchoolRS',
          twitch: null, // unset the twitch link,
          discord: '' // unset the discord link (empty strings get converted to null values)
        }
      });

      expect(secondResponse.status).toBe(200);
      expect(secondResponse.body.socialLinks).toMatchObject({
        twitter: 'https://twitter.com/OldSchoolRS',
        youtube: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        twitch: null
      });

      expect(groupMembersLeftEvent).not.toHaveBeenCalled();
      expect(groupMembersJoinedEvent).not.toHaveBeenCalled();
      expect(groupMembersRolesChangedEvent).not.toHaveBeenCalled();
    });

    it('should edit group role order', async () => {
      const response = await api.put(`/groups/${globalData.testGroupOneLeader.id}`).send({
        verificationCode: globalData.testGroupOneLeader.verificationCode,
        roleOrders: [
          { role: 'air', index: 2 },
          { role: 'member', index: 1 }
        ]
      });

      expect(response.status).toBe(200);

      const response2 = await api.get(`/groups/${globalData.testGroupOneLeader.id}`);

      expect(response2.status).toBe(200);
      expect(response2.body.roleOrders.length).toBe(2);
      // ensure the server sorts
      expect(response2.body.roleOrders[0]).toMatchObject({
        role: 'member',
        index: 1
      });
      expect(response2.body.roleOrders[1]).toMatchObject({
        role: 'air',
        index: 2
      });

      const overwriteResponse = await api.put(`/groups/${globalData.testGroupOneLeader.id}`).send({
        verificationCode: globalData.testGroupOneLeader.verificationCode,
        roleOrders: [{ role: 'beast', index: 1 }]
      });

      expect(overwriteResponse.status).toBe(200);

      const overwriteResponse2 = await api.get(`/groups/${globalData.testGroupOneLeader.id}`);
      expect(overwriteResponse2.status).toBe(200);
      expect(overwriteResponse2.body.roleOrders.length).toBe(1);
    });

    it('should not edit role order (if same index or role)', async () => {
      const response = await api.put(`/groups/${globalData.testGroupOneLeader.id}`).send({
        verificationCode: globalData.testGroupOneLeader.verificationCode,
        roleOrders: [
          { role: 'member', index: 1 },
          { role: 'air', index: 1 }
        ]
      });
      expect(response.status).toBe(400);

      const response2 = await api.put(`/groups/${globalData.testGroupOneLeader.id}`).send({
        verificationCode: globalData.testGroupOneLeader.verificationCode,
        roleOrders: [
          { role: 'air', index: 1 },
          { role: 'air', index: 2 }
        ]
      });
      expect(response2.status).toBe(400);
    });
  });

  it('should delete role order (given empty array)', async () => {
    const response = await api.put(`/groups/${globalData.testGroupOneLeader.id}`).send({
      verificationCode: globalData.testGroupOneLeader.verificationCode,
      roleOrders: []
    });
    expect(response.status).toBe(200);

    const overwriteResponse2 = await api.get(`/groups/${globalData.testGroupOneLeader.id}`);

    expect(response.status).toBe(200);
    expect(overwriteResponse2.body.roleOrders.length).toBe(0);
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

    it('should search groups (w/ name query, leading/trailing whitespace)', async () => {
      const response = await api.get('/groups').query({ name: '  ey  ' });

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

      expect(groupMembersJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not add members (invalid verification code)', async () => {
      const response = await api
        .post(`/groups/${globalData.testGroupNoLeaders.id}/members`)
        .send({ members: [] });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'verificationCode' is required.");

      expect(groupMembersJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not add members (incorrect verification code)', async () => {
      const response = await api.post(`/groups/${globalData.testGroupNoLeaders.id}/members`).send({
        verificationCode: 'xxx-xxx-xxx',
        members: [{ username: 'elvard', role: 'leader' }]
      });

      expect(response.status).toBe(403);
      expect(response.body.message).toMatch('Incorrect verification code.');

      expect(groupMembersJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not add members (invalid members list)', async () => {
      const response = await api.post(`/groups/${globalData.testGroupNoLeaders.id}/members`).send({
        verificationCode: globalData.testGroupNoLeaders.verificationCode,
        members: 123
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'members' is not a valid array.");

      expect(groupMembersJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not add members (empty members list)', async () => {
      const response = await api.post(`/groups/${globalData.testGroupNoLeaders.id}/members`).send({
        verificationCode: globalData.testGroupNoLeaders.verificationCode,
        members: []
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'members' must have a minimum of 1 element(s).");

      expect(groupMembersJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not add members (invalid member object shape)', async () => {
      const response = await api.post(`/groups/${globalData.testGroupNoLeaders.id}/members`).send({
        verificationCode: globalData.testGroupNoLeaders.verificationCode,
        members: ['elvard@invalid']
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Invalid members list.');

      expect(groupMembersJoinedEvent).not.toHaveBeenCalled();
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

      expect(groupMembersJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not add members (invalid member role)', async () => {
      const response = await api.post(`/groups/${globalData.testGroupNoLeaders.id}/members`).send({
        verificationCode: globalData.testGroupNoLeaders.verificationCode,
        members: [{ username: 'alexsuperfly', role: 'invalid' }]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Invalid enum value for 'role'.");

      expect(groupMembersJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not add members (already members)', async () => {
      const response = await api.post(`/groups/${globalData.testGroupNoLeaders.id}/members`).send({
        verificationCode: globalData.testGroupNoLeaders.verificationCode,
        members: [{ username: 'zezima' }]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('All players given are already members.');

      expect(groupMembersJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not add members (a player has opted out)', async () => {
      const createGroupResponse = await api.post(`/groups`).send({
        name: 'test',
        members: [
          { username: 'Jonas', role: 'legend' },
          { username: 'Ulrich', role: 'cook' }
        ]
      });

      expect(createGroupResponse.status).toBe(201);

      await prisma.player.create({
        data: {
          username: 'mikkel',
          displayName: 'Mikkel',
          annotations: {
            create: [{ type: PlayerAnnotationType.OPT_OUT }]
          }
        }
      });

      await prisma.player.create({
        data: {
          username: 'regina',
          displayName: 'Regina',
          annotations: {
            create: [{ type: PlayerAnnotationType.OPT_OUT_GROUPS }]
          }
        }
      });

      const addMembersResponse = await api.post(`/groups/${createGroupResponse.body.group.id}/members`).send({
        verificationCode: createGroupResponse.body.verificationCode,
        members: [
          { username: 'Martha' },
          { username: 'Mikkel' },
          { username: 'Bartosz' },
          { username: 'regina' }
        ]
      });

      expect(addMembersResponse.status).toBe(403);
      expect(addMembersResponse.body.message).toMatch('One or more players have opted out');
      expect(addMembersResponse.body.data).toEqual(['Mikkel', 'Regina']);

      const deleteGroupResponse = await api.delete(`/groups/${createGroupResponse.body.group.id}`).send({
        verificationCode: createGroupResponse.body.verificationCode
      });

      expect(deleteGroupResponse.status).toBe(200);
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

      const latestActivities = await prisma.memberActivity.findMany({
        where: { groupId: globalData.testGroupNoLeaders.id },
        orderBy: { createdAt: 'desc' },
        take: 3
      });

      const playerIds = (
        await prisma.player.findMany({
          where: { username: { in: ['sethmare', 'rro', 'lynx titan'] } },
          select: { id: true }
        })
      ).map(p => p.id);

      expect(latestActivities.map(a => a.type)).toEqual(['joined', 'joined', 'joined']);

      playerIds.forEach(playerId => {
        expect(latestActivities.map(a => a.playerId)).toContain(playerId);
      });

      const after = await api.get(`/groups/${globalData.testGroupNoLeaders.id}`);
      expect(after.status).toBe(200);
      expect(after.body.memberCount).toBe(8); // had 5 previously

      // ensure group.updatedAt has been updated
      expect(new Date(after.body.updatedAt).getTime()).toBeGreaterThan(
        new Date(before.body.updatedAt).getTime()
      );

      expect(groupMembersJoinedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          groupId: globalData.testGroupNoLeaders.id,
          members: expect.objectContaining({ length: 3 })
        })
      );

      const joinedEvents = groupMembersJoinedEvent.mock.calls[0][0].members;
      expect(joinedEvents.length).toBe(3);

      expect(joinedEvents[0]).toEqual({
        playerId: after.body.memberships.find(m => m.player.username === 'sethmare').playerId,
        role: 'magician'
      });

      expect(joinedEvents[1]).toEqual({
        playerId: after.body.memberships.find(m => m.player.username === 'rro').playerId,
        role: 'ranger'
      });

      expect(joinedEvents[2]).toEqual({
        playerId: after.body.memberships.find(m => m.player.username === 'lynx titan').playerId,
        role: 'magician'
      });
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

      expect(groupMembersRolesChangedEvent).not.toHaveBeenCalled();
    });

    it('should not change role (invalid verification code)', async () => {
      const response = await api.put(`/groups/123456789/role`).send({
        username: 'elvard',
        role: 'ranger'
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Parameter 'verificationCode' is required.");

      expect(groupMembersRolesChangedEvent).not.toHaveBeenCalled();
    });

    it('should not change role (incorrect verification code)', async () => {
      const response = await api.put(`/groups/${globalData.testGroupNoLeaders.id}/role`).send({
        verificationCode: 'xxx-xxx-xxx',
        username: 'elvard',
        role: 'ranger'
      });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Incorrect verification code.');

      expect(groupMembersRolesChangedEvent).not.toHaveBeenCalled();
    });

    it('should not change role (undefined username)', async () => {
      const response = await api.put(`/groups/${globalData.testGroupNoLeaders.id}/role`).send({
        verificationCode: globalData.testGroupNoLeaders.verificationCode
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Parameter 'username' is undefined.");

      expect(groupMembersRolesChangedEvent).not.toHaveBeenCalled();
    });

    it('should not change role (undefined role)', async () => {
      const response = await api
        .put(`/groups/${globalData.testGroupNoLeaders.id}/role`)
        .send({ username: 'idk', verificationCode: globalData.testGroupNoLeaders.verificationCode });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Parameter 'role' is undefined.");

      expect(groupMembersRolesChangedEvent).not.toHaveBeenCalled();
    });

    it('should not change role (empty role)', async () => {
      const response = await api.put(`/groups/${globalData.testGroupNoLeaders.id}/role`).send({
        username: 'idk',
        role: '',
        verificationCode: globalData.testGroupNoLeaders.verificationCode
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid enum value for 'role'.");

      expect(groupMembersRolesChangedEvent).not.toHaveBeenCalled();
    });

    it('should not change role (invalid role)', async () => {
      const response = await api.put(`/groups/${globalData.testGroupNoLeaders.id}/role`).send({
        verificationCode: globalData.testGroupNoLeaders.verificationCode,
        username: 'zezima___',
        role: 'idk'
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid enum value for 'role'.");

      expect(groupMembersRolesChangedEvent).not.toHaveBeenCalled();
    });

    it('should not change role (not a member)', async () => {
      const response = await api.put(`/groups/${globalData.testGroupNoLeaders.id}/role`).send({
        verificationCode: globalData.testGroupNoLeaders.verificationCode,
        username: 'usbc',
        role: 'beast'
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(`usbc is not a member of ${globalData.testGroupNoLeaders.name}.`);

      expect(groupMembersRolesChangedEvent).not.toHaveBeenCalled();
    });

    it('should not change role (already has role)', async () => {
      const response = await api.put(`/groups/${globalData.testGroupNoLeaders.id}/role`).send({
        verificationCode: globalData.testGroupNoLeaders.verificationCode,
        username: 'sethmare',
        role: 'magician'
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('sethmare is already a magician.');

      expect(groupMembersRolesChangedEvent).not.toHaveBeenCalled();
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

      expect(groupMembersRolesChangedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          groupId: globalData.testGroupNoLeaders.id,
          members: expect.objectContaining({ length: 1 })
        })
      );

      const event = groupMembersRolesChangedEvent.mock.calls[0][0].members[0];

      const playerSethmare = (await prisma.player.findFirst({
        where: { username: 'sethmare' }
      }))!;

      expect(event).toEqual({
        playerId: playerSethmare.id,
        role: 'dragon',
        previousRole: 'magician'
      });

      const latestActivity = (await prisma.memberActivity.findFirst({
        where: { groupId: globalData.testGroupNoLeaders.id },
        orderBy: { createdAt: 'desc' }
      }))!;

      expect(latestActivity.type).toBe('changed_role');
      expect(latestActivity.role).toBe('dragon');
      expect(latestActivity.playerId).toBe(playerSethmare.id);

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

      expect(groupMembersLeftEvent).not.toHaveBeenCalled();
    });

    it('should not remove members (invalid verification code)', async () => {
      const response = await api.delete(`/groups/${globalData.testGroupNoLeaders.id}/members`).send({
        members: ['sethmare']
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Parameter 'verificationCode' is required.");

      expect(groupMembersLeftEvent).not.toHaveBeenCalled();
    });

    it('should not remove members (incorrect verification code)', async () => {
      const response = await api.delete(`/groups/${globalData.testGroupNoLeaders.id}/members`).send({
        verificationCode: 'xxx-xxx-xxx',
        members: ['sethmare']
      });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Incorrect verification code.');

      expect(groupMembersLeftEvent).not.toHaveBeenCalled();
    });

    it('should not remove members, incorrect admin override (invalid verification code)', async () => {
      const response = await api.delete(`/groups/${globalData.testGroupNoLeaders.id}/members`).send({
        adminPassword: 'xxx-xxx-xxx',
        members: ['sethmare']
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Parameter 'verificationCode' is required.");

      expect(groupMembersLeftEvent).not.toHaveBeenCalled();
    });

    it('should not remove members, incorrect admin override (incorrect verification code)', async () => {
      const response = await api.delete(`/groups/${globalData.testGroupNoLeaders.id}/members`).send({
        adminPassword: 'xxx-xxx-xxx',
        verificationCode: 'xxx-xxx-xxx',
        members: ['sethmare']
      });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Incorrect verification code.');

      expect(groupMembersLeftEvent).not.toHaveBeenCalled();
    });

    it('should not remove members (invalid members list)', async () => {
      const response = await api.delete(`/groups/${globalData.testGroupNoLeaders.id}/members`).send({
        verificationCode: globalData.testGroupNoLeaders.verificationCode,
        members: 123
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Parameter 'members' is not a valid array.");

      expect(groupMembersLeftEvent).not.toHaveBeenCalled();
    });

    it('should not remove members (empty members list)', async () => {
      const response = await api.delete(`/groups/${globalData.testGroupNoLeaders.id}/members`).send({
        verificationCode: globalData.testGroupNoLeaders.verificationCode,
        members: []
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Parameter 'members' must have a minimum of 1 element(s).");

      expect(groupMembersLeftEvent).not.toHaveBeenCalled();
    });

    it('should not remove members (no valid players found)', async () => {
      const response = await api.delete(`/groups/${globalData.testGroupNoLeaders.id}/members`).send({
        verificationCode: globalData.testGroupNoLeaders.verificationCode,
        members: ['boom_'] // does not exist on WOM
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('None of the players given were members of that group.');

      expect(groupMembersLeftEvent).not.toHaveBeenCalled();
    });

    it('should not remove members (not members)', async () => {
      const response = await api.delete(`/groups/${globalData.testGroupNoLeaders.id}/members`).send({
        verificationCode: globalData.testGroupNoLeaders.verificationCode,
        members: ['swampletics'] // exists on WOM, but not a member of the group
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('None of the players given were members of that group.');

      expect(groupMembersLeftEvent).not.toHaveBeenCalled();
    });

    it('should remove members', async () => {
      const before = await api.get(`/groups/${globalData.testGroupNoLeaders.id}`);
      expect(before.status).toBe(200);

      const response = await api.delete(`/groups/${globalData.testGroupNoLeaders.id}/members`).send({
        verificationCode: globalData.testGroupNoLeaders.verificationCode,
        members: ['SETHmare  ', 'ZEZIMA', '__BOOM', 'psikoi']
        // "boom" should get ignored because it's not tracked yet
        // "psikoi" should get ignored because it's not a member
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        count: 2,
        message: 'Successfully removed 2 members.'
      });

      expect(groupMembersLeftEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          groupId: globalData.testGroupNoLeaders.id,
          members: expect.objectContaining({ length: 2 })
        })
      );

      const leftEvents = groupMembersLeftEvent.mock.calls[0][0].members;
      expect(leftEvents.length).toBe(2);

      expect(leftEvents[0]).toEqual({
        playerId: before.body.memberships.find(m => m.player.username === 'sethmare').playerId
      });

      expect(leftEvents[1]).toEqual({
        playerId: before.body.memberships.find(m => m.player.username === 'zezima').playerId
      });

      const latestActivities = await prisma.memberActivity.findMany({
        where: { groupId: globalData.testGroupNoLeaders.id },
        orderBy: { createdAt: 'desc' },
        take: 2
      });

      const playerIds = (
        await prisma.player.findMany({
          where: { username: { in: ['sethmare', 'zezima'] } },
          select: { id: true }
        })
      ).map(p => p.id);

      expect(latestActivities.map(a => a.type)).toEqual(['left', 'left']);

      playerIds.forEach(playerId => {
        expect(latestActivities.map(a => a.playerId)).toContain(playerId);
      });

      const after = await api.get(`/groups/${globalData.testGroupNoLeaders.id}`);
      expect(after.status).toBe(200);
      expect(after.body.memberCount).toBe(6); // had 8 previously

      // ensure group.updatedAt has been updated
      expect(new Date(after.body.updatedAt).getTime()).toBeGreaterThan(
        new Date(before.body.updatedAt).getTime()
      );
    });

    it('should remove members (admin override)', async () => {
      const createResponse = await api.post('/groups').send({
        name: 'Delete soon',
        members: [{ username: 'harry', role: 'owner' }]
      });
      expect(createResponse.status).toBe(201);

      const before = await api.get(`/groups/${createResponse.body.group.id}`);
      expect(before.status).toBe(200);

      const removeResponse = await api.delete(`/groups/${createResponse.body.group.id}/members`).send({
        adminPassword: process.env.ADMIN_PASSWORD,
        members: ['harry']
      });

      expect(removeResponse.status).toBe(200);
      expect(removeResponse.body).toMatchObject({
        count: 1,
        message: 'Successfully removed 1 members.'
      });

      expect(groupMembersLeftEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          groupId: createResponse.body.group.id,
          members: expect.objectContaining({ length: 1 })
        })
      );

      const after = await api.get(`/groups/${createResponse.body.group.id}`);
      expect(after.status).toBe(200);
      expect(after.body.memberCount).toBe(0); // had 1 previously

      // ensure group.updatedAt has been updated
      expect(new Date(after.body.updatedAt).getTime()).toBeGreaterThan(
        new Date(before.body.updatedAt).getTime()
      );

      const deleteResponse = await api.delete(`/groups/${createResponse.body.group.id}`).send({
        verificationCode: createResponse.body.verificationCode
      });
      expect(deleteResponse.status).toBe(200);
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

    it('should not delete (group not found with admin perms)', async () => {
      const response = await api.delete(`/groups/123456789`).send({
        adminPassword: process.env.ADMIN_PASSWORD
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

    it('should not delete, incorrect admin override (invalid verification code)', async () => {
      const response = await api.delete(`/groups/${globalData.testGroupNoLeaders.id}`).send({
        adminPassword: 'xxx-xxx-xxx'
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Parameter 'verificationCode' is required.");
    });

    it('should not delete, incorrect admin override (incorrect verification code)', async () => {
      const response = await api.delete(`/groups/${globalData.testGroupNoLeaders.id}`).send({
        adminPassword: 'xxx-xxx-xxx',
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

    it('should delete (admin override)', async () => {
      const createResponse = await api.post('/groups').send({
        name: 'Delete soon',
        members: [{ username: 'harry', role: 'owner' }]
      });
      expect(createResponse.status).toBe(201);

      const before = await api.get(`/groups/${createResponse.body.group.id}`);
      expect(before.status).toBe(200);

      const deleteResponse = await api.delete(`/groups/${createResponse.body.group.id}`).send({
        adminPassword: process.env.ADMIN_PASSWORD
      });

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body).toMatchObject({ message: 'Successfully deleted group: Delete soon' });

      const after = await api.get(`/groups/${createResponse.body.group.id}`);
      expect(after.status).toBe(404);
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

    it('should view details (no role ordering)', async () => {
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

  it('should view details (with role ordering)', async () => {
    // set order
    const roleOrderResponse = await api.put(`/groups/${globalData.testGroupOneLeader.id}`).send({
      verificationCode: globalData.testGroupOneLeader.verificationCode,
      roleOrders: [
        { role: 'leader', index: 1 },
        { role: 'artisan', index: 2 },
        { role: 'member', index: 3 },
        { role: 'firemaker', index: 4 },
        { role: 'achiever', index: 5 }
      ]
    });

    expect(roleOrderResponse.status).toBe(200);

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

    // this order is determined by the roleOrder defined on the group
    expect(response.body.memberships[0]).toMatchObject({
      role: 'leader',
      player: { username: 'alexsuperfly' }
    });

    expect(response.body.memberships[1]).toMatchObject({
      role: 'artisan',
      player: { username: 'swampletics' }
    });

    expect(response.body.memberships[2]).toMatchObject({
      role: 'member',
      player: { username: 'rorro' }
    });

    expect(response.body.memberships[3]).toMatchObject({
      role: 'firemaker',
      player: { username: 'zezima' }
    });

    expect(response.body.memberships[4]).toMatchObject({
      role: 'achiever',
      player: { username: 'psikoi' }
    });
  });

  describe('10 - View Members CSV', () => {
    it('should not view members CSV (group not found)', async () => {
      const response = await api.get('/groups/9999/csv');

      expect(response.status).toBe(404);
      expect(response.body.message).toMatch('Group not found.');
    });

    it('should not view members CSV (empty group)', async () => {
      const response = await api.get(`/groups/${globalData.testGroupNoMembers.id}/csv`);

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Group has no members.');
    });

    it('should view members CSV', async () => {
      const response = await api.get(`/groups/${globalData.testGroupOneLeader.id}/csv`);
      expect(response.status).toBe(200);

      const rows = response.text.split('\n');
      expect(rows.length).toBe(6);

      await prisma.player.update({
        where: { username: 'alexsuperfly' },
        data: { updatedAt: null }
      });

      // Check the table header
      expect(rows[0]).toBe('Player,Role,Experience,Last progressed,Last updated');

      expect(rows[0].split(',').length).toBe(5);

      expect(rows[1].split(',').at(-1)).toBe(''); // Alexsuperfly has null updatedAt, should be returned as empty string
      expect(rows[1].split(',').at(-2)).toBe(''); // Alexsuperfly has null lastChangedAt, should be returned as empty string

      // Check the table body
      expect(rows[1]).toMatch('alexsuperfly,leader,');
      expect(rows[2]).toMatch('swampletics,artisan');
      expect(rows[3]).toMatch('rorro,member');
      expect(rows[4]).toMatch('zezima,firemaker');
      expect(rows[5]).toMatch('psikoi,achiever');
    });
  });

  describe('11 - View Hiscores', () => {
    it('should not view hiscores (undefined metric)', async () => {
      const response = await api.get(`/groups/100000/hiscores`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Parameter 'metric' is undefined.");
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
        .query({ metric: 'dungeoneering' });

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
        { hiscoresMetricName: 'Zulrah', value: 100 },
        { hiscoresMetricName: 'Magic', value: 5_500_000 }
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
          type: 'skill',
          experience: 200_000_000,
          level: 99
        }
      });

      expect(skillHiscoresResponse.body[1]).toMatchObject({
        player: { username: 'psikoi' },
        data: {
          type: 'skill',
          experience: 19_288_604,
          level: 99
        }
      });

      expect(skillHiscoresResponse.body[2]).toMatchObject({
        player: { username: 'zezima' },
        data: {
          type: 'skill',
          experience: 5_500_000,
          level: 90
        }
      });

      // Make sure latestSnapshot isn't leaking
      expect(skillHiscoresResponse.body[0].player.latestSnapshot).not.toBeDefined();
      expect(skillHiscoresResponse.body[1].player.latestSnapshot).not.toBeDefined();
      expect(skillHiscoresResponse.body[2].player.latestSnapshot).not.toBeDefined();

      const activityHiscoresResponse = await api
        .get(`/groups/${globalData.testGroupOneLeader.id}/hiscores`)
        .query({ metric: 'clue_scrolls_all' });

      expect(activityHiscoresResponse.status).toBe(200);
      expect(activityHiscoresResponse.body.length).toBe(3);
      expect(activityHiscoresResponse.body[0].data.score).toBeDefined();
      expect(activityHiscoresResponse.body[0].data.rank).toBeDefined();
      expect(activityHiscoresResponse.body[0].data.type).toBe('activity');

      const computedMetricsHiscoresResponse = await api
        .get(`/groups/${globalData.testGroupOneLeader.id}/hiscores`)
        .query({ metric: 'ehp' });

      expect(computedMetricsHiscoresResponse.status).toBe(200);
      expect(computedMetricsHiscoresResponse.body.length).toBe(3);
      expect(computedMetricsHiscoresResponse.body[0].data.value).toBeDefined();
      expect(computedMetricsHiscoresResponse.body[0].data.rank).toBeDefined();
      expect(computedMetricsHiscoresResponse.body[0].data.type).toBe('computed');
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
          type: 'boss',
          kills: 100
        }
      });

      // Make sure latestSnapshot isn't leaking
      expect(response.body[0].player.latestSnapshot).not.toBeDefined();
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
  });

  describe('12 - View Group Activity', () => {
    it('should not view group activity (group not found)', async () => {
      const response = await api.get(`/groups/100000/activity`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Group not found.');
    });

    it('should view group activity (empty)', async () => {
      const response = await api.get(`/groups/${globalData.testGroupNoMembers.id}/activity`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should view group activity', async () => {
      const response = await api.get(`/groups/${globalData.testGroupOneLeader.id}/activity`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(6);

      // These activities where previously created during the "should edit members list" step

      expect(response.body[0]).toMatchObject({
        player: { username: 'test player' },
        role: 'leader',
        type: 'left'
      });

      expect(response.body[1]).toMatchObject({
        player: { username: 'alt player' },
        role: 'captain',
        type: 'left'
      });

      expect(response.body[2]).toMatchObject({
        player: { username: 'psikoi' },
        role: 'achiever',
        type: 'joined'
      });

      expect(response.body[3]).toMatchObject({
        player: { username: 'alexsuperfly' },
        role: 'leader',
        type: 'joined'
      });

      expect(response.body[4]).toMatchObject({
        player: { username: 'rorro' },
        role: 'member',
        type: 'joined'
      });

      expect(response.body[5]).toMatchObject({
        player: { username: 'zezima' },
        role: 'firemaker',
        type: 'changed_role'
      });
    });

    it('should view group activity (w/ pagination)', async () => {
      const response = await api
        .get(`/groups/${globalData.testGroupOneLeader.id}/activity`)
        .query({ limit: 3, offset: 2 });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(3);

      // These activities where previously created during the "should edit members list" step

      expect(response.body[0]).toMatchObject({
        player: { username: 'psikoi' },
        role: 'achiever',
        type: 'joined'
      });

      expect(response.body[1]).toMatchObject({
        player: { username: 'alexsuperfly' },
        role: 'leader',
        type: 'joined'
      });

      expect(response.body[2]).toMatchObject({
        player: { username: 'rorro' },
        role: 'member',
        type: 'joined'
      });
    });
  });

  describe('13 - View Statistics', () => {
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
        maxed200msCount: 24,
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
        },
        metricLeaders: {
          bosses: {
            abyssal_sire: {
              kills: 1049
            },
            zulrah: {
              kills: 1646,
              player: {
                username: 'psikoi'
              }
            }
          },
          skills: {
            agility: {
              experience: 200000000,
              player: {
                username: 'alexsuperfly'
              }
            },
            magic: {
              experience: 200000000,
              player: {
                username: 'alexsuperfly'
              }
            }
          },
          activities: {
            bounty_hunter_hunter: {
              player: null
            }
          }
        }
      });

      expect(new Date(response.body.averageStats.createdAt).getMonth()).toEqual(new Date().getMonth());

      const metricLeaderPlayers = [
        ...Object.values(response.body.metricLeaders.skills),
        ...Object.values(response.body.metricLeaders.bosses),
        ...Object.values(response.body.metricLeaders.activities),
        ...Object.values(response.body.metricLeaders.computed)
      ].map(m => m!['player']);

      for (let i = 0; i < metricLeaderPlayers.length; i++) {
        if (metricLeaderPlayers[i]) {
          expect(metricLeaderPlayers[i]['latestSnapshot']).not.toBeDefined();
        }
      }
    });
  });

  describe('14 - Update All', () => {
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
      // Force these players last update timestamps to be recent
      await prisma.player.update({
        where: { username: 'psikoi' },
        data: { updatedAt: new Date() }
      });
      await prisma.player.update({
        where: { username: 'alexsuperfly' },
        data: { updatedAt: new Date() }
      });
      await prisma.player.update({
        where: { username: 'zezima' },
        data: { updatedAt: new Date() }
      });
      await prisma.player.update({
        where: { username: 'swampletics' },
        data: { updatedAt: new Date() }
      });
      await prisma.player.update({
        where: { username: 'rorro' },
        data: { updatedAt: new Date() }
      });

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

      // Force this player's last update timestamp to be null
      await prisma.player.update({
        where: { username: 'alexsuperfly' },
        data: { updatedAt: null }
      });

      // Force these players last update timestamps to be recent
      await prisma.player.update({
        where: { username: 'swampletics' },
        data: { updatedAt: new Date() }
      });
      await prisma.player.update({
        where: { username: 'rorro' },
        data: { updatedAt: new Date() }
      });

      const response = await api.post(`/groups/${globalData.testGroupOneLeader.id}/update-all`).send({
        verificationCode: globalData.testGroupOneLeader.verificationCode
      });

      // 1 outdated player, 1 player with no last update timestamp, 3 players with recent update timestamps

      expect(response.status).toBe(200);
      expect(response.body.message).toBe(
        '2 outdated (updated > 24h ago) players are being updated. This can take up to a few minutes.'
      );
    });
  });

  describe('15 - Reset Verification Code', () => {
    it('should not reset code (invalid admin password)', async () => {
      const response = await api.put(`/groups/100000/reset-code`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Required parameter 'adminPassword' is undefined.");
    });

    it('should not reset code (incorrect admin password)', async () => {
      const response = await api.put(`/groups/100000/reset-code`).send({
        adminPassword: 'abcdef'
      });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Incorrect admin password.');
    });

    it('should not reset code (group not found)', async () => {
      const response = await api.put(`/groups/100000/reset-code`).send({
        adminPassword: process.env.ADMIN_PASSWORD
      });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Group not found.');
    });

    it('should reset code', async () => {
      const response = await api.put(`/groups/${globalData.testGroupOneLeader.id}/reset-code`).send({
        adminPassword: process.env.ADMIN_PASSWORD
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

  describe('16 - Verify', () => {
    it('should not verify group (invalid admin password)', async () => {
      const response = await api.put(`/groups/100000/verify`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Required parameter 'adminPassword' is undefined.");
    });

    it('should not verify group (incorrect admin password)', async () => {
      const response = await api.put(`/groups/100000/verify`).send({
        adminPassword: 'abcdef'
      });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Incorrect admin password.');
    });

    it('should not verify group (group not found)', async () => {
      const response = await api.put(`/groups/100000/verify`).send({
        adminPassword: process.env.ADMIN_PASSWORD
      });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Group not found.');
    });

    it('should verify group', async () => {
      const response = await api.put(`/groups/${globalData.testGroupOneLeader.id}/verify`).send({
        adminPassword: process.env.ADMIN_PASSWORD
      });

      expect(response.status).toBe(200);
      expect(response.body.verificationHash).not.toBeDefined();
      expect(response.body).toMatchObject({
        id: globalData.testGroupOneLeader.id,
        verified: true
      });
    });
  });
});
