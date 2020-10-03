import supertest from 'supertest';
import api from '../../src/api';
import { Player } from '../../src/database/models';
import { resetDatabase } from '../utils';

const request = supertest(api);

const BASE_URL = '/api/players';

const TEST_DATA = {
  playerA: {
    ref: null,
    data: {
      id: 1000000,
      username: 'test player',
      displayName: 'Test Player'
    }
  },
  playerB: {
    ref: null,
    data: {
      id: 200000,
      username: 'alt player',
      displayName: 'Alt Player'
    }
  }
};

beforeAll(async done => {
  await resetDatabase();

  const playerA = await Player.create(TEST_DATA.playerA.data);
  const playerB = await Player.create(TEST_DATA.playerB.data);

  TEST_DATA.playerA.ref = playerA;
  TEST_DATA.playerB.ref = playerB;

  done();
});

describe('Player API', () => {
  describe('1. Tracking', () => {
    test("1.1 - DON'T track valid username too soon", async done => {
      const body = { username: TEST_DATA.playerA.data.username };
      const response = await request.post(`${BASE_URL}/track`).send(body);

      expect(response.status).toBe(429);
      expect(response.body.message).toMatch('Error:');

      done();
    }, 90000);

    test("1.2 - DON'T track undefined username", async done => {
      const response = await request.post(`${BASE_URL}/track`).send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'username' is undefined.");

      done();
    });

    test("1.3 - DON'T track empty username", async done => {
      const response = await request.post(`${BASE_URL}/track`).send({ username: '' });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'username' is undefined.");

      done();
    });

    test("1.4 - DON'T track lengthy username", async done => {
      const body = { username: 'ALongUsername' };
      const response = await request.post(`${BASE_URL}/track`).send(body);

      expect(response.status).toBe(500);
      expect(response.body.message).toMatch('Validation error: Username must be between');

      done();
    });

    test('1.5 - Track valid username', async done => {
      const body = { username: 'Psikoi' };
      const response = await request.post(`${BASE_URL}/track`).send(body);

      if (response.status === 200 || response.status === 201) {
        expect(response.body.player.username).toBe('psikoi');
        expect(response.body.player.displayName).toBe('Psikoi');
      } else {
        expect(response.body.message).toMatch('Failed to load hiscores: Service is unavailable');
      }

      done();
    }, 90000);

    test('1.6 - Track unformatted username', async done => {
      const body = { username: ' iron_Mammal ' };
      const response = await request.post(`${BASE_URL}/track`).send(body);

      if (response.status === 200 || response.status === 201) {
        expect(response.body.player.username).toBe('iron mammal');
        expect(response.body.player.displayName).toBe('iron Mammal');
      } else {
        expect(response.body.message).toMatch('Failed to load hiscores');
      }

      done();
    }, 90000);
  });

  describe('2. Importing', () => {
    test("2.1 - DON'T import undefined username", async done => {
      const response = await request.post(`${BASE_URL}/import`).send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'username' is undefined.");

      done();
    });

    test("2.2 - DON'T import unknown username", async done => {
      const body = { username: 'SomeUnknown' };
      const response = await request.post(`${BASE_URL}/import`).send(body);

      expect(response.status).toBe(404);
      expect(response.body.message).toMatch('Player not found.');

      done();
    });

    test('2.3 - Import existing username', async done => {
      const body = { username: TEST_DATA.playerA.data.displayName };
      const response = await request.post(`${BASE_URL}/import`).send(body);

      if (response.status === 200 || response.status === 201) {
        expect(response.body.message).toMatch('snapshots imported from CML');
      } else {
        expect(response.body.message).toMatch('Failed to load history from CML.');
      }

      done();
    }, 90000);
  });

  describe('3. Importing Too Soon', () => {
    test("3.1 - DON'T import existing username too soon", async done => {
      const body = { username: TEST_DATA.playerA.data.displayName };
      const firstResponse = await request.post(`${BASE_URL}/import`).send(body);

      // If the first response is successful, the second should fail
      if (firstResponse.status === 200) {
        const secondResponse = await request.post(`${BASE_URL}/import`).send(body);

        expect(secondResponse.status).toBe(400);
        expect(secondResponse.body.message).toMatch('Imported too soon');
      }

      done();
    });
  });

  describe('4. Searching', () => {
    test("4.1 - DON'T search with undefined username", async done => {
      const response = await request.get(`${BASE_URL}/search`).query({});

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'username' is undefined.");

      done();
    });

    test("4.2 - DON'T search with empty username", async done => {
      const query = { username: '' };
      const response = await request.get(`${BASE_URL}/search`).query(query);

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'username' is undefined.");

      done();
    });

    test('4.3 - Search for valid partial username', async done => {
      const query = { username: 'tes' };
      const response = await request.get(`${BASE_URL}/search`).query(query);

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].username).toBe('test player');
      expect(response.body[0].displayName).toBe('Test Player');

      done();
    });

    test('4.4 - Search for non-existing valid partial username', async done => {
      const query = { username: 'something else' };
      const response = await request.get(`${BASE_URL}/search`).query(query);

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(0);

      done();
    });
  });

  describe('5. Viewing', () => {
    test("5.1 - DON'T view non-existing id", async done => {
      const response = await request.get(`${BASE_URL}/9999`);

      expect(response.status).toBe(404);
      expect(response.body.message).toMatch('Player not found.');

      done();
    });

    test("5.2 - DON'T view non-existing username", async done => {
      const response = await request.get(`${BASE_URL}/username/playerViewTest`);

      expect(response.status).toBe(404);
      expect(response.body.message).toMatch('Player not found.');

      done();
    });

    test('5.3 - View valid id', async done => {
      const url = `${BASE_URL}/${TEST_DATA.playerA.data.id}`;
      const response = await request.get(url);

      expect(response.status).toBe(200);
      expect(response.body.player.id).toBe(1000000);

      done();
    });

    test('5.4 - View valid username', async done => {
      const url = `${BASE_URL}/username/${TEST_DATA.playerA.data.displayName}`;
      const response = await request.get(url);

      expect(response.status).toBe(200);
      expect(response.body.player.username).toBe(TEST_DATA.playerA.data.username);
      expect(response.body.player.displayName).toBe(TEST_DATA.playerA.data.displayName);

      done();
    });

    test('5.5 - View valid unformatted username', async done => {
      const url = `${BASE_URL}/username/ alt_player`;
      const response = await request.get(url);

      expect(response.status).toBe(200);
      expect(response.body.player.username).toBe(TEST_DATA.playerB.data.username);
      expect(response.body.player.displayName).toBe(TEST_DATA.playerB.data.displayName);

      done();
    });
  });

  describe('6. Asserting Type', () => {
    test("6.1 - DON'T assert type for undefined username", async done => {
      const response = await request.post(`${BASE_URL}/assert-type`).send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'username' is undefined.");

      done();
    });

    test("6.2 - DON'T assert type for empty username", async done => {
      const response = await request.post(`${BASE_URL}/assert-type`).send({ username: '' });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'username' is undefined.");

      done();
    });

    test("6.3 - DON'T assert type for unknown username", async done => {
      const body = { username: 'assert_guy' };
      const response = await request.post(`${BASE_URL}/assert-type`).send(body);

      expect(response.status).toBe(404);
      expect(response.body.message).toMatch('Player not found.');

      done();
    });

    test('6.4 - Assert type for regular', async done => {
      const body = { username: 'Psikoi' };
      const response = await request.post(`${BASE_URL}/assert-type`).send(body);

      expect(response.status).toBe(200);
      expect(response.body.type).toMatch('regular');

      done();
    }, 90000);

    test('6.5 - Assert type for ironman', async done => {
      const body = { username: 'iron_mammal' };
      const response = await request.post(`${BASE_URL}/assert-type`).send(body);

      expect(response.status).toBe(200);
      expect(response.body.type).toMatch('ironman');

      done();
    }, 90000);
  });

  describe('7. Asserting Name', () => {
    test("7.1 - DON'T assert name for undefined username", async done => {
      const response = await request.post(`${BASE_URL}/assert-name`).send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'username' is undefined.");

      done();
    });

    test("7.2 - DON'T assert name for empty username", async done => {
      const response = await request.post(`${BASE_URL}/assert-name`).send({ username: '' });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch("Parameter 'username' is undefined.");

      done();
    });

    test("7.3 - DON'T assert name for unknown username", async done => {
      const body = { username: 'assert_guy' };
      const response = await request.post(`${BASE_URL}/assert-name`).send(body);

      expect(response.status).toBe(404);
      expect(response.body.message).toMatch('Player not found.');

      done();
    });

    test('7.4 - Assert name for correct username', async done => {
      const body = { username: 'Psikoi' };
      const response = await request.post(`${BASE_URL}/assert-name`).send(body);

      if (response.status === 200) {
        expect(response.body.displayName).toMatch('Psikoi');
      } else {
        expect(response.body.message).toMatch('Psikoi');
      }

      done();
    }, 90000);

    test('7.5 - Assert name for correct unformatted username', async done => {
      const body = { username: 'iron_mammal' };
      const response = await request.post(`${BASE_URL}/assert-name`).send(body);

      expect(response.status).toBe(200);
      expect(response.body.displayName).toMatch('Iron Mammal');

      done();
    }, 90000);
  });
});
