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

export function getMinimumBossKc(metric: string): number {
  if (!isBoss(metric)) return 0;

  switch (metric) {
    case 'mimic':
    case 'tzkal_zuk':
      return 1;
    case 'bryophyta':
    case 'chambers_of_xeric_challenge_mode':
    case 'hespori':
    case 'obor':
    case 'skotizo':
    case 'the_corrupted_gauntlet':
    case 'tztok_jad':
      return 5;
    default:
      return 50;
  }
}

function getAbbreviation(abbreviation: string): string {
  if (!abbreviation || abbreviation.length === 0) {
    return null;
  }

  switch (abbreviation) {
    // Bosses
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

    case 'chaos-ele':
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

    case 'crazy-arch':
      return 'crazy_archaeologist';

    case 'prime':
      return 'dagannoth_prime';
    case 'rex':
      return 'dagannoth_rex';
    case 'supreme':
      return 'dagannoth_supreme';

    case 'deranged-arch':
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
    case 'ggs':
      return 'grotesque_guardians';

    case 'kq':
      return 'kalphite_queen';

    case 'kbd':
      return 'king_black_dragon';

    case 'kree':
    case 'kreearra':
    case 'armadyl':
    case 'arma':
      return 'kreearra';

    case 'zammy':
    case 'zamorak':
    case 'kril':
    case 'kril-tsutsaroth':
      return 'kril_tsutsaroth';

    case 'gaunt':
    case 'gauntlet':
    case 'the-gauntlet':
      return 'the_gauntlet';

    case 'cgaunt':
    case 'cgauntlet':
    case 'corrupted':
    case 'corrupted-gauntlet':
    case 'the-corrupted-gauntlet':
      return 'the_corrupted_gauntlet';

    case 'tob':
    case 'theatre':
    case 'verzik':
    case 'tob-normal':
      return 'theatre_of_blood';

    case 'tob-hm':
    case 'tob-cm':
    case 'tob-hard-mode':
    case 'tob-hard':
      return 'theatre_of_blood_hard_mode';

    case 'nm':
    case 'tnm':
    case 'nmare':
    case 'the-nightmare':
      return 'nightmare';

    case 'pnm':
    case 'phosani':
    case 'phosanis':
    case 'phosani-nm':
    case 'phosani-nightmare':
    case 'phosanis nightmare':
      return 'phosanis_nightmare';

    case 'thermy':
    case 'smoke-devil':
      return 'thermonuclear_smoke_devil';

    case 'zuk':
    case 'inferno':
      return 'tzkal_zuk';

    case 'jad':
    case 'fight-caves':
    case 'fc':
      return 'tztok_jad';

    case 'vork':
    case 'vorky':
      return 'vorkath';

    case 'wt':
      return 'wintertodt';

    case 'snek':
    case 'zul':
      return 'zulrah';

    // Minigames and others

    case 'all-clues':
    case 'clues':
      return 'clue_scrolls_all';

    case 'beginner':
    case 'beginner-clues':
    case 'beg-clues':
    case 'beginners':
      return 'clue_scrolls_beginner';

    case 'easy':
    case 'easy-clues':
    case 'easies':
      return 'clue_scrolls_easy';

    case 'medium':
    case 'med':
    case 'meds':
    case 'medium-clues':
    case 'med-clues':
    case 'mediums':
      return 'clue_scrolls_medium';

    case 'hard':
    case 'hard-clues':
    case 'hards':
      return 'clue_scrolls_hard';

    case 'elite':
    case 'elite-clues':
    case 'elites':
      return 'clue_scrolls_elite';

    case 'master':
    case 'master-clues':
    case 'masters':
      return 'clue_scrolls_master';

    case 'lms':
      return 'last_man_standing';

    case 'league':
    case 'lp':
    case 'lps':
      return 'league_points';

    case 'sw':
    case 'zeal':
    case 'soul-wars':
      return 'soul_wars_zeal';

    // Skills

    case 'runecraft':
    case 'rc':
      return 'runecrafting';

    case 'att':
    case 'atk':
    case 'attk':
      return 'attack';

    case 'def':
    case 'defense':
      return 'defence';

    case 'str':
      return 'strength';

    case 'hp':
      return 'hitpoints';

    case 'range':
      return 'ranged';

    case 'pray':
      return 'prayer';

    case 'mage':
      return 'magic';

    case 'cook':
      return 'cooking';

    case 'wc':
      return 'woodcutting';

    case 'fletch':
      return 'fletching';

    case 'fish':
      return 'fishing';

    case 'fm':
    case 'burning':
      return 'firemaking';

    case 'craft':
      return 'crafting';

    case 'sm':
    case 'smith':
      return 'smithing';

    case 'mine':
    case 'smash':
      return 'mining';

    case 'herb':
      return 'herblore';

    case 'agi':
    case 'agil':
      return 'agility';

    case 'thief':
      return 'thieving';

    case 'slay':
      return 'slayer';

    case 'farm':
      return 'farming';

    case 'hunt':
    case 'hunting':
      return 'hunter';

    case 'con':
    case 'cons':
    case 'const':
      return 'construction';

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
  getAbbreviation
};
