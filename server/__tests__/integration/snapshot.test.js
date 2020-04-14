const fs = require('fs');
const { promisify } = require('util');
const { resetDatabase } = require('../utils');
const { Player } = require('../../src/database');
const { SKILLS } = require('../../src/api/constants/metrics');
const service = require('../../src/api/modules/snapshots/snapshot.service');

const HISCORES_DATA_PATH = `${__dirname}/../data/lynx_titan_hiscores.txt`;
const CML_DATA_PATH = `${__dirname}/../data/lynx_titan_cml.txt`;

const TEST_DATA = {};

beforeAll(async (done) => {
  await resetDatabase();

  // Setup a test values
  TEST_DATA.player = await Player.create({ username: 'SnapshotTest' });
  TEST_DATA.hiscores = await promisify(fs.readFile)(HISCORES_DATA_PATH, 'utf8');
  TEST_DATA.cml = await promisify(fs.readFile)(CML_DATA_PATH, 'utf8');

  done();
});

describe('Snapshot from external sources', () => {
  test('From hiscores (Lynx Titan) ', async (done) => {
    const snapshot = await service.fromRS(TEST_DATA.player.id, TEST_DATA.hiscores);

    expect(snapshot.playerId).toBe(TEST_DATA.player.id);

    SKILLS.forEach((skill) => {
      if (skill === 'overall') {
        expect(snapshot.overallRank).toBe(1);
        expect(snapshot.overallExperience).toBe((SKILLS.length - 1) * 200000000);
      } else {
        expect(snapshot[`${skill}Rank`]).toBeLessThan(1000);
        expect(snapshot[`${skill}Experience`]).toBe(200000000);
      }
    });

    done();
  });

  test('From CrystalMathLabs (Lynx Titan)', async (done) => {
    const cml = TEST_DATA.cml.split('\n').filter((r) => r.length);
    const snapshots = await Promise.all(cml.map((row) => service.fromCML(TEST_DATA.player.id, row)));

    const saved = await service.saveAll(snapshots);

    saved.forEach((snapshot) => {
      expect(snapshot.playerId).toBe(TEST_DATA.player.id);

      SKILLS.forEach((skill) => {
        if (skill === 'overall') {
          expect(snapshot.overallRank).toBe(1);
          expect(snapshot.overallExperience).toBe((SKILLS.length - 1) * 200000000);
        } else {
          expect(snapshot[`${skill}Rank`]).toBeLessThan(1000);
          expect(snapshot[`${skill}Experience`]).toBe(200000000);
        }
      });
    });

    done();
  });
});
