const metrics = {
  SKILLS: [
    { key: 'overall', name: 'Overall' },
    { key: 'attack', name: 'Attack' },
    { key: 'defence', name: 'Defence' },
    { key: 'strength', name: 'Strength' },
    { key: 'hitpoints', name: 'Hitpoints' },
    { key: 'ranged', name: 'Ranged' },
    { key: 'prayer', name: 'Prayer' },
    { key: 'magic', name: 'Magic' },
    { key: 'cooking', name: 'Cooking' },
    { key: 'woodcutting', name: 'Woodcutting' },
    { key: 'fletching', name: 'Fletching' },
    { key: 'fishing', name: 'Fishing' },
    { key: 'firemaking', name: 'Firemaking' },
    { key: 'crafting', name: 'Crafting' },
    { key: 'smithing', name: 'Smithing' },
    { key: 'mining', name: 'Mining' },
    { key: 'herblore', name: 'Herblore' },
    { key: 'agility', name: 'Agility' },
    { key: 'thieving', name: 'Thieving' },
    { key: 'slayer', name: 'Slayer' },
    { key: 'farming', name: 'Farming' },
    { key: 'runecrafting', name: 'Runecrafting' },
    { key: 'hunter', name: 'Hunter' },
    { key: 'construction', name: 'Construction' }
  ],
  ACTIVITIES: [
    { key: 'league_points', name: 'League Points' },
    { key: 'bounty_hunter_hunter', name: 'Bounty Hunter (Hunter)' },
    { key: 'bounty_hunter_rogue', name: 'Bounty Hunter (Rogue)' },
    { key: 'clue_scrolls_all', name: 'Clue Scrolls (All)' },
    { key: 'clue_scrolls_beginner', name: 'Clue Scrolls (Beginner)' },
    { key: 'clue_scrolls_easy', name: 'Clue Scroll (Easy)' },
    { key: 'clue_scrolls_medium', name: 'Clue Scroll (Medium)' },
    { key: 'clue_scrolls_hard', name: 'Clue Scroll (Hard)' },
    { key: 'clue_scrolls_elite', name: 'Clue Scroll (Elite)' },
    { key: 'clue_scrolls_master', name: 'Clue Scroll (Master)' },
    { key: 'last_man_standing', name: 'Last Man Standing' }
  ],
  BOSSES: [
    { key: 'abyssal_sire', name: 'Abyssal Sire' },
    { key: 'alchemical_hydra', name: 'Alchemical Hydra' },
    { key: 'barrows_chests', name: 'Barrows Chests' },
    { key: 'bryophyta', name: 'Bryophyta' },
    { key: 'callisto', name: 'Callisto' },
    { key: 'cerberus', name: 'Cerberus' },
    { key: 'chambers_of_xeric', name: 'Chambers Of Xeric' },
    { key: 'chambers_of_xeric_challenge_mode', name: 'Chambers Of Xeric (Challenge)' },
    { key: 'chaos_elemental', name: 'Chaos Elemental' },
    { key: 'chaos_fanatic', name: 'Chaos Fanatic' },
    { key: 'commander_zilyana', name: 'Commander Zilyana' },
    { key: 'corporeal_beast', name: 'Corporeal Beast' },
    { key: 'crazy_archaeologist', name: 'Crazy Archaeologist' },
    { key: 'dagannoth_prime', name: 'Dagannoth Prime' },
    { key: 'dagannoth_rex', name: 'Dagannoth Rex' },
    { key: 'dagannoth_supreme', name: 'Dagannoth Supreme' },
    { key: 'deranged_archaeologist', name: 'Deranged Archaeologist' },
    { key: 'general_graardor', name: 'General Graardor' },
    { key: 'giant_mole', name: 'Giant Mole' },
    { key: 'grotesque_guardians', name: 'Grotesque Guardians' },
    { key: 'hespori', name: 'Hespori' },
    { key: 'kalphite_queen', name: 'Kalphite Queen' },
    { key: 'king_black_dragon', name: 'King Black Dragon' },
    { key: 'kraken', name: 'Kraken' },
    { key: 'kreearra', name: "Kree'Arra" },
    { key: 'kril_tsutsaroth', name: "K'ril Tsutsaroth" },
    { key: 'mimic', name: 'Mimic' },
    { key: 'nightmare', name: 'Nightmare' },
    { key: 'obor', name: 'Obor' },
    { key: 'sarachnis', name: 'Sarachnis' },
    { key: 'scorpia', name: 'Scorpia' },
    { key: 'skotizo', name: 'Skotizo' },
    { key: 'the_gauntlet', name: 'The Gauntlet' },
    { key: 'the_corrupted_gauntlet', name: 'The Corrupted Gauntlet' },
    { key: 'theatre_of_blood', name: 'Theatre Of Blood' },
    { key: 'thermonuclear_smoke_devil', name: 'Thermonuclear Smoke Devil' },
    { key: 'tzkal_zuk', name: 'TzKal-Zuk' },
    { key: 'tztok_jad', name: 'TzTok-Jad' },
    { key: 'venenatis', name: 'Venenatis' },
    { key: 'vetion', name: "Vet'ion" },
    { key: 'vorkath', name: 'Vorkath' },
    { key: 'wintertodt', name: 'Wintertodt' },
    { key: 'zalcano', name: 'Zalcano' },
    { key: 'zulrah', name: 'Zulrah' }
  ],
  EHP: [
    { key: 'ehp', name: 'EHP' },
    { key: 'lehp', name: 'Legacy EHP' },
    { key: 'sehp', name: 'Special EHP' },
    { key: 'lsehp', name: 'Legacy Special EHP' }
  ]
};

