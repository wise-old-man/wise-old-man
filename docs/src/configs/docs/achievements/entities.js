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
        field: 'value',
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
        name: '99 {skill}',
        condition: '{skill} experience >= 13034431'
      },
      {
        name: '200m {skill}',
        condition: '{skill} experience >= 200000000'
      },
      {
        name: '100m {skill}',
        condition: '{skill} experience >= 100000000'
      },
      {
        name: '50m {skill}',
        condition: '{skill} experience >= 50000000'
      },
      {
        name: '500m overall experience',
        condition: 'overall experience >= 500000000'
      },
      {
        name: '1b overall experience',
        condition: 'overall experience >= 1000000000'
      },
      {
        name: '2b overall experience',
        condition: 'overall experience >= 2000000000'
      },
      {
        name: '200m all',
        condition: "every skill's experience >= 200000000"
      },
      {
        name: 'Maxed total',
        condition: "every skill's experience >= 13034431"
      },
      {
        name: 'Maxed combat',
        condition: "every combat skill's experience >= 13034431"
      },
      {
        name: '500 {activity} score',
        condition: '{activity} score >= 500'
      },
      {
        name: '1k {activity} score',
        condition: '{activity} score >= 1000'
      },
      {
        name: '5k {activity} score',
        condition: '{activity} score >= 5000'
      },
      {
        name: '10k {activity} score',
        condition: '{activity} score >= 10000'
      },
      {
        name: '500 {boss} kills',
        condition: '{boss} kills >= 500'
      },
      {
        name: '1k {boss} kills',
        condition: '{boss} kills >= 1000'
      },
      {
        name: '5k {boss} kills',
        condition: '{boss} kills >= 5000'
      },
      {
        name: '10k {boss} kills',
        condition: '{boss} kills >= 10000'
      },
      {
        name: '100 kills (all bosses)',
        condition: "every boss's killcount >= 100"
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
