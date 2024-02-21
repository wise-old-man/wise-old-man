import axios from 'axios';
import supertest from 'supertest';
import MockAdapter from 'axios-mock-adapter';
import apiServer from '../../../src/api';
import prisma from '../../../src/prisma';
import { PlayerType } from '../../../src/utils';
import {
  readFile,
  registerCMLMock,
  registerHiscoresMock,
  resetDatabase,
  resetRedis,
  sleep
} from '../../utils';

const api = supertest(apiServer.express);
const axiosMock = new MockAdapter(axios, { onNoMatch: 'passthrough' });

const HISCORES_FILE_PATH = `${__dirname}/../../data/hiscores/psikoi_hiscores.txt`;

beforeAll(async () => {
  await resetRedis();
  await resetDatabase();

  // Mock the history fetch from CML to always fail with a 404 status code
  registerCMLMock(axiosMock, 404);

  const hiscoresRawData = await readFile(HISCORES_FILE_PATH);

  // Mock regular hiscores data, and block any ironman requests
  registerHiscoresMock(axiosMock, {
    [PlayerType.REGULAR]: { statusCode: 200, rawData: hiscoresRawData },
    [PlayerType.IRONMAN]: { statusCode: 404 }
  });
});

afterAll(async () => {
  // Sleep for 5s to allow the server to shut down gracefully
  await apiServer.shutdown().then(() => sleep(5000));
}, 10_000);

describe('Patrons API', () => {
  describe('Claim Patreon benefits', () => {
    it('should not claim patreon benefits (invalid admin password)', async () => {
      const response = await api.put(`/patrons/claim/abc`).send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Required parameter 'adminPassword' is undefined.");
    });

    it('should not claim patreon benefits (incorrect admin password)', async () => {
      const response = await api.put(`/patrons/claim/abc`).send({
        adminPassword: 'wrong'
      });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Incorrect admin password.');
    });

    it('should not claim patreon benefits (no username or groupId provided)', async () => {
      const response = await api
        .put(`/patrons/claim/abc`)
        .send({ adminPassword: process.env.ADMIN_PASSWORD });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Username and/or groupId must be provided.');
    });

    it('should not claim patreon benefits (discord id not a patron)', async () => {
      const response = await api
        .put(`/patrons/claim/abc`)
        .send({ adminPassword: process.env.ADMIN_PASSWORD, groupId: 123 });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('No patronage found for this discordId.');
    });

    it('should not claim patreon benefits (T1 patron cannot link a groupId)', async () => {
      await prisma.patron.create({
        data: {
          id: 'some-patreon-id',
          name: 'jonxslays',
          email: 'jonxreallydobeslaying@gmail.com',
          discordId: 'some-discord-id',
          tier: 1
        }
      });

      const response = await api
        .put(`/patrons/claim/some-discord-id`)
        .send({ adminPassword: process.env.ADMIN_PASSWORD, groupId: 123 });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('You must be a tier 2 patron to claim group benefits.');
    });

    it('should not claim patreon benefits (player not found)', async () => {
      const response = await api
        .put(`/patrons/claim/some-discord-id`)
        .send({ adminPassword: process.env.ADMIN_PASSWORD, username: 'toph' });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Player not found.');
    });

    it('should not claim patreon benefits (group not found)', async () => {
      // Force upgrade them to T2
      await prisma.patron.update({
        where: { id: 'some-patreon-id' },
        data: { tier: 2 }
      });

      const response = await api
        .put(`/patrons/claim/some-discord-id`)
        .send({ adminPassword: process.env.ADMIN_PASSWORD, groupId: 123 });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Group not found.');
    });

    it('should claim patreon PLAYER benefits', async () => {
      const trackResponse = await api.post(`/players/katara`);
      expect(trackResponse.status).toBe(201);

      const response = await api
        .put(`/patrons/claim/some-discord-id`)
        .send({ adminPassword: process.env.ADMIN_PASSWORD, username: 'Katara' });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: 'some-patreon-id',
        discordId: 'some-discord-id',
        tier: 2,
        playerId: trackResponse.body.id,
        groupId: null
      });
    });

    it('should claim patreon GROUP benefits', async () => {
      const existingPatronage = await prisma.patron.findFirst({
        where: {
          id: 'some-patreon-id'
        }
      });

      const createResponse = await api.post(`/groups`).send({ name: 'Test group', members: [] });
      expect(createResponse.status).toBe(201);

      const response = await api
        .put(`/patrons/claim/some-discord-id`)
        .send({ adminPassword: process.env.ADMIN_PASSWORD, groupId: createResponse.body.group.id });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: 'some-patreon-id',
        discordId: 'some-discord-id',
        tier: 2,
        playerId: existingPatronage.playerId,
        groupId: createResponse.body.group.id
      });
    });
  });
});
