import {
  BOSSES,
  Bonus,
  Boss,
  BossMetaConfig,
  EfficiencyAlgorithmType,
  MAX_SKILL_EXP,
  REAL_SKILLS,
  SKILLS,
  SKILL_EXP_AT_99,
  Skill,
  SkillMetaConfig,
  SkillMetaMethod,
  round
} from '../../../utils';

enum BonusType {
  START,
  END
}

class EfficiencyAlgorithm {
  public type: EfficiencyAlgorithmType;
  public skillMetas: SkillMetaConfig[];
  public bossMetas: BossMetaConfig[];

  private startBonuses: Bonus[];
  private endBonuses: Bonus[];

  private bonusDirectionMap: Map<Skill, Skill[]>;
  private maximumEHPMap: Map<Skill, number>;

  constructor(type: EfficiencyAlgorithmType, skillMetas: SkillMetaConfig[], bossMetas?: BossMetaConfig[]) {
    this.type = type;
    this.skillMetas = skillMetas;
    this.bossMetas = bossMetas || [];

    // Cache the start and end bonus ratios for this algorithm type
    this.startBonuses = this.getBonuses(skillMetas, BonusType.START);
    this.endBonuses = this.getBonuses(skillMetas, BonusType.END);

    // Cache the direction in which bonuses flow from one skill to the other, this allows us to only
    // calculate skill time for bonus skills that will actually affect the origin skill. (30x less iterations)
    this.bonusDirectionMap = this.getBonusDirectionMap([...this.startBonuses, ...this.endBonuses]);

    // Cache the maximum EHP for each skill, this is used to cap some skills that get overtrained
    this.maximumEHPMap = this.calculateMaximumEHPMap();
  }

  calculateEHB(killcountMap: Map<Boss, number>) {
    return Array.from(this.calculateEHBMap(killcountMap).values()).reduce((a, c) => a + c, 0);
  }

  calculateEHP(stats: Map<Skill, number>) {
    return this.calculateEHPMap(stats).get(Skill.OVERALL);
  }

  calculateTT200mAll(stats: Map<Skill, number>) {
    return this.maximumEHPMap.get(Skill.OVERALL) - this.calculateEHPMap(stats).get(Skill.OVERALL);
  }

  calculateTTM(stats: Map<Skill, number>) {
    const maxedStats = new Map(REAL_SKILLS.map(s => [s, SKILL_EXP_AT_99]));
    const cappedStats = new Map(REAL_SKILLS.map(s => [s, Math.min(stats.get(s), SKILL_EXP_AT_99)]));

    return this.calculateEHP(maxedStats) - this.calculateEHP(cappedStats);
  }

  calculateEHPMap(stats: Map<Skill, number>) {
    // Ensure no skills can be -1 exp
    const fixedStats = new Map(stats);
    REAL_SKILLS.forEach(skill => fixedStats.set(skill, Math.max(0, stats.get(skill) ?? 0)));

    const map = new Map(SKILLS.map(s => [s, 0]));

    const startBonusExp = this.calculateBonusExp(fixedStats, BonusType.START);
    const endBonusExp = this.calculateBonusExp(fixedStats, BonusType.END);

    REAL_SKILLS.forEach(originSkill => {
      let timeSum = 0;

      const bonusSkills = new Set(this.bonusDirectionMap.get(originSkill) ?? []);

      // Some skills' bonus skills also have bonus skills (e.g. wc -> fm -> cooking), so
      // to properly calculate WC EHP, we need to account for its effect on FM and Cooking.
      // In other words, add Cooking as a "bonus skill" to WC, because it's indirectly affected.
      bonusSkills.forEach(bonusSkill => {
        const dependants = this.bonusDirectionMap.get(bonusSkill) ?? [];
        dependants.forEach(d => bonusSkills.add(d));
      });

      [...bonusSkills, originSkill].forEach(bonusSkill => {
        const startExp = fixedStats.get(bonusSkill) + startBonusExp.get(bonusSkill);
        const endExp = MAX_SKILL_EXP - endBonusExp.get(bonusSkill);

        if (endExp - startExp <= 0 && bonusSkill !== originSkill) {
          return;
        }

        const resetStats = new Map(fixedStats);
        resetStats.set(originSkill, 0);

        const startBonusesReset = this.calculateBonusExp(resetStats, BonusType.START);
        const endBonusesReset = this.calculateBonusExp(resetStats, BonusType.END);

        const startExpReset = resetStats.get(bonusSkill) + startBonusesReset.get(bonusSkill);
        const endExpReset = MAX_SKILL_EXP - endBonusesReset.get(bonusSkill);

        const diff =
          this.calculateSkillTime(bonusSkill, startExpReset, endExpReset) -
          this.calculateSkillTime(bonusSkill, startExp, endExp);

        if (endExp - startExp <= 0) {
          timeSum += Math.min(this.maximumEHPMap.get(bonusSkill), diff);
        } else {
          timeSum += diff;
        }
      });

      map.set(originSkill, timeSum);
    });

    const totalEHP = Array.from(map.values()).reduce((a, b) => a + b, 0);
    map.set(Skill.OVERALL, totalEHP);

    return map;
  }

