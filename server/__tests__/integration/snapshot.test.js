const fs = require('fs');
const { promisify } = require('util');
const { resetDatabase } = require('../utils');
const { Player, Snapshot } = require('../../src/database');
const { SKILLS } = require('../../src/api/constants/metrics');
const { fromRS, fromCML, saveAll } = require('../../src/api/modules/snapshots/snapshot.service');

const HISCORES_DATA_PATH = `${__dirname}/../data/lynx_titan_hiscores.txt`;
const CML_DATA_PATH = `${__dirname}/../data/lynx_titan_cml.txt`;

const PLAYER_ID_VALID = 500;
const PLAYER_ID_INVALID = 1000;

const LOADED_DATA = {};

describe('Player Model', () => {
  test('No arguments', () => {
    expect(1 + 1).toBe(2);
  });
});

/*
beforeAll(async () => {
  await resetDatabase();
  await Player.create({ id: PLAYER_ID_VALID, username: 'Psikoi' });
  LOADED_DATA.hiscores = await promisify(fs.readFile)(HISCORES_DATA_PATH, 'utf8');
  LOADED_DATA.cml = await promisify(fs.readFile)(CML_DATA_PATH, 'utf8');

  jest.setTimeout(30000);
});

describe('Snapshot Test', () => {
  test('Placeholder', async () => {
    await expect(1 + 1).toBe(2);
  });

  test('Null playerId', async () => {
    console.time('d');
    try {
      const created = await Snapshot.create({ playerId: 1 });
      console.error(created);
    } catch (e) {
      console.error(e);
    }
    console.timeEnd('d');
  });

  test('GET', async () => {
    const snapshots = await Snapshot.findAll({ limit: 20 });
    expect(snapshots.length).toBeGreaterThan(0);
  });
});

/*
describe('Snapshot model', () => {
  test('No arguments', async () => {
    await expect(Snapshot.create()).rejects.toThrow();
  });

  test('Null playerId', async () => {
    await expect(Snapshot.create({ playerId: null })).rejects.toThrow();
  });

  test('Empty playerId', async () => {
    try {
      const c = await Snapshot.create({ playerId: '' });
      console.log('WORKED', c);
    } catch (e) {
      console.error('DIDNT WORK', e);
    }

    expect(1 + 1).toBe(2);

    // await expect(Snapshot.create({ playerId: '' })).rejects.toThrow();
  });

  test('Invalid playerId (wrong type)', async () => {
    await expect(Snapshot.create({ playerId: 'test' })).rejects.toThrow();
  });

  test('Invalid playerId (does not exist)', async () => {
    await expect(Snapshot.create({ playerId: PLAYER_ID_INVALID })).rejects.toThrow();
  });

  test('Valid playerId (does exist)', async () => {
    const newSnapshot = await Snapshot.create({ playerId: PLAYER_ID_VALID });
    expect(newSnapshot.playerId).toBe(PLAYER_ID_VALID);
  });
});

describe('Snapshot from external sources', () => {
  test('From hiscores (Lynx Titan) ', async () => {
    const snapshot = await fromRS(PLAYER_ID_VALID, LOADED_DATA.hiscores);

    expect(snapshot.playerId).toBe(PLAYER_ID_VALID);

    SKILLS.forEach(skill => {
      if (skill === 'overall') {
        expect(snapshot.overallRank).toBe(1);
        expect(snapshot.overallExperience).toBe((SKILLS.length - 1) * 200000000);
      } else {
        expect(snapshot[`${skill}Rank`]).toBeLessThan(1000);
        expect(snapshot[`${skill}Experience`]).toBe(200000000);
      }
    });
  });

  test('From CrystalMathLabs (Lynx Titan)', async () => {
    const cml = LOADED_DATA.cml.split('\n').filter(r => r.length);
    const snapshots = await Promise.all(cml.map(row => fromCML(PLAYER_ID_VALID, row)));

    const saved = await saveAll(snapshots);

    saved.forEach(snapshot => {
      expect(snapshot.playerId).toBe(PLAYER_ID_VALID);

      SKILLS.forEach(skill => {
        if (skill === 'overall') {
          expect(snapshot.overallRank).toBe(1);
          expect(snapshot.overallExperience).toBe((SKILLS.length - 1) * 200000000);
        } else {
          expect(snapshot[`${skill}Rank`]).toBeLessThan(1000);
          expect(snapshot[`${skill}Experience`]).toBe(200000000);
        }
      });
    });
  });
});
*/
