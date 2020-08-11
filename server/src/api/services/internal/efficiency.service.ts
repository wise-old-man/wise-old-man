import { Snapshot } from 'database/models';
import { BOSSES, SKILLS } from 'api/constants';
import mainAlgorithm from 'api/modules/efficiency/algorithms/main';
import { getValueKey } from 'api/util/metrics';

function calculateEHP(snapshot: Snapshot): number {
  // TODO: always use main ehp, for now
  const algorithm = mainAlgorithm;
  const exp = Object.fromEntries(SKILLS.map(s => [s, snapshot[getValueKey(s)]]));

  return algorithm.calculateEHP(exp);
}

function calculateEHB(snapshot: Snapshot) {
  // TODO: always use main ehp, for now
  const algorithm = mainAlgorithm;
  const kcs = Object.fromEntries(BOSSES.map(b => [b, snapshot[getValueKey(b)]]));

  return algorithm.calculateEHB(kcs);
}

function calculateEHPDiff(beforeSnapshot: Snapshot, afterSnapshot: Snapshot): number {
  return calculateEHP(afterSnapshot) - calculateEHP(beforeSnapshot);
}

function calculateEHBDiff(beforeSnapshot: Snapshot, afterSnapshot: Snapshot): number {
  return calculateEHB(afterSnapshot) - calculateEHB(beforeSnapshot);
}

export { calculateEHP, calculateEHB, calculateEHBDiff, calculateEHPDiff };
