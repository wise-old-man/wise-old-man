export default [
  {
    title: 'View player achievements',
    url: '/achievements',
    method: 'GET',
    comments: [
      {
        type: 'warning',
        content:
          'If the achievement date is unknown, this will return it as "1970-01-01T00:00:00.000Z".',
      },
      {
        type: 'warning',
        content:
          'If includeMissing is true, any unachieved achievements will have "createdAt: null" and "missing: true"',
      },
    ],
    query: [
      {
        field: 'playerId',
        type: 'integer',
        description: 'The player id.',
      },
      {
        field: 'includeMissing',
        type: 'boolean',
        description: 'If true, it will return every achievement, even the unachieved - Optional',
      },
    ],
    successResponses: [
      {
        description: 'With includeMissing param set to true',
        body: [
          {
            playerId: 37,
            type: '99 attack',
            createdAt: '1970-01-01T00:00:00.000Z',
          },
          {
            playerId: 37,
            type: '99 defence',
            createdAt: '1970-01-01T00:00:00.000Z',
          },
          {
            playerId: 37,
            type: '99 strength',
            createdAt: '1970-01-01T00:00:00.000Z',
          },
          {
            playerId: 37,
            type: '99 hitpoints',
            createdAt: '1970-01-01T00:00:00.000Z',
          },
          {
            playerId: 37,
            type: '99 ranged',
            createdAt: '1970-01-01T00:00:00.000Z',
          },
          {
            playerId: 37,
            type: '99 magic',
            createdAt: '1970-01-01T00:00:00.000Z',
          },
          {
            playerId: 37,
            type: '99 slayer',
            createdAt: '1970-01-01T00:00:00.000Z',
          },
          {
            playerId: 37,
            type: '99 farming',
            createdAt: '1970-01-01T00:00:00.000Z',
          },
          {
            playerId: 37,
            type: '99 prayer',
            createdAt: null,
            missing: true,
          },
          {
            playerId: 37,
            type: '99 cooking',
            createdAt: null,
            missing: true,
          },
          {
            playerId: 37,
            type: '99 woodcutting',
            createdAt: null,
            missing: true,
          },
          {
            playerId: 37,
            type: '99 fletching',
            createdAt: null,
            missing: true,
          },
          {
            playerId: 37,
            type: '99 fishing',
            createdAt: null,
            missing: true,
          },
        ],
      },
      {
        description: 'With includeMissing param set to false',
        body: [
          {
            playerId: 37,
            type: '99 attack',
            createdAt: '1970-01-01T00:00:00.000Z',
          },
          {
            playerId: 37,
            type: '99 defence',
            createdAt: '1970-01-01T00:00:00.000Z',
          },
          {
            playerId: 37,
            type: '99 strength',
            createdAt: '1970-01-01T00:00:00.000Z',
          },
          {
            playerId: 37,
            type: '99 hitpoints',
            createdAt: '1970-01-01T00:00:00.000Z',
          },
          {
            playerId: 37,
            type: '99 ranged',
            createdAt: '1970-01-01T00:00:00.000Z',
          },
          {
            playerId: 37,
            type: '99 magic',
            createdAt: '1970-01-01T00:00:00.000Z',
          },
          {
            playerId: 37,
            type: '99 slayer',
            createdAt: '1970-01-01T00:00:00.000Z',
          },
          {
            playerId: 37,
            type: '99 farming',
            createdAt: '1970-01-01T00:00:00.000Z',
          },
        ],
      },
    ],
    errorResponses: [
      {
        description: 'If no playerId is given.',
        body: {
          message: 'Invalid player id.',
        },
      },
    ],
  },
];
