import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import supertest from 'supertest';
import APIInstance from '../../../src/api';
import { eventEmitter } from '../../../src/api/events';
import * as GroupMembersJoinedEvent from '../../../src/api/events/handlers/group-members-joined.event';
import * as NameChangeCreatedEvent from '../../../src/api/events/handlers/name-change-created.event';
import * as PlayerArchivedEvent from '../../../src/api/events/handlers/player-archived.event';
import * as PlayerNameChangedEvent from '../../../src/api/events/handlers/player-name-changed.event';
import { buildHiscoresSnapshot } from '../../../src/api/modules/snapshots/services/BuildHiscoresSnapshot';
import { jobManager, JobType } from '../../../src/jobs';
import prisma from '../../../src/prisma';
import { HiscoresDataSchema } from '../../../src/services/jagex.service';
import { redisClient } from '../../../src/services/redis.service';
import { METRICS, PlayerAnnotationType, PlayerStatus, PlayerType } from '../../../src/types';
import { getMetricRankKey } from '../../../src/utils/get-metric-rank-key.util';
import { getMetricValueKey } from '../../../src/utils/get-metric-value-key.util';
import { modifyRawHiscoresData, readFile, registerHiscoresMock, resetDatabase, sleep } from '../../utils';

const api = supertest(new APIInstance().init().express);
const axiosMock = new MockAdapter(axios, { onNoMatch: 'passthrough' });

const groupMembersJoinedEvent = jest.spyOn(GroupMembersJoinedEvent, 'handler');
const playerArchivedEvent = jest.spyOn(PlayerArchivedEvent, 'handler');
const playerNameChangedEvent = jest.spyOn(PlayerNameChangedEvent, 'handler');
const nameChangeCreatedEvent = jest.spyOn(NameChangeCreatedEvent, 'handler');

const globalData = {
  hiscoresRawData: '',
  firstNameChangeId: -1,
  secondNameChangeId: -1,
  testGroupId: -1
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

  globalData.hiscoresRawData = await readFile(`${__dirname}/../../data/hiscores/psikoi_hiscores.json`);

  // Mock regular hiscores data, and block any ironman requests
  registerHiscoresMock(axiosMock, {
    [PlayerType.REGULAR]: { statusCode: 200, rawData: globalData.hiscoresRawData },
    [PlayerType.IRONMAN]: { statusCode: 404 }
  });
});

afterAll(() => {
  jest.useRealTimers();
  axiosMock.reset();
  redisClient.quit();
});

