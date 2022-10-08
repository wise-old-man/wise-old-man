import { SKILLS, getLevel } from '@wise-old-man/utils';

export function getExperienceAt(level) {
  let accumulated = 0;

  for (let l = 1; l !== level + 1; l++) {
    accumulated += getXpDifferenceTo(l);
  }

  return accumulated;
}

export function getTotalLevel(snapshot) {
  return SKILLS.filter(skill => skill !== 'overall')
    .map(s => getLevel(snapshot[s].experience))
    .reduce((acc, cur) => acc + cur);
}

export function getCappedTotalXp(snapshot) {
  return SKILLS.filter(skill => skill !== 'overall')
    .map(s => (snapshot[s].experience >= 13034431 ? 13034431 : snapshot[s].experience))
    .reduce((acc, cur) => acc + cur);
}

function getXpDifferenceTo(level) {
  if (level < 2) {
    return 0;
  }

  return Math.floor(level - 1 + 300 * 2 ** ((level - 1) / 7)) / 4;
}
