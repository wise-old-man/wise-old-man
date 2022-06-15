import axios from 'axios';
import supertest from 'supertest';
import MockAdapter from 'axios-mock-adapter';
import apiServer from '../../../src/api';
import prisma from '../../../src/prisma';
import env from '../../../src/env';
import { PlayerType } from '../../../src/utils';
import {
  resetDatabase,
  resetRedis,
  registerCMLMock,
  registerHiscoresMock,
  readFile,
  modifyRawHiscoresData,
  sleep
} from '../../utils';

const api = supertest(apiServer);
const axiosMock = new MockAdapter(axios, { onNoMatch: 'passthrough' });

const HISCORES_FILE_PATH = `${__dirname}/../../data/hiscores/psikoi_hiscores.txt`;

const EMPTY_DATA = { id: -1, verificationCode: '' };

const globalData = {
  hiscoresRawData: '',
  testGroup: EMPTY_DATA,
  testCompetitionStarting: EMPTY_DATA,
  testCompetitionStarted: EMPTY_DATA,
  testCompetitionOngoing: EMPTY_DATA,
  testCompetitionEnding: EMPTY_DATA,
  testCompetitionEnded: EMPTY_DATA,
  testCompetitionWithGroup: EMPTY_DATA
};

beforeAll(async done => {
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

  done();
});

