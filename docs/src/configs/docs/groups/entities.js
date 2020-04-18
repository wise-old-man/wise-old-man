export default [
  {
    name: 'Competition',
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
  }
];
