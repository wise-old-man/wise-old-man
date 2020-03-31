export function getSkillIcon(skill, smallVersion) {
  const folder = smallVersion ? 'skill_icons_small' : 'skill_icons';
  return `/img/runescape/${folder}/${skill}.png`;
}