afterAll(async done => {
  axiosMock.reset();
  done();
});

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
      const response = await api.post('/api/competitions').send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'title' is undefined.");
    });

    it('should not create (empty title)', async () => {
      const response = await api.post('/api/competitions').send({ title: '' });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Competition title must have at least one character.');
    });

    it('should not create (undefined metric)', async () => {
      const response = await api.post('/api/competitions').send({ title: 'hello' });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Invalid enum value for 'metric'.");
    });

    it('should not create (undefined start date)', async () => {
      const response = await api.post('/api/competitions').send({ title: 'hello', metric: 'smithing' });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'startsAt' is undefined.");
    });

    it('should not create (invalid start date)', async () => {
      const response = await api
        .post('/api/competitions')
        .send({ title: 'hello', metric: 'smithing', startsAt: 123 });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'startsAt' is undefined.");
    });

    it('should not create (undefined end date)', async () => {
      const response = await api
        .post('/api/competitions')
        .send({ title: 'hello', metric: 'smithing', startsAt: VALID_START_DATE });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'endsAt' is undefined.");
    });

    it('should not create (invalid end date)', async () => {
      const response = await api
        .post('/api/competitions')
        .send({ title: 'hello', metric: 'smithing', endsAt: 123, startsAt: VALID_START_DATE });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'endsAt' is undefined.");
    });

    it('should not create (end date before start date)', async () => {
      const response = await api.post('/api/competitions').send({
        ...VALID_CREATE_BASE,
        startsAt: VALID_END_DATE,
        endsAt: VALID_START_DATE
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Start date must be before the end date.');
    });

    it('should not create (past dates)', async () => {
      const response = await api.post('/api/competitions').send({
        ...VALID_CREATE_BASE,
        startsAt: new Date(Date.now() - 2_000_000),
        endsAt: new Date(Date.now() - 1_000_000)
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Invalid dates: All start and end dates must be in the future.');
    });

    it('should not create (invalid metric)', async () => {
      const response = await api.post('/api/competitions').send({ ...VALID_CREATE_BASE, metric: 'sailing' });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Invalid enum value for 'metric'.");
    });

    it('should not create (title too long)', async () => {
      const response = await api.post('/api/competitions').send({
        ...VALID_CREATE_BASE,
        title: 'jklasjhfklsdhnfkjsdnfkdjsnfkdjsnfkjsdnfksdjnfksdjnjklasjhfklsdhnfkjsdnfkdjsnfkdjsnfkjsdnfksd'
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Competition title cannot be longer than 50 characters.');
    });

    it('should not create (invalid participants list)', async () => {
      const response = await api.post('/api/competitions').send({
        ...VALID_CREATE_BASE,
        participants: 123
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'participants' is not a valid array.");
    });

    it('should not create (invalid player name)', async () => {
      const response = await api.post('/api/competitions').send({
        ...VALID_CREATE_BASE,
        participants: ['psikoi', 'areallylongusername']
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Found 1 invalid usernames:');
      expect(response.body.data).toContain('areallylongusername');
    });

    it('should not create (included participants and teams)', async () => {
      const response = await api.post('/api/competitions').send({
        ...VALID_CREATE_BASE,
        participants: ['psikoi', 'zezima'],
        teams: [{ name: 'Warriors', participants: ['hydrox6', 'jakesterwars'] }]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(
        'Cannot include both "participants" and "teams", they are mutually exclusive.'
      );
    });

    it('should not create (invalid teams list type)', async () => {
      const response = await api.post('/api/competitions').send({
        ...VALID_CREATE_BASE,
        teams: 123
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'teams' is not a valid array.");
    });

    it('should not create (invalid team shape)', async () => {
      const response = await api.post('/api/competitions').send({
        ...VALID_CREATE_BASE,
        teams: [{ hey: 'bye' }]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(
        'Invalid teams list. Must be an array of { name: string; participants: string[]; }.'
      );
    });

    it('should not create (invalid team players list)', async () => {
      const response = await api.post('/api/competitions').send({
        ...VALID_CREATE_BASE,
        teams: [{ name: '?', participants: 123 }]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(
        'Invalid teams list. Must be an array of { name: string; participants: string[]; }.'
      );
    });

    it('should not create (undefined team players list)', async () => {
      const response = await api.post('/api/competitions').send({
        ...VALID_CREATE_BASE,
        teams: [{ name: '?' }]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(
        'Invalid teams list. Must be an array of { name: string; participants: string[]; }.'
      );
    });

    it('should not create (empty team players list)', async () => {
      const response = await api.post('/api/competitions').send({
        ...VALID_CREATE_BASE,
        teams: [{ name: '?', participants: [] }]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('All teams must have a valid non-empty participants array.');
    });

    it('should not create (undefined team name)', async () => {
      const response = await api.post('/api/competitions').send({
        ...VALID_CREATE_BASE,
        teams: [{ participants: ['zezima', 'psikoi'] }]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(
        'Invalid teams list. Must be an array of { name: string; participants: string[]; }.'
      );
    });

    it('should not create (empty team name)', async () => {
      const response = await api.post('/api/competitions').send({
        ...VALID_CREATE_BASE,
        teams: [{ name: '', participants: ['zezima', 'psikoi'] }]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Team names must have at least one character.');
    });

    it('should not create (team name too long)', async () => {
      const response = await api.post('/api/competitions').send({
        ...VALID_CREATE_BASE,
        teams: [{ name: 'hjsdfhfiwsehflskdhfsdkljfhsdljkfhdsljkfh', participants: ['zezima', 'psikoi'] }]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Team names cannot be longer than 30 characters.');
    });

    it('should not create (duplicated team name)', async () => {
      const response = await api.post('/api/competitions').send({
        ...VALID_CREATE_BASE,
        teams: [
          { name: 'WARRIORS ', participants: ['zezima', 'psikoi'] },
          { name: '_warriors', participants: ['hydrox6', 'jakesterwars'] }
        ]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Found repeated team names: [warriors]');
    });

    it('should not create (duplicated team players)', async () => {
      const response = await api.post('/api/competitions').send({
        ...VALID_CREATE_BASE,
        teams: [
          { name: 'warriors', participants: ['zezima', 'psikoi'] },
          { name: 'soldiers', participants: ['hydrox6', ' ZEZIMA__'] }
        ]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Found repeated usernames: [zezima]');
    });

    it('should not create (group not found)', async () => {
      const response = await api.post('/api/competitions').send({
        ...VALID_CREATE_BASE,
        groupId: 1000,
        groupVerificationCode: 'xxx-xxx-xxx'
      });

      expect(response.status).toBe(404);
      expect(response.body.message).toMatch('Group not found.');
    });

    it('should not create (invalid group verification code)', async () => {
      const response = await api.post('/api/competitions').send({
        ...VALID_CREATE_BASE,
        groupId: 1000
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Invalid group verification code.');
    });

    it('should not create (incorrect group verification code)', async () => {
      const createGroupResponse = await api.post('/api/groups').send({
        name: 'Test Group',
        members: [{ username: 'Psikoi' }, { username: 'Zezima' }]
      });

      expect(createGroupResponse.status).toBe(201);

      globalData.testGroup = {
        id: createGroupResponse.body.group.id,
        verificationCode: createGroupResponse.body.verificationCode
      };

      const response = await api.post('/api/competitions').send({
        ...VALID_CREATE_BASE,
        groupId: globalData.testGroup.id,
        groupVerificationCode: '111-111-111'
      });

      expect(response.status).toBe(403);
      expect(response.body.message).toMatch('Incorrect group verification code.');
    });

    it('should not create (included participants and groupId)', async () => {
      const response = await api.post('/api/competitions').send({
        ...VALID_CREATE_BASE,
        groupId: globalData.testGroup.id,
        groupVerificationCode: globalData.testGroup.verificationCode,
        participants: ['Psikoi', 'Hydrox6', 'Rorro']
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Cannot include both "participants" and "groupId"');
    });

    it('should create (no participants)', async () => {
      // Starting in 20mins, ending in a week (upcoming)
      const response = await api.post('/api/competitions').send({
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
      const response = await api.post('/api/competitions').send({
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

      // Reset the timers to the current (REAL) time
      jest.useRealTimers();

      globalData.testCompetitionStarted = {
        id: response.body.competition.id,
        verificationCode: response.body.verificationCode
      };
    });

    it('should create (w/ participants)', async () => {
      // Fake the current date to be 2 days ago
      jest.useFakeTimers('modern').setSystemTime(new Date(Date.now() - 172_800_000));

      const startDate = new Date(Date.now() + 10_000);
      const endDate = new Date(Date.now() + 10_000 + 432_000_000);

      // Started 2 days ago, ending in 5 days
      const response = await api.post('/api/competitions').send({
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
      expect(response.body.competition.participations.length).toBe(4);
      expect(response.body.competition.participations.map(p => p.player.username)).toContain('psikoi');
      expect(response.body.competition.participations.map(p => p.player.username)).toContain('zezima');
      expect(response.body.competition.participations.map(p => p.player.username)).toContain('rorro');
      expect(response.body.competition.participations.map(p => p.player.username)).toContain('usbc');

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
      const response = await api.post('/api/competitions').send({
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
      const response = await api.post('/api/competitions').send({
        title: 'OVERALL Competition ',
        metric: 'overall',
        startsAt: startDate,
        endsAt: endDate,
        teams: []
      });

      expect(response.status).toBe(201);
      expect(response.body.competition).toMatchObject({
        title: 'OVERALL Competition',
        metric: 'overall',
        startsAt: startDate.toISOString(),
        endsAt: endDate.toISOString(),
        participantCount: 0
      });
      expect(response.body.competition.participations.length).toBe(0);

      // Reset the timers to the current (REAL) time
      jest.useRealTimers();

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
      const response = await api.post('/api/competitions').send({
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
      const response = await api.put(`/api/competitions/100000`).send({
        title: 'Some New Title',
        verificationCode: 'xxx-xxx-xxx'
      });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Competition not found.');
    });

    it.skip('should not edit (empty title)', async () => {
      const response = await api.put(`/api/competitions/${globalData.testCompetitionStarting.id}`).send({
        title: '',
        verificationCode: globalData.testCompetitionStarting.verificationCode
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('idk');
    });

    it('should not edit (title too long)', async () => {
      const response = await api.put(`/api/competitions/${globalData.testCompetitionStarting.id}`).send({
        title: 'jklasjhfklsdhnfkjsdnfkdjsnfkdjsnfkjsdnfksdjnfksdjnjklasjhfklsdhnfkjsdnfkdjsnfkdjsnfkjsdnfksd',
        verificationCode: globalData.testCompetitionStarting.verificationCode
      });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe(
        'Validation error: Competition title must be shorted than 50 characters.'
      );
    });

    it('should not edit (invalid metric)', async () => {
      const response = await api.put(`/api/competitions/${globalData.testCompetitionStarting.id}`).send({
        metric: 'sailing',
        verificationCode: globalData.testCompetitionStarting.verificationCode
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid competition metric.');
    });

    it('should not edit (invalid start date)', async () => {
      const response = await api.put(`/api/competitions/${globalData.testCompetitionStarting.id}`).send({
        startsAt: null,
        verificationCode: globalData.testCompetitionStarting.verificationCode
      });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Validation error: Start date must be a valid date.');
    });

    it('should not edit (invalid end date)', async () => {
      const response = await api.put(`/api/competitions/${globalData.testCompetitionStarting.id}`).send({
        endsAt: null,
        verificationCode: globalData.testCompetitionStarting.verificationCode
      });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Validation error: End date must be a valid date.');
    });

    it('should not edit (end date before start date)', async () => {
      const response = await api.put(`/api/competitions/${globalData.testCompetitionStarting.id}`).send({
        startsAt: new Date(Date.now() + 3_600_000),
        endsAt: new Date(Date.now() + 1_200_000),
        verificationCode: globalData.testCompetitionStarting.verificationCode
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Start date must be before the end date.');
    });

    it.skip('should not edit (past dates)', async () => {
      const response = await api.put(`/api/competitions/${globalData.testCompetitionStarting.id}`).send({
        startsAt: new Date(Date.now() - 3_600_000),
        endsAt: new Date(Date.now() - 1_200_000),
        verificationCode: globalData.testCompetitionStarting.verificationCode
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('tbd');
    });

    it.skip('should not edit (invalid participants list)', async () => {
      const response = await api.put(`/api/competitions/${globalData.testCompetitionStarting.id}`).send({
        verificationCode: globalData.testCompetitionStarting.verificationCode,
        participants: 123
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('tbd');
    });

    it('should not edit (invalid player name)', async () => {
      const response = await api.put(`/api/competitions/${globalData.testCompetitionStarting.id}`).send({
        verificationCode: globalData.testCompetitionStarting.verificationCode,
        participants: ['psikoi', 'areallylongusername']
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Found 1 invalid usernames:');
      expect(response.body.data).toContain('areallylongusername');
    });

    it.skip('should not edit (invalid teams list type)', async () => {
      const response = await api.put(`/api/competitions/${globalData.testCompetitionEnding.id}`).send({
        verificationCode: globalData.testCompetitionEnding.verificationCode,
        teams: 123
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('tbd');
    });

    it('should not edit (invalid team shape)', async () => {
      const response = await api.put(`/api/competitions/${globalData.testCompetitionEnding.id}`).send({
        verificationCode: globalData.testCompetitionEnding.verificationCode,
        teams: [{ hey: 'bye' }]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('All teams must have a name property.');
    });

    it.skip('should not edit (invalid team players list)', async () => {
      const response = await api.put(`/api/competitions/${globalData.testCompetitionEnding.id}`).send({
        verificationCode: globalData.testCompetitionEnding.verificationCode,
        teams: [{ name: '?', participants: 123 }]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('tbd');
    });

    it('should not edit (undefined team players list)', async () => {
      const response = await api.put(`/api/competitions/${globalData.testCompetitionEnding.id}`).send({
        verificationCode: globalData.testCompetitionEnding.verificationCode,
        teams: [{ name: '?' }]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('All teams must have a valid (non-empty) array of participants.');
    });

    it('should not edit (empty team players list)', async () => {
      const response = await api.put(`/api/competitions/${globalData.testCompetitionEnding.id}`).send({
        verificationCode: globalData.testCompetitionEnding.verificationCode,
        teams: [{ name: '?', participants: [] }]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('All teams must have a valid (non-empty) array of participants.');
    });

    it('should not edit (undefined team name)', async () => {
      const response = await api.put(`/api/competitions/${globalData.testCompetitionEnding.id}`).send({
        verificationCode: globalData.testCompetitionEnding.verificationCode,
        teams: [{ participants: ['zezima', 'psikoi'] }]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('All teams must have a name property.');
    });

    it('should not edit (empty team name)', async () => {
      const response = await api.put(`/api/competitions/${globalData.testCompetitionEnding.id}`).send({
        verificationCode: globalData.testCompetitionEnding.verificationCode,
        teams: [{ name: '', participants: ['zezima', 'psikoi'] }]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('All teams must have a name property.');
    });

    it('should not edit (team name too long)', async () => {
      const response = await api.put(`/api/competitions/${globalData.testCompetitionEnding.id}`).send({
        verificationCode: globalData.testCompetitionEnding.verificationCode,
        teams: [{ name: 'hjsdfhfiwsehflskdhfsdkljfhsdljkfhdsljkfh', participants: ['zezima', 'psikoi'] }]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(
        'Team names can only be 30 characters max. The following are invalid: [hjsdfhfiwsehflskdhfsdkljfhsdljkfhdsljkfh]'
      );
    });

    it('should not edit (duplicated team name)', async () => {
      const response = await api.put(`/api/competitions/${globalData.testCompetitionEnding.id}`).send({
        verificationCode: globalData.testCompetitionEnding.verificationCode,
        teams: [
          { name: 'warriors_', participants: ['zezima', 'psikoi'] },
          { name: ' WARRIORS', participants: ['hydrox6', 'jakesterwars'] }
        ]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Found repeated team names: [warriors]');
    });

    it('should not edit (duplicated team players)', async () => {
      const response = await api.put(`/api/competitions/${globalData.testCompetitionEnding.id}`).send({
        verificationCode: globalData.testCompetitionEnding.verificationCode,
        teams: [
          { name: 'warriors', participants: ['zezima', 'psikoi'] },
          { name: 'soldiers', participants: ['hydrox6', '_ZEZIMA'] }
        ]
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Found repeated usernames: [zezima]');
    });

    it('should not edit (undefined verification code)', async () => {
      const response = await api.put(`/api/competitions/${globalData.testCompetitionEnding.id}`).send({
        title: 'Something'
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'verificationCode' is undefined.");
    });

    it('should not edit (incorrect verification code)', async () => {
      const response = await api.put(`/api/competitions/${globalData.testCompetitionEnding.id}`).send({
        title: 'Something',
        verificationCode: 'xxx-xxx-xxx'
      });

      expect(response.status).toBe(403);
      expect(response.body.message).toMatch('Incorrect verification code.');
    });

    it('should not edit start date (already started)', async () => {
      const response = await api.put(`/api/competitions/${globalData.testCompetitionOngoing.id}`).send({
        startsAt: new Date(Date.now() + 3_600_000),
        verificationCode: globalData.testCompetitionOngoing.verificationCode
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('The competition has started, the start date cannot be changed.');
    });

    it('should not edit metric (already started)', async () => {
      const response = await api.put(`/api/competitions/${globalData.testCompetitionOngoing.id}`).send({
        metric: 'obor',
        verificationCode: globalData.testCompetitionOngoing.verificationCode
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('The competition has started, the metric cannot be changed.');
    });

    it('should not edit teams (cannot change to classic competition)', async () => {
      const response = await api.put(`/api/competitions/${globalData.testCompetitionEnding.id}`).send({
        participants: ['zezima', 'sethmare'],
        verificationCode: globalData.testCompetitionEnding.verificationCode
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("The competition type cannot be changed to 'classic'.");
    });

    it('should not edit teams (cannot change to team competition)', async () => {
      const response = await api.put(`/api/competitions/${globalData.testCompetitionStarting.id}`).send({
        teams: [{ name: 'Mods', participants: ['sethmare', 'boom'] }],
        verificationCode: globalData.testCompetitionStarting.verificationCode
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("The competition type cannot be changed to 'team'.");
    });

    it('should edit (own fields)', async () => {
      const response = await api.put(`/api/competitions/${globalData.testCompetitionStarting.id}`).send({
        verificationCode: globalData.testCompetitionStarting.verificationCode,
        title: '_Worked! 👍 ',
        metric: 'agility'
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        title: 'Worked! 👍',
        metric: 'agility'
      });
      expect(response.body.participants.length).toBe(0);
    });

    it('should edit participants', async () => {
      const response = await api.put(`/api/competitions/${globalData.testCompetitionStarted.id}`).send({
        verificationCode: globalData.testCompetitionStarted.verificationCode,
        participants: ['psikoi', 'rorro', 'usbc']
      });

      expect(response.status).toBe(200);
      expect(response.body.participants.length).toBe(3);
      expect(response.body.participants.map(p => p.username)).not.toContain('zezima'); // player got removed
    });

    it('should edit teams', async () => {
      const response = await api.put(`/api/competitions/${globalData.testCompetitionEnding.id}`).send({
        verificationCode: globalData.testCompetitionEnding.verificationCode,
        teams: [
          { name: 'Mods', participants: [' SETHMARE', 'boom__'] },
          { name: 'Contributors', participants: [' psikoi', 'RORRO', 'JAKEsterwars', '__USBC'] },
          { name: 'Cool Guys', participants: [' hydrox6', '_alexsuperfly'] }
        ]
      });

      expect(response.status).toBe(200);
      expect(response.body.participants.length).toBe(8);
      expect(response.body.participants.map(p => p.username)).not.toContain('zezima'); // player got removed
    });

    it.skip('should edit (empty team players list)', async () => {
      const response = await api.put(`/api/competitions/${globalData.testCompetitionEnding.id}`).send({
        verificationCode: globalData.testCompetitionEnding.verificationCode,
        teams: []
      });

      expect(response.status).toBe(200);
      expect(response.body.participants.length).toBe(0);
    });
  });

  describe('3 - Search', () => {
    it('should not search competitions (invalid status)', async () => {
      const response = await api.get('/api/competitions').query({ status: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        "Invalid enum value for 'status'. Expected upcoming | ongoing | finished"
      );
    });

    it('should not search competitions (invalid metric)', async () => {
      const response = await api.get('/api/competitions').query({ metric: 'sailing' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid enum value for 'metric'.");
    });

    it('should not search competitions (invalid type)', async () => {
      const response = await api.get('/api/competitions').query({ type: 'invalid' });

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

      const response = await api.get('/api/competitions');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(6);

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
        title: 'Soul Wars Competition',
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
        participantCount: 0
      });

      expect(response.body[4]).toMatchObject({
        id: globalData.testCompetitionOngoing.id,
        title: 'SOTW Thieving 💰 #5',
        type: 'classic',
        metric: 'thieving',
        participantCount: 4
      });

      expect(response.body[5]).toMatchObject({
        id: globalData.testCompetitionStarted.id,
        title: 'BOTW Zulrah #3',
        type: 'classic',
        metric: 'zulrah',
        participantCount: 3
      });
    });

    it('should search competitions (w/ title filter)', async () => {
      const response = await api.get('/api/competitions').query({ title: 'competition' });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(3);

      // Hashes shouldn't be exposed to the API consumer
      expect(response.body.filter(c => !!c.verificationHash).length).toBe(0);
    });

    it('should search competitions (w/ title & status filter)', async () => {
      const response = await api.get('/api/competitions').query({ title: 'competition', status: 'ongoing' });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);

      // Hashes shouldn't be exposed to the API consumer
      expect(response.body.filter(c => !!c.verificationHash).length).toBe(0);
    });

    it('should search competitions (w/ metric filter)', async () => {
      const response = await api.get('/api/competitions').query({ metric: 'zulrah' });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);

      // Hashes shouldn't be exposed to the API consumer
      expect(response.body.filter(c => !!c.verificationHash).length).toBe(0);
    });

    it('should search competitions (w/ type filter)', async () => {
      const response = await api.get('/api/competitions').query({ type: 'team' });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
      expect(response.body[0].id).toBe(globalData.testCompetitionEnding.id);
      expect(response.body[1].id).toBe(globalData.testCompetitionWithGroup.id);

      // Hashes shouldn't be exposed to the API consumer
      expect(response.body.filter(c => !!c.verificationHash).length).toBe(0);
    });

    it('should search competitions (w/ limit)', async () => {
      const response = await api.get('/api/competitions').query({ type: 'classic', limit: 2 });

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
        participantCount: 0
      });

      // Hashes shouldn't be exposed to the API consumer
      expect(response.body.filter(c => !!c.verificationHash).length).toBe(0);
    });

    it('should search competitions (w/ limit & offset)', async () => {
      const response = await api.get('/api/competitions').query({ type: 'classic', limit: 2, offset: 1 });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2); // 4 results, limited to 2

      expect(response.body[0]).toMatchObject({
        id: globalData.testCompetitionEnded.id,
        title: 'OVERALL Competition',
        type: 'classic',
        metric: 'overall',
        participantCount: 0
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
      const response = await api.get(`/api/competitions`).query({ offset: -5 });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'offset' must be >= 0.");
    });

    it('should not search competitions (negative limit)', async () => {
      const response = await api.get(`/api/competitions`).query({ limit: -5 });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'limit' must be > 0.");
    });

    it('should not search competitions (limit > 50)', async () => {
      const response = await api.get(`/api/competitions`).query({ limit: 1000 });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('The maximum results limit is 50');
    });
  });

  describe('4 - Add Participants', () => {
    it('should not add participants (invalid verification code)', async () => {
      const response = await api
        .post('/api/competitions/1000/add-participants')
        .send({ participants: ['psikoi'] });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'verificationCode' is required.");
    });

    it('should not add participants (competition not found)', async () => {
      const response = await api.post('/api/competitions/1000/add-participants').send({
        verificationCode: 'XYZ',
        participants: ['psikoi']
      });

      expect(response.status).toBe(404);
      expect(response.body.message).toMatch('Competition not found.');
    });

    it('should not add participants (incorrect verification code)', async () => {
      const response = await api
        .post(`/api/competitions/${globalData.testCompetitionStarting.id}/add-participants`)
        .send({
          verificationCode: 'XYZ',
          participants: ['psikoi']
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toMatch('Incorrect verification code.');
    });

    it('should not add participants (undefined participant list)', async () => {
      const response = await api
        .post(`/api/competitions/${globalData.testCompetitionStarting.id}/add-participants`)
        .send({
          verificationCode: globalData.testCompetitionStarting.verificationCode
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'participants' is undefined.");
    });

    it('should not add participants (invalid participant list)', async () => {
      const response = await api
        .post(`/api/competitions/${globalData.testCompetitionStarting.id}/add-participants`)
        .send({
          participants: 123,
          verificationCode: globalData.testCompetitionStarting.verificationCode
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'participants' is not a valid array.");
    });

    it('should not add participants (empty participant list)', async () => {
      const response = await api
        .post(`/api/competitions/${globalData.testCompetitionStarting.id}/add-participants`)
        .send({
          participants: [],
          verificationCode: globalData.testCompetitionStarting.verificationCode
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Empty participants list.');
    });

    it('should not add participants (invalid participant username)', async () => {
      const response = await api
        .post(`/api/competitions/${globalData.testCompetitionStarting.id}/add-participants`)
        .send({
          participants: [123, {}],
          verificationCode: globalData.testCompetitionStarting.verificationCode
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Found 2 invalid usernames:');
    });

    it('should not add participants (repeated participant username)', async () => {
      const response = await api
        .post(`/api/competitions/${globalData.testCompetitionStarting.id}/add-participants`)
        .send({
          participants: ['zezima', 'psikoi', 'rorro', '_ZEZIMA', 'sethmare', ' ROrro__'],
          verificationCode: globalData.testCompetitionStarting.verificationCode
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Found repeated usernames: [zezima, rorro]');
    });

    it('should not add participants (already participants)', async () => {
      const response = await api
        .post(`/api/competitions/${globalData.testCompetitionStarted.id}/add-participants`)
        .send({
          participants: ['rorro', 'psikoi'],
          verificationCode: globalData.testCompetitionStarted.verificationCode
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('All players given are already competing.');
    });

    it('should not add participants (team competition)', async () => {
      const response = await api
        .post(`/api/competitions/${globalData.testCompetitionEnding.id}/add-participants`)
        .send({
          participants: ['rorro', 'psikoi'],
          verificationCode: globalData.testCompetitionEnding.verificationCode
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Cannot add participants to a team competition.');
    });

    it('should add participants', async () => {
      const before = await api.get(`/api/competitions/${globalData.testCompetitionStarted.id}`);
      expect(before.body.participants.length).toBe(3);
      expect(before.status).toBe(200);

      const response = await api
        .post(`/api/competitions/${globalData.testCompetitionStarted.id}/add-participants`)
        .send({
          participants: [' LYNX TITAN_', '__ZULU '],
          verificationCode: globalData.testCompetitionStarted.verificationCode
        });

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(2);

      const after = await api.get(`/api/competitions/${globalData.testCompetitionStarted.id}`);
      expect(after.status).toBe(200);
      expect(after.body.participants.length).toBe(5); // had 3 previously

      // ensure group.updatedAt has been updated
      expect(new Date(after.body.updatedAt).getTime()).toBeGreaterThan(
        new Date(before.body.updatedAt).getTime()
      );
    });
  });

  describe('5 - Remove Participants', () => {
    it('should not remove participants (invalid verification code)', async () => {
      const response = await api
        .post('/api/competitions/1000/remove-participants')
        .send({ participants: ['psikoi'] });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'verificationCode' is required.");
    });

    it('should not remove participants (competition not found)', async () => {
      const response = await api.post('/api/competitions/1000/remove-participants').send({
        verificationCode: 'XYZ',
        participants: ['psikoi']
      });

      expect(response.status).toBe(404);
      expect(response.body.message).toMatch('Competition not found.');
    });

    it('should not remove participants (incorrect verification code)', async () => {
      const response = await api
        .post(`/api/competitions/${globalData.testCompetitionStarting.id}/remove-participants`)
        .send({
          verificationCode: 'XYZ',
          participants: ['psikoi']
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toMatch('Incorrect verification code.');
    });

    it('should not remove participants (undefined participant list)', async () => {
      const response = await api
        .post(`/api/competitions/${globalData.testCompetitionStarting.id}/remove-participants`)
        .send({
          verificationCode: globalData.testCompetitionStarting.verificationCode
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'participants' is undefined.");
    });

    it('should not remove participants (invalid participant list)', async () => {
      const response = await api
        .post(`/api/competitions/${globalData.testCompetitionStarting.id}/remove-participants`)
        .send({
          participants: 123,
          verificationCode: globalData.testCompetitionStarting.verificationCode
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'participants' is not a valid array.");
    });

    it('should not remove participants (empty participant list)', async () => {
      const response = await api
        .post(`/api/competitions/${globalData.testCompetitionStarting.id}/remove-participants`)
        .send({
          participants: [],
          verificationCode: globalData.testCompetitionStarting.verificationCode
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Empty participants list.');
    });

    it('should not remove participants (no valid players found)', async () => {
      const response = await api
        .post(`/api/competitions/${globalData.testCompetitionOngoing.id}/remove-participants`)
        .send({
          participants: ['random', 'aleatório'],
          verificationCode: globalData.testCompetitionOngoing.verificationCode
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('No valid tracked players were given.');
    });

    it('should not remove participants (no participants found)', async () => {
      const response = await api
        .post(`/api/competitions/${globalData.testCompetitionOngoing.id}/remove-participants`)
        .send({
          participants: ['random', 'aleatório', '  lynx TITAN_'],
          verificationCode: globalData.testCompetitionOngoing.verificationCode
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('None of the players given were competing.');
    });

    it('should not remove participants (team competition)', async () => {
      const response = await api
        .post(`/api/competitions/${globalData.testCompetitionEnding.id}/remove-participants`)
        .send({
          participants: ['rorro', 'psikoi'],
          verificationCode: globalData.testCompetitionEnding.verificationCode
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Cannot remove participants from a team competition.');
    });

    it('should remove participants', async () => {
      const before = await api.get(`/api/competitions/${globalData.testCompetitionOngoing.id}`);
      expect(before.body.participants.length).toBe(4);
      expect(before.status).toBe(200);

      const response = await api
        .post(`/api/competitions/${globalData.testCompetitionOngoing.id}/remove-participants`)
        .send({
          participants: ['rorro', 'psikoi', 'zulu'], // zulu isn't on this group, should be ignored
          verificationCode: globalData.testCompetitionOngoing.verificationCode
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Successfully removed 2 participants.');

      const after = await api.get(`/api/competitions/${globalData.testCompetitionOngoing.id}`);
      expect(after.status).toBe(200);
      expect(after.body.participants.length).toBe(2); // had 4 previously

      // ensure group.updatedAt has been updated
      expect(new Date(after.body.updatedAt).getTime()).toBeGreaterThan(
        new Date(before.body.updatedAt).getTime()
      );
    });
  });

  describe('6 - Add Teams', () => {
    it('should not add teams (invalid verification code)', async () => {
      const response = await api.post(`/api/competitions/100000/add-teams`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Parameter 'verificationCode' is required.");
    });

    it('should not add teams (competition not found)', async () => {
      const response = await api
        .post(`/api/competitions/100000/add-teams`)
        .send({ verificationCode: 'xxx-xxx-xxx' });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Competition not found.');
    });

    it('should not add teams (incorrect verification code)', async () => {
      const response = await api
        .post(`/api/competitions/${globalData.testCompetitionEnding.id}/add-teams`)
        .send({ verificationCode: 'xxx-xxx-xxx' });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Incorrect verification code.');
    });

    it('should not add teams (undefined teams list)', async () => {
      const response = await api
        .post(`/api/competitions/${globalData.testCompetitionEnding.id}/add-teams`)
        .send({ verificationCode: globalData.testCompetitionEnding.verificationCode });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Parameter 'teams' is not a valid array.");
    });

    it('should not add teams (invalid teams list)', async () => {
      const response = await api
        .post(`/api/competitions/${globalData.testCompetitionEnding.id}/add-teams`)
        .send({
          teams: 123,
          verificationCode: globalData.testCompetitionEnding.verificationCode
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Parameter 'teams' is not a valid array.");
    });

    it('should not add teams (empty teams list)', async () => {
      const response = await api
        .post(`/api/competitions/${globalData.testCompetitionEnding.id}/add-teams`)
        .send({
          teams: [],
          verificationCode: globalData.testCompetitionEnding.verificationCode
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Empty teams list.');
    });

    it('should not add teams (invalid team shape)', async () => {
      const response = await api
        .post(`/api/competitions/${globalData.testCompetitionEnding.id}/add-teams`)
        .send({
          verificationCode: globalData.testCompetitionEnding.verificationCode,
          teams: [{ hey: 'bye' }]
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(
        'Invalid teams list. Must be an array of { name: string; participants: string[]; }.'
      );
    });

    it('should not add teams (invalid team players list)', async () => {
      const response = await api
        .post(`/api/competitions/${globalData.testCompetitionEnding.id}/add-teams`)
        .send({
          verificationCode: globalData.testCompetitionEnding.verificationCode,
          teams: [{ name: '?', participants: 123 }]
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(
        'Invalid teams list. Must be an array of { name: string; participants: string[]; }.'
      );
    });

    it('should not add teams (undefined team players list)', async () => {
      const response = await api
        .post(`/api/competitions/${globalData.testCompetitionEnding.id}/add-teams`)
        .send({
          verificationCode: globalData.testCompetitionEnding.verificationCode,
          teams: [{ name: '?' }]
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(
        'Invalid teams list. Must be an array of { name: string; participants: string[]; }.'
      );
    });

    it('should not add teams (empty team players list)', async () => {
      const response = await api
        .post(`/api/competitions/${globalData.testCompetitionEnding.id}/add-teams`)
        .send({
          verificationCode: globalData.testCompetitionEnding.verificationCode,
          teams: [{ name: '?', participants: [] }]
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('All teams must have a valid non-empty participants array.');
    });

    it('should not add teams (invalid team player username)', async () => {
      const response = await api
        .post(`/api/competitions/${globalData.testCompetitionEnding.id}/add-teams`)
        .send({
          verificationCode: globalData.testCompetitionEnding.verificationCode,
          teams: [{ name: 'Gang', participants: ['reallylongusername', 'zezima'] }]
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Found 1 invalid usernames:');
      expect(response.body.data).toContain('reallylongusername');
    });

    it('should not add teams (undefined team name)', async () => {
      const response = await api
        .post(`/api/competitions/${globalData.testCompetitionEnding.id}/add-teams`)
        .send({
          verificationCode: globalData.testCompetitionEnding.verificationCode,
          teams: [{ participants: ['psikoi'] }]
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(
        'Invalid teams list. Must be an array of { name: string; participants: string[]; }.'
      );
    });

    it('should not add teams (invalid team name)', async () => {
      const response = await api
        .post(`/api/competitions/${globalData.testCompetitionEnding.id}/add-teams`)
        .send({
          verificationCode: globalData.testCompetitionEnding.verificationCode,
          teams: [{ name: 123, participants: ['psikoi'] }]
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(
        'Invalid teams list. Must be an array of { name: string; participants: string[]; }.'
      );
    });

    it('should not add teams (empty team name)', async () => {
      const response = await api
        .post(`/api/competitions/${globalData.testCompetitionEnding.id}/add-teams`)
        .send({
          verificationCode: globalData.testCompetitionEnding.verificationCode,
          teams: [{ name: '', participants: ['psikoi'] }]
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Team names must have at least one character.');
    });

    it('should not add teams (team name too long)', async () => {
      const response = await api
        .post(`/api/competitions/${globalData.testCompetitionEnding.id}/add-teams`)
        .send({
          verificationCode: globalData.testCompetitionEnding.verificationCode,
          teams: [{ name: 'hjsdfhfiwsehflskdhfsdkljfhsdljkfhdsljkfh', participants: ['psikoi'] }]
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Team names cannot be longer than 30 characters.');
    });

    it('should not add teams (duplicate team names in response)', async () => {
      const response = await api
        .post(`/api/competitions/${globalData.testCompetitionEnding.id}/add-teams`)
        .send({
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
      const response = await api
        .post(`/api/competitions/${globalData.testCompetitionEnding.id}/add-teams`)
        .send({
          verificationCode: globalData.testCompetitionEnding.verificationCode,
          teams: [
            { name: '__MODS', participants: ['zezima'] },
            { name: 'Soldiers', participants: ['boom', 'usbc'] }
          ]
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Found repeated team names: [mods]');
    });

    it('should not add teams (duplicate team players)', async () => {
      const response = await api
        .post(`/api/competitions/${globalData.testCompetitionEnding.id}/add-teams`)
        .send({
          verificationCode: globalData.testCompetitionEnding.verificationCode,
          teams: [
            { name: 'Warriors', participants: ['psikoi', '__RORRO'] },
            { name: 'Soldiers', participants: ['boom', 'rorro', 'usbc'] }
          ]
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Found repeated usernames: [rorro]');
    });

    it('should not add teams (classic competition)', async () => {
      const response = await api
        .post(`/api/competitions/${globalData.testCompetitionOngoing.id}/add-teams`)
        .send({
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
      const before = await api.get(`/api/competitions/${globalData.testCompetitionEnding.id}`);
      expect(before.body.participants.length).toBe(8);
      expect(before.status).toBe(200);

      const response = await api
        .post(`/api/competitions/${globalData.testCompetitionEnding.id}/add-teams`)
        .send({
          verificationCode: globalData.testCompetitionEnding.verificationCode,
          teams: [
            { name: 'Fire Nation', participants: ['IROH__', '   Zuko'] },
            { name: 'Earth Kingdom', participants: ['bumi', 'TOPH', ' The Boulder'] },
            { name: 'Water Tribe', participants: ['katara', 'sokka'] }
          ]
        });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({ count: 7, message: 'Successfully added 7 participants.' });

      const after = await api.get(`/api/competitions/${globalData.testCompetitionEnding.id}`);
      expect(after.status).toBe(200);
      expect(after.body.participants.length).toBe(15); // had 8 previously

      // ensure group.updatedAt has been updated
      expect(new Date(after.body.updatedAt).getTime()).toBeGreaterThan(
        new Date(before.body.updatedAt).getTime()
      );
    });
  });

  describe('7 - Remove Teams', () => {
    it('should not remove teams (invalid verification code)', async () => {
      const response = await api.post(`/api/competitions/100000/remove-teams`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Parameter 'verificationCode' is required.");
    });

    it('should not remove teams (competition not found)', async () => {
      const response = await api
        .post(`/api/competitions/100000/remove-teams`)
        .send({ verificationCode: 'xxx-xxx-xxx', teamNames: [] });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Competition not found.');
    });

    it('should not remove teams (incorrect verification code)', async () => {
      const response = await api
        .post(`/api/competitions/${globalData.testCompetitionEnding.id}/remove-teams`)
        .send({ verificationCode: 'xxx-xxx-xxx', teamNames: [] });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Incorrect verification code.');
    });

    it('should not remove teams (undefined teams list)', async () => {
      const response = await api
        .post(`/api/competitions/${globalData.testCompetitionEnding.id}/remove-teams`)
        .send({ verificationCode: globalData.testCompetitionEnding.verificationCode });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Parameter 'teamNames' is undefined.");
    });

    it('should not remove teams (invalid teams list)', async () => {
      const response = await api
        .post(`/api/competitions/${globalData.testCompetitionEnding.id}/remove-teams`)
        .send({ verificationCode: globalData.testCompetitionEnding.verificationCode, teamNames: 123 });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Parameter 'teamNames' is not a valid array.");
    });

    it('should not remove teams (empty teams list)', async () => {
      const response = await api
        .post(`/api/competitions/${globalData.testCompetitionEnding.id}/remove-teams`)
        .send({ verificationCode: globalData.testCompetitionEnding.verificationCode, teamNames: [] });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Empty team names list.');
    });

    it('should not remove teams (classic competition)', async () => {
      const response = await api
        .post(`/api/competitions/${globalData.testCompetitionOngoing.id}/remove-teams`)
        .send({
          verificationCode: globalData.testCompetitionOngoing.verificationCode,
          teamNames: ['SomeName']
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Cannot remove teams from a classic competition.');
    });

    it('should not remove teams (no teams found)', async () => {
      const response = await api
        .post(`/api/competitions/${globalData.testCompetitionEnding.id}/remove-teams`)
        .send({
          verificationCode: globalData.testCompetitionEnding.verificationCode,
          teamNames: ['SomeName', 'Random']
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('No players were removed from the competition.');
    });

    it('should remove teams', async () => {
      const before = await api.get(`/api/competitions/${globalData.testCompetitionEnding.id}`);
      expect(before.body.participants.length).toBe(15);
      expect(before.status).toBe(200);

      const response = await api
        .post(`/api/competitions/${globalData.testCompetitionEnding.id}/remove-teams`)
        .send({
          verificationCode: globalData.testCompetitionEnding.verificationCode,
          teamNames: ['Fire Nation', 'Water Tribe']
        });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({ count: 4, message: 'Successfully removed 4 participants.' });

      const after = await api.get(`/api/competitions/${globalData.testCompetitionEnding.id}`);
      expect(after.status).toBe(200);
      expect(after.body.participants.length).toBe(11); // had 15 previously

      // ensure group.updatedAt has been updated
      expect(new Date(after.body.updatedAt).getTime()).toBeGreaterThan(
        new Date(before.body.updatedAt).getTime()
      );
    });
  });

  describe('8 - View Details', () => {
    it('should not view details (competition not found)', async () => {
      const response = await api.get(`/api/competitions/100000`);

      expect(response.status).toBe(404);
      expect(response.body.message).toMatch('Competition not found.');
    });

    it('should not view details', async () => {
      // Competition started 20 (and 10s) minutes ago
      // Fake the current date to be 15 minutes ago
      jest.useFakeTimers('modern').setSystemTime(new Date(Date.now() - 900_000));

      // Track Lynx Titan once, this player won't be tracked again (only 1 snapshot during competition)
      const trackResponse1 = await api.post('/api/players/track').send({ username: 'lynx titan' });
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
      const trackResponse2 = await api.post('/api/players/track').send({ username: 'usbc' });
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
      const trackResponse3 = await api.post('/api/players/track').send({ username: 'rorro' });
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
      const trackResponse4 = await api.post('/api/players/track').send({ username: 'psikoi' });
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
      const trackResponse2b = await api.post('/api/players/track').send({ username: 'usbc' });
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
      const trackResponse3b = await api.post('/api/players/track').send({ username: 'rorro' });
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
      const trackResponse4b = await api.post('/api/players/track').send({ username: 'psikoi' });
      expect(trackResponse4b.status).toBe(200);

      // Wait a bit to allow the players' participations to be synced
      await sleep(500);

      const response = await api.get(`/api/competitions/${globalData.testCompetitionStarted.id}`);

      expect(response.status).toBe(200);

      expect(response.body).toMatchObject({
        id: globalData.testCompetitionStarted.id,
        title: 'BOTW Zulrah #3',
        type: 'classic',
        metric: 'zulrah',
        totalGained: 68,
        groupId: null
      });

      expect(response.body.participants.length).toBe(5);

      expect(response.body.participants[0]).toMatchObject({
        username: 'rorro',
        progress: { start: 500, end: 557, gained: 57 }
      });

      expect(response.body.participants[1]).toMatchObject({
        username: 'usbc',
        progress: { start: -1, end: 60, gained: 11 } // we start counting at 49 kc (min kc is 50)
      });

      expect(response.body.participants[2]).toMatchObject({
        username: 'lynx titan',
        progress: { start: 1646, end: 1646, gained: 0 }
      });

      expect(response.body.participants[3]).toMatchObject({
        username: 'psikoi',
        progress: { start: 1000, end: 1000, gained: 0 }
      });

      expect(response.body.participants[4]).toMatchObject({
        username: 'zulu',
        progress: { start: -1, end: -1, gained: 0 }
      });
    });

    it('should not view details (other metric)', async () => {
      const response = await api
        .get(`/api/competitions/${globalData.testCompetitionStarted.id}`)
        .query({ metric: 'hunter' });

      expect(response.status).toBe(200);

      expect(response.body).toMatchObject({
        id: globalData.testCompetitionStarted.id,
        title: 'BOTW Zulrah #3',
        type: 'classic',
        metric: 'zulrah',
        totalGained: 260_000, // 250k from psikoi + 10k from rorro
        groupId: null
      });

      expect(response.body.participants.length).toBe(5);

      expect(response.body.participants[0]).toMatchObject({
        username: 'psikoi',
        progress: { start: 500_000, end: 750_000, gained: 250_000 }
      });

      expect(response.body.participants[1]).toMatchObject({
        username: 'rorro',
        progress: { start: 100_000, end: 110_000, gained: 10_000 }
      });

      expect(response.body.participants[2]).toMatchObject({
        username: 'lynx titan',
        progress: { start: 5346679, end: 5346679, gained: 0 }
      });

      expect(response.body.participants[3]).toMatchObject({
        username: 'usbc',
        progress: { start: 50_000, end: 50_000, gained: 0 }
      });

      expect(response.body.participants[4]).toMatchObject({
        username: 'zulu',
        progress: { start: -1, end: -1, gained: 0 }
      });
    });
  });

  describe('9 - View Top 5 Snapshots', () => {
    // default:
    //   rorro: 500, 557
    //   usbc: -1, 60
    //   lynx titan: 1646
    //   psikoi: 1000, 1000
    //   zulu: []

    // hunter (preview metric):
    //   psikoi: 500000, 750000
    //   rorro: 100000, 110000
    //   lynx titan: 5346679
    //   usbc: 50000, 50000
    //   zulu: []

    it.todo('placeholder');
  });

  describe('10 - List Player Competitions', () => {
    it('should not list player competitions (player not found)', async () => {
      const usernameResponse = await api.get(`/api/players/username/raaandooom/competitions`);

      expect(usernameResponse.status).toBe(404);
      expect(usernameResponse.body.message).toMatch('Player not found.');

      const idResponse = await api.get(`/api/players/100000/competitions`);

      expect(idResponse.status).toBe(404);
      expect(idResponse.body.message).toMatch('Player not found.');
    });

    it('should not list player competitions (negative offset)', async () => {
      const response = await api.get(`/api/players/username/psikoi/competitions`).query({ offset: -5 });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'offset' must be >= 0.");
    });

    it('should not list player competitions (negative limit)', async () => {
      const response = await api.get(`/api/players/username/psikoi/competitions`).query({ limit: -5 });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'limit' must be > 0.");
    });

    it('should not list player competitions (limit > 50)', async () => {
      const response = await api.get(`/api/players/username/psikoi/competitions`).query({ limit: 1000 });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('The maximum results limit is 50');
    });

    it('should list player competitions', async () => {
      const response = await api.get(`/api/players/username/psikoi/competitions`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(3);

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
        competitionId: globalData.testCompetitionStarted.id,
        competition: {
          id: globalData.testCompetitionStarted.id,
          participantCount: 5
        }
      });
    });

    it('should list player competitions (w/ limit & offset)', async () => {
      const response = await api
        .get(`/api/players/username/psikoi/competitions`)
        .query({ limit: 1, offset: 1 });

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

  describe('11 - List Group Competitions', () => {
    it('should not list group competitions (group not found)', async () => {
      const usernameResponse = await api.get(`/api/groups/1000000/competitions`);

      expect(usernameResponse.status).toBe(404);
      expect(usernameResponse.body.message).toMatch('Group not found.');
    });

    it('should not list group competitions (negative offset)', async () => {
      const response = await api
        .get(`/api/groups/${globalData.testGroup.id}/competitions`)
        .query({ offset: -5 });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'offset' must be >= 0.");
    });

    it('should not list group competitions (negative limit)', async () => {
      const response = await api
        .get(`/api/groups/${globalData.testGroup.id}/competitions`)
        .query({ limit: -5 });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'limit' must be > 0.");
    });

    it('should not list group competitions (limit > 50)', async () => {
      const response = await api
        .get(`/api/groups/${globalData.testGroup.id}/competitions`)
        .query({ limit: 1000 });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('The maximum results limit is 50');
    });

    it('should list group competitions', async () => {
      // Add a second competition to this group
      const createSecondCompetitionResponse = await api.post('/api/competitions').send({
        title: 'Test Group Competition',
        metric: 'agility',
        startsAt: new Date(Date.now() + 1_200_000),
        endsAt: new Date(Date.now() + 1_200_000 + 604_800_000),
        groupId: globalData.testGroup.id,
        groupVerificationCode: globalData.testGroup.verificationCode
      });

      expect(createSecondCompetitionResponse.status).toBe(201);

      // Add a second competition to this group
      const createThirdCompetitionResponse = await api.post('/api/competitions').send({
        title: 'Test Group Competition (again)',
        metric: 'mimic',
        startsAt: new Date(Date.now() + 1_200_000),
        endsAt: new Date(Date.now() + 1_200_000 + 604_800_000),
        groupId: globalData.testGroup.id,
        groupVerificationCode: globalData.testGroup.verificationCode
      });

      expect(createThirdCompetitionResponse.status).toBe(201);

      const response = await api.get(`/api/groups/${globalData.testGroup.id}/competitions`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(3);

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

    it('should list group competitions (w/ limit & offset)', async () => {
      const response = await api
        .get(`/api/groups/${globalData.testGroup.id}/competitions`)
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

  describe('12 - Update All', () => {
    it('should not update all (invalid verification code)', async () => {
      const response = await api.post(`/api/competitions/123456789/update-all`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Parameter 'verificationCode' is required.");
    });

    it('should not update all (competition not found)', async () => {
      const response = await api.post(`/api/competitions/123456789/update-all`).send({
        verificationCode: 'xxx-xxx-xxx'
      });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Competition not found.');
    });

    it('should not update all (incorrect verification code)', async () => {
      const response = await api
        .post(`/api/competitions/${globalData.testCompetitionStarted.id}/update-all`)
        .send({ verificationCode: 'xxx-xxx-xxx' });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Incorrect verification code.');
    });

    it('should not update all (no outdated participants)', async () => {
      const response = await api
        .post(`/api/competitions/${globalData.testCompetitionOngoing.id}/update-all`)
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
        .post(`/api/competitions/${globalData.testCompetitionStarted.id}/update-all`)
        .send({
          verificationCode: globalData.testCompetitionStarted.verificationCode
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        'This competition has no outdated participants (updated over 1h ago).'
      );
    });

    it('should not update all (competition has ended)', async () => {
      const response = await api
        .post(`/api/competitions/${globalData.testCompetitionEnded.id}/update-all`)
        .send({
          verificationCode: globalData.testCompetitionEnded.verificationCode
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
        .post(`/api/competitions/${globalData.testCompetitionOngoing.id}/update-all`)
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
        .post(`/api/competitions/${globalData.testCompetitionStarted.id}/update-all`)
        .send({ verificationCode: globalData.testCompetitionStarted.verificationCode });

      expect(response.status).toBe(200);

      // This competition has started recently (20mins ago), so players
      // are considered outdated after 1h. USBC was updated 10h ago, so they will count as outdated.
      expect(response.body.message).toMatch('2 outdated (updated > 1h ago) players are being updated.');

      // Fake the current date to be 12h from now
      jest.useFakeTimers('modern').setSystemTime(new Date(Date.now() + 3_600_000 * 12));

      const secondResponse = await api
        .post(`/api/competitions/${globalData.testCompetitionStarted.id}/update-all`)
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
        .post(`/api/competitions/${globalData.testCompetitionEnding.id}/update-all`)
        .send({ verificationCode: globalData.testCompetitionEnding.verificationCode });

      expect(response.status).toBe(200);

      // This competition has started 2 days ago and ends soon (in 20mins), so players
      // are considered outdated after 1h. USBC was updated 10h ago, so they will count as outdated.
      expect(response.body.message).toMatch('2 outdated (updated > 1h ago) players are being updated.');
    });
  });

  describe('13 - Reset Verification Code', () => {
    it('should not reset code (invalid admin password)', async () => {
      const response = await api.put(`/api/competitions/100000/reset-code`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Required parameter 'adminPassword' is undefined.");
    });

    it('should not reset code (invalid admin password)', async () => {
      const response = await api.put(`/api/competitions/100000/reset-code`).send({
        adminPassword: 'abcdef'
      });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Incorrect admin password.');
    });

    it('should not reset code (competition not found)', async () => {
      const response = await api.put(`/api/competitions/100000/reset-code`).send({
        adminPassword: env.ADMIN_PASSWORD
      });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Competition not found.');
    });

    it('should not reset code (group competition)', async () => {
      const response = await api
        .put(`/api/competitions/${globalData.testCompetitionWithGroup.id}/reset-code`)
        .send({
          adminPassword: env.ADMIN_PASSWORD
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Cannot reset competition codes for group competitions.');
    });

    it('should reset code', async () => {
      const response = await api
        .put(`/api/competitions/${globalData.testCompetitionOngoing.id}/reset-code`)
        .send({ adminPassword: env.ADMIN_PASSWORD });

      expect(response.status).toBe(200);
      expect(response.body.newCode).toBeDefined();

      // try to edit the competition with the old code
      const failEditAttempt = await api
        .put(`/api/competitions/${globalData.testCompetitionOngoing.id}`)
        .send({
          title: 'wow',
          verificationCode: globalData.testCompetitionOngoing.verificationCode
        });

      expect(failEditAttempt.status).toBe(403);
      expect(failEditAttempt.body.message).toBe('Incorrect verification code.');

      // try to edit the competition with the new code
      const editAttempt = await api.put(`/api/competitions/${globalData.testCompetitionOngoing.id}`).send({
        title: 'worked',
        verificationCode: response.body.newCode
      });

      expect(editAttempt.status).toBe(200);
      expect(editAttempt.body.title).toBe('worked');

      globalData.testCompetitionOngoing.verificationCode = response.body.newCode;
    });
  });

  describe('14 - Delete', () => {
    it('should not delete (competition not found)', async () => {
      const response = await api.delete(`/api/competitions/123456789`).send({
        verificationCode: 'xxx-xxx-xxx'
      });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Competition not found.');
    });

    it('should not delete (invalid verification code)', async () => {
      const response = await api.delete(`/api/competitions/123456789`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Parameter 'verificationCode' is required.");
    });

    it('should not delete (incorrect verification code)', async () => {
      const response = await api.delete(`/api/competitions/${globalData.testCompetitionOngoing.id}`).send({
        verificationCode: 'xxx-xxx-xxx'
      });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Incorrect verification code.');
    });

    it('should delete', async () => {
      const response = await api.delete(`/api/competitions/${globalData.testCompetitionOngoing.id}`).send({
        verificationCode: globalData.testCompetitionOngoing.verificationCode
      });

      expect(response.status).toBe(200);
      expect(response.body.message).toMatch('Successfully deleted competition');

      const fetchConfirmResponse = await api.get(`/api/competitions/${globalData.testCompetitionOngoing.id}`);
      expect(fetchConfirmResponse.status).toBe(404);
      expect(fetchConfirmResponse.body.message).toBe('Competition not found.');
    });
  });

  describe('15 - Group Event Side Effects', () => {
    it('should remove from group competitions', async () => {
      const createGroupResponse = await api.post('/api/groups').send({
        name: 'Test 123',
        members: [{ username: 'psikoi' }, { username: 'boom' }, { username: 'sethmare' }]
      });

      expect(createGroupResponse.status).toBe(201);

      const createClassicCompResponse = await api.post('/api/competitions').send({
        title: 'Thieving SOTW',
        metric: 'thieving',
        startsAt: new Date(Date.now() + 1_200_000),
        endsAt: new Date(Date.now() + 1_200_000 + 604_800_000),
        groupId: createGroupResponse.body.group.id,
        groupVerificationCode: createGroupResponse.body.verificationCode
      });

      expect(createClassicCompResponse.status).toBe(201);

      const createTeamCompResponse = await api.post('/api/competitions').send({
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
        `/api/competitions/${createClassicCompResponse.body.competition.id}`
      );

      expect(classicCompDetailsA.status).toBe(200);
      expect(classicCompDetailsA.body.participants.length).toBe(3);

      const classicCompParticipantsA = classicCompDetailsA.body.participants.map(p => p.username);
      expect(classicCompParticipantsA).toContain('psikoi');
      expect(classicCompParticipantsA).toContain('boom');
      expect(classicCompParticipantsA).toContain('sethmare');

      const teamCompDetailsA = await api.get(
        `/api/competitions/${createTeamCompResponse.body.competition.id}`
      );
      expect(teamCompDetailsA.status).toBe(200);
      expect(teamCompDetailsA.body.participants.length).toBe(4);

      const teamCompParticipantsA = teamCompDetailsA.body.participants.map(p => p.username);
      expect(teamCompParticipantsA).toContain('psikoi');
      expect(teamCompParticipantsA).toContain('boom');
      expect(teamCompParticipantsA).toContain('hydrox6');
      expect(teamCompParticipantsA).toContain('alexsuperfly');

      // Delete these two players from the group
      const removeMembersResponse = await api
        .post(`/api/groups/${createGroupResponse.body.group.id}/remove-members`)
        .send({
          members: ['psikoi', 'boom'],
          verificationCode: createGroupResponse.body.verificationCode
        });

      expect(removeMembersResponse.status).toBe(200);
      expect(removeMembersResponse.body.count).toBe(2);

      // Wait a bit to let the group events run
      await sleep(500);

      const classicCompDetailsB = await api.get(
        `/api/competitions/${createClassicCompResponse.body.competition.id}`
      );

      expect(classicCompDetailsB.status).toBe(200);
      expect(classicCompDetailsB.body.participants.length).toBe(1); // previously 3

      const classicCompParticipantsB = classicCompDetailsB.body.participants.map(p => p.username);
      expect(classicCompParticipantsB).toContain('sethmare');

      const teamCompDetailsB = await api.get(
        `/api/competitions/${createTeamCompResponse.body.competition.id}`
      );

      expect(teamCompDetailsB.status).toBe(200);
      expect(teamCompDetailsB.body.participants.length).toBe(2); // previously 4

      const teamCompParticipantsB = teamCompDetailsB.body.participants.map(p => p.username);
      expect(teamCompParticipantsB).toContain('hydrox6');
      expect(teamCompParticipantsB).toContain('alexsuperfly');
    });

    it('should add to group competitions', async () => {
      const createGroupResponse = await api.post('/api/groups').send({
        name: 'Test 456',
        members: [{ username: 'psikoi' }, { username: 'boom' }, { username: 'sethmare' }]
      });

      expect(createGroupResponse.status).toBe(201);

      const createClassicCompResponse = await api.post('/api/competitions').send({
        title: 'Thieving SOTW',
        metric: 'thieving',
        startsAt: new Date(Date.now() + 1_200_000),
        endsAt: new Date(Date.now() + 1_200_000 + 604_800_000),
        groupId: createGroupResponse.body.group.id,
        groupVerificationCode: createGroupResponse.body.verificationCode
      });

      expect(createClassicCompResponse.status).toBe(201);

      const createTeamCompResponse = await api.post('/api/competitions').send({
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
        `/api/competitions/${createClassicCompResponse.body.competition.id}`
      );

      expect(classicCompDetailsA.status).toBe(200);
      expect(classicCompDetailsA.body.participants.length).toBe(3);

      const classicCompParticipantsA = classicCompDetailsA.body.participants.map(p => p.username);
      expect(classicCompParticipantsA).toContain('psikoi');
      expect(classicCompParticipantsA).toContain('boom');
      expect(classicCompParticipantsA).toContain('sethmare');

      const teamCompDetailsA = await api.get(
        `/api/competitions/${createTeamCompResponse.body.competition.id}`
      );

      expect(teamCompDetailsA.status).toBe(200);
      expect(teamCompDetailsA.body.participants.length).toBe(4);

      const teamCompParticipantsA = teamCompDetailsA.body.participants.map(p => p.username);
      expect(teamCompParticipantsA).toContain('psikoi');
      expect(teamCompParticipantsA).toContain('boom');
      expect(teamCompParticipantsA).toContain('hydrox6');
      expect(teamCompParticipantsA).toContain('alexsuperfly');

      // Add these two players to the group
      const addMembersResponse = await api
        .post(`/api/groups/${createGroupResponse.body.group.id}/add-members`)
        .send({
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
        `/api/competitions/${createClassicCompResponse.body.competition.id}`
      );

      expect(classicCompDetailsB.status).toBe(200);
      expect(classicCompDetailsB.body.participants.length).toBe(5); // previously 3

      const classicCompParticipantsB = classicCompDetailsB.body.participants.map(p => p.username);
      expect(classicCompParticipantsB).toContain('usbc');
      expect(classicCompParticipantsB).toContain('jakesterwars');

      const teamCompDetailsB = await api.get(
        `/api/competitions/${createTeamCompResponse.body.competition.id}`
      );

      expect(teamCompDetailsB.status).toBe(200);
      expect(teamCompDetailsB.body.participants.length).toBe(4); // previously 4 (no change)

      // player shouldn't be auto-added to team comps
      const teamCompParticipantsB = teamCompDetailsB.body.participants.map(p => p.username);
      expect(teamCompParticipantsB).not.toContain('usbc');
      expect(teamCompParticipantsB).not.toContain('jakesterwars');
    });
  });
});
