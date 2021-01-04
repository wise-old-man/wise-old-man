export default [
  {
    title: 'View records leaderboard',
    url: '/records/leaderboard',
    method: 'GET',
    query: [
      {
        field: 'metric',
        type: 'string',
        description: "The record's metric (See accepted values above)"
      },
      {
        field: 'period',
        type: 'string',
        description: "The record's period (See accepted values above)"
      },
      {
        field: 'playerType',
        type: 'string',
        description: "The player's type (See accepted values above) - Optional (Default returns all)"
      },
      {
        field: 'playerBuild',
        type: 'string',
        description: "The player's build (See accepted values above) - Optional (Default returns all)"
      },
      {
        field: 'limit',
        type: 'integer',
        description: 'The maximum amount of results to return - Optional (Default is 20)'
      },
      {
        field: 'offset',
        type: 'integer',
        description: 'The amount of results to offset the response by - Optional (Default is 0)'
      }
    ],
    successResponses: [
      {
        description: 'Filtered by the fields metric (herblore) and period (6h) (Only showing top 3 for demo purposes)',
        body: [
          {
            value: 4296285,
            id: 10078478,
            playerId: 20400,
            period: "6h",
            metric: "herblore",
            updatedAt: "2020-12-14T10:25:30.960Z",
            player: {
              exp: 1275683046,
              id: 20400,
              username: "clouds",
              displayName: "clouds",
              type: "regular",
              build: "main",
              flagged: false,
              ehp: 4879.6876,
              ehb: 11.48485,
              ttm: 0,
              tt200m: 10082.76345,
              lastImportedAt: "2020-12-29T06:42:02.776Z",
              lastChangedAt: "2020-12-29T06:42:00.825Z",
              registeredAt: "2020-07-02T06:53:13.168Z",
              updatedAt: "2020-12-29T06:42:02.777Z"
            }
          },
          {
            value: 3954060,
            id: 10081998,
            playerId: 71872,
            period: "6h",
            metric: "herblore",
            updatedAt: "2020-12-14T22:10:32.523Z",
            player: {
              exp: 206296613,
              id: 71872,
              username: "crazy duckk",
              displayName: "Crazy Duckk",
              type: "regular",
              build: "lvl3",
              flagged: false,
              ehp: 978.34318,
              ehb: 0,
              ttm: 385.66642,
              tt200m: 12893.77735,
              lastImportedAt: "2020-12-19T12:28:30.645Z",
              lastChangedAt: "2020-12-19T12:28:28.894Z",
              registeredAt: "2020-11-02T16:42:01.176Z",
              updatedAt: "2020-12-19T12:28:30.645Z"
            }
          },
          {
            value: 3219800,
            id: 9775625,
            playerId: 5390,
            period: "6h",
            metric: "herblore",
            updatedAt: "2020-12-28T14:50:15.119Z",
            player: {
              exp: 1194753165,
              id: 5390,
              username: "max botter",
              displayName: "Max Botter",
              type: "regular",
              build: "main",
              flagged: false,
              ehp: 2570.31532,
              ehb: 608.90027,
              ttm: 0,
              tt200m: 12392.13573,
              lastImportedAt: "2020-12-28T14:50:15.296Z",
              lastChangedAt: "2020-12-28T14:50:14.278Z",
              registeredAt: "2020-05-05T18:12:26.380Z",
              updatedAt: "2020-12-28T14:50:15.296Z"
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
        description: 'If period is given but is not valid.',
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
        description: 'If playerType is given but is not valid.',
        body: {
          message: 'Invalid period: someInvalidPlayerType.'
        }
      },
      {
        description: 'If playerBuild is given but is not valid.',
        body: {
          message: 'Invalid period: someInvalidPlayerBuild.'
        }
      },
      {
        description: 'If the given limit is lower than 1.',
        body: {
          message: "Invalid limit: must be > 0"
        }
      },
      {
        description: 'If the given offset is negative.',
        body: {
          message: "Invalid offset: must a positive number."
        }
      }
    ]
  }
];
