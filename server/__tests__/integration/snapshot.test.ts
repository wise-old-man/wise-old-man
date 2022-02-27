import { SKILLS, getMetricRankKey, getMetricValueKey } from '@wise-old-man/utils';
import * as service from '../../src/api/services/internal/snapshot.service';
import { Player } from '../../src/database/models';
import { TestData } from '../types';
import { readFile, resetDatabase } from '../utils';

const HISCORES_DATA_PATH = `${__dirname}/../data/hiscores/lynx_titan_hiscores.txt`;
const CML_DATA_PATH = `${__dirname}/../data/cml/lynx_titan_cml.txt`;

const TEST_DATA = {} as TestData;

beforeAll(async done => {
  await resetDatabase();

  // Setup a test values
  TEST_DATA.player = await Player.create({ username: 'SnapshotTest' });
  TEST_DATA.hiscores = await readFile(HISCORES_DATA_PATH);
  TEST_DATA.cml = await readFile(CML_DATA_PATH);

  done();
});

describe('Snapshot from external sources', () => {
  test('From hiscores (Lynx Titan) ', async done => {
    const snapshot = await service.fromRS(TEST_DATA.player.id, TEST_DATA.hiscores);

    expect(snapshot.playerId).toBe(TEST_DATA.player.id);

    SKILLS.forEach(skill => {
      if (skill === 'overall') {
        expect(snapshot.overallRank).toBe(1);
        expect(snapshot.overallExperience).toBe((SKILLS.length - 1) * 200000000);
      } else {
        expect(snapshot[getMetricRankKey(skill)]).toBeLessThan(1000);
        expect(snapshot[getMetricValueKey(skill)]).toBe(200000000);
      }
    });

    done();
  });

  test('From CrystalMathLabs (Lynx Titan)', async done => {
    const cml = TEST_DATA.cml.split('\n').filter(r => r.length);
    const snapshots = await Promise.all(cml.map(row => service.fromCML(TEST_DATA.player.id, row)));

    const saved = await service.saveAll(snapshots);

    saved.forEach(snapshot => {
      expect(snapshot.playerId).toBe(TEST_DATA.player.id);

      SKILLS.forEach(skill => {
        if (skill === 'overall') {
          expect(snapshot.overallRank).toBe(1);
          expect(snapshot.overallExperience).toBe((SKILLS.length - 1) * 200000000);
        } else {
          expect(snapshot[getMetricRankKey(skill)]).toBeLessThan(1000);
          expect(snapshot[getMetricValueKey(skill)]).toBe(200000000);
        }
      });
    });

    done();
  });
});