  calculateEHBMap(killcountMap: Map<Boss, number>) {
    // Ensure no bosses can be -1 exp
    const fixedKillcount = new Map(killcountMap);
    BOSSES.forEach(boss => fixedKillcount.set(boss, Math.max(0, killcountMap.get(boss) ?? 0)));

    const map = new Map(BOSSES.map(s => [s, 0]));

    this.bossMetas.forEach(meta => {
      if (!meta || meta.rate <= 0) return;

      map.set(meta.boss, round((fixedKillcount.get(meta.boss) ?? 0) / meta.rate, 5));
    });

    return map;
  }

  private calculateBonusExp(stats: Map<Skill, number>, type: BonusType) {
    const isStart = type === BonusType.START;
    const bonuses = isStart ? this.startBonuses : this.endBonuses;

    const map = new Map(REAL_SKILLS.map(skill => [skill, 0]));

    bonuses
      .sort((a, b) => {
        // Sort the bonuses by the number of dependencies they have.
        // This ensures skills with no received bonus exp are applied first (ex: Slayer).
        return (
          (this.bonusDirectionMap.get(b.bonusSkill)?.length ?? 0) -
          (this.bonusDirectionMap.get(a.bonusSkill)?.length ?? 0)
        );
      })
      .forEach(b => {
        if (!isStart && b.originSkill === Skill.HUNTER && b.bonusSkill === Skill.FISHING) {
          // Apply special BXP scaling function for drift net fishing/hunter
          const driftNetBonus = this.getDriftNetScaledBonus(stats);

          if (driftNetBonus) {
            map.set(Skill.FISHING, map.get(Skill.FISHING) + driftNetBonus);
            return;
          }
        }

        if (!isStart && b.originSkill === Skill.THIEVING && b.bonusSkill === Skill.AGILITY) {
          // Apply special BXP scaling function for swimming thieving/agility
          const swimmingBonus = this.getSwimmingScaledBonus(stats);

          if (swimmingBonus) {
            map.set(Skill.AGILITY, map.get(Skill.AGILITY) + swimmingBonus);
            return;
          }
        }

        const expCap = Math.min(b.endExp, MAX_SKILL_EXP);

        const originStart =
          Math.max(stats.get(b.originSkill), b.startExp) + (isStart ? map.get(b.originSkill) : 0);

        const originEnd = !isStart ? expCap - map.get(b.originSkill) : expCap;
        const bonusToApply = Math.max(0, originEnd - originStart) * b.ratio;

        map.set(b.bonusSkill, Math.min(MAX_SKILL_EXP, map.get(b.bonusSkill) + bonusToApply));
      });

    return map;
  }

  private getDriftNetScaledBonus(stats: Map<Skill, number>) {
    return this.getScaledMaxBonus(
      stats,
      Skill.HUNTER,
      Skill.FISHING,
      this.skillMetas.find(sm => sm.skill === Skill.HUNTER)?.methods.find(m => !!m.realRate),
      this.skillMetas.find(sm => sm.skill === Skill.FISHING)?.methods.at(-1),
      this.skillMetas.find(sm => sm.skill === Skill.HUNTER)?.bonuses[0]?.ratio
    );
  }

