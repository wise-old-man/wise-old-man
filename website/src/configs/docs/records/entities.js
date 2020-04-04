export default [
  {
    name: 'Record',
    description: 'Represents a single record for a specific period, metric and player',
    structure: [
      {
        field: 'id',
        type: 'integer',
        description: 'The unique id of the record',
      },
      {
        field: 'playerId',
        type: 'integer',
        description: 'The id of the corresponding player.',
      },
      {
        field: 'period',
        type: 'string',
        description:
          "The period between the start and end of the record's gains. \nMust be a valid Period (see list below)",
      },
      {
        field: 'metric',
        type: 'string',
        description: 'The metric the record tracked. \nMust be a valid Metric (see list below)',
      },
      {
        field: 'value',
        type: 'bigint',
        description: 'The value gained for the metric, during the period.',
      },
      {
        field: 'updatedAt',
        type: 'date',
        description: 'The last update date of the record.',
      },
    ],
  },
  {
    name: 'Periods',
    description: 'All the possible values for the "periods" field of the record model.',
    values: ['day', 'week', 'month', 'year'],
  },
  {
    name: 'Metrics',
    description: 'All the possible values for the "periods" field of the record model.',
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
];
