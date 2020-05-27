const { SKILLS, BOSSES, getValueKey } = require('./metrics');

const SKILL_ACHIEVEMENTS = [
  {
    name: '99 {skill}',
    value: 13034431,
    validate: exp => exp >= 13034431
  },
  {
    name: '200m {skill}',
    value: 200000000,
    validate: exp => exp >= 200000000
  },
  {
    name: '100m {skill}',
    value: 100000000,
    validate: exp => exp >= 100000000
  },
  {
    name: '50m {skill}',
    value: 50000000,
    validate: exp => exp >= 50000000
  },
  {
    name: '500m overall experience',
    metric: 'overall',
    value: 500000000,
    validate: ({ overallExperience }) => overallExperience >= 500000000
  },
  {
    name: '1b overall experience',
    metric: 'overall',
    value: 1000000000,
    validate: ({ overallExperience }) => overallExperience >= 1000000000
  },
  {
    name: '2b overall experience',
    metric: 'overall',
    value: 2000000000,
    validate: ({ overallExperience }) => overallExperience >= 2000000000
  },
  {
    name: '200m all',
    metric: 'overall',
    value: (SKILLS.length - 1) * 200000000,
    validate: ({ overallExperience }) => overallExperience >= (SKILLS.length - 1) * 200000000
  },
  {
    name: 'Maxed overall',
    metric: 'overall',
    value: 2277,
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
    metric: 'combat',
    value: 126,
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
    name: '1k {activity} score',
    value: 1000,
    validate: score => score >= 1000
  },
  {
    name: '5k {activity} score',
    value: 5000,
    validate: score => score >= 5000
  },
  {
    name: '10k {activity} score',
    value: 10000,
    validate: score => score >= 10000
  }
];

const BOSS_ACHIEVEMENTS = [
  {
    name: '500 {boss} kills',
    value: 500,
    validate: kills => kills >= 500
  },
  {
    name: '1k {boss} kills',
    value: 1000,
    validate: kills => kills >= 1000
  },
  {
    name: '5k {boss} kills',
    value: 5000,
    validate: kills => kills >= 5000
  },
  {
    name: '10k {boss} kills',
    value: 10000,
    validate: kills => kills >= 10000
  },
  {
    name: '100 kills (all bosses)',
    metric: 'bossing',
    value: 100,
    validate: snapshot => {
      let count = 0;
      BOSSES.forEach(skill => {
        if (snapshot[getValueKey(skill)] >= 100) {
          count += 1;
        }
      });
      return count === BOSSES.length;
    }
  }
];

module.exports = { SKILL_ACHIEVEMENTS, ACTIVITY_ACHIEVEMENTS, BOSS_ACHIEVEMENTS };
