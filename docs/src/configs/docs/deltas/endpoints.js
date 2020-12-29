export default [
  {
    title: 'View deltas leaderboard',
    url: '/deltas/leaderboard',
    method: 'GET',
    comments: [
      {
        type: 'info',
        content: 'This will only return the top 20 players of each period.'
      }
    ],
    query: [
      {
        field: 'metric',
        type: 'string',
        description: "The delta's metric (See accepted values above)"
      },
      {
        field: 'period',
        type: 'string',
        description: "The delta's period (See accepted values above)"
      },
      {
        field: 'playerType',
        type: 'string',
        description: "The player's type (See accepted values above) - Optional"
      },
      {
        field: 'playerBuild',
        type: 'string',
        description: "The player's build (See accepted values above) - Optional"
      }
    ],
    successResponses: [
      {
        description: 'Note: Only showing top 3 for demo purposes',
        body: [
          {
            startDate: '2020-12-14T12:03:19.303Z',
            endDate: '2020-12-15T15:40:02.625Z',
            gained: 479679,
            player: {
              exp: 487942259,
              id: 1,
              username: 'rro',
              displayName: 'Rro',
              type: 'regular',
              build: 'main',
              flagged: false,
              ehp: 1725.64923,
              ehb: 580.18854,
              ttm: 0,
              tt200m: 13236.80182,
              lastImportedAt: '2020-12-15T15:40:06.467Z',
              lastChangedAt: '2020-12-15T15:40:02.220Z',
              registeredAt: '2020-12-14T12:03:15.437Z',
              updatedAt: '2020-12-15T15:40:06.467Z'
            }
          },
          {
            startDate: '2020-12-15T12:06:13.902Z',
            endDate: '2020-12-15T15:40:02.592Z',
            gained: 321200,
            player: {
              exp: 287727070,
              id: 3,
              username: 'psikoi',
              displayName: 'Psikoi',
              type: 'regular',
              build: 'main',
              flagged: false,
              ehp: 957.66169,
              ehb: 292.20288,
              ttm: 465.33077,
              tt200m: 14004.78936,
              lastImportedAt: '2020-12-15T15:40:06.388Z',
              lastChangedAt: '2020-12-15T15:40:02.052Z',
              registeredAt: '2020-12-15T12:04:12.669Z',
              updatedAt: '2020-12-15T15:40:06.388Z'
            }
          },
          {
            startDate: '2020-12-15T12:06:35.473Z',
            endDate: '2020-12-15T12:06:35.473Z',
            gained: 0,
            player: {
              exp: 27957906,
              id: 2,
              username: 'zezima',
              displayName: 'Zezima',
              type: 'regular',
              build: 'main',
              flagged: false,
              ehp: 170.56992,
              ehb: 0,
              ttm: 1123.18632,
              tt200m: 14791.88113,
              lastImportedAt: '2020-12-15T12:06:37.857Z',
              lastChangedAt: '2020-12-15T12:06:35.467Z',
              registeredAt: '2020-12-15T12:04:12.671Z',
              updatedAt: '2020-12-15T12:06:37.864Z'
            }
          }
        ]
      }
    ],
    errorResponses: [
      {
        description: 'If period is not given.',
        body: {
          message: 'Invalid period: undefined.'
        }
      },
      {
        description: 'If period is given but it is not valid.',
        body: {
          message: 'Invalid period: someInvalidPeriod.'
        }
      },
      {
        description: 'If metric is not given.',
        body: {
          message: 'Invalid metric: undefined.'
        }
      },
      {
        description: 'If metric is given but it is not valid.',
        body: {
          message: 'Invalid metric: someInvalidMetric.'
        }
      },
      {
        description: 'If player type is given but it is not valid.',
        body: {
          message: 'Invalid metric: someInvalidPlayerType.'
        }
      },
      {
        description: 'If player build is given but it is not valid.',
        body: {
          message: 'Invalid metric: someInvalidPlayerBuild.'
        }
      }
    ]
  }
];