describe('Names API', () => {
  describe('1 - Submitting', () => {
    it('should not submit (missing oldName)', async () => {
      const response = await api.post(`/names`).send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'oldName' is undefined.");

      expect(nameChangeCreatedEvent).not.toHaveBeenCalled();
    });

    it('should not submit (missing newName)', async () => {
      const response = await api.post(`/names`).send({ oldName: 'psikoi' });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'newName' is undefined.");

      expect(nameChangeCreatedEvent).not.toHaveBeenCalled();
    });

    it('should not submit (invalid oldName)', async () => {
      const response = await api.post(`/names`).send({ oldName: 'reallylongname', newName: 'good' });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Invalid old name.');

      expect(nameChangeCreatedEvent).not.toHaveBeenCalled();
    });

    it('should not submit (invalid newName)', async () => {
      const response = await api.post(`/names`).send({ oldName: 'good', newName: 'reallylongname' });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Invalid new name.');

      expect(nameChangeCreatedEvent).not.toHaveBeenCalled();
    });

    it('should not submit (equal names)', async () => {
      const response = await api.post(`/names`).send({ oldName: 'psikoi', newName: 'psikoi' });

      // Note: We allow changes in capitalization, so this condition only fails for equal names (same capitalization)
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('Old name and new name cannot be the same.');

      expect(nameChangeCreatedEvent).not.toHaveBeenCalled();
    });

    it("should not submit (player doesn't exist)", async () => {
      const response = await api.post(`/names`).send({ oldName: 'psikoi', newName: 'Psikoi' });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Player 'psikoi' is not tracked yet.");

      expect(nameChangeCreatedEvent).not.toHaveBeenCalled();
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

      expect(nameChangeCreatedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          nameChangeId: submitResponse.body.id
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

      expect(nameChangeCreatedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          nameChangeId: submitResponse.body.id
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

      expect(nameChangeCreatedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          nameChangeId: submitResponse.body.id
        })
      );

      const approveResponse = await api
        .post(`/names/${submitResponse.body.id}/approve`)
        .send({ adminPassword: process.env.ADMIN_PASSWORD });

      expect(approveResponse.status).toBe(200);
      expect(approveResponse.body.status).toBe('approved');
      expect(approveResponse.body.resolvedAt).not.toBe(null);
      expect(approveResponse.body.reviewContext).toBe(null);

      expect(playerNameChangedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'some guy',
          previousDisplayName: 'Some guy'
        })
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

      expect(nameChangeCreatedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          nameChangeId: submitResponse.body.id
        })
      );

      nameChangeCreatedEvent.mockClear();

      // Approve this name change
      const approvalResponse = await api
        .post(`/names/${submitResponse.body.id}/approve`)
        .send({ adminPassword: process.env.ADMIN_PASSWORD });

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

      expect(nameChangeCreatedEvent).not.toHaveBeenCalled();
    });

    it('should not submit (repeated pending submission)', async () => {
      const submitResponse = await api.post(`/names`).send({ oldName: 'hydrox6', newName: 'alexsuperfly' });

      expect(submitResponse.status).toBe(400);
      expect(submitResponse.body.message).toMatch("There's already a similar pending name change.");

      expect(nameChangeCreatedEvent).not.toHaveBeenCalled();
    });

    it('should submit (names contained in repeated pending submission)', async () => {
      const trackResponse = await api.post(`/players/Dro`);
      expect(trackResponse.status).toBe(201);
      expect(trackResponse.body.username).toBe('dro');

      const submitResponse = await api.post(`/names`).send({ oldName: 'dro', newName: 'Super' });

      expect(submitResponse.status).toBe(201);
      expect(submitResponse.body.oldName).toBe('Dro');
      expect(submitResponse.body.newName).toBe('Super');

      expect(nameChangeCreatedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          nameChangeId: submitResponse.body.id
        })
      );
    });

    it('should submit (same name, different capitalization)', async () => {
      const trackResponse = await api.post(`/players/Rorro`);

      expect(trackResponse.status).toBe(201);
      expect(trackResponse.body.username).toBe('rorro');
      expect(trackResponse.body.displayName).toBe('Rorro');

      const submitResponse = await api.post(`/names`).send({ oldName: 'Rorro', newName: 'RoRRo' });
      expect(submitResponse.status).toBe(201);
      expect(submitResponse.body.oldName).toBe('Rorro');
      expect(submitResponse.body.newName).toBe('RoRRo');

      expect(nameChangeCreatedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          nameChangeId: submitResponse.body.id
        })
      );

      const approveResponse = await api
        .post(`/names/${submitResponse.body.id}/approve`)
        .send({ adminPassword: process.env.ADMIN_PASSWORD });

      expect(approveResponse.status).toBe(200);
      expect(approveResponse.body.status).toBe('approved');
      expect(approveResponse.body.resolvedAt).not.toBe(null);
      expect(approveResponse.body.reviewContext).toBe(null);

      expect(playerNameChangedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'rorro',
          previousDisplayName: 'Rorro'
        })
      );

      const resubmitResponse = await api.post(`/names`).send({ oldName: 'RoRRo', newName: 'rorrO' });
      expect(resubmitResponse.status).toBe(201);
      expect(resubmitResponse.body.oldName).toBe('RoRRo');
      expect(resubmitResponse.body.newName).toBe('rorrO');

      await prisma.nameChange.deleteMany({
        where: { id: { in: [submitResponse.body.id, resubmitResponse.body.id] } }
      });
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

    it('should fetch details (pending name change, fallback to ironman hiscores)', async () => {
      // Mock the regular hiscores to not find the new username
      // this should force the API to fallback to checking the ironman hiscores instead.
      // This is useful because some low level ironmen don't show up on the regular hiscores.
      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 404 },
        [PlayerType.IRONMAN]: { statusCode: 200, rawData: globalData.hiscoresRawData }
      });

      const response = await api.get(`/names/${globalData.firstNameChangeId}`);

      expect(response.status).toBe(200);
      expect(response.body.nameChange.id).toBe(globalData.firstNameChangeId);
      expect(response.body.nameChange.status).toBe('pending');
      expect(response.body.data.isOldOnHiscores).toBe(false);
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
        [PlayerType.REGULAR]: { statusCode: 404, rawData: 'no stats here :)' },
        [PlayerType.IRONMAN]: { statusCode: 404, rawData: 'no stats here :)' }
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

    it('should fetch details (valid newStats, newPlayer not tracked)', async () => {
      const updateResponse = await api.post(`/names`).send({ oldName: 'Psikoi', newName: 'vessel' });
      expect(updateResponse.status).toBe(201);

      // Get the name change details
      const response = await api.get(`/names/${updateResponse.body.id}`);

      expect(response.status).toBe(200);
      expect(response.body.data.oldStats).not.toBeNull();
      // Even if newPlayer cannot be found on our db, newStats might still be gathered from newName's hiscores
      expect(response.body.data.newStats).not.toBeNull();
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
      expect(response.body.length).toBe(7);
      expect(response.body.filter(n => n.status === 'pending').length).toBe(5);
      expect(response.body.filter(n => n.status === 'approved').length).toBe(2);
      expect(response.body.filter(n => n.oldName.toLowerCase() === 'zezima').length).toBe(1);
      expect(response.body.filter(n => n.oldName.toLowerCase() === 'psikoi').length).toBe(3);
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

    it('should fetch list (filtered by username, leading/trailing whitespace)', async () => {
      const response = await api.get(`/names`).query({ username: '  zezi  ' });

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
        .send({ adminPassword: process.env.ADMIN_PASSWORD });

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
      const response = await api.post(`/names/abc/deny`).send({ adminPassword: process.env.ADMIN_PASSWORD });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Parameter 'id' is not a valid number.");
    });

    it('should not deny (id not found)', async () => {
      const response = await api
        .post(`/names/2000000000/deny`)
        .send({ adminPassword: process.env.ADMIN_PASSWORD });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Name change id was not found.');
    });

    it('should not deny (already approved)', async () => {
      const response = await api
        .post(`/names/${globalData.secondNameChangeId}/deny`)
        .send({ adminPassword: process.env.ADMIN_PASSWORD });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Name change status must be PENDING');
    });

    it('should deny', async () => {
      const response = await api
        .post(`/names/${globalData.firstNameChangeId}/deny`)
        .send({ adminPassword: process.env.ADMIN_PASSWORD });

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(globalData.firstNameChangeId);
      expect(response.body.status).toBe('denied');
      expect(response.body.resolvedAt).not.toBe(null);
      expect(response.body.reviewContext).toMatchObject({ reason: 'manual_review' });
    });
  });

  describe('6 - Approving', () => {
    it('should not approve (invalid admin password)', async () => {
      const response = await api.post(`/names/2000000000/approve`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Required parameter 'adminPassword' is undefined.");

      expect(playerNameChangedEvent).not.toHaveBeenCalled();
    });

    it('should not approve (incorrect admin password)', async () => {
      const response = await api.post(`/names/2000000000/approve`).send({ adminPassword: 'abc' });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Incorrect admin password.');

      expect(playerNameChangedEvent).not.toHaveBeenCalled();
    });

    it('should not approve (invalid id)', async () => {
      const response = await api
        .post(`/names/abc/approve`)
        .send({ adminPassword: process.env.ADMIN_PASSWORD });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Parameter 'id' is not a valid number.");

      expect(playerNameChangedEvent).not.toHaveBeenCalled();
    });

    it('should not approve (id not found)', async () => {
      const response = await api
        .post(`/names/2000000000/approve`)
        .send({ adminPassword: process.env.ADMIN_PASSWORD });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Name change id was not found.');

      expect(playerNameChangedEvent).not.toHaveBeenCalled();
    });

    it('should not approve (not pending)', async () => {
      const response = await api
        .post(`/names/${globalData.secondNameChangeId}/approve`)
        .send({ adminPassword: process.env.ADMIN_PASSWORD });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Name change status must be PENDING');

      expect(playerNameChangedEvent).not.toHaveBeenCalled();
    });

    it('should approve (capitalization change, no transfers)', async () => {
      const submitResponse = await api
        .post(`/names`)
        .send({ oldName: 'jakesterwars', newName: 'Jakesterwars' });

      expect(submitResponse.status).toBe(201);

      const response = await api
        .post(`/names/${submitResponse.body.id}/approve`)
        .send({ adminPassword: process.env.ADMIN_PASSWORD });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('approved');
      expect(response.body.resolvedAt).not.toBe(null);

      expect(playerNameChangedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'jakesterwars',
          previousDisplayName: 'jakesterwars'
        })
      );

      // New player didn't exist, so no profiles needed to be archived
      expect(playerArchivedEvent).not.toHaveBeenCalled();
    });

    it("should approve (new username isn't tracked, no transfers)", async () => {
      const trackResponse = await api.post(`/players/Momo`);

      expect(trackResponse.status).toBe(201);
      expect(trackResponse.body.username).toBe('momo');
      expect(trackResponse.body.displayName).toBe('Momo');

      const submitResponse = await api.post(`/names`).send({
        oldName: 'momo',
        newName: 'Mudscape 17'
      });

      expect(submitResponse.status).toBe(201);

      const response = await api
        .post(`/names/${submitResponse.body.id}/approve`)
        .send({ adminPassword: process.env.ADMIN_PASSWORD });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('approved');
      expect(response.body.resolvedAt).not.toBe(null);

      expect(playerNameChangedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'mudscape 17',
          previousDisplayName: 'Momo'
        })
      );

      // New player didn't exist, so no profiles needed to be archived
      expect(playerArchivedEvent).not.toHaveBeenCalled();
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
      jest.useFakeTimers().setSystemTime(new Date(Date.now() - 1_200_000));
      // Create some (pre transition) fake data to test data transferral
      await seedPreTransitionData(oldPlayerId, newPlayerId);

      // Reset the timers to the current (REAL) time
      jest.useRealTimers();
      // Create some (post transition) fake data to test data transferral
      await seedPostTransitionData(oldPlayerId, newPlayerId);

      jest.resetAllMocks();

      const response = await api
        .post(`/names/${submitResponse.body.id}/approve`)
        .send({ adminPassword: process.env.ADMIN_PASSWORD });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('approved');
      expect(response.body.resolvedAt).not.toBe(null);

      await sleep(100);

      expect(playerNameChangedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'usbc',
          previousDisplayName: 'psikoi'
        })
      );

      expect(groupMembersJoinedEvent).not.toHaveBeenCalled();

      // "New" player profile was archived
      expect(playerArchivedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          username: expect.stringContaining('archive'),
          previousUsername: 'usbc'
        })
      );

      const archive = (await prisma.playerArchive.findFirst({
        where: {
          playerId: newPlayerId,
          previousUsername: 'usbc'
        }
      }))!;

      const { archiveUsername } = archive;

      expect(archive).not.toBeNull();

      // Check if records transfered correctly to the main player
      const mainRecordsResponse = await api.get(`/players/USBC/records`);

      expect(mainRecordsResponse.status).toBe(200);
      expect(mainRecordsResponse.body.length).toBe(5);

      expect(mainRecordsResponse.body.filter(r => r.metric === 'zulrah')[0]).toMatchObject({
        period: 'month',
        metric: 'zulrah',
        value: 500
      });

      expect(mainRecordsResponse.body.filter(r => r.metric === 'ranged')[0]).toMatchObject({
        period: 'year',
        metric: 'ranged',
        value: 1_350_000
      });

      expect(mainRecordsResponse.body.filter(r => r.metric === 'agility')[0]).toMatchObject({
        period: 'week',
        metric: 'agility',
        value: 100_000
      });

      expect(mainRecordsResponse.body.filter(r => r.metric === 'smithing')[0]).toMatchObject({
        period: 'day',
        metric: 'smithing',
        value: 10_000
      });

      expect(mainRecordsResponse.body.filter(r => r.metric === 'ehp')[0]).toMatchObject({
        period: 'day',
        metric: 'ehp',
        value: 5.67
      });

      // Check if records transfered correctly to the archived player
      const archivedRecordsResponse = await api.get(`/players/${archiveUsername}/records`);

      expect(archivedRecordsResponse.status).toBe(200);
      expect(archivedRecordsResponse.body.length).toBe(1); // Only one record was "abandoned"

      // oldPlayer's week record for agility was 100k, but newPlayer's week record for agility was 50k.
      // So this 50k record wasn't transfered (because it was lower than the existing one).
      // In other words, it was abandoned in this archived "new" profile.

      expect(archivedRecordsResponse.body.filter(r => r.metric === 'agility')[0]).toMatchObject({
        period: 'week',
        metric: 'agility',
        value: 50_000
      });

      // Check if annotations transfered correctly to the main player
      const mainAnnotationsResponse = await api.get(`/players/USBC`);

      expect(mainAnnotationsResponse.status).toBe(200);
      expect(mainAnnotationsResponse.body.annotations.length).toBe(2);

      // Old player already had OPT_OUT, and the new player had OPT_OUT (deduped) AND FAKE_F2P
      expect(
        mainAnnotationsResponse.body.annotations.find(a => a.type === PlayerAnnotationType.FAKE_F2P)
      ).toBeDefined();
      expect(
        mainAnnotationsResponse.body.annotations.find(a => a.type === PlayerAnnotationType.OPT_OUT)
      ).toBeDefined();

      // New player had BLOCKED but it was added after the transition date, so it was not transfered
      expect(
        mainAnnotationsResponse.body.annotations.find(a => a.type === PlayerAnnotationType.BLOCKED)
      ).toBeUndefined();

      // Check if annotations transfered correctly to the main player
      const archivedAnnotationsResponse = await api.get(`/players/${archiveUsername}`);

      expect(archivedAnnotationsResponse.status).toBe(200);
      expect(archivedAnnotationsResponse.body.annotations.length).toBe(2);

      // Old player already had OPT_OUT, so new player retained theirs
      expect(
        mainAnnotationsResponse.body.annotations.find(a => a.type === PlayerAnnotationType.OPT_OUT)
      ).toBeDefined();
      // New player acquired this after the transition date, so it was not transfered
      expect(
        mainAnnotationsResponse.body.annotations.find(a => a.type === PlayerAnnotationType.FAKE_F2P)
      ).toBeDefined();

      // Check if none of the pre-transition snapshots have been transfered
      const mainSnapshotsResponse = await api.get(`/players/USBC/snapshots`).query({ period: 'week' });

      expect(mainSnapshotsResponse.status).toBe(200);
      expect(mainSnapshotsResponse.body.filter(s => s.data.bosses.obor.kills > -1).length).toBe(0);

      // One snapshot should have been abandoned (it was on newPlayer's profile before the transition date).
      // This snapshot has 30 obor kills, so the presence or abcense of these 30 kills are an indicator of transfer success.

      const archivedSnapshotsResponse = await api
        .get(`/players/${archiveUsername}/snapshots`)
        .query({ period: 'week' });

      expect(archivedSnapshotsResponse.status).toBe(200);

      expect(
        archivedSnapshotsResponse.body.filter(s => s.data.bosses.obor.kills === 30).length
      ).toBeGreaterThan(0);

      // Check if none of the pre-transition memberships have been transfered
      const mainGroupsResponse = await api.get(`/players/USBC/groups`);

      expect(mainGroupsResponse.status).toBe(200);
      expect(mainGroupsResponse.body.length).toBe(2);
      expect(mainGroupsResponse.body[0]).toMatchObject({
        role: 'medic', // Did not transfer newPlayer's "archer" membership, we kept oldPlayer's "medic" membership
        group: { name: 'Test Transfer Group' }
      });

      // Before the name change happened, the "newPlayer" was in a group called "Test Transfer Group (Pre)"".
      // So this archived player profile should still be in it.

      const archivedGroupsResponse = await api.get(`/players/${archiveUsername}/groups`);

      expect(archivedGroupsResponse.status).toBe(200);
      expect(archivedGroupsResponse.body.length).toBe(2);
      expect(archivedGroupsResponse.body[0]).toMatchObject({
        role: 'archer', // This membership was left behind because oldPlayer was already on this group
        group: { name: 'Test Transfer Group' }
      });
      expect(archivedGroupsResponse.body[1]).toMatchObject({
        role: 'beast',
        group: { name: 'Test Transfer Group (Pre)' }
      });

      // Check if none of the pre-transition participations have been transfered
      const mainCompetitionsResponse = await api.get(`/players/USBC/competitions`);

      expect(mainCompetitionsResponse.status).toBe(200);
      expect(mainCompetitionsResponse.body.length).toBe(2);
      expect(mainCompetitionsResponse.body[0].competition).toMatchObject({
        title: 'Test Comp',
        metric: 'thieving'
      });
      expect(mainCompetitionsResponse.body[1].competition).toMatchObject({
        title: 'Test Comp (Pre)',
        metric: 'herblore'
      });

      // Before the name change happened, the "newPlayer" was in a competition called "Test Comp (Pre)".
      // So this archived player profile should still be in it.

      const archivedCompetitionsResponse = await api.get(`/players/${archiveUsername}/competitions`);

      expect(archivedCompetitionsResponse.status).toBe(200);
      expect(archivedCompetitionsResponse.body.length).toBe(2);
      expect(archivedCompetitionsResponse.body[0].competition).toMatchObject({
        title: 'Test Comp',
        metric: 'thieving'
      });
      expect(archivedCompetitionsResponse.body[1].competition).toMatchObject({
        title: 'Test Comp (Pre)',
        metric: 'herblore'
      });

      // Check if none of the pre-transition name changes have been transfered
      const filteredMainNameChanges = await api.get(`/players/USBC/names`);

      expect(filteredMainNameChanges.status).toBe(200);
      // Should be 0 because name changes for opted out players are filtered out
      expect(filteredMainNameChanges.body.length).toBe(0);

      await prisma.playerAnnotation.delete({
        where: {
          playerId_type: {
            playerId: oldPlayerId,
            type: PlayerAnnotationType.OPT_OUT
          }
        }
      });

      const mainNameChangesResponse = await api.get(`/players/USBC/names`);

      expect(mainNameChangesResponse.status).toBe(200);
      expect(mainNameChangesResponse.body.length).toBe(2);
      expect(mainNameChangesResponse.body[0]).toMatchObject({
        newName: 'usbc',
        oldName: 'wtv post',
        status: 'approved'
      });
      expect(mainNameChangesResponse.body[1]).toMatchObject({
        newName: 'USBC',
        oldName: 'psikoi',
        status: 'approved'
      });

      const detailsResponse = await api.get(`/players/USBC`);

      expect(detailsResponse.status).toBe(200);
      expect(detailsResponse.body.id).toBe(oldPlayerId);
      expect(detailsResponse.body.displayName).toBe('USBC');
      expect(detailsResponse.body.country).toBe('PT');
    }, 10_000);

    it('should approve (new player has very little data)', async () => {
      const firstTrackResponse = await api.post(`/players/Romeo`);
      expect(firstTrackResponse.status).toBe(201);
      expect(firstTrackResponse.body.username).toBe('romeo');
      expect(firstTrackResponse.body.displayName).toBe('Romeo');

      const secondTrackResponse = await api.post(`/players/Juliet`);
      expect(secondTrackResponse.status).toBe(201);
      expect(secondTrackResponse.body.username).toBe('juliet');
      expect(secondTrackResponse.body.displayName).toBe('Juliet');

      const submitResponse = await api.post(`/names`).send({ oldName: 'Romeo', newName: 'Juliet' });

      expect(submitResponse.status).toBe(201);

      const newPlayerId = secondTrackResponse.body.id;

      const response = await api
        .post(`/names/${submitResponse.body.id}/approve`)
        .send({ adminPassword: process.env.ADMIN_PASSWORD });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('approved');
      expect(response.body.resolvedAt).not.toBe(null);

      await sleep(100);

      expect(playerNameChangedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'juliet',
          previousDisplayName: 'Romeo'
        })
      );

      // "New" player profile was archived
      expect(playerArchivedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          username: expect.stringContaining('archive'),
          previousUsername: 'juliet'
        })
      );

      const archive = await prisma.playerArchive.findFirst({
        where: {
          playerId: newPlayerId,
          previousUsername: 'juliet'
        }
      });

      // The new player had very little data (< 2 snapshots), so the archived profile should have been deleted
      expect(archive).toBeNull();
    });

    it('should approve (archived player)', async () => {
      const trackPlayerResponse = await api.post(`/players/Nightfirecat`);
      expect(trackPlayerResponse.status).toBe(201);

      const archiveResponse = await api
        .post(`/players/Nightfirecat/archive`)
        .send({ adminPassword: process.env.ADMIN_PASSWORD });

      expect(archiveResponse.status).toBe(200);

      expect(playerArchivedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          username: expect.stringContaining('archive'),
          previousUsername: 'nightfirecat'
        })
      );

      jest.resetAllMocks();

      const archiveUsername = archiveResponse.body.username;

      const submitResponse = await api.post(`/names`).send({
        oldName: archiveUsername,
        newName: 'Ron'
      });

      expect(submitResponse.status).toBe(201);

      const approveResponse = await api
        .post(`/names/${submitResponse.body.id}/approve`)
        .send({ adminPassword: process.env.ADMIN_PASSWORD });

      expect(approveResponse.status).toBe(200);
      expect(approveResponse.body.status).toBe('approved');
      expect(approveResponse.body.resolvedAt).not.toBe(null);

      const archive = (await prisma.playerArchive.findFirst({
        where: {
          playerId: trackPlayerResponse.body.id,
          previousUsername: 'nightfirecat'
        }
      }))!;

      expect(archive).not.toBeNull();
      expect(archive.restoredAt).not.toBe(null);
      expect(archive.restoredUsername).toBe('ron');

      const player = (await prisma.player.findFirst({
        where: {
          username: 'ron'
        }
      }))!;

      expect(player).not.toBeNull();
      expect(player.displayName).toBe('Ron');
      expect(player.status).toBe(PlayerStatus.ACTIVE);

      expect(playerArchivedEvent).not.toHaveBeenCalled();
    });

    it('should remove duplicated group member activities on approval', async () => {
      // If a player changes their name in-game without submitting on WOM and their group gets synced,
      // WOM will register oldName has having left, and newName has having joined.
      // Eventually, when this name change is submitted and approve, we should find these matching
      // left/join events and delete them from the database.

      const createGroupResponse = await api.post(`/groups`).send({
        name: 'Test Group!!!',
        members: [
          {
            username: 'Dayseeker',
            role: 'owner'
          },
          {
            username: 'BMTH',
            role: 'magician'
          }
        ]
      });

      expect(createGroupResponse.status).toBe(201);

      // Add vukovi as a member
      const firstEditResponse = await api.put(`/groups/${createGroupResponse.body.group.id}`).send({
        name: 'Test Group!!!',
        members: [
          {
            username: 'Dayseeker',
            role: 'owner'
          },
          {
            username: 'BMTH',
            role: 'magician'
          },
          {
            username: 'Vukovi',
            role: 'cook'
          }
        ],
        verificationCode: createGroupResponse.body.verificationCode
      });

      expect(firstEditResponse.status).toBe(200);

      const trackResponse = await api.post(`/players/Vukovi`);

      expect(trackResponse.status).toBe(200);
      expect(trackResponse.body.username).toBe('vukovi');
      expect(trackResponse.body.displayName).toBe('vukovi');

      const secondEditResponse = await api.put(`/groups/${createGroupResponse.body.group.id}`).send({
        name: 'Test Group!!!',
        members: [
          {
            username: 'Dayseeker',
            role: 'owner'
          },
          {
            username: 'BMTH',
            role: 'magician'
          },
          {
            username: 'Boston Manor',
            role: 'cook'
          }
        ],
        verificationCode: createGroupResponse.body.verificationCode
      });

      expect(secondEditResponse.status).toBe(200);

      // Should incorrectly show joined/left activity
      const firstGroupActivityResponse = await api.get(
        `/groups/${createGroupResponse.body.group.id}/activity`
      );

      expect(firstGroupActivityResponse.status).toBe(200);
      expect(firstGroupActivityResponse.body.length).toBe(3);

      expect(firstGroupActivityResponse.body[0]).toMatchObject({
        groupId: createGroupResponse.body.group.id,
        role: 'cook',
        type: 'left',
        player: {
          username: 'vukovi'
        }
      });

      expect(firstGroupActivityResponse.body[1]).toMatchObject({
        groupId: createGroupResponse.body.group.id,
        role: 'cook',
        type: 'joined',
        player: {
          username: 'boston manor'
        }
      });

      expect(firstGroupActivityResponse.body[2]).toMatchObject({
        groupId: createGroupResponse.body.group.id,
        role: 'cook',
        type: 'joined',
        player: {
          username: 'vukovi'
        }
      });

      const submitNameChangeResponse = await api.post(`/names`).send({
        oldName: 'vukovi',
        newName: 'Boston Manor'
      });

      expect(submitNameChangeResponse.status).toBe(201);

      const approveNameChangeResponse = await api
        .post(`/names/${submitNameChangeResponse.body.id}/approve`)
        .send({ adminPassword: process.env.ADMIN_PASSWORD });

      expect(approveNameChangeResponse.status).toBe(200);

      // Should no longer have joined/left activity (as it was deleted)
      const secondGroupActivityResponse = await api.get(
        `/groups/${createGroupResponse.body.group.id}/activity`
      );

      expect(secondGroupActivityResponse.status).toBe(200);
      expect(secondGroupActivityResponse.body.length).toBe(1);

      // This activity should be still remain, as it happened before the name change,
      // however, the username should be updated to the new one.

      expect(secondGroupActivityResponse.body[0]).toMatchObject({
        groupId: createGroupResponse.body.group.id,
        role: 'cook',
        type: 'joined',
        createdAt: firstGroupActivityResponse.body[2].createdAt,
        player: {
          username: 'boston manor'
        }
      });
    });

    it('should set reviewContext to null upon approval', async () => {
      const trackResponse = await api.post(`/players/makefrend`);
      expect(trackResponse.status).toBe(201);
      expect(trackResponse.body.username).toBe('makefrend');

      const submitResponse = await api.post(`/names`).send({
        oldName: 'makefrend',
        newName: 'myarm'
      });

      expect(submitResponse.status).toBe(201);

      expect(nameChangeCreatedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          nameChangeId: submitResponse.body.id
        })
      );

      const pendingNameChange = await prisma.nameChange.findFirst({
        where: { id: submitResponse.body.id }
      });

      expect(pendingNameChange!.reviewContext).toBe(null);

      await prisma.nameChange.update({
        where: { id: submitResponse.body.id },
        data: {
          reviewContext: { reason: 'test_reason' }
        }
      });

      const approveResponse = await api
        .post(`/names/${submitResponse.body.id}/approve`)
        .send({ adminPassword: process.env.ADMIN_PASSWORD });

      expect(approveResponse.status).toBe(200);
      expect(approveResponse.body.status).toBe('approved');
      expect(approveResponse.body.resolvedAt).not.toBe(null);
      expect(approveResponse.body.reviewContext).toBe(null);

      const approvedNameChange = await prisma.nameChange.findFirst({
        where: { id: approveResponse.body.id }
      });

      expect(approvedNameChange!.reviewContext).toBe(null);
    });

    it('should recalculate competition participations on approval', async () => {
      // Setup the "old player"
      let modifiedRawData = modifyRawHiscoresData(globalData.hiscoresRawData, [
        { hiscoresMetricName: 'Firemaking', value: 4_500_000 }
      ]);

      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      const oldPlayerUpdateResponse = await api.post(`/players/superman`);
      expect(oldPlayerUpdateResponse.status).toBe(201);
      await sleep(100);

      const playerSnapshot = await prisma.snapshot.findFirst({
        where: {
          playerId: oldPlayerUpdateResponse.body.id
        }
      });
      expect(playerSnapshot).not.toBeNull();

      await prisma.snapshot.update({
        where: {
          id: playerSnapshot!.id
        },
        data: {
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12) // 12 hours ago
        }
      });

      const createCompetitionResponse = await api.post('/competitions').send({
        title: 'Test',
        metric: 'firemaking',
        startsAt: new Date(Date.now() + 1000),
        endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        participants: ['clark', 'lex']
      });
      expect(createCompetitionResponse.status).toBe(201);

      const fakeStartDate = new Date(Date.now() - 1000 * 60 * 60 * 24);

      // Force-update the competition start date to be in the past
      await prisma.competition.update({
        where: { id: createCompetitionResponse.body.competition.id },
        data: {
          startsAt: fakeStartDate
        }
      });

      modifiedRawData = modifyRawHiscoresData(globalData.hiscoresRawData, [
        { hiscoresMetricName: 'Firemaking', value: 5_000_000 }
      ]);

      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      const firstPlayerUpdateResponse = await api.post(`/players/clark`);
      expect(firstPlayerUpdateResponse.status).toBe(200);
      await sleep(100);

      modifiedRawData = modifyRawHiscoresData(globalData.hiscoresRawData, [
        { hiscoresMetricName: 'Firemaking', value: 7_500_000 }
      ]);

      registerHiscoresMock(axiosMock, {
        [PlayerType.REGULAR]: { statusCode: 200, rawData: modifiedRawData },
        [PlayerType.IRONMAN]: { statusCode: 404 }
      });

      const secondPlayerUpdateResponse = await api.post(`/players/clark`);
      expect(secondPlayerUpdateResponse.status).toBe(200);
      await sleep(100);

      const firstDetailsResponse = await api.get(
        `/competitions/${createCompetitionResponse.body.competition.id}`
      );
      expect(firstDetailsResponse.status).toBe(200);
      expect(firstDetailsResponse.body.participations[0].progress).toMatchObject({
        start: 5_000_000,
        end: 7_500_000,
        gained: 2_500_000
      });

      // Player "superman" has snapshots from 12 horus ago at 4.5m exp
      // Player "clark" has snapshots from seconds ago at 5m exp
      // Name change "superman" -> "clark" would merge these two players,
      // so we need to recalculate the participations for the competition,
      // as their real progress is 4.5m -> 7.5m = 3m gained

      const submitNameChangeResponse = await api.post(`/names`).send({
        oldName: 'superman',
        newName: 'clark'
      });
      expect(submitNameChangeResponse.status).toBe(201);

      const approveNameChangeResponse = await api
        .post(`/names/${submitNameChangeResponse.body.id}/approve`)
        .send({ adminPassword: process.env.ADMIN_PASSWORD });

      expect(approveNameChangeResponse.status).toBe(200);

      expect(playerNameChangedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'clark',
          previousDisplayName: 'superman'
        })
      );

      // The "playerNameChangedEvent" mock prevents the actual event from being emitted,
      // so let's manually dispatch the job to test the recalculation
      await jobManager.runAsync(JobType.SYNC_PLAYER_COMPETITION_PARTICIPATIONS, {
        username: 'clark',
        forceRecalculate: true
      });

      const secondDetailsResponse = await api.get(
        `/competitions/${createCompetitionResponse.body.competition.id}`
      );
      expect(secondDetailsResponse.status).toBe(200);
      expect(secondDetailsResponse.body.participations[0].progress).toMatchObject({
        start: 4_500_000,
        end: 7_500_000,
        gained: 3_000_000
      });
    });
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

      await prisma.playerAnnotation.deleteMany();

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
      const fetchResponse = await api.get(`/groups/${globalData.testGroupId}/name-changes`);

      expect(fetchResponse.status).toBe(200);
      expect(fetchResponse.body.length).toBe(5); // 3 name changes from Jakesterwars, 2 from USBC
      expect(fetchResponse.body[0].player.username).toBe('usbc');

      const fetchResponseLimited = await api
        .get(`/groups/${globalData.testGroupId}/name-changes`)
        .query({ limit: 2, offset: 2 });

      expect(fetchResponseLimited.status).toBe(200);
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

  describe('9 - Clear History', () => {
    it('should not clear history (invalid admin password)', async () => {
      const response = await api.post(`/names/walter/clear-history`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Required parameter 'adminPassword' is undefined.");
    });

    it('should not clear history (incorrect admin password)', async () => {
      const response = await api.post(`/names/walter/clear-history`).send({
        adminPassword: 'abcdef'
      });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Incorrect admin password.');
    });

    it('should not clear history (player not found)', async () => {
      const response = await api
        .post(`/names/walter/clear-history`)
        .send({ adminPassword: process.env.ADMIN_PASSWORD });

      expect(response.status).toBe(404);
      expect(response.body.message).toMatch('Player not found.');
    });

    it('should not clear history (no name changes)', async () => {
      const response = await api
        .post(`/names/zezima/clear-history`)
        .send({ adminPassword: process.env.ADMIN_PASSWORD });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch('No name changes were found for this player.');
    });

    it('should clear history', async () => {
      const response = await api
        .post(`/names/usbc/clear-history`)
        .send({ adminPassword: process.env.ADMIN_PASSWORD });

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(6);
      expect(response.body.message).toMatch('Successfully deleted 6 name changes.');

      const fetchResponse = await api.get(`/players/usbc/names`);
      expect(fetchResponse.status).toBe(200);
      expect(fetchResponse.body.length).toBe(0);
    });
  });
});

