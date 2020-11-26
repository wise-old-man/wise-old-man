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
        description: "The player's type (regular, ironman, ultimate, hardcore) - Optional"
      }
    ],
    successResponses: [
      {
        description: 'Note: Only showing top 3 for demo purposes',
        body: [
          {
            startDate: '2020-08-23T02:21:21.307Z',
            endDate: '2020-08-30T01:38:31.883Z',
            gained: 1284150,
            player: {
              id: 8143,
              username: 'dabzmckush',
              displayName: 'Dabzmckush',
              type: 'regular',
              build: 'main',
              flagged: false,
              lastImportedAt: '2020-08-30T01:41:49.077Z',
              lastChangedAt: '2020-11-26T06:30:14.825Z',
              registeredAt: '2020-05-14T14:33:32.249Z',
              updatedAt: '2020-08-30T01:41:49.077Z'
            }
          },
          {
            startDate: '2020-08-27T23:10:33.921Z',
            endDate: '2020-09-03T03:49:14.132Z',
            gained: 1281389,
            player: {
              id: 272,
              username: 's ebbe',
              displayName: 'S ebbe',
              type: 'regular',
              build: 'main',
              flagged: false,
              lastImportedAt: '2020-08-30T23:48:35.941Z',
              lastChangedAt: '2020-11-26T06:30:14.825Z',
              registeredAt: '2020-04-15T13:21:12.033Z',
              updatedAt: '2020-09-03T03:49:14.300Z'
            }
          },
          {
            startDate: '2020-08-23T03:20:04.393Z',
            endDate: '2020-08-30T01:26:23.326Z',
            gained: 1052955,
            player: {
              id: 8237,
              username: 'illmatiic',
              displayName: 'Illmatiic',
              type: 'regular',
              build: 'main',
              flagged: false,
              lastImportedAt: '2020-08-30T01:26:24.762Z',
              lastChangedAt: '2020-11-26T06:30:14.825Z',
              registeredAt: '2020-05-14T14:33:32.392Z',
              updatedAt: '2020-08-30T01:26:24.762Z'
            }
          }
        ]
      }
    ],
    errorResponses: [
      {
        description: 'If period is not given but.',
        body: {
          message: "Parameter 'period' is undefined."
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
          message: 'Invalid metric: somethingElse.'
        }
      }
    ]
  }
];