  private getSwimmingScaledBonus(stats: Map<Skill, number>) {
    return this.getScaledMaxBonus(
      stats,
      Skill.THIEVING,
      Skill.AGILITY,
      this.skillMetas.find(sm => sm.skill === Skill.THIEVING)?.methods.find(m => !!m.realRate),
      this.skillMetas.find(sm => sm.skill === Skill.AGILITY)?.methods.at(-1),
      this.skillMetas.find(sm => sm.skill === Skill.THIEVING)?.bonuses[0]?.ratio
    );
  }

  private getScaledMaxBonus(
    stats: Map<Skill, number>,
    originSkill: Skill,
    bonusSkill: Skill,
    originSkillMethod: SkillMetaMethod,
    bonusSkillMethod: SkillMetaMethod,
    bonusRatio: number
  ) {
    if (!originSkillMethod || !bonusSkillMethod || !bonusRatio) return 0;

    const originSkillStart = Math.max(originSkillMethod.startExp, stats.get(originSkill));

    const originExpLeft = MAX_SKILL_EXP - originSkillStart;

    const realTime =
      this.calculateSkillTime(originSkill, originSkillStart, MAX_SKILL_EXP, true) +
      this.calculateSkillTime(bonusSkill, stats.get(bonusSkill), MAX_SKILL_EXP, true);

    const fakeTime =
      this.calculateSkillTime(originSkill, originSkillStart, MAX_SKILL_EXP, false) +
      this.calculateSkillTime(bonusSkill, stats.get(bonusSkill), MAX_SKILL_EXP, false);

    const excessBonuses = (realTime - fakeTime) * bonusSkillMethod.rate;
    const fakeBonusLeft = originExpLeft * bonusRatio;

    return fakeBonusLeft - excessBonuses;
  }

  private calculateSkillTime(skill: Skill, startExp: number, endExp: number, useRealRates = false) {
    const methods = this.skillMetas.find(sm => sm.skill === skill)?.methods;

    // Handle 0 time skills (Hitpoints, Magic, Fletching)
    if (!methods || (methods.length === 1 && methods[0].rate === 0)) {
      return (endExp - startExp) / MAX_SKILL_EXP;
    }

    let skillTime = 0;

    for (let i = 0; i < methods.length; i++) {
      const current = methods[i];
      const next = methods[i + 1];

      if (current.rate === 0) continue;

      const rate = useRealRates && current.realRate ? current.realRate : current.rate;

      // Start exp is within this method's boundaries
      if (next && next.startExp > startExp && current.startExp < endExp) {
        const gained = Math.min(next.startExp, endExp) - Math.max(startExp, current.startExp);
        skillTime += gained / rate;
      }

      // End exp is beyond this method's boundaries
      if (!next && endExp > current.startExp) {
        const gained = endExp - Math.max(current.startExp, startExp);
        skillTime += gained / rate;
      }
    }

    return skillTime;
  }

  private calculateMaximumEHPMap() {
    const map = new Map(SKILLS.map(s => [s, 0]));

    const zeroStats = new Map(REAL_SKILLS.map(skill => [skill, 0]));

    const startBonusExp = this.calculateBonusExp(zeroStats, BonusType.START);
    const endBonusExp = this.calculateBonusExp(zeroStats, BonusType.END);

    REAL_SKILLS.forEach(skill => {
      const startExp = zeroStats.get(skill) + startBonusExp.get(skill);
      const endExp = MAX_SKILL_EXP - endBonusExp.get(skill);

      map.set(skill, this.calculateSkillTime(skill, startExp, endExp));
    });

    const totalEHP = Array.from(map.values()).reduce((a, b) => a + b, 0);
    map.set(Skill.OVERALL, totalEHP);

    return map;
  }

  private getBonusDirectionMap(bonuses: Bonus[]) {
    const map = new Map();

    bonuses.forEach(b => {
      const currentList = map.get(b.originSkill);

      if (currentList) {
        if (currentList.includes(b.bonusSkill)) return;
        map.set(b.originSkill, [...currentList, b.bonusSkill]);
      } else {
        map.set(b.originSkill, [b.bonusSkill]);
      }
    });

    return map;
  }

  private getBonuses(metas: SkillMetaConfig[], type: BonusType): Bonus[] {
    return metas
      .filter(r => r.bonuses.length > 0)
      .map(r => r.bonuses)
      .flat()
      .filter(b => b?.end === (type === BonusType.END));
  }
}

export default EfficiencyAlgorithm;
