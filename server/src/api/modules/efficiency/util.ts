import { Bonus, BonusType, BossMeta, Experiences, Killcounts, SkillMeta } from '../../../types';
import { BOSSES, SKILLS } from '../../constants';

function getBonuses(metas: SkillMeta[], type: BonusType): Bonus[] {
  return metas
    .filter(r => r.bonuses.length > 0)
    .map(r => r.bonuses)
    .flat()
    .filter(b => b?.end === (type === BonusType.End));
}

function calculateBonuses(experiences: Experiences, bonuses: Bonus[]) {
  // Creates an object with an entry for each bonus skill (0 bonus exp)
  const map = Object.fromEntries(bonuses.map(b => [b.bonusSkill, 0]));

  bonuses.forEach(b => {
    const expCap = Math.min(b.endExp, 200_000_000);
    const start = Math.max(experiences[b.originSkill], b.startExp);
    const target = b.originSkill in map ? expCap - map[b.originSkill] : expCap;

    map[b.bonusSkill] += Math.max(0, target - start) * b.ratio;
  });

  return map;
}

function calculateMaxEHP(metas: SkillMeta[]) {
  const zeroStats = Object.fromEntries(SKILLS.map(s => [s, 0]));
  return calculateTTM(zeroStats, metas);
}

function calculateBossEHB(boss: string, killcounts: Killcounts, metas: BossMeta[]) {
  const kc = killcounts[boss];

  if (!kc || kc <= 0) return 0;

  const meta = metas.find(meta => meta.boss === boss);

  if (!meta || meta.rate <= 0) return 0;

  return kc / meta.rate;
}

function calculateEHB(killcounts: Killcounts, metas: BossMeta[]) {
  return BOSSES.map(b => calculateBossEHB(b, killcounts, metas)).reduce((a, c) => a + c);
}

function calculateTTM(experiences: Experiences, metas: SkillMeta[]): number {
  const startBonusExp = calculateBonuses(experiences, getBonuses(metas, BonusType.Start));
  const endBonusExp = calculateBonuses(experiences, getBonuses(metas, BonusType.End));

  const startExps = Object.fromEntries(SKILLS.map(s => [s, experiences[s] + (startBonusExp[s] || 0)]));

  const targetExps = Object.fromEntries(
    SKILLS.map(s => [s, s in endBonusExp ? 200_000_000 - endBonusExp[s] : 200_000_000])
  );

  const skillTimes = SKILLS.map(skill => {
    if (skill === 'overall') return 0;

    const methods = metas.find(sm => sm.skill === skill)?.methods;
    const startExp = startExps[skill];
    const endExp = targetExps[skill];

    // Handle 0 time skills (Hitpoints, Magic, Fletching)
    if (!methods || (methods.length === 1 && methods[0].rate === 0)) {
      return (endExp - startExp) / 200_000_000;
    }

    let skillTime = 0;

    for (let i = 0; i < methods.length; i++) {
      const current = methods[i];
      const next = methods[i + 1];

      // Start exp is within this method's boundaries
      if (next && next.startExp > startExp && current.startExp < endExp) {
        const gained = Math.min(next.startExp, endExp) - Math.max(startExp, current.startExp);
        skillTime += Math.max(0, gained / current.rate);
      }

      // End exp is beyond this method's boundaries
      if (!next && endExp > current.startExp) {
        const gained = endExp - Math.max(current.startExp, startExp);
        skillTime += Math.max(0, gained / current.rate);
      }
    }

    return skillTime;
  });

  // Sum all inidividual skill times, into the total TTM
  return skillTimes.reduce((a, c) => a + c);
}

export { getBonuses, calculateBonuses, calculateTTM, calculateMaxEHP, calculateEHB, calculateBossEHB };
