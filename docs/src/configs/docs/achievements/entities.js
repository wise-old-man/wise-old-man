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
        field: 'type',
        type: 'string',
        description: 'The achievement type (See accepted values below).'
      },
      {
        field: 'metric',
        type: 'string',
        description: 'The achievement metric (See accepted values below).'
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
    name: 'Achievement Type',
    description:
      'All the possible values for the "type" field. Note: {skill} is replaced by every skill\'s name.',
    structure: [
      {
        type: '{threshold} {skill}',
        metric: '{skill}',
        measure: 'experience',
        thresholds: '13034431, 50000000, 100000000, 200000000'
      },
      {
        type: '{threshold} Overall Exp.',
        metric: 'overall',
        measure: 'experience',
        thresholds: '500000000, 1000000000, 2000000000, 4600000000'
      },
      {
        type: 'Maxed Overall',
        metric: 'overall',
        measure: 'levels',
        thresholds: '2277'
      },
      {
        type: 'Maxed combat',
        metric: 'combat',
        measure: 'levels',
        thresholds: '126'
      },
      {
        type: '{threshold} {activity}',
        metric: '{activity}',
        measure: 'score',
        thresholds: '1000, 5000, 10000'
      },
      {
        type: '{threshold} {boss}',
        metric: '{boss}',
        measure: 'kills',
        thresholds: '500, 1000, 5000, 10000'
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
      'zulrah'
    ]
  }
];
