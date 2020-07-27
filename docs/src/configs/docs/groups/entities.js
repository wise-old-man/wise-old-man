export default [
  {
    name: 'Group',
    description: '',
    structure: [
      {
        field: 'id',
        type: 'integer',
        description: "The group's unique id."
      },
      {
        field: 'name',
        type: 'string',
        description: "The group's unique name (1-30 characters)."
      },
      {
        field: 'clanChat',
        type: 'string',
        description: "The group's clan chat (1-12 characters) (Optional)."
      },
      {
        field: 'score',
        type: 'integer',
        description: "The groups's ranking score (Essentially this group's relevance on searches)."
      },
      {
        field: 'verified',
        type: 'boolean',
        description:
          'Verified groups have higher scores, groups can be verified by contacting us on Discord.'
      },
      {
        field: 'verificationHash',
        type: 'string',
        description: "The group's verification code. (Used for authorization)"
      },
      {
        field: 'createdAt',
        type: 'date',
        description: "The group's creation date."
      },
      {
        field: 'updatedAt',
        type: 'date',
        description: "The group's last update date."
      }
    ]
  },
  {
    name: 'Membership',
    description: "Represents a player's membership in a specific group.",
    structure: [
      {
        field: 'playerId',
        type: 'integer',
        description: "The member's player id."
      },
      {
        field: 'groupId',
        type: 'integer',
        description: "The group's id."
      },
      {
        field: 'role',
        type: 'string',
        description: "The member's role within the group. (See list of possible values below)"
      }
    ]
  },
  {
    name: 'Roles',
    description: 'All the possible values for the "role" field of the group model.',
    values: ['member', 'leader']
  },
  {
    name: 'Periods',
    description:
      'All the possible values for the "period" field of the group leaderboard endpoint. (Note: a month is 31 days)',
    values: ['day', 'week', 'month', 'year']
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
