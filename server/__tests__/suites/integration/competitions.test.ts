import axios from 'axios';
import supertest from 'supertest';
import MockAdapter from 'axios-mock-adapter';
import apiServer from '../../../src/api';
import prisma from '../../../src/prisma';
import env from '../../../src/env';
import { PlayerType } from '../../../src/utils';
import * as competitionEvents from '../../../src/api/modules/competitions/competition.events';
import {
  resetDatabase,
  resetRedis,
  registerCMLMock,
  registerHiscoresMock,
  readFile,
  modifyRawHiscoresData,
  sleep
} from '../../utils';

const api = supertest(apiServer.express);
const axiosMock = new MockAdapter(axios, { onNoMatch: 'passthrough' });

const onCompetitionCreatedEvent = jest.spyOn(competitionEvents, 'onCompetitionCreated');
const onParticipantsJoinedEvent = jest.spyOn(competitionEvents, 'onParticipantsJoined');

const HISCORES_FILE_PATH = `${__dirname}/../../data/hiscores/psikoi_hiscores.txt`;

const EMPTY_DATA = { id: -1, verificationCode: '' };

const globalData = {
  hiscoresRawData: '',
  testGroup: EMPTY_DATA,
  testCompetitionStarting: EMPTY_DATA,
  testCompetitionStarted: EMPTY_DATA,
  testCompetitionStartedTeam: EMPTY_DATA,
  testCompetitionOngoing: EMPTY_DATA,
  testCompetitionEnding: EMPTY_DATA,
  testCompetitionEnded: EMPTY_DATA,
  testCompetitionWithGroup: EMPTY_DATA
};

beforeEach(() => {
  jest.resetAllMocks();
});

beforeAll(async () => {
  await resetDatabase();
  await resetRedis();

  globalData.hiscoresRawData = await readFile(HISCORES_FILE_PATH);

  // Mock the history fetch from CML to always fail with a 404 status code
  registerCMLMock(axiosMock, 404);

  // Mock regular hiscores data, and block any ironman requests
  registerHiscoresMock(axiosMock, {
    [PlayerType.REGULAR]: { statusCode: 200, rawData: globalData.hiscoresRawData },
    [PlayerType.IRONMAN]: { statusCode: 404 }
  });
});

afterAll(async () => {
  jest.useRealTimers();
  axiosMock.reset();

  // Sleep for 5s to allow the server to shut down gracefully
  await apiServer.shutdown().then(() => sleep(5000));
}, 10_000);

