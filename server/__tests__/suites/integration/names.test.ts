import axios from 'axios';
import supertest from 'supertest';
import MockAdapter from 'axios-mock-adapter';
import { getMetricValueKey, getMetricRankKey, METRICS, PlayerType } from '../../../src/utils';
import env from '../../../src/env';
import prisma, { setHooksEnabled } from '../../../src/prisma';
import apiServer from '../../../src/api';
import * as snapshotServices from '../../../src/api/modules/snapshots/snapshot.services';
import * as nameChangeEvents from '../../../src/api/modules/name-changes/name-change.events';
import * as playerEvents from '../../../src/api/modules/players/player.events';
import * as groupEvents from '../../../src/api/modules/groups/group.events';
import {
  registerCMLMock,
  registerHiscoresMock,
  resetDatabase,
  resetRedis,
  readFile,
  sleep
} from '../../utils';

const api = supertest(apiServer.express);
const axiosMock = new MockAdapter(axios, { onNoMatch: 'passthrough' });

const onMembersJoinedEvent = jest.spyOn(groupEvents, 'onMembersJoined');
const onPlayerNameChangedEvent = jest.spyOn(playerEvents, 'onPlayerNameChanged');
const onNameChangeSubmittedEvent = jest.spyOn(nameChangeEvents, 'onNameChangeSubmitted');

const HISCORES_FILE_PATH = `${__dirname}/../../data/hiscores/psikoi_hiscores.txt`;

