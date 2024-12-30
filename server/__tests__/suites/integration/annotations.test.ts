import axios from 'axios';
import supertest from 'supertest';
import MockAdapter from 'axios-mock-adapter';
import apiServer from '../../../src/api';
import prisma, { playerAnnotations } from '../../../src/prisma';
import { resetDatabase } from '../../utils';

const api = supertest(apiServer.express);

const testPlayer = 'zezima';

beforeAll(async () => {
  await resetDatabase();
});

async function createPlayer(username) {
  return prisma.player.create({
    data: {
      username,
      displayName: username
    }
  });
}

async function createAnnotationForPlayer(playerId, annotationType) {
  return prisma.annotation.create({
    data: {
      playerId,
      type: annotationType
    }
  });
}

describe('Admin, params and enum validation', () => {
  it('should return 400 when admin password is missing', async () => {
    const annotation = PlayerAnnotations.blacklist;
    const response = await api.post(`/players/${testPlayer}/annotation`).send({
      annotation: annotation
    });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Required parameter 'adminPassword' is undefined.");
  });

  it('should return 403 when admin password is incorrect', async () => {
    const annotation = PlayerAnnotations.blacklist;
    const response = await api.post(`/players/${testPlayer}/annotation`).send({
      adminPassword: 'wrongpassword',
      annotation: annotation
    });
    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Incorrect admin password.');
  });

  it('should return 400 when annotation is invalid', async () => {
    const response = await api.post(`/players/${testPlayer}/annotation`).send({
      adminPassword: process.env.ADMIN_PASSWORD,
      annotation: 'invalid'
    });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "Invalid enum value for 'annotation'. Expected blacklist | greylist | fake_f2p"
    );
  });

  it('should return 400 when annotation is missing', async () => {
    const response = await api.post(`/players/${testPlayer}/annotation`).send({
      adminPassword: process.env.ADMIN_PASSWORD
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Parameter 'annotation' is undefined.");
  });
});

describe('Create annotation for a player', () => {
  beforeAll(async () => {
    await createPlayer(testPlayer);
  });

  it('should create a valid annotation with correct admin password', async () => {
    const annotation = PlayerAnnotations.blacklist;

    const response = await api.post(`/players/${testPlayer}/annotation`).send({
      adminPassword: process.env.ADMIN_PASSWORD,
      annotation: annotation
    });

    expect(response.status).toBe(201);
    expect(response.body.type).toBe(annotation);
  });
});

describe('Fetch annotations for a player', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('should fetch annotations for a player', async () => {
    const player = await createPlayer(testPlayer);
    await createAnnotationForPlayer(player.id, PlayerAnnotations.blacklist);
    await createAnnotationForPlayer(player.id, PlayerAnnotations.fake_f2p);

    const response = await api.get(`/players/${testPlayer}/annotation`).send({
      adminPassword: process.env.ADMIN_PASSWORD
    });

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
    expect(response.body[0].type).toBe(PlayerAnnotations.blacklist);
    expect(response.body[1].type).toBe(PlayerAnnotations.fake_f2p);
  });

  it('should return an empty array for a player with no annotations', async () => {
    const player = await createPlayer(testPlayer);
    const response = await api.get(`/players/${testPlayer}/annotation`).send({
      adminPassword: process.env.ADMIN_PASSWORD
    });

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(0);
    expect(response.body).toEqual([]);
  });
});

describe('Delete annotation for a player', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('should delete an annotation for a player', async () => {
    const player = await createPlayer(testPlayer);
    const annotation = await createAnnotationForPlayer(player.id, PlayerAnnotations.blacklist);

    const response = await api.delete(`/players/${testPlayer}/annotation`).send({
      adminPassword: process.env.ADMIN_PASSWORD,
      annotation: PlayerAnnotations.blacklist
    });

    expect(response.status).toBe(200);
    expect(response.body).toBe(`Annotation ${annotation.type} deleted for player ${testPlayer}`);
  });

  it('Should return 404 when trying to delete a non-existing annotation', async () => {
    const player = await createPlayer(testPlayer);
    const response = await api.delete(`/players/${testPlayer}/annotation`).send({
      adminPassword: process.env.ADMIN_PASSWORD,
      annotation: PlayerAnnotations.blacklist
    });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe(
      `blacklist does not exist for ${testPlayer}, available annotations for this player are: none`
    );
  });

  it('should return 404 when trying to delete a non-existing player if the player has annotations should return the list of annotations in the error message', async () => {
    const player = await createPlayer(testPlayer);
    await createAnnotationForPlayer(player.id, PlayerAnnotations.blacklist);
    await createAnnotationForPlayer(player.id, PlayerAnnotations.fake_f2p);

    const response = await api.delete(`/players/${testPlayer}/annotation`).send({
      adminPassword: process.env.ADMIN_PASSWORD,
      annotation: PlayerAnnotations.greylist
    });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe(
      `greylist does not exist for ${testPlayer}, available annotations for this player are: ${PlayerAnnotations.blacklist}, ${PlayerAnnotations.fake_f2p}`
    );
  });
});
