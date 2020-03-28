import { LEVEL_EXP } from '../config';

export function getLevel(experience) {
  let index;

  for (index = 0; index < LEVEL_EXP.length; index += 1) {
    if (LEVEL_EXP[index + 1] > experience) {
      break;
    }
  }

  return Math.min(index, 99);
}

export function getExperienceAt(level) {
  return LEVEL_EXP[Math.min(level, 99)];
}