describe('Competition API', () => {
  describe('1 - Create', () => {
    const VALID_START_DATE = new Date(Date.now() + 1_200_000);
    const VALID_END_DATE = new Date(Date.now() + 1_200_000 + 604_800_000);

    const VALID_CREATE_BASE = {
      title: 'SOTW',
      metric: 'smithing',
      startsAt: VALID_START_DATE,
      endsAt: VALID_END_DATE
    };

    it('should not create (invalid title)', async () => {
      const response = await api.post('/competitions').send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'title' is undefined.");

      expect(onCompetitionCreatedEvent).not.toHaveBeenCalled();
      expect(onParticipantsJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not create (empty title)', async () => {
      const response = await api.post('/competitions').send({ title: '' });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Competition title must have at least one character.');

      expect(onCompetitionCreatedEvent).not.toHaveBeenCalled();
      expect(onParticipantsJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not create (undefined metric)', async () => {
      const response = await api.post('/competitions').send({ title: 'hello' });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Invalid enum value for 'metric'.");

      expect(onCompetitionCreatedEvent).not.toHaveBeenCalled();
      expect(onParticipantsJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not create (undefined start date)', async () => {
      const response = await api.post('/competitions').send({ title: 'hello', metric: 'smithing' });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'startsAt' is undefined.");

      expect(onCompetitionCreatedEvent).not.toHaveBeenCalled();
      expect(onParticipantsJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not create (invalid start date)', async () => {
      const response = await api
        .post('/competitions')
        .send({ title: 'hello', metric: 'smithing', startsAt: 123 });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'startsAt' is undefined.");

      expect(onCompetitionCreatedEvent).not.toHaveBeenCalled();
      expect(onParticipantsJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not create (undefined end date)', async () => {
      const response = await api
        .post('/competitions')
        .send({ title: 'hello', metric: 'smithing', startsAt: VALID_START_DATE });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'endsAt' is undefined.");

      expect(onCompetitionCreatedEvent).not.toHaveBeenCalled();
      expect(onParticipantsJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not create (invalid end date)', async () => {
      const response = await api
        .post('/competitions')
        .send({ title: 'hello', metric: 'smithing', endsAt: 123, startsAt: VALID_START_DATE });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'endsAt' is undefined.");

      expect(onCompetitionCreatedEvent).not.toHaveBeenCalled();
      expect(onParticipantsJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not create (end date before start date)', async () => {
      const response = await api.post('/competitions').send({
        ...VALID_CREATE_BASE,
        startsAt: VALID_END_DATE,
        endsAt: VALID_START_DATE
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Start date must be before the end date.');

      expect(onCompetitionCreatedEvent).not.toHaveBeenCalled();
      expect(onParticipantsJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not create (past dates)', async () => {
      const response = await api.post('/competitions').send({
        ...VALID_CREATE_BASE,
        startsAt: new Date(Date.now() - 2_000_000),
        endsAt: new Date(Date.now() - 1_000_000)
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Invalid dates: All start and end dates must be in the future.');

      expect(onCompetitionCreatedEvent).not.toHaveBeenCalled();
      expect(onParticipantsJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not create (invalid metric)', async () => {
      const response = await api.post('/competitions').send({ ...VALID_CREATE_BASE, metric: 'sailing' });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Invalid enum value for 'metric'.");

      expect(onCompetitionCreatedEvent).not.toHaveBeenCalled();
      expect(onParticipantsJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not create (title too long)', async () => {
      const response = await api.post('/competitions').send({
        ...VALID_CREATE_BASE,
        title: 'jklasjhfklsdhnfkjsdnfkdjsnfkdjsnfkjsdnfksdjnfksdjnjklasjhfklsdhnfkjsdnfkdjsnfkdjsnfkjsdnfksd'
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Competition title cannot be longer than 50 characters.');

      expect(onCompetitionCreatedEvent).not.toHaveBeenCalled();
      expect(onParticipantsJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not create (invalid participants list)', async () => {
      const response = await api.post('/competitions').send({
        ...VALID_CREATE_BASE,
        participants: 123
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'participants' is not a valid array.");

      expect(onCompetitionCreatedEvent).not.toHaveBeenCalled();
      expect(onParticipantsJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not create (invalid player name)', async () => {
      const response = await api.post('/competitions').send({
        ...VALID_CREATE_BASE,
        participants: ['psikoi', 'areallylongusername']
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Found 1 invalid usernames:');
      expect(response.body.data).toContain('areallylongusername');

      expect(onCompetitionCreatedEvent).not.toHaveBeenCalled();
      expect(onParticipantsJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not create (included participants and teams)', async () => {
      const response = await api.post('/competitions').send({
        ...VALID_CREATE_BASE,
        participants: ['psikoi', 'zezima'],
        teams: [{ name: 'Warriors', participants: ['hydrox6', 'jakesterwars'] }]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(
        'Cannot include both "participants" and "teams", they are mutually exclusive.'
      );

      expect(onCompetitionCreatedEvent).not.toHaveBeenCalled();
      expect(onParticipantsJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not create (invalid teams list type)', async () => {
      const response = await api.post('/competitions').send({
        ...VALID_CREATE_BASE,
        teams: 123
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'teams' is not a valid array.");

      expect(onCompetitionCreatedEvent).not.toHaveBeenCalled();
      expect(onParticipantsJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not create (invalid team shape)', async () => {
      const response = await api.post('/competitions').send({
        ...VALID_CREATE_BASE,
        teams: [{ hey: 'bye' }]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(
        'Invalid teams list. Must be an array of { name: string; participants: string[]; }.'
      );

      expect(onCompetitionCreatedEvent).not.toHaveBeenCalled();
      expect(onParticipantsJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not create (invalid team players list)', async () => {
      const response = await api.post('/competitions').send({
        ...VALID_CREATE_BASE,
        teams: [{ name: '?', participants: 123 }]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(
        'Invalid teams list. Must be an array of { name: string; participants: string[]; }.'
      );

      expect(onCompetitionCreatedEvent).not.toHaveBeenCalled();
      expect(onParticipantsJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not create (undefined team players list)', async () => {
      const response = await api.post('/competitions').send({
        ...VALID_CREATE_BASE,
        teams: [{ name: '?' }]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(
        'Invalid teams list. Must be an array of { name: string; participants: string[]; }.'
      );

      expect(onCompetitionCreatedEvent).not.toHaveBeenCalled();
      expect(onParticipantsJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not create (empty team players list)', async () => {
      const response = await api.post('/competitions').send({
        ...VALID_CREATE_BASE,
        teams: [{ name: '?', participants: [] }]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('All teams must have a valid non-empty participants array.');

      expect(onCompetitionCreatedEvent).not.toHaveBeenCalled();
      expect(onParticipantsJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not create (undefined team name)', async () => {
      const response = await api.post('/competitions').send({
        ...VALID_CREATE_BASE,
        teams: [{ participants: ['zezima', 'psikoi'] }]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(
        'Invalid teams list. Must be an array of { name: string; participants: string[]; }.'
      );

      expect(onCompetitionCreatedEvent).not.toHaveBeenCalled();
      expect(onParticipantsJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not create (empty team name)', async () => {
      const response = await api.post('/competitions').send({
        ...VALID_CREATE_BASE,
        teams: [{ name: '', participants: ['zezima', 'psikoi'] }]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Team names must have at least one character.');

      expect(onCompetitionCreatedEvent).not.toHaveBeenCalled();
      expect(onParticipantsJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not create (team name too long)', async () => {
      const response = await api.post('/competitions').send({
        ...VALID_CREATE_BASE,
        teams: [{ name: 'hjsdfhfiwsehflskdhfsdkljfhsdljkfhdsljkfh', participants: ['zezima', 'psikoi'] }]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Team names cannot be longer than 30 characters.');

      expect(onCompetitionCreatedEvent).not.toHaveBeenCalled();
      expect(onParticipantsJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not create (duplicated team name)', async () => {
      const response = await api.post('/competitions').send({
        ...VALID_CREATE_BASE,
        teams: [
          { name: 'WARRIORS ', participants: ['zezima', 'psikoi'] },
          { name: '_warriors', participants: ['hydrox6', 'jakesterwars'] }
        ]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Found repeated team names: [warriors]');

      expect(onCompetitionCreatedEvent).not.toHaveBeenCalled();
      expect(onParticipantsJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not create (duplicated team players)', async () => {
      const response = await api.post('/competitions').send({
        ...VALID_CREATE_BASE,
        teams: [
          { name: 'warriors', participants: ['zezima', 'psikoi'] },
          { name: 'soldiers', participants: ['hydrox6', ' ZEZIMA__'] }
        ]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Found repeated usernames: [zezima]');

      expect(onCompetitionCreatedEvent).not.toHaveBeenCalled();
      expect(onParticipantsJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not create (group not found)', async () => {
      const response = await api.post('/competitions').send({
        ...VALID_CREATE_BASE,
        groupId: 1000,
        groupVerificationCode: 'xxx-xxx-xxx'
      });

      expect(response.status).toBe(404);
      expect(response.body.message).toMatch('Group not found.');

      expect(onCompetitionCreatedEvent).not.toHaveBeenCalled();
      expect(onParticipantsJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not create (invalid group verification code)', async () => {
      const response = await api.post('/competitions').send({
        ...VALID_CREATE_BASE,
        groupId: 1000
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Invalid group verification code.');

      expect(onCompetitionCreatedEvent).not.toHaveBeenCalled();
      expect(onParticipantsJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not create (incorrect group verification code)', async () => {
      const createGroupResponse = await api.post('/groups').send({
        name: 'Test Group',
        members: [{ username: 'Psikoi' }, { username: 'Zezima' }]
      });

      expect(createGroupResponse.status).toBe(201);

      globalData.testGroup = {
        id: createGroupResponse.body.group.id,
        verificationCode: createGroupResponse.body.verificationCode
      };

      const response = await api.post('/competitions').send({
        ...VALID_CREATE_BASE,
        groupId: globalData.testGroup.id,
        groupVerificationCode: '111-111-111'
      });

      expect(response.status).toBe(403);
      expect(response.body.message).toMatch('Incorrect group verification code.');

      expect(onCompetitionCreatedEvent).not.toHaveBeenCalled();
      expect(onParticipantsJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not create (included participants and groupId)', async () => {
      const response = await api.post('/competitions').send({
        ...VALID_CREATE_BASE,
        groupId: globalData.testGroup.id,
        groupVerificationCode: globalData.testGroup.verificationCode,
        participants: ['Psikoi', 'Hydrox6', 'Rorro']
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Cannot include both "participants" and "groupId"');

      expect(onCompetitionCreatedEvent).not.toHaveBeenCalled();
      expect(onParticipantsJoinedEvent).not.toHaveBeenCalled();
    });

    it('should create (no participants)', async () => {
      // Starting in 20mins, ending in a week (upcoming)
      const response = await api.post('/competitions').send({
        title: ' Wise Old-Man___ ',
        metric: 'smithing',
        startsAt: VALID_START_DATE,
        endsAt: VALID_END_DATE
      });

      expect(response.status).toBe(201);
      expect(response.body.competition).toMatchObject({
        title: 'Wise Old Man',
        metric: 'smithing',
        startsAt: VALID_START_DATE.toISOString(),
        endsAt: VALID_END_DATE.toISOString()
      });

      expect(response.body.competition.groupId).toBeNull();
      expect(response.body.competition.group).not.toBeDefined();
      expect(response.body.competition.verificationHash).not.toBeDefined();
      expect(response.body.competition.participations.length).toBe(0);

      expect(onCompetitionCreatedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Wise Old Man',
          metric: 'smithing'
        })
      );

      expect(onParticipantsJoinedEvent).not.toHaveBeenCalled();

      globalData.testCompetitionStarting = {
        id: response.body.competition.id,
        verificationCode: response.body.verificationCode
      };
    });

    it('should create (w/ participants)', async () => {
      // Fake the current date to be 20 minutes ago
      jest.useFakeTimers('modern').setSystemTime(new Date(Date.now() - 1_200_000));

      const startDate = new Date(Date.now() + 10_000);
      const endDate = new Date(Date.now() + 10_000 + 604_800_000);

      // Started 20mins ago, ending in a week
      const response = await api.post('/competitions').send({
        title: ' BOTW Zulrah #3 ',
        metric: 'zulrah',
        startsAt: startDate,
        endsAt: endDate,
        participants: ['psikoi', 'zezima', 'rorro', 'usbc']
      });

      expect(response.status).toBe(201);
      expect(response.body.competition).toMatchObject({
        title: 'BOTW Zulrah #3',
        metric: 'zulrah',
        startsAt: startDate.toISOString(),
        endsAt: endDate.toISOString(),
        participantCount: 4
      });

      expect(response.body.competition.groupId).toBeNull();
      expect(response.body.competition.group).not.toBeDefined();
      expect(response.body.competition.verificationHash).not.toBeDefined();
      expect(response.body.competition.participations.length).toBe(4);

      expect(onCompetitionCreatedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'BOTW Zulrah #3',
          metric: 'zulrah'
        })
      );

      expect(onParticipantsJoinedEvent).toHaveBeenCalledWith(expect.objectContaining({ length: 4 }));

      // Create this competition here, as it'll be used in future tests
      // as a team-type competition mirror for the one above
      const secondResponse = await api.post('/competitions').send({
        title: 'Team Comp Test 123',
        metric: 'zulrah',
        startsAt: startDate,
        endsAt: endDate,
        teams: [
          { name: 'Team 1', participants: ['psikoi', 'rorro'] },
          { name: 'Team 2', participants: ['zezima', 'usbc'] }
        ]
      });
      expect(secondResponse.status).toBe(201);

      // Reset the timers to the current (REAL) time
      jest.useRealTimers();

      globalData.testCompetitionStarted = {
        id: response.body.competition.id,
        verificationCode: response.body.verificationCode
      };

      globalData.testCompetitionStartedTeam = {
        id: secondResponse.body.competition.id,
        verificationCode: secondResponse.body.verificationCode
      };
    });

    it('should create (w/ participants)', async () => {
      // Fake the current date to be 2 days ago
      jest.useFakeTimers('modern').setSystemTime(new Date(Date.now() - 172_800_000));

      const startDate = new Date(Date.now() + 10_000);
      const endDate = new Date(Date.now() + 10_000 + 432_000_000);

      // Started 2 days ago, ending in 5 days
      const response = await api.post('/competitions').send({
        title: ' SOTW Thieving 💰 #5 ',
        metric: 'thieving',
        startsAt: startDate,
        endsAt: endDate,
        participants: ['PSIKOI  ', '_Zezima ', 'rorro', 'usbc ']
      });

      expect(response.status).toBe(201);
      expect(response.body.competition).toMatchObject({
        title: 'SOTW Thieving 💰 #5', // test emoji support
        metric: 'thieving',
        startsAt: startDate.toISOString(),
        endsAt: endDate.toISOString(),
        participantCount: 4
      });

      expect(response.body.competition.groupId).toBeNull();
      expect(response.body.competition.group).not.toBeDefined();
      expect(response.body.competition.verificationHash).not.toBeDefined();
      expect(response.body.competition.participations.length).toBe(4);
      expect(response.body.competition.participations.map(p => p.player.username)).toContain('psikoi');
      expect(response.body.competition.participations.map(p => p.player.username)).toContain('zezima');
      expect(response.body.competition.participations.map(p => p.player.username)).toContain('rorro');
      expect(response.body.competition.participations.map(p => p.player.username)).toContain('usbc');

      expect(onCompetitionCreatedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'SOTW Thieving 💰 #5',
          metric: 'thieving'
        })
      );

      expect(onParticipantsJoinedEvent).toHaveBeenCalledWith(expect.objectContaining({ length: 4 }));

      // Reset the timers to the current (REAL) time
      jest.useRealTimers();

      globalData.testCompetitionOngoing = {
        id: response.body.competition.id,
        verificationCode: response.body.verificationCode
      };
    });

    it('should create (w/ teams)', async () => {
      // Fake the current date to be 2 days ago
      jest.useFakeTimers('modern').setSystemTime(new Date(Date.now() - 172_800_000));

      const startDate = new Date(Date.now() + 10_000);
      const endDate = new Date(Date.now() + 10_000 + 174_000_000);

      // Started 2 days ago, ending in 20 mins
      const response = await api.post('/competitions').send({
        title: '_Soul Wars Competition ',
        metric: 'soul_wars_zeal',
        startsAt: startDate,
        endsAt: endDate,
        teams: [
          { name: '_Warriors ', participants: [' PSIKOI', '__Zezima '] },
          { name: 'Scouts ', participants: ['hydrox6', 'usbc'] }
        ]
      });

      expect(response.status).toBe(201);
      expect(response.body.competition).toMatchObject({
        title: 'Soul Wars Competition',
        metric: 'soul_wars_zeal',
        startsAt: startDate.toISOString(),
        endsAt: endDate.toISOString(),
        participantCount: 4
      });
      expect(response.body.competition.groupId).toBeNull();
      expect(response.body.competition.group).not.toBeDefined();
      expect(response.body.competition.verificationHash).not.toBeDefined();
      expect(response.body.competition.participations.length).toBe(4);

      const sortedParticipants = response.body.competition.participations.sort(
        (a, b) => a.player.id - b.player.id
      );

      expect(sortedParticipants[0]).toMatchObject({
        player: { username: 'psikoi' },
        teamName: 'Warriors'
      });

      expect(sortedParticipants[1]).toMatchObject({
        player: { username: 'zezima' },
        teamName: 'Warriors'
      });

      expect(sortedParticipants[2]).toMatchObject({
        player: { username: 'usbc' },
        teamName: 'Scouts'
      });

      expect(sortedParticipants[3]).toMatchObject({
        player: { username: 'hydrox6' },
        teamName: 'Scouts'
      });

      // Reset the timers to the current (REAL) time
      jest.useRealTimers();

      expect(onCompetitionCreatedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Soul Wars Competition',
          metric: 'soul_wars_zeal'
        })
      );

      expect(onParticipantsJoinedEvent).toHaveBeenCalledWith(expect.objectContaining({ length: 4 }));

      globalData.testCompetitionEnding = {
        id: response.body.competition.id,
        verificationCode: response.body.verificationCode
      };
    });

    it('should create (no teams)', async () => {
      // Fake the current date to be 2 days ago
      jest.useFakeTimers('modern').setSystemTime(new Date(Date.now() - 172_800_000));

      const startDate = new Date(Date.now() + 10_000);
      const endDate = new Date(Date.now() + 100_000);

      // Started 2 days ago, ended 2 days (and 90 seconds) ago
      const response = await api.post('/competitions').send({
        title: 'OVERALL Competition ',
        metric: 'overall',
        startsAt: startDate,
        endsAt: endDate,
        groupId: globalData.testGroup.id,
        groupVerificationCode: globalData.testGroup.verificationCode,
        teams: []
      });

      expect(response.status).toBe(201);
      expect(response.body.competition).toMatchObject({
        title: 'OVERALL Competition',
        metric: 'overall',
        startsAt: startDate.toISOString(),
        endsAt: endDate.toISOString(),
        participantCount: 2
      });
      expect(response.body.competition.groupId).toBe(globalData.testGroup.id);
      expect(response.body.competition.group.id).toBe(globalData.testGroup.id);
      expect(response.body.competition.group.verificationHash).not.toBeDefined();
      expect(response.body.competition.verificationHash).not.toBeDefined();
      expect(response.body.competition.participations.length).toBe(2);

      // Reset the timers to the current (REAL) time
      jest.useRealTimers();

      expect(onCompetitionCreatedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'OVERALL Competition',
          metric: 'overall'
        })
      );

      expect(onParticipantsJoinedEvent).toHaveBeenCalledWith(expect.objectContaining({ length: 2 }));

      globalData.testCompetitionEnded = {
        id: response.body.competition.id,
        verificationCode: response.body.verificationCode
      };
    });

    it('should create (w/ teams and group)', async () => {
      // Fake the current date to be 2 days ago
      jest.useFakeTimers('modern').setSystemTime(new Date(Date.now() - 172_800_000));

      const startDate = new Date(Date.now() + 10_000);
      const endDate = new Date(Date.now() + 10_000 + 174_000_000);

      // Started 2 days ago, ending in 20 mins
      const response = await api.post('/competitions').send({
        title: 'Fishing Competition ',
        metric: 'fishing',
        startsAt: startDate,
        endsAt: endDate,
        teams: [
          { name: '_Warriors ', participants: [' PSIKOI', '__Zezima '] },
          { name: 'Scouts ', participants: ['hydrox6', 'usbc'] }
        ],
        groupId: globalData.testGroup.id,
        groupVerificationCode: globalData.testGroup.verificationCode
      });

      expect(response.status).toBe(201);
      expect(response.body.competition).toMatchObject({
        title: 'Fishing Competition',
        metric: 'fishing',
        startsAt: startDate.toISOString(),
        endsAt: endDate.toISOString(),
        groupId: globalData.testGroup.id,
        participantCount: 4
      });

      expect(response.body.competition.groupId).toBe(globalData.testGroup.id);
      expect(response.body.competition.verificationHash).not.toBeDefined();
      expect(response.body.competition.group).toMatchObject({
        id: globalData.testGroup.id
      });

      expect(onCompetitionCreatedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Fishing Competition',
          metric: 'fishing'
        })
      );

      expect(onParticipantsJoinedEvent).toHaveBeenCalledWith(expect.objectContaining({ length: 4 }));

      globalData.testCompetitionWithGroup = {
        id: response.body.competition.id,
        verificationCode: response.body.verificationCode
      };

      // Reset the timers to the current (REAL) time
      jest.useRealTimers();
    });
  });

  describe('2 - Edit', () => {
    it('should not edit (competition not found)', async () => {
      const response = await api.put(`/competitions/100000`).send({
        title: 'Some New Title',
        verificationCode: 'xxx-xxx-xxx'
      });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Competition not found.');

      expect(onParticipantsJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not edit (empty title)', async () => {
      const response = await api.put(`/competitions/${globalData.testCompetitionStarting.id}`).send({
        title: '',
        verificationCode: globalData.testCompetitionStarting.verificationCode
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Competition title must have at least one character.');

      expect(onParticipantsJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not edit (title too long)', async () => {
      const response = await api.put(`/competitions/${globalData.testCompetitionStarting.id}`).send({
        title: 'jklasjhfklsdhnfkjsdnfkdjsnfkdjsnfkjsdnfksdjnfksdjnjklasjhfklsdhnfkjsdnfkdjsnfkdjsnfkjsdnfksd',
        verificationCode: globalData.testCompetitionStarting.verificationCode
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Competition title cannot be longer than 50 characters.');

      expect(onParticipantsJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not edit (nothing to update)', async () => {
      const response = await api.put(`/competitions/${globalData.testCompetitionStarting.id}`).send({
        verificationCode: globalData.testCompetitionStarting.verificationCode
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Nothing to update.');

      expect(onParticipantsJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not edit (invalid metric)', async () => {
      const response = await api.put(`/competitions/${globalData.testCompetitionStarting.id}`).send({
        metric: 'sailing',
        verificationCode: globalData.testCompetitionStarting.verificationCode
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid enum value for 'metric'.");

      expect(onParticipantsJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not edit (end date before start date)', async () => {
      const response = await api.put(`/competitions/${globalData.testCompetitionStarting.id}`).send({
        startsAt: new Date(Date.now() + 3_600_000),
        endsAt: new Date(Date.now() + 1_200_000),
        verificationCode: globalData.testCompetitionStarting.verificationCode
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Start date must be before the end date.');

      expect(onParticipantsJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not edit (invalid participants list)', async () => {
      const response = await api.put(`/competitions/${globalData.testCompetitionStarting.id}`).send({
        verificationCode: globalData.testCompetitionStarting.verificationCode,
        participants: 123
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Parameter 'participants' is not a valid array.");

      expect(onParticipantsJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not edit (invalid player name)', async () => {
      const response = await api.put(`/competitions/${globalData.testCompetitionStarting.id}`).send({
        verificationCode: globalData.testCompetitionStarting.verificationCode,
        participants: ['psikoi', 'areallylongusername']
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Found 1 invalid usernames:');
      expect(response.body.data).toContain('areallylongusername');

      expect(onParticipantsJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not edit (invalid teams list type)', async () => {
      const response = await api.put(`/competitions/${globalData.testCompetitionEnding.id}`).send({
        verificationCode: globalData.testCompetitionEnding.verificationCode,
        teams: 123
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'teams' is not a valid array.");

      expect(onParticipantsJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not edit (invalid team shape)', async () => {
      const response = await api.put(`/competitions/${globalData.testCompetitionEnding.id}`).send({
        verificationCode: globalData.testCompetitionEnding.verificationCode,
        teams: [{ hey: 'bye' }]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(
        'Invalid teams list. Must be an array of { name: string; participants: string[]; }.'
      );

      expect(onParticipantsJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not edit (invalid team players list)', async () => {
      const response = await api.put(`/competitions/${globalData.testCompetitionEnding.id}`).send({
        verificationCode: globalData.testCompetitionEnding.verificationCode,
        teams: [{ name: '?', participants: 123 }]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(
        'Invalid teams list. Must be an array of { name: string; participants: string[]; }.'
      );

      expect(onParticipantsJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not edit (undefined team players list)', async () => {
      const response = await api.put(`/competitions/${globalData.testCompetitionEnding.id}`).send({
        verificationCode: globalData.testCompetitionEnding.verificationCode,
        teams: [{ name: '?' }]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(
        'Invalid teams list. Must be an array of { name: string; participants: string[]; }.'
      );

      expect(onParticipantsJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not edit (empty team players list)', async () => {
      const response = await api.put(`/competitions/${globalData.testCompetitionEnding.id}`).send({
        verificationCode: globalData.testCompetitionEnding.verificationCode,
        teams: [{ name: '?', participants: [] }]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('All teams must have a valid non-empty participants array.');

      expect(onParticipantsJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not edit (undefined team name)', async () => {
      const response = await api.put(`/competitions/${globalData.testCompetitionEnding.id}`).send({
        verificationCode: globalData.testCompetitionEnding.verificationCode,
        teams: [{ participants: ['zezima', 'psikoi'] }]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(
        'Invalid teams list. Must be an array of { name: string; participants: string[]; }.'
      );

      expect(onParticipantsJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not edit (empty team name)', async () => {
      const response = await api.put(`/competitions/${globalData.testCompetitionEnding.id}`).send({
        verificationCode: globalData.testCompetitionEnding.verificationCode,
        teams: [{ name: '', participants: ['zezima', 'psikoi'] }]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Team names must have at least one character.');

      expect(onParticipantsJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not edit (team name too long)', async () => {
      const response = await api.put(`/competitions/${globalData.testCompetitionEnding.id}`).send({
        verificationCode: globalData.testCompetitionEnding.verificationCode,
        teams: [{ name: 'hjsdfhfiwsehflskdhfsdkljfhsdljkfhdsljkfh', participants: ['zezima', 'psikoi'] }]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Team names cannot be longer than 30 characters.');

      expect(onParticipantsJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not edit (duplicated team name)', async () => {
      const response = await api.put(`/competitions/${globalData.testCompetitionEnding.id}`).send({
        verificationCode: globalData.testCompetitionEnding.verificationCode,
        teams: [
          { name: 'warriors_', participants: ['zezima', 'psikoi'] },
          { name: ' WARRIORS', participants: ['hydrox6', 'jakesterwars'] }
        ]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Found repeated team names: [warriors]');

      expect(onParticipantsJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not edit (duplicated team players)', async () => {
      const response = await api.put(`/competitions/${globalData.testCompetitionEnding.id}`).send({
        verificationCode: globalData.testCompetitionEnding.verificationCode,
        teams: [
          { name: 'warriors', participants: ['zezima', 'psikoi'] },
          { name: 'soldiers', participants: ['hydrox6', '_ZEZIMA'] }
        ]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Found repeated usernames: [zezima]');

      expect(onParticipantsJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not edit (undefined verification code)', async () => {
      const response = await api.put(`/competitions/${globalData.testCompetitionEnding.id}`).send({
        title: 'Something'
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'verificationCode' is required.");

      expect(onParticipantsJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not edit (incorrect verification code)', async () => {
      const response = await api.put(`/competitions/${globalData.testCompetitionEnding.id}`).send({
        title: 'Something',
        verificationCode: 'xxx-xxx-xxx'
      });

      expect(response.status).toBe(403);
      expect(response.body.message).toMatch('Incorrect verification code.');

      expect(onParticipantsJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not edit teams (cannot change to classic competition)', async () => {
      const response = await api.put(`/competitions/${globalData.testCompetitionEnding.id}`).send({
        participants: ['zezima', 'sethmare'],
        verificationCode: globalData.testCompetitionEnding.verificationCode
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("The competition type cannot be changed to 'classic'.");

      expect(onParticipantsJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not edit teams (cannot change to team competition)', async () => {
      const response = await api.put(`/competitions/${globalData.testCompetitionStarting.id}`).send({
        teams: [{ name: 'Mods', participants: ['sethmare', 'boom'] }],
        verificationCode: globalData.testCompetitionStarting.verificationCode
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("The competition type cannot be changed to 'team'.");

      expect(onParticipantsJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not edit teams (team competition, undefined teams, defined participants)', async () => {
      const getResponse = await api.get(`/competitions/${globalData.testCompetitionEnding.id}`);
      expect(getResponse.status).toBe(200);

      const response = await api.put(`/competitions/${globalData.testCompetitionEnding.id}`).send({
        verificationCode: globalData.testCompetitionEnding.verificationCode,
        title: getResponse.body.title,
        teams: undefined, // make sure this doesn't override the existing teams
        participants: [] // make sure this doesn't override the existing teams
      });

      expect(response.status).toBe(200);
      expect(response.body.participations.length).toBeGreaterThan(0);
      expect(getResponse.body.participations.length).toEqual(response.body.participations.length);
    });

    it('should not edit teams (team competition, undefined teams, undefined participants)', async () => {
      const getResponse = await api.get(`/competitions/${globalData.testCompetitionEnding.id}`);
      expect(getResponse.status).toBe(200);

      const response = await api.put(`/competitions/${globalData.testCompetitionEnding.id}`).send({
        verificationCode: globalData.testCompetitionEnding.verificationCode,
        title: getResponse.body.title,
        teams: undefined, // make sure this doesn't override the existing teams
        participants: undefined // make sure this doesn't override the existing teams
      });

      expect(response.status).toBe(200);
      expect(response.body.participations.length).toBeGreaterThan(0);
      expect(getResponse.body.participations.length).toEqual(response.body.participations.length);
    });

    it('should not edit participants (classic competition, undefined participants, defined teams)', async () => {
      const getResponse = await api.get(`/competitions/${globalData.testCompetitionStarted.id}`);
      expect(getResponse.status).toBe(200);

      const response = await api.put(`/competitions/${globalData.testCompetitionStarted.id}`).send({
        verificationCode: globalData.testCompetitionStarted.verificationCode,
        title: getResponse.body.title,
        participants: undefined, // make sure this doesn't override the existing participants
        teams: [] // make sure this doesn't override the existing participants
      });

      expect(response.status).toBe(200);
      expect(response.body.participations.length).toBeGreaterThan(0);
      expect(getResponse.body.participations.length).toEqual(response.body.participations.length);
    });

    it('should not edit participants (classic competition, undefined participants, undefined teams)', async () => {
      const getResponse = await api.get(`/competitions/${globalData.testCompetitionEnding.id}`);
      expect(getResponse.status).toBe(200);

      const response = await api.put(`/competitions/${globalData.testCompetitionEnding.id}`).send({
        verificationCode: globalData.testCompetitionEnding.verificationCode,
        title: getResponse.body.title,
        teams: undefined, // make sure this doesn't override the existing participants
        participants: undefined // make sure this doesn't override the existing participants
      });

      expect(response.status).toBe(200);
      expect(response.body.participations.length).toBeGreaterThan(0);
      expect(getResponse.body.participations.length).toEqual(response.body.participations.length);
    });

    it('should edit (own fields)', async () => {
      const response = await api.put(`/competitions/${globalData.testCompetitionStarting.id}`).send({
        verificationCode: globalData.testCompetitionStarting.verificationCode,
        title: '_Worked! 👍 ',
        metric: 'agility'
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        title: 'Worked! 👍',
        metric: 'agility'
      });
      expect(response.body.participantCount).toBe(0);
      expect(response.body.participations.length).toBe(0);
      expect(response.body.groupId).toBe(null);
      expect(response.body.group).not.toBeDefined();
      expect(response.body.verificationHash).not.toBeDefined();

      expect(onParticipantsJoinedEvent).not.toHaveBeenCalled();
    });

    it('should edit participants', async () => {
      const detailsBeforeResponse = await api.get(`/competitions/${globalData.testCompetitionStarted.id}`);
      expect(detailsBeforeResponse.status).toBe(200);
      expect(detailsBeforeResponse.body.participations.length).toBe(4);
      expect(detailsBeforeResponse.body.participantCount).toBe(4);

      const response = await api.put(`/competitions/${globalData.testCompetitionStarted.id}`).send({
        // should ignore these dates because they are the same as the current ones
        // even though startsAt is in the past
        startsAt: detailsBeforeResponse.body.startsAt,
        endsAt: detailsBeforeResponse.body.endsAt,
        verificationCode: globalData.testCompetitionStarted.verificationCode,
        participants: ['psikoi', ' RORRO', '_usbc ', 'hydrox6'],
        teams: [] // make sure this doesn't override the new participants
      });

      expect(response.status).toBe(200);
      expect(response.body.participantCount).toBe(4);
      expect(response.body.participations.length).toBe(4);
      expect(response.body.groupId).toBe(null);
      expect(response.body.group).not.toBeDefined();
      expect(response.body.verificationHash).not.toBeDefined();

      // Only hydrox6 was added, the other 3 were already participants
      expect(onParticipantsJoinedEvent).toHaveBeenCalledWith(expect.objectContaining({ length: 1 }));

      const participantUsernames = response.body.participations.map(p => p.player.username);

      expect(participantUsernames).toContain('psikoi');
      expect(participantUsernames).toContain('rorro');
      expect(participantUsernames).toContain('usbc');
      expect(participantUsernames).toContain('hydrox6');

      const detailsResponse = await api.get(`/competitions/${globalData.testCompetitionStarted.id}`);
      expect(detailsResponse.status).toBe(200);
      expect(detailsResponse.body.participations.length).toBe(4);
      expect(detailsResponse.body.participantCount).toBe(4);

      // ensure competition.updatedAt has been updated
      expect(new Date(detailsResponse.body.updatedAt).getTime()).toBeGreaterThan(
        new Date(detailsBeforeResponse.body.updatedAt).getTime()
      );
    });

    it('should edit teams', async () => {
      const createResponse = await api.post('/competitions').send({
        title: 'Test Test',
        metric: 'mimic',
        startsAt: new Date(Date.now() + 1_200_000),
        endsAt: new Date(Date.now() + 1_200_000 + 604_800_000),
        teams: [
          { name: 'Team A', participants: ['johnny123', 'MIKE01'] },
          { name: 'Team B', participants: ['ruben_', ' seth   _'] },
          { name: 'Team C', participants: ['jake0011011', 'alexcantfly'] },
          { name: 'Team D', participants: ['alice', 'MARIA   '] }
        ],
        participants: [] // make sure this doesn't override the new teams
      });

      expect(createResponse.status).toBe(201);
      expect(onParticipantsJoinedEvent).toHaveBeenCalledWith(expect.objectContaining({ length: 8 }));

      jest.resetAllMocks();

      const response = await api.put(`/competitions/${createResponse.body.competition.id}`).send({
        verificationCode: createResponse.body.verificationCode,
        teams: [
          { name: 'Team A', participants: ['emanuel', 'gerard'] },
          { name: ' Team B', participants: ['ruben_', ' seth   _'] },
          { name: 'Team C ', participants: ['jake0011011', ' ALICE '] },
          { name: 'Team_D', participants: ['MARIA   ', 'alexcantfly'] },
          { name: 'Team_E', participants: ['alanturing', 'luigi'] }
        ],
        participants: undefined // make sure this doesn't override the new teams
      });

      expect(response.status).toBe(200);
      expect(response.body.participations.length).toBe(10);
      expect(response.body.groupId).toBe(null);
      expect(response.body.group).not.toBeDefined();
      expect(response.body.verificationHash).not.toBeDefined();

      // Only 4 players were added (the other 6 were already participants)
      expect(onParticipantsJoinedEvent).toHaveBeenCalledWith(expect.objectContaining({ length: 4 }));

      const usernameTeamMap: { [username: string]: string } = {};

      response.body.participations.forEach(p => {
        usernameTeamMap[p.player.username] = p.teamName;
      });

      // these two players were removed
      expect(usernameTeamMap['johnny123']).not.toBeDefined();
      expect(usernameTeamMap['mike01']).not.toBeDefined();

      // Added two new players to Team A
      expect(usernameTeamMap['emanuel']).toBe('Team A');
      expect(usernameTeamMap['gerard']).toBe('Team A');

      // Team B has had no changes
      expect(usernameTeamMap['ruben']).toBe('Team B');
      expect(usernameTeamMap['seth']).toBe('Team B');

      // alexcantfly has left Team C, alice has joined
      expect(usernameTeamMap['jake0011011']).toBe('Team C');
      expect(usernameTeamMap['alice']).toBe('Team C');

      // alice has left Team D, alexcantfly has joined
      expect(usernameTeamMap['alexcantfly']).toBe('Team D');
      expect(usernameTeamMap['maria']).toBe('Team D');

      // brand new team was added
      expect(usernameTeamMap['alanturing']).toBe('Team E');
      expect(usernameTeamMap['luigi']).toBe('Team E');

      const detailsResponse = await api.get(`/competitions/${createResponse.body.competition.id}`);
      expect(detailsResponse.status).toBe(200);
      expect(detailsResponse.body.participantCount).toBe(10);
      expect(detailsResponse.body.participations.length).toBe(10);

      // ensure competition.updatedAt has been updated
      expect(new Date(detailsResponse.body.updatedAt).getTime()).toBeGreaterThan(
        new Date(createResponse.body.competition.updatedAt).getTime()
      );

      // Test if it's possible to empty all teams for an existing competition
      const emptyGroupResponse = await api.put(`/competitions/${createResponse.body.competition.id}`).send({
        verificationCode: createResponse.body.verificationCode,
        teams: []
      });

      expect(emptyGroupResponse.status).toBe(200);
      expect(emptyGroupResponse.body.participations.length).toBe(0);

      // Remove this competition as to not mess any previously created tests (ran after this)
      const deleteResponse = await api
        .delete(`/competitions/${createResponse.body.competition.id}`)
        .send({ verificationCode: createResponse.body.verificationCode });

      expect(deleteResponse.status).toBe(200);
    });

    it('should edit teams (and own fields)', async () => {
      const response = await api.put(`/competitions/${globalData.testCompetitionEnding.id}`).send({
        verificationCode: globalData.testCompetitionEnding.verificationCode,
        title: '_SoulWars Competition',
        teams: [
          { name: 'Mods', participants: [' SETHMARE', 'boom__'] },
          { name: 'Contributors', participants: [' psikoi', 'RORRO', 'JAKEsterwars', '__USBC'] },
          { name: 'Cool Guys', participants: [' hydrox6', '_alexsuperfly'] }
        ],
        participants: undefined // make sure this doesn't override the new teams
      });

      expect(response.status).toBe(200);
      expect(response.body.participations.length).toBe(8);
      expect(response.body.participations.map(p => p.player.username)).not.toContain('zezima'); // player got removed
      expect(response.body.title).toBe('SoulWars Competition');

      // psikoi, hydrox6 and usbc were already in the competition, only 5 new players joined
      expect(onParticipantsJoinedEvent).toHaveBeenCalledWith(expect.objectContaining({ length: 5 }));
    });
  });

  describe('3 - Search', () => {
    it('should not search competitions (invalid status)', async () => {
      const response = await api.get('/competitions').query({ status: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        "Invalid enum value for 'status'. Expected upcoming | ongoing | finished"
      );
    });

    it('should not search competitions (invalid metric)', async () => {
      const response = await api.get('/competitions').query({ metric: 'sailing' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid enum value for 'metric'.");
    });

    it('should not search competitions (invalid type)', async () => {
      const response = await api.get('/competitions').query({ type: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid enum value for 'type'. Expected classic | team");
    });

    it('should search competitions', async () => {
      await prisma.competition.update({
        where: { id: globalData.testCompetitionStarting.id },
        data: { score: 100 }
      });

      await prisma.competition.update({
        where: { id: globalData.testCompetitionEnding.id },
        data: { score: 30 }
      });

      const response = await api.get('/competitions');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(7);

      // Hashes shouldn't be exposed to the API consumer
      expect(response.body.filter(c => !!c.verificationHash).length).toBe(0);

      // These should be ordered by score, then id
      expect(response.body[0]).toMatchObject({
        id: globalData.testCompetitionStarting.id,
        title: 'Worked! 👍',
        type: 'classic',
        metric: 'agility',
        participantCount: 0
      });

      expect(response.body[1]).toMatchObject({
        id: globalData.testCompetitionEnding.id,
        title: 'SoulWars Competition',
        type: 'team',
        metric: 'soul_wars_zeal',
        participantCount: 8
      });

      expect(response.body[2]).toMatchObject({
        id: globalData.testCompetitionWithGroup.id,
        title: 'Fishing Competition',
        type: 'team',
        metric: 'fishing',
        participantCount: 4
      });

      expect(response.body[3]).toMatchObject({
        id: globalData.testCompetitionEnded.id,
        title: 'OVERALL Competition',
        type: 'classic',
        metric: 'overall',
        groupId: globalData.testGroup.id,
        group: {
          id: globalData.testGroup.id,
          memberCount: 2
        },
        participantCount: 2
      });

      expect(response.body[4]).toMatchObject({
        id: globalData.testCompetitionOngoing.id,
        title: 'SOTW Thieving 💰 #5',
        type: 'classic',
        metric: 'thieving',
        participantCount: 4
      });

      expect(response.body[5]).toMatchObject({
        id: globalData.testCompetitionStartedTeam.id,
        title: 'Team Comp Test 123',
        type: 'team',
        metric: 'zulrah',
        participantCount: 4
      });

      expect(response.body[6]).toMatchObject({
        id: globalData.testCompetitionStarted.id,
        title: 'BOTW Zulrah #3',
        type: 'classic',
        metric: 'zulrah',
        participantCount: 4
      });
    });

    it('should search competitions (w/ title filter)', async () => {
      const response = await api.get('/competitions').query({ title: 'competition' });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(3);

      // Hashes shouldn't be exposed to the API consumer
      expect(response.body.filter(c => !!c.verificationHash).length).toBe(0);
    });

    it('should search competitions (w/ title filter, leading/trailing whitespace)', async () => {
      const response = await api.get('/competitions').query({ title: '  competition  ' });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(3);

      // Hashes shouldn't be exposed to the API consumer
      expect(response.body.filter(c => !!c.verificationHash).length).toBe(0);
    });

    it('should search competitions (w/ title & status filter)', async () => {
      const response = await api.get('/competitions').query({ title: 'competition', status: 'ongoing' });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);

      // Hashes shouldn't be exposed to the API consumer
      expect(response.body.filter(c => !!c.verificationHash).length).toBe(0);
    });

    it('should search competitions (w/ metric filter)', async () => {
      const response = await api.get('/competitions').query({ metric: 'zulrah' });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);

      // Hashes shouldn't be exposed to the API consumer
      expect(response.body.filter(c => !!c.verificationHash).length).toBe(0);
    });

    it('should search competitions (w/ type filter)', async () => {
      const response = await api.get('/competitions').query({ type: 'team' });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(3);
      expect(response.body[0].id).toBe(globalData.testCompetitionEnding.id);
      expect(response.body[1].id).toBe(globalData.testCompetitionWithGroup.id);
      expect(response.body[2].id).toBe(globalData.testCompetitionStartedTeam.id);

      // Hashes shouldn't be exposed to the API consumer
      expect(response.body.filter(c => !!c.verificationHash).length).toBe(0);
    });

    it('should search competitions (w/ limit)', async () => {
      const response = await api.get('/competitions').query({ type: 'classic', limit: 2 });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2); // 4 results, limited to 2

      expect(response.body[0]).toMatchObject({
        id: globalData.testCompetitionStarting.id,
        title: 'Worked! 👍',
        type: 'classic',
        metric: 'agility',
        participantCount: 0
      });

      expect(response.body[1]).toMatchObject({
        id: globalData.testCompetitionEnded.id,
        title: 'OVERALL Competition',
        type: 'classic',
        metric: 'overall',
        groupId: globalData.testGroup.id,
        group: {
          id: globalData.testGroup.id,
          memberCount: 2
        },
        participantCount: 2
      });

      // Hashes shouldn't be exposed to the API consumer
      expect(response.body.filter(c => !!c.verificationHash).length).toBe(0);
    });

    it('should search competitions (w/ limit & offset)', async () => {
      const response = await api.get('/competitions').query({ type: 'classic', limit: 2, offset: 1 });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2); // 4 results, limited to 2

      expect(response.body[0]).toMatchObject({
        id: globalData.testCompetitionEnded.id,
        title: 'OVERALL Competition',
        type: 'classic',
        metric: 'overall',
        groupId: globalData.testGroup.id,
        group: {
          id: globalData.testGroup.id,
          memberCount: 2
        },
        participantCount: 2
      });

      expect(response.body[1]).toMatchObject({
        id: globalData.testCompetitionOngoing.id,
        title: 'SOTW Thieving 💰 #5',
        type: 'classic',
        metric: 'thieving',
        participantCount: 4
      });

      // Hashes shouldn't be exposed to the API consumer
      expect(response.body.filter(c => !!c.verificationHash).length).toBe(0);
    });

    it('should not search competitions (negative offset)', async () => {
      const response = await api.get(`/competitions`).query({ offset: -5 });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'offset' must be >= 0.");
    });

    it('should not search competitions (negative limit)', async () => {
      const response = await api.get(`/competitions`).query({ limit: -5 });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'limit' must be > 0.");
    });

    it('should not search competitions (limit > 50)', async () => {
      const response = await api.get(`/competitions`).query({ limit: 1000 });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('The maximum results limit is 50');
    });
  });

  describe('4 - Add Participants', () => {
    it('should not add participants (invalid verification code)', async () => {
      const response = await api.post('/competitions/1000/participants').send({ participants: ['psikoi'] });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'verificationCode' is required.");

      expect(onParticipantsJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not add participants (competition not found)', async () => {
      const response = await api.post('/competitions/1000/participants').send({
        verificationCode: 'XYZ',
        participants: ['psikoi']
      });

      expect(response.status).toBe(404);
      expect(response.body.message).toMatch('Competition not found.');

      expect(onParticipantsJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not add participants (incorrect verification code)', async () => {
      const response = await api
        .post(`/competitions/${globalData.testCompetitionStarting.id}/participants`)
        .send({
          verificationCode: 'XYZ',
          participants: ['psikoi']
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toMatch('Incorrect verification code.');

      expect(onParticipantsJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not add participants (undefined participant list)', async () => {
      const response = await api
        .post(`/competitions/${globalData.testCompetitionStarting.id}/participants`)
        .send({
          verificationCode: globalData.testCompetitionStarting.verificationCode
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'participants' is undefined.");

      expect(onParticipantsJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not add participants (invalid participant list)', async () => {
      const response = await api
        .post(`/competitions/${globalData.testCompetitionStarting.id}/participants`)
        .send({
          participants: 123,
          verificationCode: globalData.testCompetitionStarting.verificationCode
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'participants' is not a valid array.");

      expect(onParticipantsJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not add participants (empty participant list)', async () => {
      const response = await api
        .post(`/competitions/${globalData.testCompetitionStarting.id}/participants`)
        .send({
          participants: [],
          verificationCode: globalData.testCompetitionStarting.verificationCode
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Empty participants list.');

      expect(onParticipantsJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not add participants (invalid participant username)', async () => {
      const response = await api
        .post(`/competitions/${globalData.testCompetitionStarting.id}/participants`)
        .send({
          participants: [123, {}],
          verificationCode: globalData.testCompetitionStarting.verificationCode
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Found 2 invalid usernames:');

      expect(onParticipantsJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not add participants (repeated participant username)', async () => {
      const response = await api
        .post(`/competitions/${globalData.testCompetitionStarting.id}/participants`)
        .send({
          participants: ['zezima', 'psikoi', 'rorro', '_ZEZIMA', 'sethmare', ' ROrro__'],
          verificationCode: globalData.testCompetitionStarting.verificationCode
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Found repeated usernames: [zezima, rorro]');

      expect(onParticipantsJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not add participants (already participants)', async () => {
      const response = await api
        .post(`/competitions/${globalData.testCompetitionStarted.id}/participants`)
        .send({
          participants: ['rorro', 'psikoi'],
          verificationCode: globalData.testCompetitionStarted.verificationCode
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('All players given are already competing.');

      expect(onParticipantsJoinedEvent).not.toHaveBeenCalled();
    });

    it('should not add participants (team competition)', async () => {
      const response = await api
        .post(`/competitions/${globalData.testCompetitionEnding.id}/participants`)
        .send({
          participants: ['rorro', 'psikoi'],
          verificationCode: globalData.testCompetitionEnding.verificationCode
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Cannot add participants to a team competition.');

      expect(onParticipantsJoinedEvent).not.toHaveBeenCalled();
    });

    it('should add participants', async () => {
      const before = await api.get(`/competitions/${globalData.testCompetitionStarted.id}`);
      expect(before.status).toBe(200);
      expect(before.body.participantCount).toBe(4);
      expect(before.body.participations.length).toBe(4);

      const response = await api
        .post(`/competitions/${globalData.testCompetitionStarted.id}/participants`)
        .send({
          participants: [' LYNX TITAN_', '__ZULU '],
          verificationCode: globalData.testCompetitionStarted.verificationCode
        });

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(2);

      expect(onParticipantsJoinedEvent).toHaveBeenCalledWith(expect.objectContaining({ length: 2 }));

      const after = await api.get(`/competitions/${globalData.testCompetitionStarted.id}`);
      expect(after.status).toBe(200);
      expect(after.body.participantCount).toBe(6); // had 4 previously
      expect(after.body.participations.length).toBe(6); // had 4 previously

      // ensure group.updatedAt has been updated
      expect(new Date(after.body.updatedAt).getTime()).toBeGreaterThan(
        new Date(before.body.updatedAt).getTime()
      );
    });
  });

  describe('5 - Remove Participants', () => {
    it('should not remove participants (invalid verification code)', async () => {
      const response = await api.delete('/competitions/1000/participants').send({ participants: ['psikoi'] });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'verificationCode' is required.");
    });

    it('should not remove participants (competition not found)', async () => {
      const response = await api.delete('/competitions/1000/participants').send({
        verificationCode: 'XYZ',
        participants: ['psikoi']
      });

      expect(response.status).toBe(404);
      expect(response.body.message).toMatch('Competition not found.');
    });

    it('should not remove participants (incorrect verification code)', async () => {
      const response = await api
        .delete(`/competitions/${globalData.testCompetitionStarting.id}/participants`)
        .send({
          verificationCode: 'XYZ',
          participants: ['psikoi']
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toMatch('Incorrect verification code.');
    });

    it('should not remove participants (undefined participant list)', async () => {
      const response = await api
        .delete(`/competitions/${globalData.testCompetitionStarting.id}/participants`)
        .send({
          verificationCode: globalData.testCompetitionStarting.verificationCode
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'participants' is undefined.");
    });

    it('should not remove participants (invalid participant list)', async () => {
      const response = await api
        .delete(`/competitions/${globalData.testCompetitionStarting.id}/participants`)
        .send({
          participants: 123,
          verificationCode: globalData.testCompetitionStarting.verificationCode
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'participants' is not a valid array.");
    });

    it('should not remove participants (empty participant list)', async () => {
      const response = await api
        .delete(`/competitions/${globalData.testCompetitionStarting.id}/participants`)
        .send({
          participants: [],
          verificationCode: globalData.testCompetitionStarting.verificationCode
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Empty participants list.');
    });

    it('should not remove participants (no valid players found)', async () => {
      const response = await api
        .delete(`/competitions/${globalData.testCompetitionOngoing.id}/participants`)
        .send({
          participants: ['random', 'aleatório'],
          verificationCode: globalData.testCompetitionOngoing.verificationCode
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('No valid tracked players were given.');
    });

    it('should not remove participants (no participants found)', async () => {
      const response = await api
        .delete(`/competitions/${globalData.testCompetitionOngoing.id}/participants`)
        .send({
          participants: ['random', 'aleatório', '  lynx TITAN_'],
          verificationCode: globalData.testCompetitionOngoing.verificationCode
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('None of the players given were competing.');
    });

    it('should not remove participants (team competition)', async () => {
      const response = await api
        .delete(`/competitions/${globalData.testCompetitionEnding.id}/participants`)
        .send({
          participants: ['rorro', 'psikoi'],
          verificationCode: globalData.testCompetitionEnding.verificationCode
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Cannot remove participants from a team competition.');
    });

    it('should remove participants', async () => {
      const before = await api.get(`/competitions/${globalData.testCompetitionOngoing.id}`);
      expect(before.status).toBe(200);
      expect(before.body.participantCount).toBe(4);
      expect(before.body.participations.length).toBe(4);

      const response = await api
        .delete(`/competitions/${globalData.testCompetitionOngoing.id}/participants`)
        .send({
          participants: ['rorro', 'psikoi', 'zulu'], // zulu isn't on this group, should be ignored
          verificationCode: globalData.testCompetitionOngoing.verificationCode
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Successfully removed 2 participants.');

      const after = await api.get(`/competitions/${globalData.testCompetitionOngoing.id}`);
      expect(after.status).toBe(200);
      expect(after.body.participantCount).toBe(2); // had 4 previously
      expect(after.body.participations.length).toBe(2); // had 4 previously

      // ensure group.updatedAt has been updated
      expect(new Date(after.body.updatedAt).getTime()).toBeGreaterThan(
        new Date(before.body.updatedAt).getTime()
      );
    });
  });

  describe('6 - Add Teams', () => {
    it('should not add teams (invalid verification code)', async () => {
      const response = await api.post(`/competitions/100000/teams`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Parameter 'verificationCode' is required.");
    });

    it('should not add teams (competition not found)', async () => {
      const response = await api.post(`/competitions/100000/teams`).send({ verificationCode: 'xxx-xxx-xxx' });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Competition not found.');
    });

    it('should not add teams (incorrect verification code)', async () => {
      const response = await api
        .post(`/competitions/${globalData.testCompetitionEnding.id}/teams`)
        .send({ verificationCode: 'xxx-xxx-xxx' });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Incorrect verification code.');
    });

    it('should not add teams (undefined teams list)', async () => {
      const response = await api
        .post(`/competitions/${globalData.testCompetitionEnding.id}/teams`)
        .send({ verificationCode: globalData.testCompetitionEnding.verificationCode });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Parameter 'teams' is not a valid array.");
    });

    it('should not add teams (invalid teams list)', async () => {
      const response = await api.post(`/competitions/${globalData.testCompetitionEnding.id}/teams`).send({
        teams: 123,
        verificationCode: globalData.testCompetitionEnding.verificationCode
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Parameter 'teams' is not a valid array.");
    });

    it('should not add teams (empty teams list)', async () => {
      const response = await api.post(`/competitions/${globalData.testCompetitionEnding.id}/teams`).send({
        teams: [],
        verificationCode: globalData.testCompetitionEnding.verificationCode
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Empty teams list.');
    });

    it('should not add teams (invalid team shape)', async () => {
      const response = await api.post(`/competitions/${globalData.testCompetitionEnding.id}/teams`).send({
        verificationCode: globalData.testCompetitionEnding.verificationCode,
        teams: [{ hey: 'bye' }]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(
        'Invalid teams list. Must be an array of { name: string; participants: string[]; }.'
      );
    });

    it('should not add teams (invalid team players list)', async () => {
      const response = await api.post(`/competitions/${globalData.testCompetitionEnding.id}/teams`).send({
        verificationCode: globalData.testCompetitionEnding.verificationCode,
        teams: [{ name: '?', participants: 123 }]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(
        'Invalid teams list. Must be an array of { name: string; participants: string[]; }.'
      );
    });

    it('should not add teams (undefined team players list)', async () => {
      const response = await api.post(`/competitions/${globalData.testCompetitionEnding.id}/teams`).send({
        verificationCode: globalData.testCompetitionEnding.verificationCode,
        teams: [{ name: '?' }]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(
        'Invalid teams list. Must be an array of { name: string; participants: string[]; }.'
      );
    });

    it('should not add teams (empty team players list)', async () => {
      const response = await api.post(`/competitions/${globalData.testCompetitionEnding.id}/teams`).send({
        verificationCode: globalData.testCompetitionEnding.verificationCode,
        teams: [{ name: '?', participants: [] }]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('All teams must have a valid non-empty participants array.');
    });

    it('should not add teams (invalid team player username)', async () => {
      const response = await api.post(`/competitions/${globalData.testCompetitionEnding.id}/teams`).send({
        verificationCode: globalData.testCompetitionEnding.verificationCode,
        teams: [{ name: 'Gang', participants: ['reallylongusername', 'zezima'] }]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Found 1 invalid usernames:');
      expect(response.body.data).toContain('reallylongusername');
    });

    it('should not add teams (undefined team name)', async () => {
      const response = await api.post(`/competitions/${globalData.testCompetitionEnding.id}/teams`).send({
        verificationCode: globalData.testCompetitionEnding.verificationCode,
        teams: [{ participants: ['psikoi'] }]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(
        'Invalid teams list. Must be an array of { name: string; participants: string[]; }.'
      );
    });

    it('should not add teams (invalid team name)', async () => {
      const response = await api.post(`/competitions/${globalData.testCompetitionEnding.id}/teams`).send({
        verificationCode: globalData.testCompetitionEnding.verificationCode,
        teams: [{ name: 123, participants: ['psikoi'] }]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(
        'Invalid teams list. Must be an array of { name: string; participants: string[]; }.'
      );
    });

    it('should not add teams (empty team name)', async () => {
      const response = await api.post(`/competitions/${globalData.testCompetitionEnding.id}/teams`).send({
        verificationCode: globalData.testCompetitionEnding.verificationCode,
        teams: [{ name: '', participants: ['psikoi'] }]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Team names must have at least one character.');
    });

    it('should not add teams (team name too long)', async () => {
      const response = await api.post(`/competitions/${globalData.testCompetitionEnding.id}/teams`).send({
        verificationCode: globalData.testCompetitionEnding.verificationCode,
        teams: [{ name: 'hjsdfhfiwsehflskdhfsdkljfhsdljkfhdsljkfh', participants: ['psikoi'] }]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Team names cannot be longer than 30 characters.');
    });

    it('should not add teams (duplicate team names in response)', async () => {
      const response = await api.post(`/competitions/${globalData.testCompetitionEnding.id}/teams`).send({
        verificationCode: globalData.testCompetitionEnding.verificationCode,
        teams: [
          { name: 'WARRIORS', participants: ['psikoi'] },
          { name: '_warriors', participants: ['zezima'] }
        ]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Found repeated team names: [warriors]');
    });

    it('should not add teams (duplicate team names in database)', async () => {
      const response = await api.post(`/competitions/${globalData.testCompetitionEnding.id}/teams`).send({
        verificationCode: globalData.testCompetitionEnding.verificationCode,
        teams: [
          { name: '__MODS', participants: ['zezima'] },
          { name: 'Soldiers', participants: ['boom', 'usbc'] }
        ]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Found repeated team names: [mods]');
    });

    it('should not add teams (duplicate team players in response)', async () => {
      const response = await api.post(`/competitions/${globalData.testCompetitionEnding.id}/teams`).send({
        verificationCode: globalData.testCompetitionEnding.verificationCode,
        teams: [
          { name: 'Warriors', participants: ['someguy', '__RORRO'] },
          { name: 'Soldiers', participants: ['sokka', 'rorro', 'toph'] }
        ]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Found repeated usernames: [rorro]');
    });

    it('should not add teams (duplicate team players in database)', async () => {
      const response = await api.post(`/competitions/${globalData.testCompetitionEnding.id}/teams`).send({
        verificationCode: globalData.testCompetitionEnding.verificationCode,
        teams: [{ name: 'Duplicates', participants: ['psikoi', 'hydrox6'] }]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Found repeated usernames: [psikoi, hydrox6]');
    });

    it('should not add teams (classic competition)', async () => {
      const response = await api.post(`/competitions/${globalData.testCompetitionOngoing.id}/teams`).send({
        verificationCode: globalData.testCompetitionOngoing.verificationCode,
        teams: [
          { name: 'Warriors', participants: ['psikoi', 'rorro'] },
          { name: 'Soldiers', participants: ['boom', 'usbc'] }
        ]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Cannot add teams to a classic competition.');
    });

    it('should add teams', async () => {
      const before = await api.get(`/competitions/${globalData.testCompetitionEnding.id}`);
      expect(before.status).toBe(200);
      expect(before.body.participantCount).toBe(8);
      expect(before.body.participations.length).toBe(8);

      const response = await api.post(`/competitions/${globalData.testCompetitionEnding.id}/teams`).send({
        verificationCode: globalData.testCompetitionEnding.verificationCode,
        teams: [
          { name: 'Fire Nation', participants: ['IROH__', '   Zuko'] },
          { name: 'Earth Kingdom', participants: ['bumi', 'TOPH', ' The Boulder'] },
          { name: 'Water Tribe', participants: ['katara', 'sokka'] }
        ]
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({ count: 7, message: 'Successfully added 7 participants.' });

      const after = await api.get(`/competitions/${globalData.testCompetitionEnding.id}`);
      expect(after.status).toBe(200);
      expect(after.body.participantCount).toBe(15); // had 8 previously
      expect(after.body.participations.length).toBe(15); // had 8 previously

      // ensure group.updatedAt has been updated
      expect(new Date(after.body.updatedAt).getTime()).toBeGreaterThan(
        new Date(before.body.updatedAt).getTime()
      );
    });
  });

  describe('7 - Remove Teams', () => {
    it('should not remove teams (invalid verification code)', async () => {
      const response = await api.delete(`/competitions/100000/teams`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Parameter 'verificationCode' is required.");
    });

    it('should not remove teams (competition not found)', async () => {
      const response = await api
        .delete(`/competitions/100000/teams`)
        .send({ verificationCode: 'xxx-xxx-xxx', teamNames: [] });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Competition not found.');
    });

    it('should not remove teams (incorrect verification code)', async () => {
      const response = await api
        .delete(`/competitions/${globalData.testCompetitionEnding.id}/teams`)
        .send({ verificationCode: 'xxx-xxx-xxx', teamNames: [] });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Incorrect verification code.');
    });

    it('should not remove teams (undefined teams list)', async () => {
      const response = await api
        .delete(`/competitions/${globalData.testCompetitionEnding.id}/teams`)
        .send({ verificationCode: globalData.testCompetitionEnding.verificationCode });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Parameter 'teamNames' is undefined.");
    });

    it('should not remove teams (invalid teams list)', async () => {
      const response = await api
        .delete(`/competitions/${globalData.testCompetitionEnding.id}/teams`)
        .send({ verificationCode: globalData.testCompetitionEnding.verificationCode, teamNames: 123 });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Parameter 'teamNames' is not a valid array.");
    });

    it('should not remove teams (empty teams list)', async () => {
      const response = await api
        .delete(`/competitions/${globalData.testCompetitionEnding.id}/teams`)
        .send({ verificationCode: globalData.testCompetitionEnding.verificationCode, teamNames: [] });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Empty team names list.');
    });

    it('should not remove teams (classic competition)', async () => {
      const response = await api.delete(`/competitions/${globalData.testCompetitionOngoing.id}/teams`).send({
        verificationCode: globalData.testCompetitionOngoing.verificationCode,
        teamNames: ['SomeName']
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Cannot remove teams from a classic competition.');
    });

    it('should not remove teams (no teams found)', async () => {
      const response = await api.delete(`/competitions/${globalData.testCompetitionEnding.id}/teams`).send({
        verificationCode: globalData.testCompetitionEnding.verificationCode,
        teamNames: ['SomeName', 'Random']
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('No players were removed from the competition.');
    });

    it('should remove teams', async () => {
      const before = await api.get(`/competitions/${globalData.testCompetitionEnding.id}`);
      expect(before.status).toBe(200);
      expect(before.body.participantCount).toBe(15);
      expect(before.body.participations.length).toBe(15);

      const response = await api.delete(`/competitions/${globalData.testCompetitionEnding.id}/teams`).send({
        verificationCode: globalData.testCompetitionEnding.verificationCode,
        teamNames: ['Fire Nation', 'Water Tribe']
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({ count: 4, message: 'Successfully removed 4 participants.' });

      const after = await api.get(`/competitions/${globalData.testCompetitionEnding.id}`);
      expect(after.status).toBe(200);
      expect(after.body.participantCount).toBe(11); // had 15 previously
      expect(after.body.participations.length).toBe(11); // had 15 previously

      // ensure group.updatedAt has been updated
      expect(new Date(after.body.updatedAt).getTime()).toBeGreaterThan(
        new Date(before.body.updatedAt).getTime()
      );
    });
  });

  describe('8 - View Details', () => {
    it('should not view details (competition not found)', async () => {
      const response = await api.get(`/competitions/100000`);

      expect(response.status).toBe(404);
      expect(response.body.message).toMatch('Competition not found.');
    });

    it('should not view details (invalid metric)', async () => {
      const response = await api.get(`/competitions/${globalData.testCompetitionStarted.id}`).query({
        metric: 'sailing'
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Invalid enum value for 'metric'.");
    });

    it('should view details', async () => {
      // This player was added to the test code after all the other tests were written
      // let's remove them instead of changing all the others tests to include them
      const removeParticipantResponse = await api
        .delete(`/competitions/${globalData.testCompetitionStarted.id}/participants`)
        .send({
          participants: ['hydrox6'],
          verificationCode: globalData.testCompetitionStarted.verificationCode
        });

      expect(removeParticipantResponse.status).toBe(200);

      // Competition started 20 (and 10s) minutes ago
      // Fake the current date to be 15 minutes ago
      jest.useFakeTimers('modern').setSystemTime(new Date(Date.now() - 900_000));

      // Track Lynx Titan once, this player won't be tracked again (only 1 snapshot during competition)
      const trackResponse1 = await api.post('/players/lynx titan');
      expect(trackResponse1.status).toBe(200);

      // Change the mock hiscores data to return unranked (-1) zulrah kc
      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: {
          statusCode: 200,
          rawData: modifyRawHiscoresData(globalData.hiscoresRawData, [
            { metric: 'zulrah', value: -1 },
            { metric: 'hunter', value: 50_000 }
          ])
        },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      // Track USBC once at -1 zulrah kc, will be tracked again later at > 50
      const trackResponse2 = await api.post('/players/usbc');
      expect(trackResponse2.status).toBe(200);

      // Change the mock hiscores data to return 500 zulrah kc
      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: {
          statusCode: 200,
          rawData: modifyRawHiscoresData(globalData.hiscoresRawData, [
            { metric: 'zulrah', value: 500 },
            { metric: 'hunter', value: 100_000 }
          ])
        },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      // Track Rorro once at 500 zulrah kc, will be tracked again later at > 500
      const trackResponse3 = await api.post('/players/rorro');
      expect(trackResponse3.status).toBe(200);

      // Change the mock hiscores data to return 1000 zulrah kc
      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: {
          statusCode: 200,
          rawData: modifyRawHiscoresData(globalData.hiscoresRawData, [
            { metric: 'zulrah', value: 1000 },
            { metric: 'hunter', value: 500_000 }
          ])
        },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      // Track Rorro once at 1000 zulrah kc, will be tracked again later at 1000 (no progress)
      const trackResponse4 = await api.post('/players/psikoi');
      expect(trackResponse4.status).toBe(200);

      // Reset the timers to the current (REAL) time
      jest.useRealTimers();

      // Wait a bit to allow the players' participations to be synced
      await sleep(500);

      // Change the mock hiscores data to return 60 zulrah kc
      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: {
          statusCode: 200,
          rawData: modifyRawHiscoresData(globalData.hiscoresRawData, [
            { metric: 'zulrah', value: 60 },
            { metric: 'hunter', value: 50_000 }
          ])
        },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      // Track USBC again at 60 kc (previously -1)
      const trackResponse2b = await api.post('/players/usbc');
      expect(trackResponse2b.status).toBe(200);

      // Change the mock hiscores data to return 557 zulrah kc
      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: {
          statusCode: 200,
          rawData: modifyRawHiscoresData(globalData.hiscoresRawData, [
            { metric: 'zulrah', value: 557 },
            { metric: 'hunter', value: 110_000 }
          ])
        },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      // Track Rorro again at 557 kc (previously 500)
      const trackResponse3b = await api.post('/players/rorro');
      expect(trackResponse3b.status).toBe(200);

      // Change the mock hiscores data to return 1000 zulrah kc
      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: {
          statusCode: 200,
          rawData: modifyRawHiscoresData(globalData.hiscoresRawData, [
            { metric: 'zulrah', value: 1000 },
            { metric: 'hunter', value: 750_000 }
          ])
        },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      // Track Psikoi again at 1000 kc (previously 1000)
      const trackResponse4b = await api.post('/players/psikoi');
      expect(trackResponse4b.status).toBe(200);

      // Wait a bit to allow the players' participations to be synced
      await sleep(500);

      const response = await api.get(`/competitions/${globalData.testCompetitionStarted.id}`);

      expect(response.status).toBe(200);

      expect(response.body).toMatchObject({
        id: globalData.testCompetitionStarted.id,
        title: 'BOTW Zulrah #3',
        type: 'classic',
        metric: 'zulrah',
        groupId: null
      });

      expect(response.body.participations.length).toBe(5);

      expect(response.body.participations[0]).toMatchObject({
        player: { username: 'rorro' },
        progress: { start: 500, end: 557, gained: 57 }
      });

      expect(response.body.participations[1]).toMatchObject({
        player: { username: 'usbc' },
        progress: { start: -1, end: 60, gained: 21 } // we start counting at 39 kc (min kc is 40)
      });

      expect(response.body.participations[2]).toMatchObject({
        player: { username: 'lynx titan' },
        progress: { start: 1646, end: 1646, gained: 0 }
      });

      expect(response.body.participations[3]).toMatchObject({
        player: { username: 'psikoi' },
        progress: { start: 1000, end: 1000, gained: 0 }
      });

      expect(response.body.participations[4]).toMatchObject({
        player: { username: 'zulu' },
        progress: { start: -1, end: -1, gained: 0 }
      });
    });

    it('should view details (other metric)', async () => {
      const response = await api
        .get(`/competitions/${globalData.testCompetitionStarted.id}`)
        .query({ metric: 'hunter' });

      expect(response.status).toBe(200);

      expect(response.body).toMatchObject({
        id: globalData.testCompetitionStarted.id,
        title: 'BOTW Zulrah #3',
        type: 'classic',
        metric: 'zulrah',
        groupId: null
      });

      expect(response.body.participations.length).toBe(5);

      expect(response.body.participations[0]).toMatchObject({
        player: { username: 'psikoi' },
        progress: { start: 500_000, end: 750_000, gained: 250_000 }
      });

      expect(response.body.participations[1]).toMatchObject({
        player: { username: 'rorro' },
        progress: { start: 100_000, end: 110_000, gained: 10_000 }
      });

      expect(response.body.participations[2]).toMatchObject({
        player: { username: 'lynx titan' },
        progress: { start: 5346679, end: 5346679, gained: 0 }
      });

      expect(response.body.participations[3]).toMatchObject({
        player: { username: 'usbc' },
        progress: { start: 50_000, end: 50_000, gained: 0 }
      });

      expect(response.body.participations[4]).toMatchObject({
        player: { username: 'zulu' },
        progress: { start: -1, end: -1, gained: 0 }
      });
    });
  });

  describe('9 - View Top 5 Snapshots', () => {
    it('should not view top 5 snapshots (competition not found)', async () => {
      const response = await api.get(`/competitions/100000/top-history`);

      expect(response.status).toBe(404);
      expect(response.body.message).toMatch('Competition not found.');
    });

    it('should not view top 5 snapshots (invalid metric)', async () => {
      const response = await api
        .get(`/competitions/${globalData.testCompetitionStarted.id}/top-history`)
        .query({ metric: 'sailing' });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Invalid enum value for 'metric'.");
    });

    it('should view top 5 snapshots', async () => {
      const response = await api.get(`/competitions/${globalData.testCompetitionStarted.id}/top-history`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(5);

      expect(response.body[0].player.username).toBe('rorro');
      expect(response.body[0].history.length).toBe(2);
      expect(response.body[0].history[0].value).toBe(557);
      expect(response.body[0].history[1].value).toBe(500);

      expect(response.body[1].player.username).toBe('usbc');
      expect(response.body[1].history.length).toBe(2);
      expect(response.body[1].history[0].value).toBe(60);
      expect(response.body[1].history[1].value).toBe(-1);

      expect(response.body[2].player.username).toBe('lynx titan');
      expect(response.body[2].history.length).toBe(1);
      expect(response.body[2].history[0].value).toBe(1646);

      expect(response.body[3].player.username).toBe('psikoi');
      expect(response.body[3].history.length).toBe(2);
      expect(response.body[3].history[0].value).toBe(1000);
      expect(response.body[3].history[1].value).toBe(1000);

      expect(response.body[4].player.username).toBe('zulu');
      expect(response.body[4].history.length).toBe(0);
    });

    it('should view top 5 snapshots (other metric)', async () => {
      const response = await api
        .get(`/competitions/${globalData.testCompetitionStarted.id}/top-history`)
        .query({ metric: 'hunter' });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(5);

      expect(response.body[0].player.username).toBe('psikoi');
      expect(response.body[0].history.length).toBe(2);
      expect(response.body[0].history[0].value).toBe(750_000);
      expect(response.body[0].history[1].value).toBe(500_000);

      expect(response.body[1].player.username).toBe('rorro');
      expect(response.body[1].history.length).toBe(2);
      expect(response.body[1].history[0].value).toBe(110_000);
      expect(response.body[1].history[1].value).toBe(100_000);

      expect(response.body[2].player.username).toBe('lynx titan');
      expect(response.body[2].history.length).toBe(1);
      expect(response.body[2].history[0].value).toBe(5_346_679);

      expect(response.body[3].player.username).toBe('usbc');
      expect(response.body[3].history.length).toBe(2);
      expect(response.body[3].history[0].value).toBe(50_000);
      expect(response.body[3].history[1].value).toBe(50_000);

      expect(response.body[4].player.username).toBe('zulu');
      expect(response.body[4].history.length).toBe(0);
    });
  });

  describe('10 - View CSV Export', () => {
    it('should not view CSV export (competition not found)', async () => {
      const response = await api.get(`/competitions/100000/csv`);

      expect(response.status).toBe(404);
      expect(response.body.message).toMatch('Competition not found.');
    });

    it('should not view CSV export (invalid metric)', async () => {
      const response = await api
        .get(`/competitions/${globalData.testCompetitionStarted.id}/csv`)
        .query({ metric: 'sailing' });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Invalid enum value for 'metric'.");
    });

    it('should not view CSV export (invalid table)', async () => {
      const response = await api
        .get(`/competitions/${globalData.testCompetitionStarted.id}/csv`)
        .query({ table: 'wrong' });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Invalid enum value for 'table'.");
    });

    it('should not view CSV export (no teamName)', async () => {
      const response = await api
        .get(`/competitions/${globalData.testCompetitionStarted.id}/csv`)
        .query({ table: 'team' });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(
        'Team name is a required parameter for the table type of "team".'
      );
    });

    it('should not view CSV export (team/teams table on a classic competition)', async () => {
      const response = await api
        .get(`/competitions/${globalData.testCompetitionStarted.id}/csv`)
        .query({ table: 'teams' });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Cannot view team/teams table on a classic competition.');
    });

    it('should view CSV export (participants)', async () => {
      const response = await api.get(`/competitions/${globalData.testCompetitionStarted.id}/csv`);
      expect(response.status).toBe(200);

      const rows = response.text.split('\n');

      expect(rows.length).toBe(6);

      // Check the table header
      expect(rows[0]).toBe('Rank,Username,Start,End,Gained,Last Updated');

      // Check the table body
      expect(rows[1]).toMatch('1,rorro,500,557,57,');
      expect(rows[2]).toMatch('2,usbc,-1,60,21,');
      expect(rows[3]).toMatch('3,LYNX TITAN,1646,1646,0,');
      expect(rows[4]).toMatch('4,Psikoi,1000,1000,0,');
      expect(rows[5]).toMatch('5,ZULU,-1,-1,0,');
    });

    it('should view CSV export (participants & other metric)', async () => {
      const response = await api.get(`/competitions/${globalData.testCompetitionStarted.id}/csv`).query({
        metric: 'hunter'
      });

      expect(response.status).toBe(200);

      const rows = response.text.split('\n');

      expect(rows.length).toBe(6);

      // Check the table header
      expect(rows[0]).toBe('Rank,Username,Start,End,Gained,Last Updated');

      // Check the table body
      expect(rows[1]).toMatch('1,Psikoi,500000,750000,250000,');
      expect(rows[2]).toMatch('2,rorro,100000,110000,10000,');
      expect(rows[3]).toMatch('3,LYNX TITAN,5346679,5346679,');
      expect(rows[4]).toMatch('4,usbc,50000,50000,0,');
      expect(rows[5]).toMatch('5,ZULU,-1,-1,0,');
    });

    it('should view CSV export (participants on team comp)', async () => {
      const response = await api.get(`/competitions/${globalData.testCompetitionStartedTeam.id}/csv`);
      expect(response.status).toBe(200);

      const rows = response.text.split('\n');

      expect(rows.length).toBe(5);

      // Check the table header, ensure it has a "Team" column
      expect(rows[0]).toBe('Rank,Username,Team,Start,End,Gained,Last Updated');

      // Check the table body, ensure it has a "Team" column
      expect(rows[1]).toMatch('1,rorro,Team 1,500,557,57,');
      expect(rows[2]).toMatch('2,usbc,Team 2,-1,60,21,');
      expect(rows[3]).toMatch('3,Psikoi,Team 1,1000,1000,0,');
      expect(rows[4]).toMatch('4,Zezima,Team 2,-1,-1,0,');
    });

    it('should view CSV export (teams)', async () => {
      const response = await api
        .get(`/competitions/${globalData.testCompetitionStartedTeam.id}/csv`)
        .query({ table: 'teams' });

      expect(response.status).toBe(200);

      const rows = response.text.split('\n');

      expect(rows.length).toBe(3);

      // Check the table header
      expect(rows[0]).toBe('Rank,Name,Players,Total Gained,Average Gained,MVP');

      // Check the table body
      expect(rows[1]).toMatch('1,Team 1,2,57,28.5,rorro');
      expect(rows[2]).toMatch('2,Team 2,2,21,10.5,usbc');
    });

    it('should view CSV export (team)', async () => {
      const response = await api
        .get(`/competitions/${globalData.testCompetitionStartedTeam.id}/csv`)
        .query({ table: 'team', teamName: 'Team 1' });

      expect(response.status).toBe(200);

      const rows = response.text.split('\n');

      expect(rows.length).toBe(3);

      // Check the table header
      expect(rows[0]).toBe('Rank,Username,Start,End,Gained,Last Updated');

      // Check the table body
      expect(rows[1]).toMatch('1,rorro,500,557,57,');
      expect(rows[2]).toMatch('2,Psikoi,1000,1000,0,');
    });
  });

  describe('11 - List Player Competitions', () => {
    it('should not list player competitions (player not found)', async () => {
      const usernameResponse = await api.get(`/players/raaandooom/competitions`);

      expect(usernameResponse.status).toBe(404);
      expect(usernameResponse.body.message).toMatch('Player not found.');
    });

    it.skip('should not list player competitions (negative offset)', async () => {
      const response = await api.get(`/players/psikoi/competitions`).query({ offset: -5 });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'offset' must be >= 0.");
    });

    it.skip('should not list player competitions (negative limit)', async () => {
      const response = await api.get(`/players/psikoi/competitions`).query({ limit: -5 });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'limit' must be > 0.");
    });

    it.skip('should not list player competitions (limit > 50)', async () => {
      const response = await api.get(`/players/psikoi/competitions`).query({ limit: 1000 });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('The maximum results limit is 50');
    });

    it('should list player competitions', async () => {
      const response = await api.get(`/players/psikoi/competitions`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(5);

      // Hashes shouldn't be exposed to the API consumer
      expect(response.body.filter(p => !!p.competition.verificationHash).length).toBe(0);
      // Snapshot IDs shouldn't be exposed to the API consumer
      expect(response.body.filter(p => !!p.startSnapshotId).length).toBe(0);
      expect(response.body.filter(p => !!p.endSnapshotId).length).toBe(0);

      expect(response.body[0]).toMatchObject({
        teamName: 'Contributors',
        competitionId: globalData.testCompetitionEnding.id,
        competition: {
          id: globalData.testCompetitionEnding.id,
          participantCount: 11
        }
      });

      expect(response.body[1]).toMatchObject({
        teamName: 'Warriors',
        competitionId: globalData.testCompetitionWithGroup.id,
        competition: {
          id: globalData.testCompetitionWithGroup.id,
          participantCount: 4
        }
      });

      expect(response.body[2]).toMatchObject({
        teamName: null,
        competitionId: globalData.testCompetitionEnded.id,
        competition: {
          id: globalData.testCompetitionEnded.id,
          groupId: globalData.testGroup.id,
          group: {
            id: globalData.testGroup.id,
            memberCount: 2
          },
          participantCount: 2
        }
      });

      expect(response.body[3]).toMatchObject({
        teamName: 'Team 1',
        competitionId: globalData.testCompetitionStartedTeam.id,
        competition: {
          id: globalData.testCompetitionStartedTeam.id,
          participantCount: 4
        }
      });

      expect(response.body[4]).toMatchObject({
        teamName: null,
        competitionId: globalData.testCompetitionStarted.id,
        competition: {
          id: globalData.testCompetitionStarted.id,
          participantCount: 5
        }
      });
    });

    it('should list player competitions (w/ ongoing status filter)', async () => {
      const response = await api.get(`/players/psikoi/competitions`).query({ status: 'ongoing' });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(4);

      // Hashes shouldn't be exposed to the API consumer
      expect(response.body.filter(p => !!p.competition.verificationHash).length).toBe(0);
      // Snapshot IDs shouldn't be exposed to the API consumer
      expect(response.body.filter(p => !!p.startSnapshotId).length).toBe(0);
      expect(response.body.filter(p => !!p.endSnapshotId).length).toBe(0);

      expect(response.body[0]).toMatchObject({
        teamName: 'Contributors',
        competitionId: globalData.testCompetitionEnding.id,
        competition: {
          id: globalData.testCompetitionEnding.id,
          participantCount: 11
        }
      });

      expect(response.body[1]).toMatchObject({
        teamName: 'Warriors',
        competitionId: globalData.testCompetitionWithGroup.id,
        competition: {
          id: globalData.testCompetitionWithGroup.id,
          participantCount: 4
        }
      });

      expect(response.body[2]).toMatchObject({
        teamName: 'Team 1',
        competitionId: globalData.testCompetitionStartedTeam.id,
        competition: {
          id: globalData.testCompetitionStartedTeam.id,
          participantCount: 4
        }
      });

      expect(response.body[3]).toMatchObject({
        teamName: null,
        competitionId: globalData.testCompetitionStarted.id,
        competition: {
          id: globalData.testCompetitionStarted.id,
          participantCount: 5
        }
      });
    });

    it('should list player competitions (w/ finished status filter)', async () => {
      const response = await api.get(`/players/psikoi/competitions`).query({ status: 'finished' });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);

      // Hashes shouldn't be exposed to the API consumer
      expect(response.body.filter(p => !!p.competition.verificationHash).length).toBe(0);
      // Snapshot IDs shouldn't be exposed to the API consumer
      expect(response.body.filter(p => !!p.startSnapshotId).length).toBe(0);
      expect(response.body.filter(p => !!p.endSnapshotId).length).toBe(0);

      expect(response.body[0]).toMatchObject({
        teamName: null,
        competitionId: globalData.testCompetitionEnded.id,
        competition: {
          id: globalData.testCompetitionEnded.id,
          groupId: globalData.testGroup.id,
          group: {
            id: globalData.testGroup.id,
            memberCount: 2
          },
          participantCount: 2
        }
      });
    });

    it('should list player competitions (w/ upcoming status filter)', async () => {
      const response = await api.get(`/players/psikoi/competitions`).query({ status: 'upcoming' });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(0);
    });

    it.skip('should list player competitions (w/ limit & offset)', async () => {
      const response = await api.get(`/players/psikoi/competitions`).query({ limit: 1, offset: 1 });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);

      // Hashes and snapshot IDs shouldn't be exposed to the API consumer
      expect(response.body[0].competition.verificationHash).not.toBeDefined();
      expect(response.body[0].startSnapshotId).not.toBeDefined();
      expect(response.body[0].endSnapshotId).not.toBeDefined();

      expect(response.body[0]).toMatchObject({
        teamName: 'Warriors',
        competitionId: globalData.testCompetitionWithGroup.id,
        competition: {
          id: globalData.testCompetitionWithGroup.id,
          participantCount: 4
        }
      });
    });
  });

  describe('12 - List Player Competition Standings', () => {
    it('should not list player competition standings (player not found)', async () => {
      const usernameResponse = await api
        .get(`/players/raaandooom/competitions/standings`)
        .query({ status: 'ongoing' });

      expect(usernameResponse.status).toBe(404);
      expect(usernameResponse.body.message).toMatch('Player not found.');
    });

    it('should not list player competition standings (undefined competition status)', async () => {
      const response = await api.get(`/players/psikoi/competitions/standings`);

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Invalid enum value for 'status'");
    });

    it('should not list player competition standings (invalid competition status)', async () => {
      const response = await api.get(`/players/psikoi/competitions/standings`).query({ status: 'something' });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Invalid enum value for 'status'");
    });

    it('should not list player competition standings (upcoming competition status)', async () => {
      const response = await api.get(`/players/psikoi/competitions/standings`).query({ status: 'upcoming' });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Invalid enum value for 'status'");
    });

    it('should list player competitions standings (ongoing competitions)', async () => {
      const response = await api.get(`/players/psikoi/competitions/standings`).query({ status: 'ongoing' });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(4);

      // Hashes shouldn't be exposed to the API consumer
      expect(response.body.filter(p => !!p.competition.verificationHash).length).toBe(0);
      // Snapshot IDs shouldn't be exposed to the API consumer
      expect(response.body.filter(p => !!p.startSnapshotId).length).toBe(0);
      expect(response.body.filter(p => !!p.endSnapshotId).length).toBe(0);
      expect(response.body.filter(p => !!p.player).length).toBe(0);

      expect(response.body[0]).toMatchObject({
        teamName: 'Contributors',
        competitionId: globalData.testCompetitionEnding.id,
        competition: {
          id: globalData.testCompetitionEnding.id,
          participantCount: 11
        },
        rank: 11,
        progress: { end: -1, gained: 0, start: -1 }
      });

      expect(response.body[1]).toMatchObject({
        teamName: 'Warriors',
        competitionId: globalData.testCompetitionWithGroup.id,
        competition: {
          id: globalData.testCompetitionWithGroup.id,
          participantCount: 4
        },
        rank: 2,
        progress: { end: 6350129, gained: 0, start: 6350129 }
      });

      expect(response.body[2]).toMatchObject({
        teamName: 'Team 1',
        competitionId: globalData.testCompetitionStartedTeam.id,
        competition: {
          id: globalData.testCompetitionStartedTeam.id,
          participantCount: 4
        },
        rank: 3,
        progress: { end: 1000, gained: 0, start: 1000 }
      });

      expect(response.body[3]).toMatchObject({
        teamName: null,
        competitionId: globalData.testCompetitionStarted.id,
        competition: {
          id: globalData.testCompetitionStarted.id,
          participantCount: 5
        },
        rank: 4,
        progress: { end: 1000, gained: 0, start: 1000 }
      });
    });

    it('should list player competitions standings (finished competitions)', async () => {
      const response = await api.get(`/players/psikoi/competitions/standings`).query({ status: 'finished' });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);

      // Hashes shouldn't be exposed to the API consumer
      expect(response.body.filter(p => !!p.competition.verificationHash).length).toBe(0);
      // Snapshot IDs shouldn't be exposed to the API consumer
      expect(response.body.filter(p => !!p.startSnapshotId).length).toBe(0);
      expect(response.body.filter(p => !!p.endSnapshotId).length).toBe(0);

      expect(response.body[0]).toMatchObject({
        teamName: null,
        competitionId: globalData.testCompetitionEnded.id,
        competition: {
          id: globalData.testCompetitionEnded.id,
          groupId: globalData.testGroup.id,
          group: {
            id: globalData.testGroup.id,
            memberCount: 2
          },
          participantCount: 2
        },
        rank: 1,
        progress: { end: -1, gained: 0, start: -1 }
      });
    });

    it.skip('should list player competitions (w/ limit & offset)', async () => {
      const response = await api
        .get(`/players/psikoi/competitions`)
        .query({ status: 'ongoing', limit: 1, offset: 1 });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);

      // Hashes and snapshot IDs shouldn't be exposed to the API consumer
      expect(response.body[0].competition.verificationHash).not.toBeDefined();
      expect(response.body[0].startSnapshotId).not.toBeDefined();
      expect(response.body[0].endSnapshotId).not.toBeDefined();

      expect(response.body[0]).toMatchObject({
        teamName: 'Warriors',
        competitionId: globalData.testCompetitionWithGroup.id,
        competition: {
          id: globalData.testCompetitionWithGroup.id,
          participantCount: 4
        }
      });
    });
  });

  describe('13 - List Group Competitions', () => {
    it('should not list group competitions (group not found)', async () => {
      const usernameResponse = await api.get(`/groups/1000000/competitions`);

      expect(usernameResponse.status).toBe(404);
      expect(usernameResponse.body.message).toMatch('Group not found.');
    });

    it.skip('should not list group competitions (negative offset)', async () => {
      const response = await api.get(`/groups/${globalData.testGroup.id}/competitions`).query({ offset: -5 });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'offset' must be >= 0.");
    });

    it.skip('should not list group competitions (negative limit)', async () => {
      const response = await api.get(`/groups/${globalData.testGroup.id}/competitions`).query({ limit: -5 });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'limit' must be > 0.");
    });

    it.skip('should not list group competitions (limit > 50)', async () => {
      const response = await api
        .get(`/groups/${globalData.testGroup.id}/competitions`)
        .query({ limit: 1000 });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('The maximum results limit is 50');
    });

    it('should list group competitions', async () => {
      // Add a second competition to this group
      const createSecondCompetitionResponse = await api.post('/competitions').send({
        title: 'Test Group Competition',
        metric: 'agility',
        startsAt: new Date(Date.now() + 1_200_000),
        endsAt: new Date(Date.now() + 1_200_000 + 604_800_000),
        groupId: globalData.testGroup.id,
        groupVerificationCode: globalData.testGroup.verificationCode
      });

      expect(createSecondCompetitionResponse.status).toBe(201);

      // Add a second competition to this group
      const createThirdCompetitionResponse = await api.post('/competitions').send({
        title: 'Test Group Competition (again)',
        metric: 'mimic',
        startsAt: new Date(Date.now() + 1_200_000),
        endsAt: new Date(Date.now() + 1_200_000 + 604_800_000),
        groupId: globalData.testGroup.id,
        groupVerificationCode: globalData.testGroup.verificationCode
      });

      expect(createThirdCompetitionResponse.status).toBe(201);

      const response = await api.get(`/groups/${globalData.testGroup.id}/competitions`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(4);

      // Hashes shouldn't be exposed to the API consumer
      expect(response.body.filter(c => !!c.verificationHash).length).toBe(0);

      expect(response.body[0]).toMatchObject({
        id: createThirdCompetitionResponse.body.competition.id,
        participantCount: 2 // inherits all members of the group as participants
      });

      expect(response.body[1]).toMatchObject({
        id: createSecondCompetitionResponse.body.competition.id,
        participantCount: 2 // inherits all members of the group as participants
      });

      expect(response.body[2]).toMatchObject({
        id: globalData.testCompetitionWithGroup.id,
        participantCount: 4 // these 4 participants were explicitly added to the competition
      });
    });

    it.skip('should list group competitions (w/ limit & offset)', async () => {
      const response = await api
        .get(`/groups/${globalData.testGroup.id}/competitions`)
        .query({ limit: 1, offset: 2 });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);

      // Hashes shouldn't be exposed to the API consumer
      expect(response.body[0].verificationHash).not.toBeDefined();

      expect(response.body[0]).toMatchObject({
        id: globalData.testCompetitionWithGroup.id,
        participantCount: 4 // these 4 participants were explicitly added to the competition
      });
    });
  });

  describe('14 - Update All', () => {
    it('should not update all (invalid verification code)', async () => {
      const response = await api.post(`/competitions/123456789/update-all`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Parameter 'verificationCode' is required.");
    });

    it('should not update all (competition not found)', async () => {
      const response = await api.post(`/competitions/123456789/update-all`).send({
        verificationCode: 'xxx-xxx-xxx'
      });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Competition not found.');
    });

    it('should not update all (incorrect verification code)', async () => {
      const response = await api
        .post(`/competitions/${globalData.testCompetitionStarted.id}/update-all`)
        .send({ verificationCode: 'xxx-xxx-xxx' });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Incorrect verification code.');
    });

    it('should not update all (no outdated participants)', async () => {
      const response = await api
        .post(`/competitions/${globalData.testCompetitionOngoing.id}/update-all`)
        .send({
          verificationCode: globalData.testCompetitionOngoing.verificationCode
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        'This competition has no outdated participants (updated over 24h ago).'
      );
    });

    it('should not update all (no outdated participants, near start)', async () => {
      const response = await api
        .post(`/competitions/${globalData.testCompetitionStarted.id}/update-all`)
        .send({
          verificationCode: globalData.testCompetitionStarted.verificationCode
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        'This competition has no outdated participants (updated over 1h ago).'
      );
    });

    it('should not update all (competition has ended)', async () => {
      const response = await api.post(`/competitions/${globalData.testCompetitionEnded.id}/update-all`).send({
        verificationCode: globalData.testGroup.verificationCode
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('This competition has ended. Cannot update all.');
    });

    it('should update all', async () => {
      const tenHourOldDate = new Date(Date.now() - 1000 - 10 * 60 * 60 * 1000);
      const dayOldDate = new Date(Date.now() - 1000 - 24 * 60 * 60 * 1000);

      // Force this player's last update timestamp to be a day ago
      await prisma.player.update({
        where: { username: 'zezima' },
        data: { updatedAt: dayOldDate }
      });

      // Force this player's last update timestamp to be 10h ago
      await prisma.player.update({
        where: { username: 'usbc' },
        data: { updatedAt: tenHourOldDate }
      });

      const response = await api
        .post(`/competitions/${globalData.testCompetitionOngoing.id}/update-all`)
        .send({ verificationCode: globalData.testCompetitionOngoing.verificationCode });

      expect(response.status).toBe(200);

      // This competition has been ongoing for 2 days, and is ending in 5 days, so players
      // are only considered outdated after 24h. USBC was updated 10h ago, so they won't count.
      expect(response.body.message).toMatch('1 outdated (updated > 24h ago) players are being updated.');
    });

    it('should update all (near start)', async () => {
      const tenHourOldDate = new Date(Date.now() - 1000 - 10 * 60 * 60 * 1000);
      const dayOldDate = new Date(Date.now() - 1000 - 24 * 60 * 60 * 1000);

      // Force this player's last update timestamp to be a day ago
      await prisma.player.update({
        where: { username: 'psikoi' },
        data: { updatedAt: dayOldDate }
      });

      // Force this player's last update timestamp to be 10h ago
      await prisma.player.update({
        where: { username: 'usbc' },
        data: { updatedAt: tenHourOldDate }
      });

      const response = await api
        .post(`/competitions/${globalData.testCompetitionStarted.id}/update-all`)
        .send({ verificationCode: globalData.testCompetitionStarted.verificationCode });

      expect(response.status).toBe(200);

      // This competition has started recently (20mins ago), so players
      // are considered outdated after 1h. USBC was updated 10h ago, so they will count as outdated.
      expect(response.body.message).toMatch('2 outdated (updated > 1h ago) players are being updated.');

      // Fake the current date to be 12h from now
      jest.useFakeTimers('modern').setSystemTime(new Date(Date.now() + 3_600_000 * 12));

      const secondResponse = await api
        .post(`/competitions/${globalData.testCompetitionStarted.id}/update-all`)
        .send({ verificationCode: globalData.testCompetitionStarted.verificationCode });

      expect(secondResponse.status).toBe(200);

      // This competition has started 12h 20mins ago, and it's no longer "recently started",
      // so players are considered outdated after 24h. USBC was updated 10h ago, so they won't be considered outdated
      expect(secondResponse.body.message).toMatch(
        '1 outdated (updated > 24h ago) players are being updated.'
      );

      // Reset the timers to the current (REAL) time
      jest.useRealTimers();
    });

    it('should update all (near end)', async () => {
      const tenHourOldDate = new Date(Date.now() - 1000 - 10 * 60 * 60 * 1000);
      const dayOldDate = new Date(Date.now() - 1000 - 24 * 60 * 60 * 1000);

      // Force this player's last update timestamp to be a day ago
      await prisma.player.update({
        where: { username: 'psikoi' },
        data: { updatedAt: dayOldDate }
      });

      // Force this player's last update timestamp to be 10h ago
      await prisma.player.update({
        where: { username: 'usbc' },
        data: { updatedAt: tenHourOldDate }
      });

      const response = await api
        .post(`/competitions/${globalData.testCompetitionEnding.id}/update-all`)
        .send({ verificationCode: globalData.testCompetitionEnding.verificationCode });

      expect(response.status).toBe(200);

      // This competition has started 2 days ago and ends soon (in 20mins), so players
      // are considered outdated after 1h. USBC was updated 10h ago, so they will count as outdated.
      expect(response.body.message).toMatch('2 outdated (updated > 1h ago) players are being updated.');
    });
  });

  describe('15 - Reset Verification Code', () => {
    it('should not reset code (invalid admin password)', async () => {
      const response = await api.put(`/competitions/100000/reset-code`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Required parameter 'adminPassword' is undefined.");
    });

    it('should not reset code (invalid admin password)', async () => {
      const response = await api.put(`/competitions/100000/reset-code`).send({
        adminPassword: 'abcdef'
      });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Incorrect admin password.');
    });

    it('should not reset code (competition not found)', async () => {
      const response = await api.put(`/competitions/100000/reset-code`).send({
        adminPassword: env.ADMIN_PASSWORD
      });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Competition not found.');
    });

    it('should not reset code (group competition)', async () => {
      const response = await api
        .put(`/competitions/${globalData.testCompetitionWithGroup.id}/reset-code`)
        .send({
          adminPassword: env.ADMIN_PASSWORD
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Cannot reset competition codes for group competitions.');
    });

    it('should reset code', async () => {
      const response = await api
        .put(`/competitions/${globalData.testCompetitionOngoing.id}/reset-code`)
        .send({ adminPassword: env.ADMIN_PASSWORD });

      expect(response.status).toBe(200);
      expect(response.body.newCode).toBeDefined();

      // try to edit the competition with the old code
      const failEditAttempt = await api.put(`/competitions/${globalData.testCompetitionOngoing.id}`).send({
        title: 'wow',
        verificationCode: globalData.testCompetitionOngoing.verificationCode
      });

      expect(failEditAttempt.status).toBe(403);
      expect(failEditAttempt.body.message).toBe('Incorrect verification code.');

      // try to edit the competition with the new code
      const editAttempt = await api.put(`/competitions/${globalData.testCompetitionOngoing.id}`).send({
        title: 'worked',
        verificationCode: response.body.newCode
      });

      expect(editAttempt.status).toBe(200);
      expect(editAttempt.body.title).toBe('worked');

      globalData.testCompetitionOngoing.verificationCode = response.body.newCode;
    });
  });

  describe('16 - Delete', () => {
    it('should not delete (competition not found)', async () => {
      const response = await api.delete(`/competitions/123456789`).send({
        verificationCode: 'xxx-xxx-xxx'
      });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Competition not found.');
    });

    it('should not delete (invalid verification code)', async () => {
      const response = await api.delete(`/competitions/123456789`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Parameter 'verificationCode' is required.");
    });

    it('should not delete (incorrect verification code)', async () => {
      const response = await api.delete(`/competitions/${globalData.testCompetitionOngoing.id}`).send({
        verificationCode: 'xxx-xxx-xxx'
      });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Incorrect verification code.');
    });

    it('should delete', async () => {
      const response = await api.delete(`/competitions/${globalData.testCompetitionOngoing.id}`).send({
        verificationCode: globalData.testCompetitionOngoing.verificationCode
      });

      expect(response.status).toBe(200);
      expect(response.body.message).toMatch('Successfully deleted competition');

      const fetchConfirmResponse = await api.get(`/competitions/${globalData.testCompetitionOngoing.id}`);
      expect(fetchConfirmResponse.status).toBe(404);
      expect(fetchConfirmResponse.body.message).toBe('Competition not found.');
    });

    it('should delete (with group code)', async () => {
      const response = await api.delete(`/competitions/${globalData.testCompetitionWithGroup.id}`).send({
        verificationCode: globalData.testGroup.verificationCode
      });

      expect(response.status).toBe(200);
      expect(response.body.message).toMatch('Successfully deleted competition');

      const fetchConfirmResponse = await api.get(`/competitions/${globalData.testCompetitionWithGroup.id}`);

      expect(fetchConfirmResponse.status).toBe(404);
      expect(fetchConfirmResponse.body.message).toBe('Competition not found.');
    });
  });

  describe('17 - Group Event Side Effects', () => {
    it('should remove from group competitions', async () => {
      const createGroupResponse = await api.post('/groups').send({
        name: 'Test 123',
        members: [{ username: 'psikoi' }, { username: 'boom' }, { username: 'sethmare' }]
      });

      expect(createGroupResponse.status).toBe(201);

      const createClassicCompResponse = await api.post('/competitions').send({
        title: 'Thieving SOTW',
        metric: 'thieving',
        startsAt: new Date(Date.now() + 1_200_000),
        endsAt: new Date(Date.now() + 1_200_000 + 604_800_000),
        groupId: createGroupResponse.body.group.id,
        groupVerificationCode: createGroupResponse.body.verificationCode
      });

      expect(createClassicCompResponse.status).toBe(201);

      const createTeamCompResponse = await api.post('/competitions').send({
        title: 'Zulrah BOTW',
        metric: 'zulrah',
        startsAt: new Date(Date.now() + 1_200_000),
        endsAt: new Date(Date.now() + 1_200_000 + 604_800_000),
        teams: [
          { name: 'Warriors', participants: ['psikoi', 'hydrox6'] },
          { name: 'Soldiers', participants: ['alexsuperfly', 'boom'] }
        ],
        groupId: createGroupResponse.body.group.id,
        groupVerificationCode: createGroupResponse.body.verificationCode
      });

      expect(createTeamCompResponse.status).toBe(201);

      // Wait a bit to let the group events run
      await sleep(500);

      const classicCompDetailsA = await api.get(
        `/competitions/${createClassicCompResponse.body.competition.id}`
      );

      expect(classicCompDetailsA.status).toBe(200);
      expect(classicCompDetailsA.body.participations.length).toBe(3);

      const classicCompParticipantsA = classicCompDetailsA.body.participations.map(p => p.player.username);
      expect(classicCompParticipantsA).toContain('psikoi');
      expect(classicCompParticipantsA).toContain('boom');
      expect(classicCompParticipantsA).toContain('sethmare');

      const teamCompDetailsA = await api.get(`/competitions/${createTeamCompResponse.body.competition.id}`);
      expect(teamCompDetailsA.status).toBe(200);
      expect(teamCompDetailsA.body.participations.length).toBe(4);

      const teamCompParticipantsA = teamCompDetailsA.body.participations.map(p => p.player.username);
      expect(teamCompParticipantsA).toContain('psikoi');
      expect(teamCompParticipantsA).toContain('boom');
      expect(teamCompParticipantsA).toContain('hydrox6');
      expect(teamCompParticipantsA).toContain('alexsuperfly');

      // Delete these two players from the group
      const removeMembersResponse = await api
        .delete(`/groups/${createGroupResponse.body.group.id}/members`)
        .send({
          members: ['psikoi', 'boom'],
          verificationCode: createGroupResponse.body.verificationCode
        });

      expect(removeMembersResponse.status).toBe(200);
      expect(removeMembersResponse.body.count).toBe(2);

      // Wait a bit to let the group events run
      await sleep(500);

      const classicCompDetailsB = await api.get(
        `/competitions/${createClassicCompResponse.body.competition.id}`
      );

      expect(classicCompDetailsB.status).toBe(200);
      expect(classicCompDetailsB.body.participations.length).toBe(1); // previously 3

      const classicCompParticipantsB = classicCompDetailsB.body.participations.map(p => p.player.username);
      expect(classicCompParticipantsB).toContain('sethmare');

      const teamCompDetailsB = await api.get(`/competitions/${createTeamCompResponse.body.competition.id}`);

      expect(teamCompDetailsB.status).toBe(200);
      expect(teamCompDetailsB.body.participations.length).toBe(2); // previously 4

      const teamCompParticipantsB = teamCompDetailsB.body.participations.map(p => p.player.username);
      expect(teamCompParticipantsB).toContain('hydrox6');
      expect(teamCompParticipantsB).toContain('alexsuperfly');
    });

    it('should add to group competitions', async () => {
      const createGroupResponse = await api.post('/groups').send({
        name: 'Test 456',
        members: [{ username: 'psikoi' }, { username: 'boom' }, { username: 'sethmare' }]
      });

      expect(createGroupResponse.status).toBe(201);

      const createClassicCompResponse = await api.post('/competitions').send({
        title: 'Thieving SOTW',
        metric: 'thieving',
        startsAt: new Date(Date.now() + 1_200_000),
        endsAt: new Date(Date.now() + 1_200_000 + 604_800_000),
        groupId: createGroupResponse.body.group.id,
        groupVerificationCode: createGroupResponse.body.verificationCode
      });

      expect(createClassicCompResponse.status).toBe(201);

      const createTeamCompResponse = await api.post('/competitions').send({
        title: 'Zulrah BOTW',
        metric: 'zulrah',
        startsAt: new Date(Date.now() + 1_200_000),
        endsAt: new Date(Date.now() + 1_200_000 + 604_800_000),
        teams: [
          { name: 'Warriors', participants: ['psikoi', 'hydrox6'] },
          { name: 'Soldiers', participants: ['alexsuperfly', 'boom'] }
        ],
        groupId: createGroupResponse.body.group.id,
        groupVerificationCode: createGroupResponse.body.verificationCode
      });

      expect(createTeamCompResponse.status).toBe(201);

      // Wait a bit to let the group events run
      await sleep(500);

      const classicCompDetailsA = await api.get(
        `/competitions/${createClassicCompResponse.body.competition.id}`
      );

      expect(classicCompDetailsA.status).toBe(200);
      expect(classicCompDetailsA.body.participations.length).toBe(3);

      const classicCompParticipantsA = classicCompDetailsA.body.participations.map(p => p.player.username);
      expect(classicCompParticipantsA).toContain('psikoi');
      expect(classicCompParticipantsA).toContain('boom');
      expect(classicCompParticipantsA).toContain('sethmare');

      const teamCompDetailsA = await api.get(`/competitions/${createTeamCompResponse.body.competition.id}`);

      expect(teamCompDetailsA.status).toBe(200);
      expect(teamCompDetailsA.body.participations.length).toBe(4);

      const teamCompParticipantsA = teamCompDetailsA.body.participations.map(p => p.player.username);
      expect(teamCompParticipantsA).toContain('psikoi');
      expect(teamCompParticipantsA).toContain('boom');
      expect(teamCompParticipantsA).toContain('hydrox6');
      expect(teamCompParticipantsA).toContain('alexsuperfly');

      // Add these two players to the group
      const addMembersResponse = await api.post(`/groups/${createGroupResponse.body.group.id}/members`).send({
        members: [
          { username: 'usbc', role: 'archer' },
          { username: 'jakesterwars', role: 'ruby' }
        ],
        verificationCode: createGroupResponse.body.verificationCode
      });

      expect(addMembersResponse.status).toBe(200);
      expect(addMembersResponse.body.count).toBe(2);

      // Wait a bit to let the group events run
      await sleep(500);

      const classicCompDetailsB = await api.get(
        `/competitions/${createClassicCompResponse.body.competition.id}`
      );

      expect(classicCompDetailsB.status).toBe(200);
      expect(classicCompDetailsB.body.participations.length).toBe(5); // previously 3

      const classicCompParticipantsB = classicCompDetailsB.body.participations.map(p => p.player.username);
      expect(classicCompParticipantsB).toContain('usbc');
      expect(classicCompParticipantsB).toContain('jakesterwars');

      const teamCompDetailsB = await api.get(`/competitions/${createTeamCompResponse.body.competition.id}`);

      expect(teamCompDetailsB.status).toBe(200);
      expect(teamCompDetailsB.body.participations.length).toBe(4); // previously 4 (no change)

      // player shouldn't be auto-added to team comps
      const teamCompParticipantsB = teamCompDetailsB.body.participations.map(p => p.player.username);
      expect(teamCompParticipantsB).not.toContain('usbc');
      expect(teamCompParticipantsB).not.toContain('jakesterwars');
    });

    it('should delete when the group is deleted', async () => {
      const createGroupResponse = await api.post('/groups').send({
        name: 'Test 987',
        members: [{ username: 'psikoi' }, { username: 'boom' }, { username: 'sethmare' }]
      });

      expect(createGroupResponse.status).toBe(201);

      const createClassicCompResponse = await api.post('/competitions').send({
        title: 'Thieving SOTW',
        metric: 'thieving',
        startsAt: new Date(Date.now() + 1_200_000),
        endsAt: new Date(Date.now() + 1_200_000 + 604_800_000),
        groupId: createGroupResponse.body.group.id,
        groupVerificationCode: createGroupResponse.body.verificationCode
      });

      expect(createClassicCompResponse.status).toBe(201);

      // Delete the group
      const response = await api.delete(`/groups/${createGroupResponse.body.group.id}`).send({
        verificationCode: createGroupResponse.body.verificationCode
      });

      expect(response.status).toBe(200);
      expect(response.body.message).toMatch('Successfully deleted group:');

      // Confirm the group was successfully deleted
      const fetchGroupConfirmResponse = await api.get(`/groups/${createGroupResponse.body.group.id}`);
      expect(fetchGroupConfirmResponse.status).toBe(404);
      expect(fetchGroupConfirmResponse.body.message).toBe('Group not found.');

      // Confirm the competition was deleted as a side effect
      const fetchCompetitionConfirmResponse = await api.get(
        `/competitions/${createClassicCompResponse.body.competition.id}`
      );

      expect(fetchCompetitionConfirmResponse.status).toBe(404);
      expect(fetchCompetitionConfirmResponse.body.message).toBe('Competition not found.');
    });
  });
});
