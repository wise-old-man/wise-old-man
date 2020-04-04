export default [
  {
    name: 'Delta',
    description: 'Represents a single delta for a specific period and player',
    structure: [
      {
        field: 'id',
        type: 'integer',
        description: "The delta's unique id",
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
        field: 'startSnapshotId',
        type: 'integer',
        description: 'The id of the starting snapshot (The first registered snapshot in the period)',
      },
      {
        field: 'endSnapshotId',
        type: 'integer',
        description: 'The id of the ending snapshot (The last registered snapshot)',
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
    description: 'All the possible values for the "periods" field of the delta model.',
    values: ['day', 'week', 'month', 'year'],
  },
];
