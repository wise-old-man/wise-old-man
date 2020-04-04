export default [
  {
    title: 'View player deltas',
    url: '/deltas',
    method: 'GET',
    comments: [
      {
        type: 'warning',
        content: 'The response will be formatted into a json-friendlier format. See example below.',
      },
      {
        type: 'warning',
        content: 'If the "period" param is not supplied, it will return the deltas for all periods.',
      },
    ],
    query: [
      {
        field: 'playerId',
        type: 'integer',
        description: 'The player id.',
      },
      {
        field: 'period',
        type: 'string',
        description: "The delta's period (See accepted values above) - Optional",
      },
    ],
    successResponses: [
      {
        description: 'Without any period filtering (Not showing the whole response)',
        body: {
          month: {
            period: 'month',
            updatedAt: '2020-04-04T16:43:36.274Z',
            startsAt: '2020-03-05T03:19:24.000Z',
            endsAt: '2020-04-04T16:43:36.219Z',
            interval: '30 days, 13 hours, 24 minutes, 12 seconds',
            data: {
              overall: {
                rank: {
                  start: 29626,
                  end: 30400,
                  delta: 774,
                },
                experience: {
                  start: 268213747,
                  end: 269828205,
                  delta: 1614458,
                },
              },
              attack: {
                rank: {
                  start: 12097,
                  end: 12158,
                  delta: 61,
                },
                experience: {
                  start: 26994448,
                  end: 27216011,
                  delta: 221563,
                },
              },
            },
          },
          year: {
            period: 'year',
            updatedAt: '2020-04-04T16:43:36.284Z',
            startsAt: '2019-04-04T23:42:16.000Z',
            endsAt: '2020-04-04T16:43:36.219Z',
            interval: '365 days, 17 hours, 1 minutes, 20 seconds',
            data: {
              overall: {
                rank: {
                  start: 25166,
                  end: 30400,
                  delta: 5234,
                },
                experience: {
                  start: 236973133,
                  end: 269828205,
                  delta: 32855072,
                },
              },
              attack: {
                rank: {
                  start: 10989,
                  end: 12158,
                  delta: 1169,
                },
                experience: {
                  start: 25212878,
                  end: 27216011,
                  delta: 2003133,
                },
              },
            },
          },
          day: {
            period: 'day',
            updatedAt: '2020-04-04T16:43:36.274Z',
            startsAt: '2020-04-03T21:43:19.856Z',
            endsAt: '2020-04-04T16:43:36.219Z',
            interval: '19 hours, 16 seconds',
            data: {
              overall: {
                rank: {
                  start: 30353,
                  end: 30400,
                  delta: 47,
                },
                experience: {
                  start: 269705120,
                  end: 269828205,
                  delta: 123085,
                },
              },
              attack: {
                rank: {
                  start: 12144,
                  end: 12158,
                  delta: 14,
                },
                experience: {
                  start: 27216011,
                  end: 27216011,
                  delta: 0,
                },
              },
            },
          },
          week: {
            period: 'week',
            updatedAt: '2020-04-04T16:43:36.274Z',
            startsAt: '2020-04-03T21:43:19.856Z',
            endsAt: '2020-04-04T16:43:36.219Z',
            interval: '19 hours, 16 seconds',
            data: {
              overall: {
                rank: {
                  start: 30353,
                  end: 30400,
                  delta: 47,
                },
                experience: {
                  start: 269705120,
                  end: 269828205,
                  delta: 123085,
                },
              },
              attack: {
                rank: {
                  start: 12144,
                  end: 12158,
                  delta: 14,
                },
                experience: {
                  start: 27216011,
                  end: 27216011,
                  delta: 0,
                },
              },
            },
          },
        },
      },
      {
        description: 'Filtered by the period field (month)',
        body: {
          period: 'month',
          updatedAt: '2020-04-04T16:43:36.274Z',
          startsAt: '2020-03-05T03:19:24.000Z',
          endsAt: '2020-04-04T16:43:36.219Z',
          interval: '30 days, 13 hours, 24 minutes, 12 seconds',
          data: {
            overall: {
              rank: {
                start: 29626,
                end: 30400,
                delta: 774,
              },
              experience: {
                start: 268213747,
                end: 269828205,
                delta: 1614458,
              },
            },
            attack: {
              rank: {
                start: 12097,
                end: 12158,
                delta: 61,
              },
              experience: {
                start: 26994448,
                end: 27216011,
                delta: 221563,
              },
            },
            defence: {
              rank: {
                start: 16398,
                end: 16794,
                delta: 396,
              },
              experience: {
                start: 20370965,
                end: 20398429,
                delta: 27464,
              },
            },
          },
        },
      },
    ],
  },
  {
    title: 'View deltas leaderboard',
    url: '/deltas/leaderboard',
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
        description: "The delta's metric (See accepted values above)",
      },
      {
        field: 'period',
        type: 'string',
        description: "The delta's period (See accepted values above) - Optional",
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
              playerId: 38,
              username: 'Zulu',
              type: 'regular',
              gained: 603493,
            },
            {
              playerId: 40,
              username: 'Porthuguese',
              type: 'unknown',
              gained: 348275,
            },
            {
              playerId: 37,
              username: 'Psikoi',
              type: 'regular',
              gained: 123085,
            },
          ],
          week: [
            {
              playerId: 38,
              username: 'Zulu',
              type: 'regular',
              gained: 3678203,
            },
            {
              playerId: 40,
              username: 'Porthuguese',
              type: 'unknown',
              gained: 348275,
            },
            {
              playerId: 37,
              username: 'Psikoi',
              type: 'regular',
              gained: 123085,
            },
          ],
          month: [
            {
              playerId: 38,
              username: 'Zulu',
              type: 'regular',
              gained: 12076256,
            },
            {
              playerId: 37,
              username: 'Psikoi',
              type: 'regular',
              gained: 1614458,
            },
            {
              playerId: 40,
              username: 'Porthuguese',
              type: 'unknown',
              gained: 348275,
            },
          ],
          year: [
            {
              playerId: 37,
              username: 'Psikoi',
              type: 'regular',
              gained: 32855072,
            },
            {
              playerId: 38,
              username: 'Zulu',
              type: 'regular',
              gained: 12076256,
            },
            {
              playerId: 40,
              username: 'Porthuguese',
              type: 'unknown',
              gained: 348275,
            },
          ],
        },
      },
      {
        description: 'Filtered by the period field (month) (Only showing top 3 for demo purposes)',
        body: [
          {
            playerId: 38,
            username: 'Zulu',
            type: 'regular',
            gained: 12076256,
          },
          {
            playerId: 37,
            username: 'Psikoi',
            type: 'regular',
            gained: 1614458,
          },

          {
            playerId: 40,
            username: 'Porthuguese',
            type: 'unknown',
            gained: 348275,
          },
        ],
      },
    ],
  },
];