async function seedPreTransitionData(oldPlayerId: number, newPlayerId: number) {
  const mockDate = new Date();

  const newPlayer = await prisma.player.findFirst({
    where: {
      id: newPlayerId
    }
  });

  if (!newPlayer) {
    throw new Error('New player not found');
  }

  await prisma.player.update({
    where: { id: newPlayerId },
    data: { country: 'PT' }
  });

  await prisma.playerAnnotation.create({
    data: {
      playerId: newPlayerId,
      type: PlayerAnnotationType.BLOCKED,
      createdAt: mockDate
    }
  });

  // Pending name change
  await prisma.nameChange.create({
    data: {
      oldName: 'idk',
      newName: newPlayer.username,
      playerId: newPlayerId
    }
  });

  // Approved name change, 20 mins before the mock date
  await prisma.nameChange.create({
    data: {
      oldName: 'wtv',
      status: 'approved',
      resolvedAt: new Date(mockDate.getTime() - 1_200_000),
      newName: newPlayer.username,
      playerId: newPlayerId
    }
  });

  // Denied name change, 10 mins before the mock date
  await prisma.nameChange.create({
    data: {
      oldName: 'pls',
      status: 'denied',
      resolvedAt: new Date(mockDate.getTime() - 600_000),
      newName: newPlayer.username,
      playerId: newPlayerId
    }
  });

  // Create a few pre-transition-date records
  await prisma.record.createMany({
    data: [
      { playerId: oldPlayerId, period: 'month', metric: 'zulrah', value: 13, updatedAt: mockDate },
      { playerId: oldPlayerId, period: 'week', metric: 'agility', value: 100_000, updatedAt: mockDate },
      { playerId: oldPlayerId, period: 'day', metric: 'smithing', value: 10_000, updatedAt: mockDate }
    ]
  });

  await prisma.playerAnnotation.create({
    data: {
      playerId: oldPlayerId,
      type: PlayerAnnotationType.OPT_OUT,
      createdAt: mockDate
    }
  });

  const filteredSnapshotData = {};

  const snapshotData = buildHiscoresSnapshot(
    oldPlayerId,
    HiscoresDataSchema.parse(JSON.parse(globalData.hiscoresRawData))
  );

  METRICS.forEach(m => {
    filteredSnapshotData[getMetricValueKey(m)] = snapshotData[getMetricValueKey(m)];
    filteredSnapshotData[getMetricRankKey(m)] = snapshotData[getMetricRankKey(m)];
  });

  // Create two pre-transition-date snapshots
  await prisma.snapshot.create({
    data: { ...filteredSnapshotData, playerId: newPlayerId, oborKills: 30, createdAt: mockDate }
  });
  await prisma.snapshot.create({
    data: { ...filteredSnapshotData, playerId: newPlayerId, oborKills: 30, createdAt: mockDate }
  });

  // Create a pre-transition-date test competition and add this player to it
  await prisma.competition.create({
    data: {
      title: 'Test Comp (Pre)',
      verificationHash: '',
      startsAt: new Date(Date.now() + 100_000),
      endsAt: new Date(Date.now() + 400_000),
      participations: {
        create: [
          { playerId: newPlayerId, createdAt: mockDate },
          { playerId: oldPlayerId, createdAt: mockDate }
        ]
      },
      metrics: {
        create: {
          metric: 'herblore'
        }
      }
    }
  });

  // Create a pre-transition-date test group and add this player to it
  await prisma.group.create({
    data: {
      name: 'Test Transfer Group (Pre)',
      verificationHash: '',
      memberships: {
        create: [
          { playerId: newPlayerId, role: 'beast', createdAt: mockDate },
          { playerId: oldPlayerId, role: 'beast', createdAt: mockDate }
        ]
      }
    }
  });
}

