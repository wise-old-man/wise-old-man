export default [
  {
    name: 'Competition',
    description: '',
    structure: [
      {
        field: 'id',
        type: 'integer',
        description: "The competition's unique id."
      },
      {
        field: 'title',
        type: 'string',
        description: 'The title of the competition (1-50 characters)'
      },
      {
        field: 'metric',
        type: 'string',
        description: "The competition's metric. (See accepted values below)"
      },
      {
        field: 'score',
        type: 'integer',
        description:
          "The competition's ranking score (Essentially this competition's relevance on searches)."
      },
      {
        field: 'verificationHash',
        type: 'string',
        description: "The competition's verification code. Used for authorization."
      },
      {
        field: 'startsAt',
        type: 'date',
        description: "The competition's start date."
      },
      {
        field: 'endsAt',
        type: 'date',
        description: "The competition's end date."
      },
      {
        field: 'createdAt',
        type: 'date',
        description: "The competition's creation date."
      },
      {
        field: 'updatedAt',
        type: 'date',
        description: "The competition's last update date."
      }
    ]
  },
  {
    name: 'Participation',
    description: "Represents a player's participation in a specific competition.",
    structure: [
      {
        field: 'playerId',
        type: 'integer',
        description: "The participant's player id."
      },
      {
        field: 'competitionId',
        type: 'integer',
        description: "The competition's id."
      },
      {
        field: 'startSnapshotId',
        type: 'integer',
        description: "The start snapshot's id."
      },
      {
        field: 'endSnapshotId',
        type: 'integer',
        description: "The end snapshot's id."
      }
    ]
  },
  {
    name: 'Status',
    description:
      'All the possible values for the "status" query parameter of the competition endpoints.',
    values: ['upcoming', 'ongoing', 'finished']
  },
  {
    name: 'Type',
    description: 'All the possible values for the "type" property of the Competition model.',
    values: ['classic', 'team']
  },
  {
    name: 'Metrics',
    description: 'All the possible values for the "metric" field of the competition model.',
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
