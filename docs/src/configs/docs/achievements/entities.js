export default [
  {
    name: 'Achievement',
    description: "Represents player's progression milestone",
    structure: [
      {
        field: 'playerId',
        type: 'integer',
        description: 'The id of the corresponding player.',
      },
      {
        field: 'type',
        type: 'string',
        description: 'The achievement type (See accepted valued below).',
      },
      {
        field: 'createdAt',
        type: 'date',
        description: 'The date at which the achieved was created.',
      },
    ],
  },
  {
    name: 'Achievement Type',
    description:
      'All the possible values for the "type" field. Note: {skill} is replaced by every skill\'s name.',
    structure: [
      {
        name: '99 {skill}',
        condition: '{skill} experience >= 13034431',
      },
      {
        name: '200m {skill}',
        condition: '{skill} experience >= 200000000',
      },
      {
        name: '100m {skill}',
        condition: '{skill} experience >= 100000000',
      },
      {
        name: '50m {skill}',
        condition: '{skill} experience >= 50000000',
      },
      {
        name: '500m overall experience',
        condition: 'overall experience >= 500000000',
      },
      {
        name: '1b overall experience',
        condition: 'overall experience >= 1000000000',
      },
      {
        name: '2b overall experience',
        condition: 'overall experience >= 2000000000',
      },
      {
        name: '200m all',
        condition: "every skill's experience >= 200000000",
      },
      {
        name: 'Maxed total',
        condition: "every skill's experience >= 13034431",
      },
      {
        name: 'Maxed combat',
        condition: "every combat skill's experience >= 13034431",
      },
    ],
  },
];
