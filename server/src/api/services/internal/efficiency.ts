import { BOSSES, SKILLS } from '../../constants';
import { getValueKey } from '../../util/metrics';
import Snapshot from '../../modules/snapshots/snapshot.model';
import mainAlgorithm from '../../modules/efficiency/algorithms/main';

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
