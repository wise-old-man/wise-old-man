import { ACTIVITIES, ACTIVITIES_MAP, BOSSES, BOSSES_MAP, SKILLS, SKILLS_MAP } from '../constants';

function isSkill(value: string) {
  return SKILLS.includes(value);
}

function isActivity(value) {
  return ACTIVITIES.includes(value);
}

function isBoss(value) {
  return BOSSES.includes(value);
}

function getMeasure(value) {
  if (isSkill(value)) {
    return 'experience';
  }

  if (isActivity(value)) {
    return 'score';
  }

  return 'kills';
}

function getRankKey(value) {
  return `${value}Rank`;
}

function getValueKey(value) {
  if (isSkill(value)) {
    return `${value}Experience`;
  }

  if (isActivity(value)) {
    return `${value}Score`;
  }

  return `${value}Kills`;
}

function getFormattedName(value) {
  for (let i = 0; i < SKILLS_MAP.length; i += 1) {
    if (SKILLS_MAP[i].key === value) {
      return SKILLS_MAP[i].name;
    }
  }

  for (let i = 0; i < ACTIVITIES_MAP.length; i += 1) {
    if (ACTIVITIES_MAP[i].key === value) {
      return ACTIVITIES_MAP[i].name;
    }
  }

  for (let i = 0; i < BOSSES_MAP.length; i += 1) {
    if (BOSSES_MAP[i].key === value) {
      return BOSSES_MAP[i].name;
    }
  }

  return 'Invalid metric name';
}

function getDifficultyFactor(metric) {
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

function getAbbreviation(abbr) {
  if (!abbr || abbr.length === 0) {
    return null;
  }

  switch (abbr) {
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
      return abbr;
  }
}

export {
  isSkill,
  isActivity,
  isBoss,
  getMeasure,
  getFormattedName,
  getRankKey,
  getValueKey,
  getDifficultyFactor,
  getAbbreviation
};
