import axios from 'axios';
import supertest from 'supertest';
import MockAdapter from 'axios-mock-adapter';
import { PlayerType, getMetricValueKey, getMetricRankKey, METRICS } from '@wise-old-man/utils';
import env from '../../src/env';
import apiServer from '../../src/api';
import * as snapshotService from '../../src/api/services/internal/snapshot.service';
import prisma from '../../src/prisma';
import { registerCMLMock, registerHiscoresMock, resetDatabase, readFile } from '../utils';

const api = supertest(apiServer);
const axiosMock = new MockAdapter(axios, { onNoMatch: 'passthrough' });

const HISCORES_FILE_PATH = `${__dirname}/../data/hiscores/psikoi_hiscores.txt`;

const globalData = {
  hiscoresRawData: '',
  firstNameChangeId: -1,
  secondNameChangeId: -1
};

beforeAll(async done => {
  await resetDatabase();

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

describe('Names API', () => {
  describe('1 - Submitting', () => {
    it('should not submit (missing oldName)', async () => {
      const response = await api.post(`/api/names`).send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'oldName' is undefined.");
    });

    it('should not submit (missing newName)', async () => {
      const response = await api.post(`/api/names`).send({ oldName: 'psikoi' });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'newName' is undefined.");
    });

    it('should not submit (invalid oldName)', async () => {
      const response = await api.post(`/api/names`).send({ oldName: 'reallylongname', newName: 'good' });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Invalid old name.');
    });

    it('should not submit (invalid newName)', async () => {
      const response = await api.post(`/api/names`).send({ oldName: 'good', newName: 'reallylongname' });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Invalid new name.');
    });

    it('should not submit (equal names)', async () => {
      const response = await api.post(`/api/names`).send({ oldName: 'psikoi', newName: 'psikoi' });

      // Note: We allow changes in capitalization, so this condition only fails for equal names (same capitalization)
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Old name and new name cannot be the same.');
    });

    it("should not submit (player doesn't exist)", async () => {
      const response = await api.post(`/api/names`).send({ oldName: 'psikoi', newName: 'Psikoi' });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Player 'psikoi' is not tracked yet.");
    });

    it('should submit (capitalization change)', async () => {
      const trackResponse = await api.post(`/api/players/track`).send({ username: 'psikoi' });

      expect(trackResponse.status).toBe(201);
      expect(trackResponse.body.username).toBe('psikoi');
      expect(trackResponse.body.displayName).toBe('psikoi');

      // Adding spaces and invalid characters to ensure they get stripped out on submission
      const submitResponse = await api.post(`/api/names`).send({ oldName: '_psikoi -', newName: ' Psikoi' });

      expect(submitResponse.status).toBe(201);
      expect(submitResponse.body.status).toBe(0);
      expect(submitResponse.body.oldName).toBe('psikoi');
      expect(submitResponse.body.newName).toBe('Psikoi');
      expect(submitResponse.body.resolvedAt).toBe(null);

      globalData.firstNameChangeId = submitResponse.body.id;
    });

    it('should submit (full name change)', async () => {
      const trackResponse = await api.post(`/api/players/track`).send({ username: 'Hydrox6' });

      expect(trackResponse.status).toBe(201);
      expect(trackResponse.body.username).toBe('hydrox6');
      expect(trackResponse.body.displayName).toBe('Hydrox6');

      // Adding spaces and invalid characters to ensure they get stripped out on submission
      const submitResponse = await api
        .post(`/api/names`)
        .send({ oldName: 'hydrox6', newName: 'alexsuperfly' });

      expect(submitResponse.status).toBe(201);
      expect(submitResponse.body.status).toBe(0);
      expect(submitResponse.body.oldName).toBe('Hydrox6');
      expect(submitResponse.body.newName).toBe('alexsuperfly');
      expect(submitResponse.body.resolvedAt).toBe(null);
    });

    it('should not submit (repeated approved submission)', async () => {
      // Track new player (zezima)
      const firstTrackResponse = await api.post(`/api/players/track`).send({ username: 'Zezima' });
      expect(firstTrackResponse.status).toBe(201);
      expect(firstTrackResponse.body.username).toBe('zezima');

      // Track new player (sethmare)
      const secondTrackResponse = await api.post(`/api/players/track`).send({ username: 'Sethmare' });
      expect(secondTrackResponse.status).toBe(201);
      expect(secondTrackResponse.body.username).toBe('sethmare');

      // Change name from zezima to sethmare
      const submitResponse = await api.post(`/api/names`).send({ oldName: 'zezima', newName: 'sethmare' });
      expect(submitResponse.status).toBe(201);

      globalData.secondNameChangeId = submitResponse.body.id;

      // Approve this name change
      const approvalResponse = await api
        .post(`/api/names/${submitResponse.body.id}/approve`)
        .send({ adminPassword: env.ADMIN_PASSWORD });

      expect(approvalResponse.status).toBe(200);
      expect(approvalResponse.body.status).toBe(2);
      expect(approvalResponse.body.oldName).toBe('Zezima');
      expect(approvalResponse.body.newName).toBe('sethmare');
      expect(approvalResponse.body.resolvedAt).not.toBe(null);

      // Track new player (zezima) (again)
      const thirdTrackResponse = await api.post(`/api/players/track`).send({ username: 'Zezima' });
      expect(thirdTrackResponse.status).toBe(201);
      expect(thirdTrackResponse.body.username).toBe('zezima');

      // Change name from zezima to sethmare (again)
      const secondSubmitResponse = await api
        .post(`/api/names`)
        .send({ oldName: 'zezima', newName: 'sethmare' });

      expect(secondSubmitResponse.status).toBe(400);
      expect(secondSubmitResponse.body.message).toMatch('Cannot submit a duplicate (approved) name change');
    });

    it('should not submit (repeated pending submission)', async () => {
      const submitResponse = await api
        .post(`/api/names`)
        .send({ oldName: 'hydrox6', newName: 'alexsuperfly' });

      expect(submitResponse.status).toBe(400);
      expect(submitResponse.body.message).toMatch("There's already a similar pending name change.");
    });
  });

  describe('2 - Details', () => {
    it('should not fetch details (missing id)', async () => {
      const response = await api.get(`/api/names/wow`);

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'id' is not a valid number.");
    });

    it('should not fetch details (id not found)', async () => {
      const response = await api.get(`/api/names/2000000000`);

      expect(response.status).toBe(404);
      expect(response.body.message).toMatch('Name change id was not found.');
    });

    it('should fetch details (pending name change)', async () => {
      const response = await api.get(`/api/names/${globalData.firstNameChangeId}`);

      expect(response.status).toBe(200);
      expect(response.body.nameChange.id).toBe(globalData.firstNameChangeId);
      expect(response.body.nameChange.status).toBe(0);
      expect(response.body.data.isOldOnHiscores).toBe(true);
      expect(response.body.data.isNewOnHiscores).toBe(true);
      expect(response.body.data.isNewTracked).toBe(true);
      expect(response.body.data.hasNegativeGains).toBe(false);
    });

    it('should fetch details (approved name change, empty data)', async () => {
      const response = await api.get(`/api/names/${globalData.secondNameChangeId}`);

      expect(response.status).toBe(200);
      expect(response.body.nameChange.id).toBe(globalData.secondNameChangeId);
      expect(response.body.nameChange.status).toBe(2);
      expect(JSON.stringify(response.body.data)).toBe('{}');
    });
  });

  describe('3 - Listing', () => {
    it('should not fetch list (invalid status)', async () => {
      const response = await api.get(`/api/names`).query({ status: 50 });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Invalid status');
    });

    it('should fetch list (no filters)', async () => {
      const response = await api.get(`/api/names`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(3);
      expect(response.body.filter(n => n.status === 0).length).toBe(2);
      expect(response.body.filter(n => n.status === 2).length).toBe(1);
      expect(response.body.filter(n => n.oldName === 'Zezima').length).toBe(1);
      expect(response.body.filter(n => n.oldName === 'psikoi').length).toBe(1);
    });

    it('should fetch list (filtered by status)', async () => {
      const response = await api.get(`/api/names`).query({ status: 2 });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body.filter(n => n.status !== 2).length).toBe(0);
    });

    it('should fetch list (filtered by username)', async () => {
      const response = await api.get(`/api/names`).query({ username: 'zezi' });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body.filter(n => n.oldName !== 'Zezima').length).toBe(0);
    });

    it('should fetch (empty) list (filtered by username & status)', async () => {
      const response = await api.get(`/api/names`).query({ username: 'zez', status: 0 });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(0);
    });

    it('should fetch list (with paginated results)', async () => {
      const firstResponse = await api.get(`/api/names`).query({ limit: 1 });

      expect(firstResponse.status).toBe(200);
      expect(firstResponse.body.length).toBe(1);

      const secondResponse = await api.get(`/api/names`).query({ limit: 1, offset: 1 });

      expect(secondResponse.status).toBe(200);
      expect(secondResponse.body.length).toBe(1);
      expect(secondResponse.body[0].id).not.toBe(firstResponse.body.id);
    });
  });

  describe('4 - Listing Player Names', () => {
    it('should not fetch list (invalid player id)', async () => {
      const response = await api.get(`/api/players/ddd/names`);

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'id' is not a valid number.");
    });

    it('should not fetch list (player not found)', async () => {
      const response = await api.get(`/api/players/username/Jakesterwars/names`);

      expect(response.status).toBe(404);
      expect(response.body.message).toMatch('Player not found.');
    });

    it('should fetch list', async () => {
      const response = await api.get(`/api/players/username/sethmare/names`);
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
    });

    it('should fetch list (again, after a name change)', async () => {
      const submitResponse = await api
        .post(`/api/names`)
        .send({ oldName: 'sethmare', newName: 'jakesterwars' });

      expect(submitResponse.status).toBe(201);

      const approvalResponse = await api
        .post(`/api/names/${submitResponse.body.id}/approve`)
        .send({ adminPassword: env.ADMIN_PASSWORD });

      expect(approvalResponse.status).toBe(200);

      const secondFetchResponse = await api.get(`/api/players/username/Jakesterwars/names`);
      expect(secondFetchResponse.status).toBe(200);
      expect(secondFetchResponse.body.length).toBe(2);
    });
  });

  describe('5 - Denying', () => {
    it('should not deny (invalid id)', async () => {
      const response = await api.post(`/api/names/abc/deny`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Parameter 'id' is not a valid number.");
    });

    it('should not deny (invalid admin password)', async () => {
      const response = await api.post(`/api/names/2000000000/deny`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Parameter 'adminPassword' is undefined.");
    });

    it('should not deny (incorrect admin password)', async () => {
      const response = await api.post(`/api/names/2000000000/deny`).send({ adminPassword: 'abc' });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Incorrect admin password.');
    });

    it('should not deny (id not found)', async () => {
      const response = await api
        .post(`/api/names/2000000000/deny`)
        .send({ adminPassword: env.ADMIN_PASSWORD });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Name change id was not found.');
    });

    it('should not deny (already approved)', async () => {
      const response = await api
        .post(`/api/names/${globalData.secondNameChangeId}/deny`)
        .send({ adminPassword: env.ADMIN_PASSWORD });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Name change status must be PENDING');
    });

    it('should deny', async () => {
      const response = await api
        .post(`/api/names/${globalData.firstNameChangeId}/deny`)
        .send({ adminPassword: env.ADMIN_PASSWORD });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe(1);
      expect(response.body.resolvedAt).not.toBe(null);
      expect(response.body.id).toBe(globalData.firstNameChangeId);
    });
  });

  describe('6 - Approving', () => {
    it('should not approve (invalid id)', async () => {
      const response = await api.post(`/api/names/abc/approve`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Parameter 'id' is not a valid number.");
    });

    it('should not approve (invalid admin password)', async () => {
      const response = await api.post(`/api/names/2000000000/approve`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Parameter 'adminPassword' is undefined.");
    });

    it('should not approve (incorrect admin password)', async () => {
      const response = await api.post(`/api/names/2000000000/approve`).send({ adminPassword: 'abc' });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Incorrect admin password.');
    });

    it('should not approve (id not found)', async () => {
      const response = await api
        .post(`/api/names/2000000000/approve`)
        .send({ adminPassword: env.ADMIN_PASSWORD });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Name change id was not found.');
    });

    it('should not approve (not pending)', async () => {
      const response = await api
        .post(`/api/names/${globalData.secondNameChangeId}/approve`)
        .send({ adminPassword: env.ADMIN_PASSWORD });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Name change status must be PENDING');
    });

    it('should approve (capitalization change, no transfers)', async () => {
      const submitResponse = await api
        .post(`/api/names`)
        .send({ oldName: 'jakesterwars', newName: 'Jakesterwars' });

      expect(submitResponse.status).toBe(201);

      const response = await api
        .post(`/api/names/${submitResponse.body.id}/approve`)
        .send({ adminPassword: env.ADMIN_PASSWORD });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe(2);
      expect(response.body.resolvedAt).not.toBe(null);
    });

    it('should approve (and transfer data)', async () => {
      const trackResponse = await api.post(`/api/players/track`).send({ username: 'USBC' });

      expect(trackResponse.status).toBe(201);
      expect(trackResponse.body.username).toBe('usbc');
      expect(trackResponse.body.displayName).toBe('USBC');

      const submitResponse = await api.post(`/api/names`).send({ oldName: 'psikoi', newName: 'USBC' });

      expect(submitResponse.status).toBe(201);

      const oldPlayerId = submitResponse.body.playerId;
      const newPlayerId = trackResponse.body.id;

      // Fake the current date to be 20 minutes ago
      jest.useFakeTimers('modern').setSystemTime(new Date(Date.now() - 1_200_000));
      // Create some (pre transition) fake data to test data transferral
      await seedPreTransitionData(oldPlayerId, newPlayerId);

      // Reset the timers to the current (REAL) time
      jest.useRealTimers();
      // Create some (post transition) fake data to test data transferral
      await seedPostTransitionData(oldPlayerId, newPlayerId);

      const response = await api
        .post(`/api/names/${submitResponse.body.id}/approve`)
        .send({ adminPassword: env.ADMIN_PASSWORD });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe(2);
      expect(response.body.resolvedAt).not.toBe(null);

      // Check if records transfered correctly
      const recordsResponse = await api.get(`/api/players/username/USBC/records`);

      expect(recordsResponse.status).toBe(200);
      expect(recordsResponse.body.length).toBe(4);
      expect(recordsResponse.body[0]).toMatchObject({ period: 'month', metric: 'zulrah', value: 500 });
      expect(recordsResponse.body[1]).toMatchObject({ period: 'week', metric: 'agility', value: 100_000 });
      expect(recordsResponse.body[2]).toMatchObject({ period: 'day', metric: 'smithing', value: 10_000 });
      expect(recordsResponse.body[3]).toMatchObject({ period: 'year', metric: 'ranged', value: 1_350_000 });

      // Check if none of the pre-teansition records have been transfered
      const snapshotsResponse = await api
        .get(`/api/players/username/USBC/snapshots`)
        .query({ period: 'week' });

      expect(snapshotsResponse.status).toBe(200);
      expect(snapshotsResponse.body.filter(s => s.obor.kills > -1).length).toBe(0);

      // Check if none of the pre-teansition memberships have been transfered
      const groupsResponse = await api.get(`/api/players/username/USBC/groups`);

      expect(groupsResponse.status).toBe(200);
      expect(groupsResponse.body.length).toBe(1);
      expect(groupsResponse.body[0]).toMatchObject({ name: 'Test Transfer Group', role: 'archer' });

      // Check if none of the pre-teansition participations have been transfered
      const competitionsResponse = await api.get(`/api/players/username/USBC/competitions`);

      expect(competitionsResponse.status).toBe(200);
      expect(competitionsResponse.body.length).toBe(1);
      expect(competitionsResponse.body[0]).toMatchObject({ title: 'Test Comp' });

      const detailsResponse = await api.get(`/api/players/username/USBC`);

      expect(detailsResponse.status).toBe(200);
      expect(detailsResponse.body.id).toBe(oldPlayerId);
      expect(detailsResponse.body.displayName).toBe('USBC');
      expect(detailsResponse.body.country).toBe('PT');
    }, 10_000);
  });

  describe('7 - Listing Group Name Changes', () => {
    it('should not fetch (invalid id)', async () => {
      const fetchResponse = await api.get(`/api/groups/abc/name-changes`);

      expect(fetchResponse.status).toBe(400);
      expect(fetchResponse.body.message).toBe("Parameter 'id' is not a valid number.");
    });

    it('should not fetch (group not found)', async () => {
      const fetchResponse = await api.get(`/api/groups/2000000000/name-changes`);

      expect(fetchResponse.status).toBe(404);
      expect(fetchResponse.body.message).toBe('Group not found.');
    });

    it('should not fetch (group has no members)', async () => {
      // Create group
      const createGroupResponse = await api.post('/api/groups').send({ name: 'Test' });

      expect(createGroupResponse.status).toBe(201);
      expect(createGroupResponse.body.members.length).toBe(0);

      const fetchResponse = await api.get(`/api/groups/${createGroupResponse.body.id}/name-changes`);

      expect(fetchResponse.status).toBe(400);
      expect(fetchResponse.body.message).toBe('That group has no members.');
    });

    it('should fetch group name changes', async () => {
      const payload = {
        name: 'Names Test Group',
        members: [{ username: 'USBC' }, { username: 'Jakesterwars' }]
      };

      // Create group
      const createGroupResponse = await api.post('/api/groups').send(payload);

      expect(createGroupResponse.status).toBe(201);
      expect(createGroupResponse.body.members.map(m => m.username)).toContain('usbc');
      expect(createGroupResponse.body.members.map(m => m.username)).toContain('jakesterwars');

      const groupId = createGroupResponse.body.id;
      const fetchResponse = await api.get(`/api/groups/${groupId}/name-changes`).query({ limit: 200 });

      expect(fetchResponse.body.length).toBe(4); // 3 name changes from Jakesterwars, 1 from USBC
      expect(fetchResponse.body[0].player.username).toBe('usbc');
    });
  });

  describe('8 - Bulk Submission', () => {
    it('should not bulk submit (invalid payload)', async () => {
      const response = await api.post('/api/names/bulk').send();

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid name change list format.');
    });

    it('should not bulk submit (not an array)', async () => {
      const response = await api.post('/api/names/bulk').send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid name change list format.');
    });

    it('should not bulk submit (empty array)', async () => {
      const response = await api.post('/api/names/bulk').send([]);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Empty name change list.');
    });

    it('should not bulk submit (incorrect object shape)', async () => {
      const response = await api.post('/api/names/bulk').send([1, 2, 3]);

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('All name change objects must have ');
    });

    it('should not bulk submit (no valid submissions)', async () => {
      const payload = [
        { oldName: 'A', newName: 'B' },
        { oldName: 'C', newName: 'D' }
      ];

      const response = await api.post('/api/names/bulk').send(payload);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Could not find any valid name changes to submit.');
    });

    it('should bulk submit', async () => {
      const payload = [
        { oldName: 'A', newName: 'B' },
        { oldName: 'USBC', newName: 'Boom' },
        { oldName: 'Jakesterwars', newName: 'rorro' }
      ];

      const response = await api.post('/api/names/bulk').send(payload);

      expect(response.status).toBe(201);
      expect(response.body.message).toMatch('Successfully submitted 2/3 name changes.');
    });
  });
});

async function seedPreTransitionData(oldPlayerId: number, newPlayerId: number) {
  const mockDate = new Date();

  await prisma.player.update({ where: { id: newPlayerId }, data: { country: 'PT' } });

  // Create a few pre-transition-date records
  await prisma.record.createMany({
    data: [
      { playerId: oldPlayerId, period: 'month', metric: 'zulrah', value: 13, updatedAt: mockDate },
      { playerId: oldPlayerId, period: 'week', metric: 'agility', value: 100_000, updatedAt: mockDate },
      { playerId: oldPlayerId, period: 'day', metric: 'smithing', value: 10_000, updatedAt: mockDate }
    ]
  });

  const filteredSnapshotData = {};
  const snapshotData = await snapshotService.fromRS(oldPlayerId, globalData.hiscoresRawData);

  METRICS.forEach(m => {
    filteredSnapshotData[getMetricValueKey(m)] = snapshotData[getMetricValueKey(m)];
    filteredSnapshotData[getMetricRankKey(m)] = snapshotData[getMetricRankKey(m)];
  });

  // Create a pre-transition-date snapshot
  await prisma.snapshot.create({
    data: { ...filteredSnapshotData, playerId: newPlayerId, oborKills: 30, createdAt: mockDate }
  });

  // Create a pre-transition-date test competition and add this player to it
  await prisma.competition.create({
    data: {
      title: 'Test Comp (Pre)',
      metric: 'herblore',
      verificationHash: '',
      startsAt: new Date(Date.now() + 100_000),
      endsAt: new Date(Date.now() + 400_000),
      participations: {
        create: [{ playerId: newPlayerId, createdAt: mockDate }]
      }
    }
  });

  // Create a pre-transition-date test group and add this player to it
  await prisma.group.create({
    data: {
      name: 'Test Transfer Group (Pre)',
      verificationHash: '',
      memberships: {
        create: [{ playerId: newPlayerId, role: 'beast', createdAt: mockDate }]
      }
    }
  });
}

async function seedPostTransitionData(oldPlayerId: number, newPlayerId: number) {
  // Create a few post-transition-date records
  await prisma.record.createMany({
    data: [
      { playerId: newPlayerId, period: 'week', metric: 'agility', value: 50_000 },
      { playerId: newPlayerId, period: 'month', metric: 'zulrah', value: 500 },
      { playerId: newPlayerId, period: 'year', metric: 'ranged', value: 1_350_000 }
    ]
  });

  const filteredSnapshotData = {};
  const snapshotData = await snapshotService.fromRS(oldPlayerId, globalData.hiscoresRawData);

  METRICS.forEach(m => {
    filteredSnapshotData[getMetricValueKey(m)] = snapshotData[getMetricValueKey(m)];
    filteredSnapshotData[getMetricRankKey(m)] = snapshotData[getMetricRankKey(m)];
  });

  // Create a post-transition-date snapshot
  await prisma.snapshot.create({
    data: { playerId: newPlayerId, ...filteredSnapshotData }
  });

  // Create a test competition and add this player to it
  await prisma.competition.create({
    data: {
      title: 'Test Comp',
      metric: 'thieving',
      verificationHash: '',
      startsAt: new Date(Date.now() + 100_000),
      endsAt: new Date(Date.now() + 400_000),
      participations: {
        create: [{ playerId: newPlayerId }]
      }
    }
  });

  // Create a test group and add this player to it
  await prisma.group.create({
    data: {
      name: 'Test Transfer Group',
      verificationHash: '',
      memberships: {
        create: [{ playerId: newPlayerId, role: 'archer' }]
      }
    }
  });
}
