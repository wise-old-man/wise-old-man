const { SKILLS, BOSSES, getValueKey } = require('./metrics');

const SKILL_ACHIEVEMENTS = [
  {
    name: '99 {skill}',
    validate: exp => exp >= 13034431
  },
  {
    name: '200m {skill}',
    validate: exp => exp >= 200000000
  },
  {
    name: '100m {skill}',
    validate: exp => exp >= 100000000
  },
  {
    name: '50m {skill}',
    validate: exp => exp >= 50000000
  },
  {
    name: '500m overall experience',
    validate: ({ overallExperience }) => overallExperience >= 500000000
  },
  {
    name: '1b overall experience',
    validate: ({ overallExperience }) => overallExperience >= 1000000000
  },
  {
    name: '2b overall experience',
    validate: ({ overallExperience }) => overallExperience >= 2000000000
  },
  {
    name: '200m all',
    validate: ({ overallExperience }) => overallExperience >= (SKILLS.length - 1) * 200000000
  },
  {
    name: 'Maxed total',
    validate: snapshot => {
      let maxedSkills = 0;
      SKILLS.filter(s => s !== 'overall').forEach(skill => {
        if (snapshot[getValueKey(skill)] >= 13034431) {
          maxedSkills += 1;
        }
      });

      return maxedSkills === SKILLS.length - 1;
    }
  },
  {
    name: 'Maxed combat',
    validate: snapshot => {
      const combatSkills = ['attack', 'strength', 'defence', 'prayer', 'magic', 'ranged'];
      let maxedSkills = 0;

      SKILLS.filter(s => combatSkills.includes(s)).forEach(skill => {
        if (snapshot[getValueKey(skill)] >= 13034431) {
          maxedSkills += 1;
        }
      });

      return maxedSkills === combatSkills.length;
    }
  }
];

const ACTIVITY_ACHIEVEMENTS = [
  {
    name: '500 {activity} score',
    validate: score => score >= 500
  },
  {
    name: '1k {activity} score',
    validate: score => score >= 1000
  },
  {
    name: '5k {activity} score',
    validate: score => score >= 5000
  },
  {
    name: '10k {activity} score',
    validate: score => score >= 10000
  }
];

const BOSS_ACHIEVEMENTS = [
  {
    name: '500 {boss} kills',
    validate: kills => kills >= 500
  },
  {
    name: '1k {boss} kills',
    validate: kills => kills >= 1000
  },
  {
    name: '5k {boss} kills',
    validate: kills => kills >= 5000
  },
  {
    name: '10k {boss} kills',
    validate: kills => kills >= 10000
  },
  {
    name: '100 kills (all bosses)',
    validate: snapshot => {
      let count = 0;
      BOSSES.forEach(skill => {
        if (snapshot[getValueKey(skill)] >= 100) {
          count += 1;
        }
      });
      return count === BOSSES.length - 1;
    }
  }
];

module.exports = { SKILL_ACHIEVEMENTS, ACTIVITY_ACHIEVEMENTS, BOSS_ACHIEVEMENTS };
