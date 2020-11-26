export default [
  {
    name: 'Player',
    description: '',
    structure: [
      {
        field: 'id',
        type: 'integer',
        description: "The player's unique id."
      },
      {
        field: 'username',
        type: 'string',
        description: "The player's unique username. (Always lower case)"
      },
      {
        field: 'displayName',
        type: 'string',
        description: "The player's unique display name."
      },
      {
        field: 'type',
        type: 'string',
        description: "The player's account type. (See possible values below)"
      },
      {
        field: 'build',
        type: 'string',
        description: "The player's account build. (See possible values below)"
      },
      {
        field: 'flagged',
        type: 'boolean',
        description: 'Whether or not this player has had an unregistered name change.'
      },
      {
        field: 'lastImportedAt',
        type: 'date',
        description: "The last time this player's history was imported from CML."
      },
      {
        field: 'lastChangedAt',
        type: 'date',
        description: 'The last time this player gained exp/kc/scores.'
      },
      {
        field: 'registeredAt',
        type: 'date',
        description: "The player's registration date."
      },
      {
        field: 'updatedAt',
        type: 'date',
        description: "The player's last update date."
      }
    ]
  },
  {
    name: 'Player Types',
    description: 'All the possible values for the "type" field of the player model.',
    values: ['unknown', 'regular', 'ironman', 'hardcore', 'ultimate']
  },
  {
    name: 'Player Builds',
    description: 'All the possible values for the "build" field of the player model.',
    values: ['main', '1def', 'lvl3', '10hp', 'f2p']
  }
];
