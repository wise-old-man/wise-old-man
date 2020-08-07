export default [
  {
    name: 'NameChange',
    description: '',
    structure: [
      {
        field: 'id',
        type: 'integer',
        description: "The name change's unique id."
      },
      {
        field: 'playerId',
        type: 'number',
        description: 'The id of the player whose name should to be changed.'
      },
      {
        field: 'oldName',
        type: 'string',
        description: "The player's previous (old) name."
      },
      {
        field: 'newName',
        type: 'string',
        description: "The player's preposed new name."
      },
      {
        field: 'status',
        type: 'number',
        description: "The name change's status. (0 = pending, 1 = denied, 2 = approved)"
      },
      {
        field: 'resolvedAt',
        type: 'date',
        description: "The name change's approval/denial date."
      },
      {
        field: 'createdAt',
        type: 'date',
        description: "The name change's creation date."
      },
      {
        field: 'updatedAt',
        type: 'date',
        description: "The name change's last update date."
      }
    ]
  }
];
