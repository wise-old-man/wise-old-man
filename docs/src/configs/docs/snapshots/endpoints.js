export default [
  {
    title: 'View player snapshots',
    url: '/snapshots',
    method: 'GET',
    query: [
      {
        field: 'playerId',
        type: 'integer',
        description: 'The player id.',
      },
      {
        field: 'period',
        type: 'string',
        description: 'The time period to filter the snapshots by (See accepted values above) - Optional',
      },
    ],
    successResponses: [
      {
        description: 'Without any period filtering (Not showing the whole response)',
        body: {
          day: [
            {
              createdAt: '2020-04-04T16:43:36.219Z',
              importedAt: null,
              overall: {
                rank: 30400,
                experience: 269828205,
              },
              attack: {
                rank: 12158,
                experience: 27216011,
              },
            },
          ],
          week: [
            {
              createdAt: '2020-04-04T16:43:36.219Z',
              importedAt: null,
              overall: {
                rank: 30400,
                experience: 269828205,
              },
              attack: {
                rank: 12158,
                experience: 27216011,
              },
            },
          ],
          month: [
            {
              createdAt: '2020-04-04T16:43:36.219Z',
              importedAt: null,
              overall: {
                rank: 30400,
                experience: 269828205,
              },
              attack: {
                rank: 12158,
                experience: 27216011,
              },
            },
          ],
          year: [
            {
              createdAt: '2020-04-04T16:43:36.219Z',
              importedAt: null,
              overall: {
                rank: 30400,
                experience: 269828205,
              },
              attack: {
                rank: 12158,
                experience: 27216011,
              },
            },
          ],
        },
      },
      {
        description: 'Filtered by the period field (day) (Not showing the whole response)',
        body: [
          {
            createdAt: '2020-04-04T16:43:36.219Z',
            importedAt: null,
            overall: {
              rank: 30400,
              experience: 269828205,
            },
            attack: {
              rank: 12158,
              experience: 27216011,
            },
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
      {
        description: 'If period is given but is invalid.',
        body: {
          message: 'Invalid period: someInvalidPeriod',
        },
      },
    ],
  },
];
