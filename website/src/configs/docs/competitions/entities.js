export default [
  {
    name: 'Competition',
    description: 'Represents a guild or DM channel within Discord.',
    structure: [
      {
        field: 'id',
        type: 'integer',
        description: 'The id of this competition',
      },
      {
        field: 'name?',
        type: 'string',
        description: 'The name of this competition (5-50 characters)',
      },
    ],
  },
  {
    name: 'Competition Type',
    description: 'Represents a guild or DM channel within Discord.',
    structure: [
      {
        field: 'id',
        type: 'integer',
        description: 'The id of this competition',
      },
      {
        field: 'name',
        type: 'string',
        description: 'The name of this competition (5-50 characters)',
      },
    ],
  },
];
