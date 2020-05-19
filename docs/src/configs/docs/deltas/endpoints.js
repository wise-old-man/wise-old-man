export default [
  {
    title: 'View player deltas',
    url: '/deltas',
    method: 'GET',
    comments: [
      {
        type: 'warning',
        content: 'The response will be formatted into a json-friendlier format. See example below.'
      },
      {
        type: 'warning',
        content: 'If the "period" param is not supplied, it will return the deltas for all periods.'
      }
    ],
    query: [
      {
        field: 'playerId',
        type: 'integer',
        description: 'The player id.'
      },
      {
        field: 'period',
        type: 'string',
        description: "The delta's period (See accepted values above) - Optional"
      }
    ],
    successResponses: [
      {
        description: 'Without any period filtering (Not showing the whole response)',
        body: {
          month: {
            period: 'month',
            startsAt: '2020-03-05T03:19:24.000Z',
            endsAt: '2020-04-04T16:43:36.219Z',
            data: {
              overall: {
                rank: {
                  start: 29626,
                  end: 30400,
                  delta: 774
                },
                experience: {
                  start: 268213747,
                  end: 269828205,
                  delta: 1614458
                }
              },
              attack: {
                rank: {
                  start: 12097,
                  end: 12158,
                  delta: 61
                },
                experience: {
                  start: 26994448,
                  end: 27216011,
                  delta: 221563
                }
              }
            }
          },
          year: {
            period: 'year',
            startsAt: '2019-04-04T23:42:16.000Z',
            endsAt: '2020-04-04T16:43:36.219Z',
            data: {
              overall: {
                rank: {
                  start: 25166,
                  end: 30400,
                  delta: 5234
                },
                experience: {
                  start: 236973133,
                  end: 269828205,
                  delta: 32855072
                }
              },
              attack: {
                rank: {
                  start: 10989,
                  end: 12158,
                  delta: 1169
                },
                experience: {
                  start: 25212878,
                  end: 27216011,
                  delta: 2003133
                }
              }
            }
          },
          day: {
            period: 'day',
            startsAt: '2020-04-03T21:43:19.856Z',
            endsAt: '2020-04-04T16:43:36.219Z',
            data: {
              overall: {
                rank: {
                  start: 30353,
                  end: 30400,
                  delta: 47
                },
                experience: {
                  start: 269705120,
                  end: 269828205,
                  delta: 123085
                }
              },
              attack: {
                rank: {
                  start: 12144,
                  end: 12158,
                  delta: 14
                },
                experience: {
                  start: 27216011,
                  end: 27216011,
                  delta: 0
                }
              }
            }
          },
          week: {
            period: 'week',
            startsAt: '2020-04-03T21:43:19.856Z',
            endsAt: '2020-04-04T16:43:36.219Z',
            data: {
              overall: {
                rank: {
                  start: 30353,
                  end: 30400,
                  delta: 47
                },
                experience: {
                  start: 269705120,
                  end: 269828205,
                  delta: 123085
                }
              },
              attack: {
                rank: {
                  start: 12144,
                  end: 12158,
                  delta: 14
                },
                experience: {
                  start: 27216011,
                  end: 27216011,
                  delta: 0
                }
              }
            }
          }
        }
      },
      {
        description: 'Filtered by the period field (month)',
        body: {
          period: 'month',
          startsAt: '2020-03-05T03:19:24.000Z',
          endsAt: '2020-04-04T16:43:36.219Z',
          data: {
            overall: {
              rank: {
                start: 29626,
                end: 30400,
                delta: 774
              },
              experience: {
                start: 268213747,
                end: 269828205,
                delta: 1614458
              }
            },
            attack: {
              rank: {
                start: 12097,
                end: 12158,
                delta: 61
              },
              experience: {
                start: 26994448,
                end: 27216011,
                delta: 221563
              }
            },
            defence: {
              rank: {
                start: 16398,
                end: 16794,
                delta: 396
              },
              experience: {
                start: 20370965,
                end: 20398429,
                delta: 27464
              }
            }
          }
        }
      }
    ],
    errorResponses: [
      {
        description: 'If no playerId is given.',
        body: {
          message: 'Invalid player id.'
        }
      },
      {
        description: 'If the player does not have any associated deltas in a period.',
        body: {
          message: "Couldn't find month deltas for that player."
        }
      },
      {
        description: 'If period is given but it is not valid.',
        body: {
          message: 'Invalid period: someInvalidPeriod.'
        }
      }
    ]
  },
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
              username: 'Zulu',
              type: 'regular',
              startDate: '2020-05-18T11:41:54.866Z',
              endDate: '2020-05-18T17:23:26.612Z',
              endValue: 12698378,
              startValue: 11589252,
              delta: 1109126
            },
            {
              playerId: 40,
              username: 'Porthuguese',
              type: 'unknown',
              startDate: '2020-05-18T08:20:48.485Z',
              endDate: '2020-05-18T09:40:26.729Z',
              endValue: 70777512,
              startValue: 70149092,
              delta: 628420
            },
            {
              playerId: 37,
              username: 'Psikoi',
              type: 'regular',
              startDate: '2020-05-18T05:45:47.023Z',
              endDate: '2020-05-18T17:47:22.186Z',
              endValue: 10292953,
              startValue: 9737168,
              delta: 555785
            }
          ],
          week: [
            {
              playerId: 38,
              username: 'Zulu',
              type: 'regular',
              startDate: '2020-05-12T13:48:01.266Z',
              endDate: '2020-05-18T17:01:34.448Z',
              endValue: 13053054,
              startValue: 101430,
              delta: 12951624
            },
            {
              playerId: 40,
              username: 'Porthuguese',
              type: 'unknown',
              startDate: '2020-05-12T10:57:30.111Z',
              endDate: '2020-05-18T17:50:24.727Z',
              endValue: 7802411,
              startValue: 101860,
              delta: 7700551
            },
            {
              playerId: 37,
              username: 'Psikoi',
              type: 'regular',
              startDate: '2020-05-12T13:49:19.828Z',
              endDate: '2020-05-18T13:19:11.926Z',
              endValue: 13061524,
              startValue: 5450161,
              delta: 7611363
            }
          ],
          month: [
            {
              playerId: 38,
              username: 'Zulu',
              type: 'regular',
              startDate: '2020-05-05T18:11:54.789Z',
              endDate: '2020-05-14T00:18:03.793Z',
              endValue: 115250310,
              startValue: 90011927,
              delta: 25238383
            },
            {
              playerId: 37,
              username: 'Psikoi',
              type: 'regular',
              startDate: '2020-04-19T10:02:29.000Z',
              endDate: '2020-05-18T17:39:56.535Z',
              endValue: 126327104,
              startValue: 106383626,
              delta: 19943478
            },
            {
              playerId: 40,
              username: 'Porthuguese',
              type: 'unknown',
              startDate: '2020-04-19T18:06:19.000Z',
              endDate: '2020-05-15T21:06:18.440Z',
              endValue: 17676261,
              startValue: 101720,
              delta: 17574541
            }
          ]
        }
      },
      {
        description: 'Filtered by the period field (month) (Only showing top 3 for demo purposes)',
        body: [
          {
            playerId: 38,
            username: 'Zulu',
            type: 'regular',
            startDate: '2020-05-05T18:11:54.789Z',
            endDate: '2020-05-14T00:18:03.793Z',
            endValue: 115250310,
            startValue: 90011927,
            delta: 25238383
          },
          {
            playerId: 37,
            username: 'Psikoi',
            type: 'regular',
            startDate: '2020-04-19T10:02:29.000Z',
            endDate: '2020-05-18T17:39:56.535Z',
            endValue: 126327104,
            startValue: 106383626,
            delta: 19943478
          },

          {
            playerId: 40,
            username: 'Porthuguese',
            type: 'unknown',
            startDate: '2020-04-19T18:06:19.000Z',
            endDate: '2020-05-15T21:06:18.440Z',
            endValue: 17676261,
            startValue: 101720,
            delta: 17574541
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
