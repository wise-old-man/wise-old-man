export default [
  {
    title: 'View player records',
    url: '/records',
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
        description: "The record's period (See accepted values above) - Optional",
      },
      {
        field: 'metric',
        type: 'string',
        description: "The record's metric (See accepted values above) - Optional",
      },
    ],
    successResponses: [
      {
        description: 'Without any period or metric filtering (Not showing the whole response)',
        body: [
          {
            period: 'day',
            metric: 'firemaking',
            value: '16450',
            updatedAt: '2020-04-04T16:21:50.974Z',
          },
          {
            period: 'month',
            metric: 'magic',
            value: '57662',
            updatedAt: '2020-04-03T23:58:29.522Z',
          },
          {
            period: 'day',
            metric: 'fletching',
            value: '4795',
            updatedAt: '2020-04-04T16:21:50.974Z',
          },
          {
            period: 'day',
            metric: 'overall',
            value: '123085',
            updatedAt: '2020-04-04T16:21:50.907Z',
          },
        ],
      },
      {
        description: 'Filtered by the metric field (Woodcutting)',
        body: [
          {
            period: 'week',
            metric: 'woodcutting',
            value: '101659',
            updatedAt: '2020-04-04T16:21:51.060Z',
          },
          {
            period: 'year',
            metric: 'woodcutting',
            value: '3225180',
            updatedAt: '2020-04-04T16:21:51.291Z',
          },
          {
            period: 'month',
            metric: 'woodcutting',
            value: '290949',
            updatedAt: '2020-04-04T16:21:51.185Z',
          },
          {
            period: 'day',
            metric: 'woodcutting',
            value: '101659',
            updatedAt: '2020-04-04T16:21:50.919Z',
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
        description: 'If period is given but it is not valid.',
        body: {
          message: 'Invalid period: someInvalidPeriod.',
        },
      },
      {
        description: 'If metric is given but it is not valid.',
        body: {
          message: 'Invalid metric: someInvalidMetric.',
        },
      },
    ],
  },
  {
    title: 'View records leaderboard',
    url: '/records/leaderboard',
    method: 'GET',
    comments: [
      {
        type: 'info',
        content: 'This will only return the top 20 players of each period.',
      },
      {
        type: 'warning',
        content: 'If no "period" param is supplied, it will return the leaderboard for all periods.',
      },
    ],
    query: [
      {
        field: 'metric',
        type: 'string',
        description: "The record's metric (See accepted values above)",
      },
      {
        field: 'period',
        type: 'string',
        description: "The record's period (See accepted values above) - Optional",
      },
      {
        field: 'playerType',
        type: 'string',
        description: "The player's type (regular, ironman, ultimate, hardcore) - Optional",
      },
    ],
    successResponses: [
      {
        description: 'Without any period filtering (Only showing top 3 for demo purposes)',
        body: {
          day: [
            {
              playerId: 37,
              username: 'Psikoi',
              type: 'regular',
              value: '101659',
              updatedAt: '2020-04-04T16:21:50.919Z',
            },
            {
              playerId: 39,
              username: 'Zulu',
              type: 'regular',
              value: '34655',
              updatedAt: '2020-04-03T23:03:19.135Z',
            },
            {
              playerId: 40,
              username: 'Porthuguese',
              type: 'unknown',
              value: '0',
              updatedAt: '2020-04-03T23:03:24.181Z',
            },
          ],
          week: [
            {
              playerId: 37,
              username: 'Psikoi',
              type: 'regular',
              value: '101659',
              updatedAt: '2020-04-04T16:21:51.060Z',
            },
            {
              playerId: 38,
              username: 'Zulu',
              type: 'regular',
              value: '7930',
              updatedAt: '2020-04-04T16:21:23.462Z',
            },
            {
              playerId: 40,
              username: 'Porthuguese',
              type: 'unknown',
              value: '0',
              updatedAt: '2020-04-03T23:03:26.343Z',
            },
          ],
          month: [
            {
              playerId: 37,
              username: 'Psikoi',
              type: 'regular',
              value: '290949',
              updatedAt: '2020-04-04T16:21:51.185Z',
            },
            {
              playerId: 38,
              username: 'Zulu',
              type: 'regular',
              value: '25515',
              updatedAt: '2020-04-04T16:21:23.606Z',
            },
            {
              playerId: 40,
              username: 'Porthuguese',
              type: 'unknown',
              value: '0',
              updatedAt: '2020-04-03T23:03:28.737Z',
            },
          ],
          year: [
            {
              playerId: 37,
              username: 'Psikoi',
              type: 'regular',
              value: '3225180',
              updatedAt: '2020-04-04T16:21:51.291Z',
            },
            {
              playerId: 38,
              username: 'Zulu',
              type: 'regular',
              value: '25515',
              updatedAt: '2020-04-04T16:21:23.746Z',
            },
            {
              playerId: 40,
              username: 'Porthuguese',
              type: 'unknown',
              value: '0',
              updatedAt: '2020-04-03T23:03:30.820Z',
            },
          ],
        },
      },
      {
        description: 'Filtered by the period field (month) (Only showing top 3 for demo purposes)',
        body: [
          {
            playerId: 37,
            username: 'Psikoi',
            type: 'regular',
            value: '290949',
            updatedAt: '2020-04-04T16:21:51.185Z',
          },
          {
            playerId: 38,
            username: 'Zulu',
            type: 'regular',
            value: '25515',
            updatedAt: '2020-04-04T16:21:23.746Z',
          },
          {
            playerId: 40,
            username: 'Porthuguese',
            type: 'unknown',
            value: '0',
            updatedAt: '2020-04-03T23:03:28.737Z',
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
        description: 'If period is given but it is not valid.',
        body: {
          message: 'Invalid period: someInvalidPeriod.',
        },
      },
      {
        description: 'If metric is given but it is not valid.',
        body: {
          message: 'Invalid metric: someInvalidMetric.',
        },
      },
    ],
  },
];
