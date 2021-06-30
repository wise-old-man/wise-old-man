export default [
  {
    name: 'Achievement',
    description: "Represents player's progression milestone",
    structure: [
      {
        field: 'playerId',
        type: 'integer',
        description: 'The id of the corresponding player.'
      },
      {
        field: 'name',
        type: 'string',
        description: 'The achievement name. (Ex: 99 Smithing)'
      },
      {
        field: 'metric',
        type: 'string',
        description: 'The achievement metric (See accepted values below).'
      },
      {
        field: 'measure',
        type: 'string',
        description: 'The achievement measure (See accepted values below).'
      },
      {
        field: 'threshold',
        type: 'number',
        description: 'The achievement threshold value (ex: 50m exp would be 50000000)'
      },
      {
        field: 'createdAt',
        type: 'date',
        description: 'The date at which the achieved was created.'
      }
    ]
  },
  {
    name: 'Achievement Name',
    description:
      'All the possible values for the "name" field. Note: {skill} is replaced by every skill\'s name.',
    structure: [
      {
        name: 'Base {level} Stats',
        metric: 'overall',
        measure: 'levels',
        thresholds: '273k (60), 737k (70), 1.98m (80), 5.34m (90), 13m (99)'
      },
      {
        name: '126 Combat',
        metric: 'combat',
        measure: 'levels',
        thresholds: '126'
      },
      {
        name: '{threshold} Overall Exp.',
        metric: 'overall',
        measure: 'experience',
        thresholds: '100m, 200m, 500m, 1b, 2b, 4.6b'
      },
      {
        name: '{threshold} Attack',
        metric: 'attack',
        measure: 'experience',
        thresholds: '13m (99), 50m, 100m, 200m'
      },
      {
        name: '{threshold} Defence',
        metric: 'defence',
        measure: 'experience',
        thresholds: '13m (99), 50m, 100m, 200m'
      },
      {
        name: '{threshold} Strength',
        metric: 'strength',
        measure: 'experience',
        thresholds: '13m (99), 50m, 100m, 200m'
      },
      {
        name: '{threshold} Hitpoints',
        metric: 'hitpoints',
        measure: 'experience',
        thresholds: '13m (99), 50m, 100m, 200m'
      },
      {
        name: '{threshold} Ranged',
        metric: 'ranged',
        measure: 'experience',
        thresholds: '13m (99), 50m, 100m, 200m'
      },
      {
        name: '{threshold} Prayer',
        metric: 'prayer',
        measure: 'experience',
        thresholds: '13m (99), 50m, 100m, 200m'
      },
      {
        name: '{threshold} Magic',
        metric: 'magic',
        measure: 'experience',
        thresholds: '13m (99), 50m, 100m, 200m'
      },
      {
        name: '{threshold} Cooking',
        metric: 'cooking',
        measure: 'experience',
        thresholds: '13m (99), 50m, 100m, 200m'
      },
      {
        name: '{threshold} Woodcutting',
        metric: 'woodcutting',
        measure: 'experience',
        thresholds: '13m (99), 50m, 100m, 200m'
      },
      {
        name: '{threshold} Fletching',
        metric: 'fletching',
        measure: 'experience',
        thresholds: '13m (99), 50m, 100m, 200m'
      },
      {
        name: '{threshold} Fishing',
        metric: 'fishing',
        measure: 'experience',
        thresholds: '13m (99), 50m, 100m, 200m'
      },
      {
        name: '{threshold} Firemaking',
        metric: 'firemaking',
        measure: 'experience',
        thresholds: '13m (99), 50m, 100m, 200m'
      },
      {
        name: '{threshold} Crafting',
        metric: 'crafting',
        measure: 'experience',
        thresholds: '13m (99), 50m, 100m, 200m'
      },
      {
        name: '{threshold} Smithing',
        metric: 'smithing',
        measure: 'experience',
        thresholds: '13m (99), 50m, 100m, 200m'
      },
      {
        name: '{threshold} Mining',
        metric: 'mining',
        measure: 'experience',
        thresholds: '13m (99), 50m, 100m, 200m'
      },
      {
        name: '{threshold} Herblore',
        metric: 'herblore',
        measure: 'experience',
        thresholds: '13m (99), 50m, 100m, 200m'
      },
      {
        name: '{threshold} Agility',
        metric: 'agility',
        measure: 'experience',
        thresholds: '13m (99), 50m, 100m, 200m'
      },
      {
        name: '{threshold} Thieving',
        metric: 'thieving',
        measure: 'experience',
        thresholds: '13m (99), 50m, 100m, 200m'
      },
      {
        name: '{threshold} Slayer',
        metric: 'slayer',
        measure: 'experience',
        thresholds: '13m (99), 50m, 100m, 200m'
      },
      {
        name: '{threshold} Farming',
        metric: 'farming',
        measure: 'experience',
        thresholds: '13m (99), 50m, 100m, 200m'
      },
      {
        name: '{threshold} Runecrafting',
        metric: 'runecrafting',
        measure: 'experience',
        thresholds: '13m (99), 50m, 100m, 200m'
      },
      {
        name: '{threshold} Hunter',
        metric: 'hunter',
        measure: 'experience',
        thresholds: '13m (99), 50m, 100m, 200m'
      },
      {
        name: '{threshold} Construction',
        metric: 'construction',
        measure: 'experience',
        thresholds: '13m (99), 50m, 100m, 200m'
      },
      {
        name: '{threshold} Abyssal Sire kills',
        metric: 'abyssal_sire',
        measure: 'kills',
        thresholds: '500, 1k, 5k, 10k'
      },
      {
        name: '{threshold} Alchemical Hydra kills',
        metric: 'alchemical_hydra',
        measure: 'kills',
        thresholds: '500, 1k, 5k, 10k'
      },
      {
        name: '{threshold} Barrows Chests',
        metric: 'barrows_chests',
        measure: 'kills',
        thresholds: '500, 1k, 5k, 10k'
      },
      {
        name: '{threshold} Bryophyta kills',
        metric: 'bryophyta',
        measure: 'kills',
        thresholds: '50, 100, 500, 1k'
      },
      {
        name: '{threshold} Callisto kills',
        metric: 'callisto',
        measure: 'kills',
        thresholds: '500, 1k, 5k, 10k'
      },
      {
        name: '{threshold} Cerberus kills',
        metric: 'cerberus',
        measure: 'kills',
        thresholds: '500, 1k, 5k, 10k'
      },
      {
        name: '{threshold} Chambers Of Xeric kills',
        metric: 'chambers_of_xeric',
        measure: 'kills',
        thresholds: '100, 500, 1k, 5k'
      },
      {
        name: '{threshold} Chambers Of Xeric (CM) kills',
        metric: 'chambers_of_xeric_challenge_mode',
        measure: 'kills',
        thresholds: '100, 500, 1k, 5k'
      },
      {
        name: '{threshold} Chaos Elemental kills',
        metric: 'chaos_elemental',
        measure: 'kills',
        thresholds: '500, 1k, 5k, 10k'
      },
      {
        name: '{threshold} Chaos Fanatic kills',
        metric: 'chaos_fanatic',
        measure: 'kills',
        thresholds: '500, 1k, 5k, 10k'
      },
      {
        name: '{threshold} Commander Zilyana kills',
        metric: 'commander_zilyana',
        measure: 'kills',
        thresholds: '500, 1k, 5k, 10k'
      },
      {
        name: '{threshold} Corporeal Beast kills',
        metric: 'corporeal_beast',
        measure: 'kills',
        thresholds: '500, 1k, 5k, 10k'
      },
      {
        name: '{threshold} Crazy Archaeologist kills',
        metric: 'crazy_archaeologist',
        measure: 'kills',
        thresholds: '500, 1k, 5k, 10k'
      },
      {
        name: '{threshold} Dagannoth Prime kills',
        metric: 'dagannoth_prime',
        measure: 'kills',
        thresholds: '500, 1k, 5k, 10k'
      },
      {
        name: '{threshold} Dagannoth Rex kills',
        metric: 'dagannoth_rex',
        measure: 'kills',
        thresholds: '500, 1k, 5k, 10k'
      },
      {
        name: '{threshold} Dagannoth Supreme kills',
        metric: 'dagannoth_supreme',
        measure: 'kills',
        thresholds: '500, 1k, 5k, 10k'
      },
      {
        name: '{threshold} Deranged Archaeologist kills',
        metric: 'deranged_archaeologist',
        measure: 'kills',
        thresholds: '500, 1k, 5k, 10k'
      },
      {
        name: '{threshold} General Graardor kills',
        metric: 'general_graardor',
        measure: 'kills',
        thresholds: '500, 1k, 5k, 10k'
      },
      {
        name: '{threshold} Giant Mole kills',
        metric: 'giant_mole',
        measure: 'kills',
        thresholds: '500, 1k, 5k, 10k'
      },
      {
        name: '{threshold} Grotesque Guardians kills',
        metric: 'grotesque_guardians',
        measure: 'kills',
        thresholds: '500, 1k, 5k, 10k'
      },
      {
        name: '{threshold} Hespori kills',
        metric: 'hespori',
        measure: 'kills',
        thresholds: '50, 100, 500, 1k'
      },
      {
        name: '{threshold} Kalphite Queen kills',
        metric: 'kalphite_queen',
        measure: 'kills',
        thresholds: '500, 1k, 5k, 10k'
      },
      {
        name: '{threshold} King Black Dragon kills',
        metric: 'king_black_dragon',
        measure: 'kills',
        thresholds: '500, 1k, 5k, 10k'
      },
      {
        name: '{threshold} Kraken kills',
        metric: 'kraken',
        measure: 'kills',
        thresholds: '500, 1k, 5k, 10k'
      },
      {
        name: "{threshold} Kree'Arra kills",
        metric: 'kreearra',
        measure: 'kills',
        thresholds: '500, 1k, 5k, 10k'
      },
      {
        name: "{threshold} K'ril Tsutsaroth kills",
        metric: 'kril_tsutsaroth',
        measure: 'kills',
        thresholds: '500, 1k, 5k, 10k'
      },
      {
        name: '{threshold} Mimic kills',
        metric: 'mimic',
        measure: 'kills',
        thresholds: '10, 50, 100, 200'
      },
      {
        name: '{threshold} Nightmare kills',
        metric: 'nightmare',
        measure: 'kills',
        thresholds: '500, 1k, 5k, 10k'
      },
      {
        name: "{threshold} Phosani's Nightmare kills",
        metric: 'phosanis_nightmare',
        measure: 'kills',
        thresholds: '500, 1k, 5k, 10k'
      },
      {
        name: '{threshold} Obor kills',
        metric: 'obor',
        measure: 'kills',
        thresholds: '50, 100, 500, 1k'
      },
      {
        name: '{threshold} Sarachnis kills',
        metric: 'sarachnis',
        measure: 'kills',
        thresholds: '500, 1k, 5k, 10k'
      },
      {
        name: '{threshold} Scorpia kills',
        metric: 'scorpia',
        measure: 'kills',
        thresholds: '500, 1k, 5k, 10k'
      },
      {
        name: '{threshold} Skotizo kills',
        metric: 'skotizo',
        measure: 'kills',
        thresholds: '50, 100, 500, 1k'
      },
      {
        name: '{threshold} Tempoross kills',
        metric: 'tempoross',
        measure: 'kills',
        thresholds: '500, 1k, 5k, 10k'
      },
      {
        name: '{threshold} The Gauntlet kills',
        metric: 'the_gauntlet',
        measure: 'kills',
        thresholds: '100, 200, 1k, 2k'
      },
      {
        name: '{threshold} The Corrupted Gauntlet kills',
        metric: 'the_corrupted_gauntlet',
        measure: 'kills',
        thresholds: '100, 200, 1k, 2k'
      },
      {
        name: '{threshold} Theatre Of Blood kills',
        metric: 'theatre_of_blood',
        measure: 'kills',
        thresholds: '100, 500, 1k, 5k'
      },
      {
        name: '{threshold} Theatre Of Blood (HM) kills',
        metric: 'theatre_of_blood_hard_mode',
        measure: 'kills',
        thresholds: '100, 500, 1k, 5k'
      },
      {
        name: '{threshold} Thermonuclear Smoke Devil kills',
        metric: 'thermonuclear_smoke_devil',
        measure: 'kills',
        thresholds: '500, 1k, 5k, 10k'
      },
      {
        name: '{threshold} TzKal-Zuk kills',
        metric: 'tzkal_zuk',
        measure: 'kills',
        thresholds: '10, 50, 100, 200'
      },
      {
        name: '{threshold} TzTok-Jad kills',
        metric: 'tztok_jad',
        measure: 'kills',
        thresholds: '50, 100, 500, 1k'
      },
      {
        name: '{threshold} Venenatis kills',
        metric: 'venenatis',
        measure: 'kills',
        thresholds: '500, 1k, 5k, 10k'
      },
      {
        name: "{threshold} Vet'ion kills",
        metric: 'vetion',
        measure: 'kills',
        thresholds: '500, 1k, 5k, 10k'
      },
      {
        name: '{threshold} Vorkath kills',
        metric: 'vorkath',
        measure: 'kills',
        thresholds: '500, 1k, 5k, 10k'
      },
      {
        name: '{threshold} Wintertodt kills',
        metric: 'wintertodt',
        measure: 'kills',
        thresholds: '500, 1k, 5k, 10k'
      },
      {
        name: '{threshold} Zalcano kills',
        metric: 'zalcano',
        measure: 'kills',
        thresholds: '500, 1k, 5k, 10k'
      },
      {
        name: '{threshold} Zulrah kills',
        metric: 'zulrah',
        measure: 'kills',
        thresholds: '500, 1k, 5k, 10k'
      },
      {
        name: '{threshold} Bounty Hunter (Hunter) score',
        metric: 'bounty_hunter_hunter',
        measure: 'score',
        thresholds: '1k, 5k, 10k'
      },
      {
        name: '{threshold} Bounty Hunter (Rogue) score',
        metric: 'bounty_hunter_rogue',
        measure: 'score',
        thresholds: '1k, 5k, 10k'
      },
      {
        name: '{threshold} Clue Scrolls (All)',
        metric: 'clue_scrolls_all',
        measure: 'score',
        thresholds: '500, 1k, 5k, 10k'
      },
      {
        name: '{threshold} Clue Scrolls (Beginner)',
        metric: 'clue_scrolls_beginner',
        measure: 'score',
        thresholds: '200, 500, 1k, 5k'
      },
      {
        name: '{threshold} Clue Scrolls (Easy)',
        metric: 'clue_scrolls_easy',
        measure: 'score',
        thresholds: '500, 1k, 5k, 10k'
      },
      {
        name: '{threshold} Clue Scrolls (Medium)',
        metric: 'clue_scrolls_medium',
        measure: 'score',
        thresholds: '500, 1k, 5k, 10k'
      },
      {
        name: '{threshold} Clue Scrolls (Hard)',
        metric: 'clue_scrolls_hard',
        measure: 'score',
        thresholds: '500, 1k, 5k, 10k'
      },
      {
        name: '{threshold} Clue Scrolls (Elite)',
        metric: 'clue_scrolls_elite',
        measure: 'score',
        thresholds: '100, 500, 1k, 5k'
      },
      {
        name: '{threshold} Clue Scrolls (Master)',
        metric: 'clue_scrolls_master',
        measure: 'score',
        thresholds: '100, 500, 1k, 5k'
      },
      {
        name: '{threshold} Last Man Standing score',
        metric: 'last_man_standing',
        measure: 'score',
        thresholds: '2k, 5k, 10k, 15k'
      },
      {
        name: '{threshold} Soul Wars Zeal',
        metric: 'soul_wars_zeal',
        measure: 'score',
        thresholds: '5k, 10k, 20k'
      }
    ]
  },
  {
    name: 'Achievement Metric',
    description: 'All the possible values for the "metric" field.',
    values: [
      'overall',
      'combat',
      'attack',
      'defence',
      'strength',
      'hitpoints',
      'ranged',
      'prayer',
      'magic',
      'cooking',
      'woodcutting',
      'fletching',
      'fishing',
      'firemaking',
      'crafting',
      'smithing',
      'mining',
      'herblore',
      'agility',
      'thieving',
      'slayer',
      'farming',
      'runecrafting',
      'hunter',
      'construction',
      'bounty_hunter_hunter',
      'bounty_hunter_rogue',
      'clue_scrolls_all',
      'clue_scrolls_beginner',
      'clue_scrolls_easy',
      'clue_scrolls_medium',
      'clue_scrolls_hard',
      'clue_scrolls_elite',
      'clue_scrolls_master',
      'last_man_standing',
      'soul_wars_zeal',
      'abyssal_sire',
      'alchemical_hydra',
      'barrows_chests',
      'bryophyta',
      'callisto',
      'cerberus',
      'chambers_of_xeric',
      'chambers_of_xeric_challenge_mode',
      'chaos_elemental',
      'chaos_fanatic',
      'commander_zilyana',
      'corporeal_beast',
      'crazy_archaeologist',
      'dagannoth_prime',
      'dagannoth_rex',
      'dagannoth_supreme',
      'deranged_archaeologist',
      'general_graardor',
      'giant_mole',
      'grotesque_guardians',
      'hespori',
      'kalphite_queen',
      'king_black_dragon',
      'kraken',
      'kreearra',
      'kril_tsutsaroth',
      'mimic',
      'nightmare',
      'phosanis_nightmare',
      'obor',
      'sarachnis',
      'scorpia',
      'skotizo',
      'the_gauntlet',
      'the_corrupted_gauntlet',
      'theatre_of_blood',
      'thermonuclear_smoke_devil',
      'tzkal_zuk',
      'tztok_jad',
      'venenatis',
      'vetion',
      'vorkath',
      'wintertodt',
      'zalcano',
      'zulrah'
    ]
  },
  {
    name: 'Achievement Measure',
    description: 'All the possible values for the "measure" field.',
    values: ['experience', 'kills', 'score', 'levels']
  }
];
