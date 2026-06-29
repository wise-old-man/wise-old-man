import supertest from 'supertest';
import APIInstance from '../../../src/api';
import { redisClient } from '../../../src/services/redis.service';
import { resetDatabase } from '../../utils';

const api = supertest(new APIInstance().init().express);

const globalData = {
  testGroup: {
    id: -1,
    verificationCode: ''
  },
  competitionCode: ''
};

beforeAll(async () => {
  await resetDatabase();
  await redisClient.flushall();

  // Create a group to use in tests
  const createGroupResponse = await api.post('/groups').send({
    name: 'Competition Code Test Group',
    members: [{ username: 'test_play_1' }, { username: 'test_play_2' }]
  });

  expect(createGroupResponse.status).toBe(201);

  globalData.testGroup = {
    id: createGroupResponse.body.group.id,
    verificationCode: createGroupResponse.body.verificationCode
  };
});

afterAll(async () => {
  await redisClient.quit();
});

describe('Group Competition Code API', () => {
  describe('1 - Generate Competition Code', () => {
    it('should not generate (missing verification code)', async () => {
      const response = await api.put(`/groups/${globalData.testGroup.id}/competition-code`).send({});

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({ code: 'MISSING_VERIFICATION_CODE' });
    });

    it('should not generate (incorrect verification code)', async () => {
      const response = await api.put(`/groups/${globalData.testGroup.id}/competition-code`).send({
        verificationCode: '000-000-000'
      });

      expect(response.status).toBe(403);
      expect(response.body).toMatchObject({ code: 'INCORRECT_VERIFICATION_CODE' });
    });

    it('should not generate (group not found)', async () => {
      const response = await api.put('/groups/999999/competition-code').send({
        verificationCode: globalData.testGroup.verificationCode
      });

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({ code: 'GROUP_NOT_FOUND' });
    });

    it('should generate a competition code', async () => {
      const response = await api.put(`/groups/${globalData.testGroup.id}/competition-code`).send({
        verificationCode: globalData.testGroup.verificationCode
      });

      expect(response.status).toBe(200);
      expect(response.body.competitionCode).toBeDefined();
      expect(response.body.competitionCode).toMatch(/^\d{3}-\d{3}-\d{3}$/);

      globalData.competitionCode = response.body.competitionCode;
    });

    it('should show hasCompetitionCode=true in group details', async () => {
      const response = await api.get(`/groups/${globalData.testGroup.id}`);

      expect(response.status).toBe(200);
      expect(response.body.hasCompetitionCode).toBe(true);
    });

    it('should regenerate the competition code (overwrite old one)', async () => {
      const response = await api.put(`/groups/${globalData.testGroup.id}/competition-code`).send({
        verificationCode: globalData.testGroup.verificationCode
      });

      expect(response.status).toBe(200);
      expect(response.body.competitionCode).toBeDefined();
      expect(response.body.competitionCode).toMatch(/^\d{3}-\d{3}-\d{3}$/);

      // The new code should (almost certainly) be different from the old one
      globalData.competitionCode = response.body.competitionCode;
    });
  });

  describe('2 - Create Competition with Competition Code', () => {
    it('should create a group competition using the main verification code', async () => {
      const futureStart = new Date(Date.now() + 1000 * 60 * 60 * 24);
      const futureEnd = new Date(Date.now() + 1000 * 60 * 60 * 48);

      const response = await api.post('/competitions').send({
        title: 'Test Comp Main Code',
        metrics: ['woodcutting'],
        startsAt: futureStart.toISOString(),
        endsAt: futureEnd.toISOString(),
        groupId: globalData.testGroup.id,
        groupVerificationCode: globalData.testGroup.verificationCode
      });

      expect(response.status).toBe(201);
      expect(response.body.competition.groupId).toBe(globalData.testGroup.id);
    });

    it('should create a group competition using the competition code', async () => {
      const futureStart = new Date(Date.now() + 1000 * 60 * 60 * 24);
      const futureEnd = new Date(Date.now() + 1000 * 60 * 60 * 48);

      const response = await api.post('/competitions').send({
        title: 'Test Comp Competition Code',
        metrics: ['fishing'],
        startsAt: futureStart.toISOString(),
        endsAt: futureEnd.toISOString(),
        groupId: globalData.testGroup.id,
        groupVerificationCode: globalData.competitionCode
      });

      expect(response.status).toBe(201);
      expect(response.body.competition.groupId).toBe(globalData.testGroup.id);
    });

    it('should not create a group competition with an invalid code', async () => {
      const futureStart = new Date(Date.now() + 1000 * 60 * 60 * 24);
      const futureEnd = new Date(Date.now() + 1000 * 60 * 60 * 48);

      const response = await api.post('/competitions').send({
        title: 'Test Comp Bad Code',
        metrics: ['mining'],
        startsAt: futureStart.toISOString(),
        endsAt: futureEnd.toISOString(),
        groupId: globalData.testGroup.id,
        groupVerificationCode: '999-999-999'
      });

      expect(response.status).toBe(403);
      expect(response.body).toMatchObject({ code: 'INCORRECT_GROUP_VERIFICATION_CODE' });
    });

    it('should not allow using competition code to edit the group', async () => {
      const response = await api.put(`/groups/${globalData.testGroup.id}`).send({
        verificationCode: globalData.competitionCode,
        name: 'Hacked Group Name'
      });

      expect(response.status).toBe(403);
      expect(response.body).toMatchObject({ code: 'INCORRECT_VERIFICATION_CODE' });
    });

    it('should not allow using competition code to delete the group', async () => {
      const response = await api.delete(`/groups/${globalData.testGroup.id}`).send({
        verificationCode: globalData.competitionCode
      });

      expect(response.status).toBe(403);
      expect(response.body).toMatchObject({ code: 'INCORRECT_VERIFICATION_CODE' });
    });
  });

  describe('3 - Delete Competition Code', () => {
    it('should not delete (missing verification code)', async () => {
      const response = await api.delete(`/groups/${globalData.testGroup.id}/competition-code`).send({});

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({ code: 'MISSING_VERIFICATION_CODE' });
    });

    it('should not delete (incorrect verification code)', async () => {
      const response = await api.delete(`/groups/${globalData.testGroup.id}/competition-code`).send({
        verificationCode: '000-000-000'
      });

      expect(response.status).toBe(403);
      expect(response.body).toMatchObject({ code: 'INCORRECT_VERIFICATION_CODE' });
    });

    it('should not allow using competition code to delete itself', async () => {
      const response = await api.delete(`/groups/${globalData.testGroup.id}/competition-code`).send({
        verificationCode: globalData.competitionCode
      });

      expect(response.status).toBe(403);
      expect(response.body).toMatchObject({ code: 'INCORRECT_VERIFICATION_CODE' });
    });

    it('should delete the competition code', async () => {
      const response = await api.delete(`/groups/${globalData.testGroup.id}/competition-code`).send({
        verificationCode: globalData.testGroup.verificationCode
      });

      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/successfully deleted/i);
    });

    it('should show hasCompetitionCode=false after deletion', async () => {
      const response = await api.get(`/groups/${globalData.testGroup.id}`);

      expect(response.status).toBe(200);
      expect(response.body.hasCompetitionCode).toBe(false);
    });

    it('should not create a group competition with the old competition code after deletion', async () => {
      const futureStart = new Date(Date.now() + 1000 * 60 * 60 * 24);
      const futureEnd = new Date(Date.now() + 1000 * 60 * 60 * 48);

      const response = await api.post('/competitions').send({
        title: 'Test Comp After Delete',
        metrics: ['attack'],
        startsAt: futureStart.toISOString(),
        endsAt: futureEnd.toISOString(),
        groupId: globalData.testGroup.id,
        groupVerificationCode: globalData.competitionCode
      });

      expect(response.status).toBe(403);
      expect(response.body).toMatchObject({ code: 'INCORRECT_GROUP_VERIFICATION_CODE' });
    });

    it('should still create a group competition with the main code after competition code deletion', async () => {
      const futureStart = new Date(Date.now() + 1000 * 60 * 60 * 24);
      const futureEnd = new Date(Date.now() + 1000 * 60 * 60 * 48);

      const response = await api.post('/competitions').send({
        title: 'Test Comp Main After Delete',
        metrics: ['strength'],
        startsAt: futureStart.toISOString(),
        endsAt: futureEnd.toISOString(),
        groupId: globalData.testGroup.id,
        groupVerificationCode: globalData.testGroup.verificationCode
      });

      expect(response.status).toBe(201);
      expect(response.body.competition.groupId).toBe(globalData.testGroup.id);
    });
  });
});
