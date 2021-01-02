export default [
  {
    name: 'Record',
    description: 'Represents a single record for a specific period, metric and player',
    structure: [
      {
        field: 'id',
        type: 'integer',
        description: "The record's unique id."
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
        field: 'metric',
        type: 'string',
        description: 'The metric the record tracked. \nMust be a valid Metric (see list below)'
      },
      {
        field: 'value',
        type: 'bigint',
        description: 'The value gained for the metric, during the period.'
      },
      {
        field: 'updatedAt',
        type: 'date',
        description: 'The last update date of the record.'
      }
    ]
  },
  {
    name: 'Periods',
    description:
      'All the possible values for the "period" field of the record model. (Note: a month is 31 days)',
    values: ['6h', 'day', 'week', 'month', 'year']
  },
  {
    name: 'Player types',
    description:
      'All the possible values for the "playerType" query parameter.',
    values: ['unknown', 'regular', 'ironman', 'hardcore', 'ultimate']
  },
  {
    name: 'Player builds',
    description:
      'All the possible values for the "playerBuild" query parameter.',
    values: ['f2p', 'lvl3', '1def', '10hp', 'main']
  },
  {
    name: 'Metrics',
    description: 'All the possible values for the "metric" field of the record model.',
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
      'zulrah',
      'ehp',
      'ehb'
    ]
  }
];
