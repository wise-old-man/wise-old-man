import {
  ACTIVITIES,
  ACTIVITIES_MAP,
  BOSSES,
  BOSSES_MAP,
  SKILLS,
  SKILLS_MAP,
  VIRTUAL,
  VIRTUAL_MAP
} from '../constants';

function isSkill(metric: string): boolean {
  return SKILLS.includes(metric);
}

function isActivity(metric: string): boolean {
  return ACTIVITIES.includes(metric);
}

function isBoss(metric: string): boolean {
  return BOSSES.includes(metric);
}

function isVirtual(metric: string): boolean {
  return VIRTUAL.includes(metric);
}

function getMeasure(metric: string): string {
  if (isSkill(metric)) {
    return 'experience';
  }

  if (isActivity(metric)) {
    return 'score';
  }

  if (isBoss(metric)) {
    return 'kills';
  }

  return 'value';
}

function getRankKey(metric: string): string {
  return `${metric}Rank`;
}

function getValueKey(metric: string): string {
  if (isSkill(metric)) {
    return `${metric}Experience`;
  }

  if (isBoss(metric)) {
    return `${metric}Kills`;
  }

  if (isActivity(metric)) {
    return `${metric}Score`;
  }

  return `${metric}Value`;
}

function getVirtualKey(metric: string): string {
  if (isBoss(metric)) return 'ehb';
  if (isSkill(metric)) return 'ehp';

  return null;
}

function getFormattedName(metric: string): string {
  const maps = [...SKILLS_MAP, ...ACTIVITIES_MAP, ...BOSSES_MAP, ...VIRTUAL_MAP];

  for (let i = 0; i < maps.length; i++) {
    if (maps[i].key === metric) {
      return maps[i].name;
    }
  }

  return 'Invalid metric name';
}

function getDifficultyFactor(metric: string): number {
  switch (metric) {
    case 'chambers_of_xeric':
    case 'chambers_of_xeric_challenge_mode':
    case 'theatre_of_blood':
    case 'the_gauntlet':
    case 'the_corrupted_gauntlet':
    case 'tztok_jad':
      return 0.2;
    case 'bryophyta':
    case 'obor':
    case 'skotizo':
    case 'hespori':
      return 0.1;
    case 'mimic':
    case 'tzkal_zuk':
      return 0.05;
    default:
      return 1;
  }
}

export function getMinimumBossKc(metric: string): number {
  if (!isBoss(metric)) return 0;

  switch (metric) {
    case 'mimic':
    case 'tzkal_zuk':
      return 2;
    case 'bryophyta':
    case 'chambers_of_xeric_challenge_mode':
    case 'hespori':
    case 'obor':
    case 'skotizo':
    case 'the_corrupted_gauntlet':
    case 'tztok_jad':
      return 10;
    default:
      return 50;
  }
}

function getAbbreviation(abbreviation: string): string {
  if (!abbreviation || abbreviation.length === 0) {
    return null;
  }

  switch (abbreviation) {
    case 'sire':
      return 'abyssal_sire';

    case 'hydra':
      return 'alchemical_hydra';

    case 'barrows':
      return 'barrows_chests';

    case 'bryo':
      return 'bryophyta';

    case 'cerb':
      return 'cerberus';

    case 'cox':
    case 'xeric':
    case 'chambers':
    case 'olm':
    case 'raids':
      return 'chambers_of_xeric';

    case 'cox-cm':
    case 'xeric-cm':
    case 'chambers-cm':
    case 'olm-cm':
    case 'raids-cm':
      return 'chambers_of_xeric_challenge_mode';

    case 'chaos ele':
      return 'chaos_elemental';

    case 'fanatic':
      return 'chaos_fanatic';

    case 'sara':
    case 'saradomin':
    case 'zilyana':
    case 'zily':
      return 'commander_zilyana';

    case 'corp':
      return 'corporeal_beast';

    case 'crazy arch':
      return 'crazy_archaeologist';

    case 'prime':
      return 'dagannoth_prime';
    case 'rex':
      return 'dagannoth_rex';
    case 'supreme':
      return 'dagannoth_supreme';

    case 'deranged arch':
      return 'deranged_archaeologist';

    case 'bandos':
    case 'graardor':
      return 'general_graardor';

    case 'mole':
      return 'giant_mole';

    case 'dusk':
    case 'dawn':
    case 'gargs':
    case 'guardians':
      return 'grotesque_guardians';

    case 'kq':
      return 'kalphite_queen';

    case 'kbd':
      return 'king_black_dragon';

    case 'kree':
    case 'kreearra':
    case 'armadyl':
    case 'armadyl':
      return 'kreearra';

    case 'zammy':
    case 'zamorak':
    case 'kril':
    case 'kril trutsaroth':
      return 'kril_tsutsaroth';

    case 'gaunt':
    case 'gauntlet':
      return 'the_gauntlet';

    case 'cgaunt':
    case 'cgauntlet':
    case 'corrupted':
      return 'the_corrupted_gauntlet';

    case 'tob':
    case 'theatre':
    case 'verzik':
      return 'theatre_of_blood';

    case 'thermy':
      return 'thermonuclear_smoke_devil';

    case 'zuk':
    case 'inferno':
      return 'tzkal_zuk';

    case 'jad':
      return 'tztok_jad';

    case 'vork':
      return 'vorkath';

    case 'wt':
      return 'wintertodt';

    case 'snek':
      return 'zulrah';

    default:
      return abbreviation;
  }
}

export {
  isSkill,
  isActivity,
  isBoss,
  isVirtual,
  getMeasure,
  getFormattedName,
  getRankKey,
  getValueKey,
  getVirtualKey,
  getDifficultyFactor,
  getAbbreviation
};
