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
        description: "The player's type (regular, ironman, ultimate, hardcore) - Optional"
      }
    ],
    successResponses: [
      {
        description: 'Without any period filtering (Only showing top 3 for demo purposes)',
        body: {
          day: [
            {
              playerId: 37,
              username: 'psikoi',
              displayName: 'Psikoi',
              type: 'regular',
              build: 'main',
              flagged: false,
              value: 101659,
              updatedAt: '2020-04-04T16:21:50.919Z'
            },
            {
              playerId: 39,
              username: 'zulu',
              displayName: 'Zulu',
              type: 'regular',
              build: 'main',
              flagged: false,
              value: 34655,
              updatedAt: '2020-04-03T23:03:19.135Z'
            },
            {
              playerId: 40,
              username: 'porthuguese',
              displayName: 'Porthuguese',
              type: 'unknown',
              build: 'main',
              flagged: false,
              value: 0,
              updatedAt: '2020-04-03T23:03:24.181Z'
            }
          ],
          week: [
            {
              playerId: 37,
              username: 'psikoi',
              displayName: 'Psikoi',
              type: 'regular',
              build: 'main',
              flagged: false,
              value: 101659,
              updatedAt: '2020-04-04T16:21:51.060Z'
            },
            {
              playerId: 38,
              username: 'zulu',
              displayName: 'Zulu',
              type: 'regular',
              build: 'main',
              flagged: false,
              value: 7930,
              updatedAt: '2020-04-04T16:21:23.462Z'
            },
            {
              playerId: 40,
              username: 'porthuguese',
              displayName: 'Porthuguese',
              type: 'unknown',
              build: 'main',
              flagged: false,
              value: 0,
              updatedAt: '2020-04-03T23:03:26.343Z'
            }
          ],
          month: [
            {
              playerId: 37,
              username: 'psikoi',
              displayName: 'Psikoi',
              type: 'regular',
              build: 'main',
              flagged: false,
              value: 290949,
              updatedAt: '2020-04-04T16:21:51.185Z'
            },
            {
              playerId: 38,
              username: 'zulu',
              displayName: 'Zulu',
              type: 'regular',
              build: 'main',
              flagged: false,
              value: 25515,
              updatedAt: '2020-04-04T16:21:23.606Z'
            },
            {
              playerId: 40,
              username: 'porthuguese',
              displayName: 'Porthuguese',
              type: 'unknown',
              build: 'main',
              flagged: false,
              value: 0,
              updatedAt: '2020-04-03T23:03:28.737Z'
            }
          ],
          year: [
            {
              playerId: 37,
              username: 'psikoi',
              displayName: 'Psikoi',
              type: 'regular',
              build: 'main',
              flagged: false,
              value: 3225180,
              updatedAt: '2020-04-04T16:21:51.291Z'
            },
            {
              playerId: 38,
              username: 'zulu',
              displayName: 'Zulu',
              type: 'regular',
              build: 'main',
              flagged: false,
              value: 25515,
              updatedAt: '2020-04-04T16:21:23.746Z'
            },
            {
              playerId: 40,
              username: 'porthuguese',
              displayName: 'Porthuguese',
              type: 'unknown',
              build: 'main',
              flagged: false,
              value: 0,
              updatedAt: '2020-04-03T23:03:30.820Z'
            }
          ]
        }
      },
      {
        description: 'Filtered by the period field (month) (Only showing top 3 for demo purposes)',
        body: [
          {
            playerId: 37,
            username: 'psikoi',
            displayName: 'Psikoi',
            type: 'regular',
            build: 'main',
            flagged: false,
            value: 290949,
            updatedAt: '2020-04-04T16:21:51.185Z'
          },
          {
            playerId: 38,
            username: 'zulu',
            displayName: 'Zulu',
            type: 'regular',
            build: 'main',
            flagged: false,
            value: 25515,
            updatedAt: '2020-04-04T16:21:23.746Z'
          },
          {
            playerId: 40,
            username: 'porthuguese',
            displayName: 'Porthuguese',
            type: 'unknown',
            build: 'main',
            flagged: false,
            value: 0,
            updatedAt: '2020-04-03T23:03:28.737Z'
          }
        ]
      }
    ],
    errorResponses: [
      {
        description: 'If period is not given.',
        body: {
          message: "Parameter 'period' is undefined."
        }
      },
      {
        description: 'If metric is given but it is not valid.',
        body: {
          message: 'Invalid metric: someInvalidMetric.'
        }
      }
    ]
  }
];