async function seedPostTransitionData(oldPlayerId: number, newPlayerId: number) {
  const newPlayer = await prisma.player.findFirst({
    where: {
      id: newPlayerId
    }
  });

  if (!newPlayer) {
    throw new Error('New player not found');
  }

  await prisma.playerAnnotation.create({
    data: {
      playerId: newPlayerId,
      type: PlayerAnnotationType.OPT_OUT
    }
  });

  await prisma.playerAnnotation.create({
    data: {
      playerId: newPlayerId,
      type: PlayerAnnotationType.FAKE_F2P
    }
  });

  // Pending name change
  await prisma.nameChange.create({
    data: {
      oldName: 'idk post',
      newName: newPlayer.username,
      playerId: newPlayerId
    }
  });

  // Approved name change
  await prisma.nameChange.create({
    data: {
      oldName: 'wtv post',
      status: 'approved',
      resolvedAt: new Date(Date.now() + 300_000),
      newName: newPlayer.username,
      playerId: newPlayerId
    }
  });

  // Denied name change
  await prisma.nameChange.create({
    data: {
      oldName: 'pls post',
      status: 'denied',
      resolvedAt: new Date(Date.now() + 600_000),
      newName: newPlayer.username,
      playerId: newPlayerId
    }
  });

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

  const snapshotData = buildHiscoresSnapshot(
    oldPlayerId,
    HiscoresDataSchema.parse(JSON.parse(globalData.hiscoresRawData))
  );

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
      verificationHash: '',
      startsAt: new Date(Date.now() + 100_000),
      endsAt: new Date(Date.now() + 400_000),
      participations: {
        create: [
          { playerId: newPlayerId }, // this should not be transfered as oldPlayer is already on this comp
          { playerId: oldPlayerId }
        ]
      },
      metrics: {
        create: {
          metric: 'thieving'
        }
      }
    }
  });

  // Create a test group and add this player to it
  await prisma.group.create({
    data: {
      name: 'Test Transfer Group',
      verificationHash: '',
      memberships: {
        create: [
          { playerId: newPlayerId, role: 'archer' }, // this should not be transfered as oldPlayer is already on this group
          { playerId: oldPlayerId, role: 'medic' }
        ]
      }
    }
  });
}