const SKILLS_KEYS = metrics.SKILLS.map(s => s.key);
const ACTIVITIES_KEYS = metrics.ACTIVITIES.map(s => s.key);
const BOSSES_KEYS = metrics.BOSSES.map(s => s.key);
const EHP_KEYS = metrics.EHP.map(s => s.key);

function isSkill(value) {
  return SKILLS_KEYS.includes(value);
}

function isActivity(value) {
  return ACTIVITIES_KEYS.includes(value);
}

function isBoss(value) {
  return BOSSES_KEYS.includes(value);
}

function isEhp(value) {
  return EHP_KEYS.includes(value);
}

function getMeasure(value) {
  if (isSkill(value)) {
    return 'experience';
  }

  if (isActivity(value)) {
    return 'score';
  }

  if (isEhp(value)) {
    return 'hours';
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

  if (isEhp(value)) {
    return `${value}`;
  }

  return `${value}Kills`;
}

function getFormattedName(value) {
  for (let i = 0; i < metrics.SKILLS.length; i += 1) {
    if (metrics.SKILLS[i].key === value) {
      return metrics.SKILLS[i].name;
    }
  }

  for (let i = 0; i < metrics.ACTIVITIES.length; i += 1) {
    if (metrics.ACTIVITIES[i].key === value) {
      return metrics.ACTIVITIES[i].name;
    }
  }

  for (let i = 0; i < metrics.BOSSES.length; i += 1) {
    if (metrics.BOSSES[i].key === value) {
      return metrics.BOSSES[i].name;
    }
  }

  for (let i = 0; i < metrics.EHP.length; i += 1) {
    if (metrics.EHP[i].key === value) {
      return metrics.EHP[i].name;
    }
  }

  return 'Invalid metric name';
}

module.exports = {
  SKILLS: SKILLS_KEYS,
  ACTIVITIES: ACTIVITIES_KEYS,
  BOSSES: BOSSES_KEYS,
  EHP: EHP_KEYS,
  ALL_METRICS: [...SKILLS_KEYS, ...ACTIVITIES_KEYS, ...BOSSES_KEYS, ...EHP_KEYS],
  isSkill,
  isActivity,
  isBoss,
  isEhp,
  getMeasure,
  getFormattedName,
  getRankKey,
  getValueKey
};
