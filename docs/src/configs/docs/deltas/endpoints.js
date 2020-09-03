export default [
  {
    title: 'View deltas leaderboard',
    url: '/deltas/leaderboard',
    method: 'GET',
    comments: [
      {
        type: 'info',
        content: 'This will only return the top 20 players of each period.'
      },
      {
        type: 'warning',
        content: 'If no "period" param is supplied, it will return the leaderboard for all periods.'
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
        description: "The delta's period (See accepted values above) - Optional"
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
              playerId: 38,
              username: 'zulu',
              displayName: 'Zulu',
              type: 'regular',
              build: 'main',
              flagged: false,
              startDate: '2020-05-18T11:41:54.866Z',
              endDate: '2020-05-18T17:23:26.612Z',
              endValue: 12698378,
              startValue: 11589252,
              gained: 1109126
            },
            {
              playerId: 40,
              username: 'porthuguese',
              displayName: 'Porthuguese',
              type: 'unknown',
              build: 'main',
              flagged: false,
              startDate: '2020-05-18T08:20:48.485Z',
              endDate: '2020-05-18T09:40:26.729Z',
              endValue: 70777512,
              startValue: 70149092,
              gained: 628420
            },
            {
              playerId: 37,
              username: 'psikoi',
              displayName: 'Psikoi',
              type: 'regular',
              build: 'main',
              flagged: false,
              startDate: '2020-05-18T05:45:47.023Z',
              endDate: '2020-05-18T17:47:22.186Z',
              endValue: 10292953,
              startValue: 9737168,
              gained: 555785
            }
          ],
          week: [
            {
              playerId: 38,
              username: 'zulu',
              displayName: 'Zulu',
              type: 'regular',
              build: 'main',
              flagged: false,
              startDate: '2020-05-12T13:48:01.266Z',
              endDate: '2020-05-18T17:01:34.448Z',
              endValue: 13053054,
              startValue: 101430,
              gained: 12951624
            },
            {
              playerId: 40,
              username: 'porthuguese',
              displayName: 'Porthuguese',
              type: 'unknown',
              build: 'main',
              flagged: false,
              startDate: '2020-05-12T10:57:30.111Z',
              endDate: '2020-05-18T17:50:24.727Z',
              endValue: 7802411,
              startValue: 101860,
              gained: 7700551
            },
            {
              playerId: 37,
              username: 'psikoi',
              displayName: 'Psikoi',
              type: 'regular',
              build: 'main',
              flagged: false,
              startDate: '2020-05-12T13:49:19.828Z',
              endDate: '2020-05-18T13:19:11.926Z',
              endValue: 13061524,
              startValue: 5450161,
              gained: 7611363
            }
          ],
          month: [
            {
              playerId: 38,
              username: 'zulu',
              displayName: 'Zulu',
              type: 'regular',
              build: 'main',
              flagged: false,
              startDate: '2020-05-05T18:11:54.789Z',
              endDate: '2020-05-14T00:18:03.793Z',
              endValue: 115250310,
              startValue: 90011927,
              gained: 25238383
            },
            {
              playerId: 37,
              username: 'psikoi',
              displayName: 'Psikoi',
              type: 'regular',
              build: 'main',
              flagged: false,
              startDate: '2020-04-19T10:02:29.000Z',
              endDate: '2020-05-18T17:39:56.535Z',
              endValue: 126327104,
              startValue: 106383626,
              gained: 19943478
            },
            {
              playerId: 40,
              username: 'porthuguese',
              displayName: 'Porthuguese',
              type: 'unknown',
              build: 'main',
              flagged: false,
              startDate: '2020-04-19T18:06:19.000Z',
              endDate: '2020-05-15T21:06:18.440Z',
              endValue: 17676261,
              startValue: 101720,
              gained: 17574541
            }
          ]
        }
      },
      {
        description: 'Filtered by the period field (month) (Only showing top 3 for demo purposes)',
        body: [
          {
            playerId: 38,
            username: 'zulu',
            displayName: 'Zulu',
            type: 'regular',
            build: 'main',
            flagged: false,
            startDate: '2020-05-05T18:11:54.789Z',
            endDate: '2020-05-14T00:18:03.793Z',
            endValue: 115250310,
            startValue: 90011927,
            gained: 25238383
          },
          {
            playerId: 37,
            username: 'psikoi',
            displayName: 'Psikoi',
            type: 'regular',
            build: 'main',
            flagged: false,
            startDate: '2020-04-19T10:02:29.000Z',
            endDate: '2020-05-18T17:39:56.535Z',
            endValue: 126327104,
            startValue: 106383626,
            gained: 19943478
          },

          {
            playerId: 40,
            username: 'porthuguese',
            displayName: 'Porthuguese',
            type: 'unknown',
            build: 'main',
            flagged: false,
            startDate: '2020-04-19T18:06:19.000Z',
            endDate: '2020-05-15T21:06:18.440Z',
            endValue: 17676261,
            startValue: 101720,
            gained: 17574541
          }
        ]
      }
    ],
    errorResponses: [
      {
        description: 'If period is given but it is not valid.',
        body: {
          message: 'Invalid period: someInvalidPeriod.'
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
