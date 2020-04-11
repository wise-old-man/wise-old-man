export default [
  {
    name: 'Competition',
    description: '',
    structure: [
      {
        field: 'id',
        type: 'integer',
        description: "The competition's unique id.",
      },
      {
        field: 'title',
        type: 'string',
        description: 'The title of the competition (1-30 characters)',
      },
      {
        field: 'metric',
        type: 'string',
        description: "The competition's metric. (See accepted values below)",
      },
      {
        field: 'verificationHash',
        type: 'string',
        description: "The competition's verification code. Used for authorization.",
      },
      {
        field: 'startsAt',
        type: 'date',
        description: "The competition's start date.",
      },
      {
        field: 'endsAt',
        type: 'date',
        description: "The competition's end date.",
      },
      {
        field: 'updatedAllAt',
        type: 'date',
        description: "The last time the competition's participants were globally updated.",
      },
      {
        field: 'createdAt',
        type: 'date',
        description: "The competition's creation date.",
      },
      {
        field: 'updatedAt',
        type: 'date',
        description: "The competition's last update date.",
      },
    ],
  },
  {
    name: 'Participation',
    description: "Represents a player's participation in a specific competition.",
    structure: [
      {
        field: 'playerId',
        type: 'integer',
        description: "The participant's player id.",
      },
      {
        field: 'competitionId',
        type: 'integer',
        description: "The competition's id.",
      },
      {
        field: 'startSnapshotId',
        type: 'integer',
        description: "The participant's first snapshot in the competition's time range.",
      },
      {
        field: 'endSnapshotId',
        type: 'integer',
        description: "The participant's last snapshot in the competition's time range.",
      },
    ],
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
    ],
  },
  {
    name: 'Status',
    description:
      'All the possible values for the "status" query parameter of the competition endpoints.',
    values: ['upcoming', 'ongoing', 'finished'],
  },
];