const globalData = {
  hiscoresRawData: '',
  firstNameChangeId: -1,
  secondNameChangeId: -1,
  testGroupId: -1
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

describe('Names API', () => {
  describe('1 - Submitting', () => {
    it('should not submit (missing oldName)', async () => {
      const response = await api.post(`/names`).send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'oldName' is undefined.");

      expect(onNameChangeSubmittedEvent).not.toHaveBeenCalled();
    });

    it('should not submit (missing newName)', async () => {
      const response = await api.post(`/names`).send({ oldName: 'psikoi' });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'newName' is undefined.");

      expect(onNameChangeSubmittedEvent).not.toHaveBeenCalled();
    });

    it('should not submit (invalid oldName)', async () => {
      const response = await api.post(`/names`).send({ oldName: 'reallylongname', newName: 'good' });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Invalid old name.');

      expect(onNameChangeSubmittedEvent).not.toHaveBeenCalled();
    });

    it('should not submit (invalid newName)', async () => {
      const response = await api.post(`/names`).send({ oldName: 'good', newName: 'reallylongname' });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Invalid new name.');

      expect(onNameChangeSubmittedEvent).not.toHaveBeenCalled();
    });

    it('should not submit (equal names)', async () => {
      const response = await api.post(`/names`).send({ oldName: 'psikoi', newName: 'psikoi' });

      // Note: We allow changes in capitalization, so this condition only fails for equal names (same capitalization)
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Old name and new name cannot be the same.');

      expect(onNameChangeSubmittedEvent).not.toHaveBeenCalled();
    });

    it("should not submit (player doesn't exist)", async () => {
      const response = await api.post(`/names`).send({ oldName: 'psikoi', newName: 'Psikoi' });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Player 'psikoi' is not tracked yet.");

      expect(onNameChangeSubmittedEvent).not.toHaveBeenCalled();
    });

    it('should submit (capitalization change)', async () => {
      const trackResponse = await api.post(`/players/psikoi`);

      expect(trackResponse.status).toBe(201);
      expect(trackResponse.body.username).toBe('psikoi');
      expect(trackResponse.body.displayName).toBe('psikoi');

      // Adding spaces and invalid characters to ensure they get stripped out on submission
      const submitResponse = await api.post(`/names`).send({ oldName: '_psikoi -', newName: ' Psikoi' });

      expect(submitResponse.status).toBe(201);
      expect(submitResponse.body.status).toBe('pending');
      expect(submitResponse.body.oldName).toBe('psikoi');
      expect(submitResponse.body.newName).toBe('Psikoi');
      expect(submitResponse.body.resolvedAt).toBe(null);

      expect(onNameChangeSubmittedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          id: submitResponse.body.id
        })
      );

      globalData.firstNameChangeId = submitResponse.body.id;
    });

    it('should submit (full name change)', async () => {
      const trackResponse = await api.post(`/players/Hydrox6`);

      expect(trackResponse.status).toBe(201);
      expect(trackResponse.body.username).toBe('hydrox6');
      expect(trackResponse.body.displayName).toBe('Hydrox6');

      // Adding spaces and invalid characters to ensure they get stripped out on submission
      const submitResponse = await api.post(`/names`).send({ oldName: 'hydrox6', newName: 'alexsuperfly' });

      expect(submitResponse.status).toBe(201);
      expect(submitResponse.body.status).toBe('pending');
      expect(submitResponse.body.oldName).toBe('Hydrox6');
      expect(submitResponse.body.newName).toBe('alexsuperfly');
      expect(submitResponse.body.resolvedAt).toBe(null);

      expect(onNameChangeSubmittedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          id: submitResponse.body.id
        })
      );
    });

    it('should not submit (repeated approved submission, same name, different capitalization)', async () => {
      const trackResponse = await api.post(`/players/Some guy`);

      expect(trackResponse.status).toBe(201);
      expect(trackResponse.body.username).toBe('some guy');
      expect(trackResponse.body.displayName).toBe('Some guy');

      const submitResponse = await api.post(`/names`).send({ oldName: 'Some guy', newName: 'Some Guy' });
      expect(submitResponse.status).toBe(201);
      expect(submitResponse.body.oldName).toBe('Some guy');
      expect(submitResponse.body.newName).toBe('Some Guy');

      expect(onNameChangeSubmittedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          id: submitResponse.body.id
        })
      );

      const approveResponse = await api
        .post(`/names/${submitResponse.body.id}/approve`)
        .send({ adminPassword: env.ADMIN_PASSWORD });

      expect(approveResponse.status).toBe(200);
      expect(approveResponse.body.status).toBe('approved');
      expect(approveResponse.body.resolvedAt).not.toBe(null);

      expect(onPlayerNameChangedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          displayName: 'Some Guy'
        }),
        'Some guy'
      );

      const resubmitResponse = await api.post(`/names`).send({ oldName: 'Some guy', newName: 'Some Guy' });
      expect(resubmitResponse.status).toBe(400);
    });

    it('should not submit (repeated approved submission, different names)', async () => {
      // Track new player (zezima)
      const firstTrackResponse = await api.post(`/players/Zezima`);
      expect(firstTrackResponse.status).toBe(201);
      expect(firstTrackResponse.body.username).toBe('zezima');

      // Track new player (sethmare)
      const secondTrackResponse = await api.post(`/players/Sethmare`);
      expect(secondTrackResponse.status).toBe(201);
      expect(secondTrackResponse.body.username).toBe('sethmare');

      // Change name from zezima to sethmare
      const submitResponse = await api.post(`/names`).send({ oldName: 'zezima', newName: 'sethmare' });
      expect(submitResponse.status).toBe(201);

      globalData.secondNameChangeId = submitResponse.body.id;

      expect(onNameChangeSubmittedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          id: submitResponse.body.id
        })
      );

      jest.resetAllMocks();

      // Approve this name change
      const approvalResponse = await api
        .post(`/names/${submitResponse.body.id}/approve`)
        .send({ adminPassword: env.ADMIN_PASSWORD });

      expect(approvalResponse.status).toBe(200);
      expect(approvalResponse.body.status).toBe('approved');
      expect(approvalResponse.body.oldName).toBe('Zezima');
      expect(approvalResponse.body.newName).toBe('sethmare');
      expect(approvalResponse.body.resolvedAt).not.toBe(null);

      // Track new player (zezima) (again)
      const thirdTrackResponse = await api.post(`/players/Zezima`);
      expect(thirdTrackResponse.status).toBe(201);
      expect(thirdTrackResponse.body.username).toBe('zezima');

      // Change name from zezima to sethmare (again)
      const secondSubmitResponse = await api.post(`/names`).send({ oldName: 'zezima', newName: 'sethmare' });

      expect(secondSubmitResponse.status).toBe(400);
      expect(secondSubmitResponse.body.message).toMatch('Cannot submit a duplicate (approved) name change');

      expect(onNameChangeSubmittedEvent).not.toHaveBeenCalled();
    });

    it('should not submit (repeated pending submission)', async () => {
      const submitResponse = await api.post(`/names`).send({ oldName: 'hydrox6', newName: 'alexsuperfly' });

      expect(submitResponse.status).toBe(400);
      expect(submitResponse.body.message).toMatch("There's already a similar pending name change.");

      expect(onNameChangeSubmittedEvent).not.toHaveBeenCalled();
    });
  });

  describe('2 - Details', () => {
    it('should not fetch details (missing id)', async () => {
      const response = await api.get(`/names/wow`);

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'id' is not a valid number.");
    });

    it('should not fetch details (id not found)', async () => {
      const response = await api.get(`/names/2000000000`);

      expect(response.status).toBe(404);
      expect(response.body.message).toMatch('Name change id was not found.');
    });

    it('should fetch details (pending name change)', async () => {
      const response = await api.get(`/names/${globalData.firstNameChangeId}`);

      expect(response.status).toBe(200);
      expect(response.body.nameChange.id).toBe(globalData.firstNameChangeId);
      expect(response.body.nameChange.status).toBe('pending');
      expect(response.body.data.isOldOnHiscores).toBe(true);
      expect(response.body.data.isNewOnHiscores).toBe(true);
      expect(response.body.data.isNewTracked).toBe(true);
      expect(response.body.data.hasNegativeGains).toBe(false);
    });

    it('should not have new stats (pending name change, invalid new name)', async () => {
      // Create a new invalid name change
      const updateResponse = await api.post(`/names`).send({ oldName: 'Psikoi', newName: 'invalid' });
      expect(updateResponse.status).toBe(201);

      // Mock the hiscores to not find the new username
      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 404, rawData: 'no stats here :)' }
      });

      // Get the name change details
      const response = await api.get(`/names/${updateResponse.body.id}`);

      expect(response.status).toBe(200);
      expect(response.body.data.oldStats).toBeTruthy();
      expect(response.body.data.newStats).toBeNull();

      // Mock regular hiscores data, and block any ironman requests
      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: globalData.hiscoresRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });
    });

    it('should fetch details (approved name change, no data)', async () => {
      const response = await api.get(`/names/${globalData.secondNameChangeId}`);

      expect(response.status).toBe(200);
      expect(response.body.nameChange.id).toBe(globalData.secondNameChangeId);
      expect(response.body.nameChange.status).toBe('approved');
      expect(response.body.data).toBeUndefined();
    });
  });

  describe('3 - Listing', () => {
    it('should not fetch list (invalid status)', async () => {
      const response = await api.get(`/names`).query({ status: 50 });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(
        "Invalid enum value for 'status'. Expected pending | denied | approved"
      );
    });

    it('should not fetch list (negative pagination limit)', async () => {
      const response = await api.get(`/names`).query({ limit: -5 });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'limit' must be > 0.");
    });

    it('should not fetch list (negative pagination offset)', async () => {
      const response = await api.get(`/names`).query({ offset: -5 });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'offset' must be >= 0.");
    });

    it('should fetch list (no filters)', async () => {
      const response = await api.get(`/names`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(5);
      expect(response.body.filter(n => n.status === 'pending').length).toBe(3);
      expect(response.body.filter(n => n.status === 'approved').length).toBe(2);
      expect(response.body.filter(n => n.oldName === 'Zezima').length).toBe(1);
      expect(response.body.filter(n => n.oldName === 'psikoi').length).toBe(2);
    });

    it('should fetch list (filtered by status)', async () => {
      const response = await api.get(`/names`).query({ status: 'approved' });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
      expect(response.body.filter(n => n.status !== 'approved').length).toBe(0);
    });

    it('should fetch list (filtered by username)', async () => {
      const response = await api.get(`/names`).query({ username: 'zezi' });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body.filter(n => n.oldName !== 'Zezima').length).toBe(0);
    });

    it('should fetch (empty) list (filtered by username & status)', async () => {
      const response = await api.get(`/names`).query({ username: 'zez', status: 'pending' });

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(0);
    });

    it('should fetch list (with paginated results)', async () => {
      const firstResponse = await api.get(`/names`).query({ limit: 1 });

      expect(firstResponse.status).toBe(200);
      expect(firstResponse.body.length).toBe(1);

      const secondResponse = await api.get(`/names`).query({ limit: 1, offset: 1 });

      expect(secondResponse.status).toBe(200);
      expect(secondResponse.body.length).toBe(1);
      expect(secondResponse.body[0].id).not.toBe(firstResponse.body.id);
    });
  });

  describe('4 - Listing Player Names', () => {
    it('should not fetch list (player not found)', async () => {
      const firstResponse = await api.get(`/players/Jakesterwars/names`);

      expect(firstResponse.status).toBe(404);
      expect(firstResponse.body.message).toMatch('Player not found.');
    });

    it('should fetch list', async () => {
      const response = await api.get(`/players/sethmare/names`);
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
    });

    it('should fetch list (again, after a name change)', async () => {
      const submitResponse = await api.post(`/names`).send({ oldName: 'sethmare', newName: 'jakesterwars' });

      expect(submitResponse.status).toBe(201);

      const approvalResponse = await api
        .post(`/names/${submitResponse.body.id}/approve`)
        .send({ adminPassword: env.ADMIN_PASSWORD });

      expect(approvalResponse.status).toBe(200);

      const secondFetchResponse = await api.get(`/players/Jakesterwars/names`);
      expect(secondFetchResponse.status).toBe(200);
      expect(secondFetchResponse.body.length).toBe(2);
    });
  });

  describe('5 - Denying', () => {
    it('should not deny (invalid admin password)', async () => {
      const response = await api.post(`/names/2000000000/deny`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Required parameter 'adminPassword' is undefined.");
    });

    it('should not deny (incorrect admin password)', async () => {
      const response = await api.post(`/names/2000000000/deny`).send({ adminPassword: 'abc' });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Incorrect admin password.');
    });

    it('should not deny (invalid id)', async () => {
      const response = await api.post(`/names/abc/deny`).send({ adminPassword: env.ADMIN_PASSWORD });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Parameter 'id' is not a valid number.");
    });

    it('should not deny (id not found)', async () => {
      const response = await api.post(`/names/2000000000/deny`).send({ adminPassword: env.ADMIN_PASSWORD });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Name change id was not found.');
    });

    it('should not deny (already approved)', async () => {
      const response = await api
        .post(`/names/${globalData.secondNameChangeId}/deny`)
        .send({ adminPassword: env.ADMIN_PASSWORD });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Name change status must be PENDING');
    });

    it('should deny', async () => {
      const response = await api
        .post(`/names/${globalData.firstNameChangeId}/deny`)
        .send({ adminPassword: env.ADMIN_PASSWORD });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('denied');
      expect(response.body.resolvedAt).not.toBe(null);
      expect(response.body.id).toBe(globalData.firstNameChangeId);
    });
  });

  describe('6 - Approving', () => {
    it('should not approve (invalid admin password)', async () => {
      const response = await api.post(`/names/2000000000/approve`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Required parameter 'adminPassword' is undefined.");

      expect(onPlayerNameChangedEvent).not.toHaveBeenCalled();
    });

    it('should not approve (incorrect admin password)', async () => {
      const response = await api.post(`/names/2000000000/approve`).send({ adminPassword: 'abc' });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Incorrect admin password.');

      expect(onPlayerNameChangedEvent).not.toHaveBeenCalled();
    });

    it('should not approve (invalid id)', async () => {
      const response = await api.post(`/names/abc/approve`).send({ adminPassword: env.ADMIN_PASSWORD });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Parameter 'id' is not a valid number.");

      expect(onPlayerNameChangedEvent).not.toHaveBeenCalled();
    });

    it('should not approve (id not found)', async () => {
      const response = await api
        .post(`/names/2000000000/approve`)
        .send({ adminPassword: env.ADMIN_PASSWORD });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Name change id was not found.');

      expect(onPlayerNameChangedEvent).not.toHaveBeenCalled();
    });

    it('should not approve (not pending)', async () => {
      const response = await api
        .post(`/names/${globalData.secondNameChangeId}/approve`)
        .send({ adminPassword: env.ADMIN_PASSWORD });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Name change status must be PENDING');

      expect(onPlayerNameChangedEvent).not.toHaveBeenCalled();
    });

    it('should approve (capitalization change, no transfers)', async () => {
      const submitResponse = await api
        .post(`/names`)
        .send({ oldName: 'jakesterwars', newName: 'Jakesterwars' });

      expect(submitResponse.status).toBe(201);

      const response = await api
        .post(`/names/${submitResponse.body.id}/approve`)
        .send({ adminPassword: env.ADMIN_PASSWORD });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('approved');
      expect(response.body.resolvedAt).not.toBe(null);

      expect(onPlayerNameChangedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          displayName: 'Jakesterwars'
        }),
        'jakesterwars'
      );
    });

    it('should approve (and transfer data)', async () => {
      const trackResponse = await api.post(`/players/USBC`);

      expect(trackResponse.status).toBe(201);
      expect(trackResponse.body.username).toBe('usbc');
      expect(trackResponse.body.displayName).toBe('USBC');

      const submitResponse = await api.post(`/names`).send({ oldName: 'psikoi', newName: 'USBC' });

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

      jest.resetAllMocks();

      const response = await api
        .post(`/names/${submitResponse.body.id}/approve`)
        .send({ adminPassword: env.ADMIN_PASSWORD });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('approved');
      expect(response.body.resolvedAt).not.toBe(null);

      await sleep(500);

      expect(onPlayerNameChangedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          displayName: 'USBC'
        }),
        'psikoi'
      );

      expect(onMembersJoinedEvent).not.toHaveBeenCalled();

      // Check if records transfered correctly
      const recordsResponse = await api.get(`/players/USBC/records`);

      expect(recordsResponse.status).toBe(200);
      expect(recordsResponse.body.length).toBe(5);

      expect(recordsResponse.body.filter(r => r.metric === 'zulrah')[0]).toMatchObject({
        period: 'month',
        metric: 'zulrah',
        value: 500
      });

      expect(recordsResponse.body.filter(r => r.metric === 'ranged')[0]).toMatchObject({
        period: 'year',
        metric: 'ranged',
        value: 1_350_000
      });

      expect(recordsResponse.body.filter(r => r.metric === 'agility')[0]).toMatchObject({
        period: 'week',
        metric: 'agility',
        value: 100_000
      });

      expect(recordsResponse.body.filter(r => r.metric === 'smithing')[0]).toMatchObject({
        period: 'day',
        metric: 'smithing',
        value: 10_000
      });

      expect(recordsResponse.body.filter(r => r.metric === 'ehp')[0]).toMatchObject({
        period: 'day',
        metric: 'ehp',
        value: 5.67
      });

      // Check if none of the pre-transition snapshots have been transfered
      const snapshotsResponse = await api.get(`/players/USBC/snapshots`).query({ period: 'week' });

      expect(snapshotsResponse.status).toBe(200);
      expect(snapshotsResponse.body.filter(s => s.data.bosses.obor.kills > -1).length).toBe(0);

      // Check if none of the pre-transition memberships have been transfered
      const groupsResponse = await api.get(`/players/USBC/groups`);

      expect(groupsResponse.status).toBe(200);
      expect(groupsResponse.body.length).toBe(1);
      expect(groupsResponse.body[0]).toMatchObject({
        role: 'archer',
        group: { name: 'Test Transfer Group' }
      });

      // Check if none of the pre-transition participations have been transfered
      const competitionsResponse = await api.get(`/players/USBC/competitions`);

      expect(competitionsResponse.status).toBe(200);
      expect(competitionsResponse.body.length).toBe(1);
      expect(competitionsResponse.body[0].competition).toMatchObject({
        title: 'Test Comp',
        metric: 'thieving'
      });

      const detailsResponse = await api.get(`/players/USBC`);

      expect(detailsResponse.status).toBe(200);
      expect(detailsResponse.body.id).toBe(oldPlayerId);
      expect(detailsResponse.body.displayName).toBe('USBC');
      expect(detailsResponse.body.country).toBe('PT');
    }, 10_000);
  });

  describe('7 - Listing Group Name Changes', () => {
    it('should not fetch (invalid id)', async () => {
      const fetchResponse = await api.get(`/groups/abc/name-changes`);

      expect(fetchResponse.status).toBe(400);
      expect(fetchResponse.body.message).toBe("Parameter 'id' is not a valid number.");
    });

    it('should not fetch (group not found)', async () => {
      const fetchResponse = await api.get(`/groups/2000000000/name-changes`);

      expect(fetchResponse.status).toBe(404);
      expect(fetchResponse.body.message).toBe('Group not found.');
    });

    it('should not fetch (negative pagination limit)', async () => {
      const payload = {
        name: 'Names Test Group',
        members: [{ username: 'USBC' }, { username: 'Jakesterwars' }]
      };

      // Create group
      const createGroupResponse = await api.post('/groups').send(payload);

      expect(createGroupResponse.status).toBe(201);
      expect(createGroupResponse.body.group.memberships.map(m => m.player.username)).toContain('usbc');
      expect(createGroupResponse.body.group.memberships.map(m => m.player.username)).toContain(
        'jakesterwars'
      );

      globalData.testGroupId = createGroupResponse.body.group.id;

      const fetchResponse = await api
        .get(`/groups/${globalData.testGroupId}/name-changes`)
        .query({ limit: -5 });

      expect(fetchResponse.status).toBe(400);
      expect(fetchResponse.body.message).toBe("Parameter 'limit' must be > 0.");
    });

    it('should not fetch (negative pagination offset)', async () => {
      const fetchResponse = await api
        .get(`/groups/${globalData.testGroupId}/name-changes`)
        .query({ limit: 3, offset: -5 });

      expect(fetchResponse.status).toBe(400);
      expect(fetchResponse.body.message).toBe("Parameter 'offset' must be >= 0.");
    });

    it('should fetch group name changes', async () => {
      const fetchResponse = await api
        .get(`/groups/${globalData.testGroupId}/name-changes`)
        .query({ limit: null, offset: 'abc' }); // the API should ignore these invalid pagination params

      expect(fetchResponse.body.length).toBe(4); // 3 name changes from Jakesterwars, 1 from USBC
      expect(fetchResponse.body[0].player.username).toBe('usbc');

      const fetchResponseLimited = await api
        .get(`/groups/${globalData.testGroupId}/name-changes`)
        .query({ limit: 2, offset: 2 });

      expect(fetchResponseLimited.body.length).toBe(2); // Test the limit
      expect(fetchResponseLimited.body[0].id).toBe(fetchResponse.body[2].id); // Test the offset
    });
  });

  describe('8 - Bulk Submission', () => {
    it('should not bulk submit (invalid payload)', async () => {
      const response = await api.post('/names/bulk').send();

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid name change list format.');
    });

    it('should not bulk submit (not an array)', async () => {
      const response = await api.post('/names/bulk').send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid name change list format.');
    });

    it('should not bulk submit (empty array)', async () => {
      const response = await api.post('/names/bulk').send([]);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Empty name change list.');
    });

    it('should not bulk submit (incorrect object shape)', async () => {
      const response = await api.post('/names/bulk').send([1, 2, 3]);

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('All name change objects must have ');
    });

    it('should not bulk submit (equal names)', async () => {
      const payload = [{ oldName: 'Psikoi', newName: 'Psikoi' }];

      const response = await api.post('/names/bulk').send(payload);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Old name and new name cannot be the same.');
    });

    it('should not bulk submit (no valid submissions)', async () => {
      const payload = [
        { oldName: 'A', newName: 'B' },
        { oldName: 'C', newName: 'D' }
      ];

      const response = await api.post('/names/bulk').send(payload);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Could not find any valid name changes to submit.');
    });

    it('should bulk submit', async () => {
      const payload = [
        { oldName: 'A', newName: 'B' },
        { oldName: 'USBC', newName: 'Boom' },
        { oldName: 'Jakesterwars', newName: 'rorro' }
      ];

      const response = await api.post('/names/bulk').send(payload);

      expect(response.status).toBe(201);
      expect(response.body.nameChangesSubmitted).toBe(2);
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

  const snapshotData = await snapshotServices.buildSnapshot({
    playerId: oldPlayerId,
    rawCSV: globalData.hiscoresRawData
  });

  METRICS.forEach(m => {
    filteredSnapshotData[getMetricValueKey(m)] = snapshotData[getMetricValueKey(m)];
    filteredSnapshotData[getMetricRankKey(m)] = snapshotData[getMetricRankKey(m)];
  });

  setHooksEnabled(false); // disable hooks to prevent gains/records from being calculated from this
  // Create a pre-transition-date snapshot
  await prisma.snapshot.create({
    data: { ...filteredSnapshotData, playerId: newPlayerId, oborKills: 30, createdAt: mockDate }
  });
  setHooksEnabled(true);

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
      { playerId: newPlayerId, period: 'year', metric: 'ranged', value: 1_350_000 },
      { playerId: newPlayerId, period: 'day', metric: 'ehp', value: 5.67 * 10_000 } // ehp/ehb records get mapped to ints on the database
    ]
  });

  const filteredSnapshotData = {};

  const snapshotData = await snapshotServices.buildSnapshot({
    playerId: oldPlayerId,
    rawCSV: globalData.hiscoresRawData
  });

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
