export const MAX_LEVEL = 99;
export const MAX_VIRTUAL_LEVEL = 126;

export const PERIODS = ['day', 'week', 'month', 'year'];

export const PLAYER_TYPES = ['unknown', 'regular', 'ironman', 'hardcore', 'ultimate'];

export const GROUP_ROLES = ['member', 'leader'];

export const COMPETITION_STATUSES = ['upcoming', 'ongoing', 'finished'];

export const OSRS_HISCORES = {
  regular: 'https://services.runescape.com/m=hiscore_oldschool/index_lite.ws',
  ironman: 'https://services.runescape.com/m=hiscore_oldschool_ironman/index_lite.ws',
  hardcore: 'https://services.runescape.com/m=hiscore_oldschool_hardcore_ironman/index_lite.ws',
  ultimate: 'https://services.runescape.com/m=hiscore_oldschool_ultimate/index_lite.ws',
  nameCheck: 'https://secure.runescape.com/m=hiscore_oldschool/overall?table=0'
};

export const CML = {
  HISTORY: 'https://crystalmathlabs.com/tracker/api.php?type=datapoints'
};

export const SKILLS_MAP = [
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
];

export const ACTIVITIES_MAP = [
  { key: 'league_points', name: 'League Points' },
  { key: 'bounty_hunter_hunter', name: 'Bounty Hunter (Hunter)' },
  { key: 'bounty_hunter_rogue', name: 'Bounty Hunter (Rogue)' },
  { key: 'clue_scrolls_all', name: 'Clue Scrolls (All)' },
  { key: 'clue_scrolls_beginner', name: 'Clue Scrolls (Beginner)' },
  { key: 'clue_scrolls_easy', name: 'Clue Scrolls (Easy)' },
  { key: 'clue_scrolls_medium', name: 'Clue Scrolls (Medium)' },
  { key: 'clue_scrolls_hard', name: 'Clue Scrolls (Hard)' },
  { key: 'clue_scrolls_elite', name: 'Clue Scrolls (Elite)' },
  { key: 'clue_scrolls_master', name: 'Clue Scrolls (Master)' },
  { key: 'last_man_standing', name: 'Last Man Standing' }
];

export const BOSSES_MAP = [
  { key: 'abyssal_sire', name: 'Abyssal Sire' },
  { key: 'alchemical_hydra', name: 'Alchemical Hydra' },
  { key: 'barrows_chests', name: 'Barrows Chests' },
  { key: 'bryophyta', name: 'Bryophyta' },
  { key: 'callisto', name: 'Callisto' },
  { key: 'cerberus', name: 'Cerberus' },
  { key: 'chambers_of_xeric', name: 'Chambers Of Xeric' },
  { key: 'chambers_of_xeric_challenge_mode', name: 'Chambers Of Xeric (CM)' },
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
];

export const SKILLS = SKILLS_MAP.map(s => s.key);
export const ACTIVITIES = ACTIVITIES_MAP.map(s => s.key);
export const BOSSES = BOSSES_MAP.map(s => s.key);
export const ALL_METRICS = [...SKILLS, ...ACTIVITIES, ...BOSSES];
