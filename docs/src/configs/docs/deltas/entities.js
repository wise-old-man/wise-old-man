export default [
  {
    name: 'Delta',
    description: 'Represents a single delta for a specific period and player',
    structure: [
      {
        field: 'id',
        type: 'integer',
        description: "The delta's unique id"
      },
      {
        field: 'playerId',
        type: 'integer',
        description: 'The id of the corresponding player.'
      },
      {
        field: 'period',
        type: 'string',
        description:
          "The period between the start and end of the record's gains. \nMust be a valid Period (see list below)"
      },
      {
        field: 'indicator',
        type: 'string',
        description: 'The indicator (or measure) of this delta. (experience or rank)'
      },
      {
        field: 'startedAt',
        type: 'date',
        description: 'The start date of the tracked period.'
      },
      {
        field: 'endedAt',
        type: 'date',
        description: 'The end date of the tracked period.'
      },
      {
        field: 'updatedAt',
        type: 'date',
        description: 'The last update date of the record.'
      },
      {
        field: 'overall',
        type: 'integer',
        description: ''
      },
      {
        field: 'attack',
        type: 'integer',
        description: ''
      },
      {
        field: 'defence',
        type: 'integer',
        description: ''
      },
      {
        field: 'strength',
        type: 'integer',
        description: ''
      },
      {
        field: 'hitpoints',
        type: 'integer',
        description: ''
      },
      {
        field: 'ranged',
        type: 'integer',
        description: ''
      },
      {
        field: 'prayer',
        type: 'integer',
        description: ''
      },
      {
        field: 'magic',
        type: 'integer',
        description: ''
      },
      {
        field: 'cooking',
        type: 'integer',
        description: ''
      },
      {
        field: 'woodcutting',
        type: 'integer',
        description: ''
      },
      {
        field: 'fletching',
        type: 'integer',
        description: ''
      },
      {
        field: 'fishing',
        type: 'integer',
        description: ''
      },
      {
        field: 'firemaking',
        type: 'integer',
        description: ''
      },
      {
        field: 'crafting',
        type: 'integer',
        description: ''
      },
      {
        field: 'smithing',
        type: 'integer',
        description: ''
      },
      {
        field: 'mining',
        type: 'integer',
        description: ''
      },
      {
        field: 'herblore',
        type: 'integer',
        description: ''
      },
      {
        field: 'agility',
        type: 'integer',
        description: ''
      },
      {
        field: 'thieving',
        type: 'integer',
        description: ''
      },
      {
        field: 'slayer',
        type: 'integer',
        description: ''
      },
      {
        field: 'farming',
        type: 'integer',
        description: ''
      },
      {
        field: 'runecrafting',
        type: 'integer',
        description: ''
      },
      {
        field: 'hunter',
        type: 'integer',
        description: ''
      },
      {
        field: 'construction',
        type: 'integer',
        description: ''
      },
      {
        field: 'league_points',
        type: 'integer',
        description: ''
      },
      {
        field: 'bounty_hunter_hunter',
        type: 'integer',
        description: ''
      },
      {
        field: 'bounty_hunter_rogue',
        type: 'integer',
        description: ''
      },
      {
        field: 'clue_scrolls_all',
        type: 'integer',
        description: ''
      },
      {
        field: 'clue_scrolls_beginner',
        type: 'integer',
        description: ''
      },
      {
        field: 'clue_scrolls_easy',
        type: 'integer',
        description: ''
      },
      {
        field: 'clue_scrolls_medium',
        type: 'integer',
        description: ''
      },
      {
        field: 'clue_scrolls_hard',
        type: 'integer',
        description: ''
      },
      {
        field: 'clue_scrolls_elite',
        type: 'integer',
        description: ''
      },
      {
        field: 'clue_scrolls_master',
        type: 'integer',
        description: ''
      },
      {
        field: 'last_man_standing',
        type: 'integer',
        description: ''
      },
      {
        field: 'soul_wars_zeal',
        type: 'integer',
        description: ''
      },
      {
        field: 'guardians_of_the_rift',
        type: 'integer',
        description: ''
      },
      {
        field: 'abyssal_sire',
        type: 'integer',
        description: ''
      },
      {
        field: 'alchemical_hydra',
        type: 'integer',
        description: ''
      },
      {
        field: 'barrows_chests',
        type: 'integer',
        description: ''
      },
      {
        field: 'bryophyta',
        type: 'integer',
        description: ''
      },
      {
        field: 'callisto',
        type: 'integer',
        description: ''
      },
      {
        field: 'cerberus',
        type: 'integer',
        description: ''
      },
      {
        field: 'chambers_of_xeric',
        type: 'integer',
        description: ''
      },
      {
        field: 'chambers_of_xeric_challenge_mode',
        type: 'integer',
        description: ''
      },
      {
        field: 'chaos_elemental',
        type: 'integer',
        description: ''
      },
      {
        field: 'chaos_fanatic',
        type: 'integer',
        description: ''
      },
      {
        field: 'commander_zilyana',
        type: 'integer',
        description: ''
      },
      {
        field: 'corporeal_beast',
        type: 'integer',
        description: ''
      },
      {
        field: 'crazy_archaeologist',
        type: 'integer',
        description: ''
      },
      {
        field: 'dagannoth_prime',
        type: 'integer',
        description: ''
      },
      {
        field: 'dagannoth_rex',
        type: 'integer',
        description: ''
      },
      {
        field: 'dagannoth_supreme',
        type: 'integer',
        description: ''
      },
      {
        field: 'deranged_archaeologist',
        type: 'integer',
        description: ''
      },
      {
        field: 'general_graardor',
        type: 'integer',
        description: ''
      },
      {
        field: 'giant_mole',
        type: 'integer',
        description: ''
      },
      {
        field: 'grotesque_guardians',
        type: 'integer',
        description: ''
      },
      {
        field: 'hespori',
        type: 'integer',
        description: ''
      },
      {
        field: 'kalphite_queen',
        type: 'integer',
        description: ''
      },
      {
        field: 'king_black_dragon',
        type: 'integer',
        description: ''
      },
      {
        field: 'kraken',
        type: 'integer',
        description: ''
      },
      {
        field: 'kreearra',
        type: 'integer',
        description: ''
      },
      {
        field: 'kril_tsutsaroth',
        type: 'integer',
        description: ''
      },
      {
        field: 'mimic',
        type: 'integer',
        description: ''
      },
      {
        field: 'nex',
        type: 'integer',
        description: ''
      },
      {
        field: 'nightmare',
        type: 'integer',
        description: ''
      },
      {
        field: 'phosanis_nightmare',
        type: 'integer',
        description: ''
      },
      {
        field: 'obor',
        type: 'integer',
        description: ''
      },
      {
        field: 'sarachnis',
        type: 'integer',
        description: ''
      },
      {
        field: 'scorpia',
        type: 'integer',
        description: ''
      },
      {
        field: 'skotizo',
        type: 'integer',
        description: ''
      },
      {
        field: 'tempoross',
        type: 'integer',
        description: ''
      },
      {
        field: 'the_gauntlet',
        type: 'integer',
        description: ''
      },
      {
        field: 'the_corrupted_gauntlet',
        type: 'integer',
        description: ''
      },
      {
        field: 'theatre_of_blood',
        type: 'integer',
        description: ''
      },
      {
        field: 'theatre_of_blood_hard_mode',
        type: 'integer',
        description: ''
      },
      {
        field: 'thermonuclear_smoke_devil',
        type: 'integer',
        description: ''
      },
      {
        field: 'tzkal_zuk',
        type: 'integer',
        description: ''
      },
      {
        field: 'tztok_jad',
        type: 'integer',
        description: ''
      },
      {
        field: 'venenatis',
        type: 'integer',
        description: ''
      },
      {
        field: 'vetion',
        type: 'integer',
        description: ''
      },
      {
        field: 'vorkath',
        type: 'integer',
        description: ''
      },
      {
        field: 'wintertodt',
        type: 'integer',
        description: ''
      },
      {
        field: 'zalcano',
        type: 'integer',
        description: ''
      },
      {
        field: 'zulrah',
        type: 'integer',
        description: ''
      }
    ]
  },
  {
    name: 'Periods',
    description:
      'All the possible values for the "period" field of the delta model. (Note: a month is 31 days)',
    values: ['5min', 'day', 'week', 'month', 'year']
  },
  {
    name: 'Player types',
    description: 'All the possible values for the "playerType" query parameter.',
    values: ['unknown', 'regular', 'ironman', 'hardcore', 'ultimate']
  },
  {
    name: 'Player Builds',
    description: 'All the possible values for the "playerBuild" query parameter.',
    values: ['main', '1def', 'lvl3', '10hp', 'zerker', 'f2p']
  },
  {
    name: 'Metrics',
    description: 'All the possible values for the "metric" field of the leaderboard endpoint.',
    values: [
      'overall',
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
      'league_points',
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
      'guardians_of_the_rift',
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
      'nex',
      'nightmare',
      'phosanis_nightmare',
      'obor',
      'sarachnis',
      'scorpia',
      'skotizo',
      'tempoross',
      'the_gauntlet',
      'the_corrupted_gauntlet',
      'theatre_of_blood',
      'theatre_of_blood_hard_mode',
      'thermonuclear_smoke_devil',
      'tzkal_zuk',
      'tztok_jad',
      'venenatis',
      'vetion',
      'vorkath',
      'wintertodt',
      'zalcano',
      'zulrah',
      'ehp',
      'ehb'
    ]
  }
];
