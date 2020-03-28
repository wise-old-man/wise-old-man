const { SKILLS } = require("./metrics");

const ACHIEVEMENTS = [
  {
    name: "99 {skill}",
    validate: exp => exp >= 13034431
  },
  {
    name: "200m {skill}",
    validate: exp => exp >= 200000000
  },
  {
    name: "100m {skill}",
    validate: exp => exp >= 100000000
  },
  {
    name: "50m {skill}",
    validate: exp => exp >= 50000000
  },
  {
    name: "500m overall experience",
    validate: ({ overallExperience }) => overallExperience >= 500000000
  },
  {
    name: "1b overall experience",
    validate: ({ overallExperience }) => overallExperience >= 1000000000
  },
  {
    name: "2b overall experience",
    validate: ({ overallExperience }) => overallExperience >= 2000000000
  },
  {
    name: "200m all",
    validate: ({ overallExperience }) => overallExperience >= (SKILLS.length - 1) * 200000000
  },
  {
    name: "Maxed total",
    validate: snapshot => {
      let maxedSkills = 0;
      SKILLS.filter(s => s !== "overall").forEach(skill => {
        if (snapshot[`${skill}Experience`] >= 13034431) {
          maxedSkills += 1;
        }
      });

      return maxedSkills === SKILLS.length - 1;
    }
  },
  {
    name: "Maxed combat",
    validate: snapshot => {
      const combatSkills = ["attack", "strength", "defence", "prayer", "magic", "ranged"];
      let maxedSkills = 0;

      SKILLS.filter(s => combatSkills.includes(s)).forEach(skill => {
        if (snapshot[`${skill}Experience`] >= 13034431) {
          maxedSkills += 1;
        }
      });

      return maxedSkills === combatSkills.length;
    }
  }
];

exports.ACHIEVEMENTS = ACHIEVEMENTS;
