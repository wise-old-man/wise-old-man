export default [
  {
    name: 'Player',
    description: 'Represents an account.',
    structure: [
      {
        field: 'id',
        type: 'integer',
        description: "The player's unique id.",
      },
      {
        field: 'username',
        type: 'string',
        description: "The player's unique username.",
      },
      {
        field: 'type',
        type: 'string',
        description: "The player's account type. (See possible values below)",
      },
      {
        field: 'lastImportedAt',
        type: 'date',
        description: "The last time this player's history was imported from CML.",
      },
      {
        field: 'registeredAt',
        type: 'date',
        description: "The player's registration date.",
      },
      {
        field: 'updatedAt',
        type: 'date',
        description: "The player's last update date.",
      },
    ],
  },
  {
    name: 'Player Types',
    description: 'All the possible values for the "type" field of the player model.',
    values: ['unknown', 'regular', 'ironman', 'hardcore', 'ultimate'],
  },
];
