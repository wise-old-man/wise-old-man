export default [
  {
    title: 'Search groups',
    url: '/groups',
    method: 'GET',
    query: [
      {
        field: 'name',
        type: 'string',
        description: 'A partial name match. - Optional'
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
        description: '',
        body: [
          {
            id: 1,
            name: 'Hexis',
            score: 120,
            verified: true,
            clanChat: null,
            createdAt: '2020-04-18T08:37:24.190Z',
            updatedAt: '2020-04-18T08:37:24.190Z',
            memberCount: 3
          },
          {
            id: 2,
            name: 'RSPT',
            score: 100,
            verified: true,
            clanChat: 'rspt',
            createdAt: '2020-04-18T08:45:28.726Z',
            updatedAt: '2020-04-18T08:47:50.870Z',
            memberCount: 21
          },
          {
            id: 4,
            name: 'Varrock Titans',
            score: 90,
            verified: false,
            clanChat: 'Vrck Titans',
            createdAt: '2020-04-18T09:01:10.630Z',
            updatedAt: '2020-04-18T09:07:00.915Z',
            memberCount: 13
          }
        ]
      }
    ]
  },
  {
    title: 'View group details',
    url: '/groups/:id',
    method: 'GET',
    params: [
      {
        field: 'id',
        type: 'integer',
        description: "The group's id."
      }
    ],
    successResponses: [
      {
        description: '',
        body: {
          id: 4,
          name: 'RSPT',
          score: 120,
          verified: true,
          description: 'RSPT is a group that produces the best local goods in the Zanaris market.',
          homeworld: 492,
          clanChat: 'rspt',
          memberCount: 178,
          createdAt: '2020-04-18T09:01:10.630Z',
          updatedAt: '2020-04-18T09:07:00.915Z'
        }
      }
    ],
    errorResponses: [
      {
        description: 'If no id is given.',
        body: {
          message: "Parameter 'id' is undefined."
        }
      },
      {
        description: 'If the given id does not exist.',
        body: {
          message: 'Group not found.'
        }
      }
    ]
  },
  {
    title: 'Get group members list',
    url: '/groups/:id/members',
    method: 'GET',
    params: [
      {
        field: 'id',
        type: 'integer',
        description: "The group's id."
      }
    ],
    successResponses: [
      {
        description: '',
        body: [
          {
            exp: 78918881,
            id: 60165,
            username: 'dare5125',
            displayName: 'Dare5125',
            type: 'regular',
            build: 'main',
            flagged: false,
            ehp: 304.87241,
            ehb: 0,
            ttm: 990.34978,
            tt200m: 14657.57865,
            lastImportedAt: '2020-12-12T16:50:39.923Z',
            lastChangedAt: '2020-12-12T15:36:25.455Z',
            registeredAt: '2020-10-25T14:00:15.323Z',
            updatedAt: '2020-12-12T16:50:39.923Z',
            role: 'leader',
            joinedAt: '2020-11-12T03:15:23.764Z'
          },
          {
            exp: 39513689,
            id: 60171,
            username: 'solaire555',
            displayName: 'Solaire555',
            type: 'regular',
            build: 'main',
            flagged: false,
            ehp: 277.88386,
            ehb: 0,
            ttm: 1016.10838,
            tt200m: 14684.56719,
            lastImportedAt: '2020-12-12T03:57:07.125Z',
            lastChangedAt: '2020-12-12T03:57:03.843Z',
            registeredAt: '2020-10-25T14:06:25.949Z',
            updatedAt: '2020-12-12T03:57:07.126Z',
            role: 'member',
            joinedAt: '2020-11-12T03:15:23.764Z'
          },
          {
            exp: 846463,
            id: 82898,
            username: 'lorfbeff',
            displayName: 'lorfbeff',
            type: 'regular',
            build: '1def',
            flagged: true,
            ehp: 10.59196,
            ehb: 0,
            ttm: 1283.16399,
            tt200m: 14951.85909,
            lastImportedAt: null,
            lastChangedAt: '2020-12-06T19:26:20.991Z',
            registeredAt: '2020-11-12T03:33:04.364Z',
            updatedAt: '2020-12-11T21:56:38.748Z',
            role: 'member',
            joinedAt: '2020-11-19T22:35:54.533Z'
          },
          {
            exp: 31072359,
            id: 60179,
            username: 'margery',
            displayName: 'Margery',
            type: 'regular',
            build: 'main',
            flagged: false,
            ehp: 235.95676,
            ehb: 0,
            ttm: 1057.7992,
            tt200m: 14726.49429,
            lastImportedAt: null,
            lastChangedAt: '2020-12-12T18:15:49.593Z',
            registeredAt: '2020-10-25T14:13:09.099Z',
            updatedAt: '2020-12-12T18:15:49.789Z',
            role: 'member',
            joinedAt: '2020-11-12T03:15:23.764Z'
          },
          {
            exp: 119653370,
            id: 60170,
            username: 'cathays',
            displayName: 'Cathays',
            type: 'regular',
            build: 'main',
            flagged: false,
            ehp: 468.97732,
            ehb: 0.33333,
            ttm: 825.19001,
            tt200m: 14493.47373,
            lastImportedAt: '2020-12-12T17:08:51.803Z',
            lastChangedAt: '2020-12-12T17:08:51.451Z',
            registeredAt: '2020-10-25T14:05:10.738Z',
            updatedAt: '2020-12-12T17:08:51.803Z',
            role: 'member',
            joinedAt: '2020-11-12T03:15:23.764Z'
          },
          {
            exp: 484599,
            id: 91398,
            username: 'theesterios',
            displayName: 'theesterios',
            type: 'regular',
            build: 'main',
            flagged: true,
            ehp: 13.36597,
            ehb: 0,
            ttm: 1280.38999,
            tt200m: 14949.08509,
            lastImportedAt: null,
            lastChangedAt: '2020-12-09T21:08:44.999Z',
            registeredAt: '2020-11-19T22:32:16.003Z',
            updatedAt: '2020-12-11T21:56:38.742Z',
            role: 'member',
            joinedAt: '2020-11-19T22:32:16.017Z'
          },
          {
            exp: 127823896,
            id: 91397,
            username: 'force king',
            displayName: 'force king',
            type: 'regular',
            build: 'main',
            flagged: false,
            ehp: 488.7107,
            ehb: 41.65034,
            ttm: 827.03235,
            tt200m: 14473.74035,
            lastImportedAt: '2020-12-12T03:57:06.618Z',
            lastChangedAt: '2020-12-12T03:57:03.852Z',
            registeredAt: '2020-11-19T22:32:16.001Z',
            updatedAt: '2020-12-12T03:57:06.618Z',
            role: 'member',
            joinedAt: '2020-11-19T22:32:16.017Z'
          },
          {
            exp: 44260460,
            id: 60181,
            username: 'eml0uise',
            displayName: 'EmL0uise',
            type: 'regular',
            build: 'main',
            flagged: false,
            ehp: 159.69145,
            ehb: 0,
            ttm: 1134.06464,
            tt200m: 14802.75961,
            lastImportedAt: null,
            lastChangedAt: '2020-12-12T15:36:33.809Z',
            registeredAt: '2020-10-25T14:14:05.692Z',
            updatedAt: '2020-12-12T15:36:33.963Z',
            role: 'member',
            joinedAt: '2020-11-12T03:15:23.764Z'
          }
        ]
      }
    ],
    errorResponses: [
      {
        description: 'If no id is given.',
        body: {
          message: "Parameter 'id' is undefined."
        }
      },
      {
        description: 'If the given id does not exist.',
        body: {
          message: 'Group not found.'
        }
      }
    ]
  },
  {
    title: "Get a group's competitions",
    url: '/group/:id/competitions',
    method: 'GET',
    params: [
      {
        field: 'id',
        type: 'integer',
        description: "The group's id."
      }
    ],
    successResponses: [
      {
        description: '',
        body: [
          {
            id: 1,
            title: 'SOTW 52 - Firemaking',
            metric: 'firemaking',
            score: 150,
            startsAt: '2020-03-20T23:00:00.000Z',
            endsAt: '2020-04-16T23:00:00.000Z',
            groupId: 51,
            createdAt: '2020-04-03T23:00:27.184Z',
            updatedAt: '2020-04-03T23:48:03.502Z',
            participantCount: 21,
            duration: '27 days'
          }
        ]
      }
    ],
    errorResponses: [
      {
        description: 'If no id is given.',
        body: {
          message: "Parameter 'id' is undefined."
        }
      },
      {
        description: 'If the given id does not exist.',
        body: {
          message: 'Group not found.'
        }
      }
    ]
  },
  {
    title: "Get a group's monthly top member",
    url: '/groups/:id/monthly-top',
    method: 'GET',
    params: [
      {
        field: 'id',
        type: 'integer',
        description: "The group's id."
      }
    ],
    successResponses: [
      {
        description: '',
        body: {
          playerId: 299,
          username: 'psikoi',
          displayName: 'Psikoi',
          build: 'main',
          flagged: false,
          type: 'regular',
          startDate: '2020-04-18T16:20:05.000Z',
          endDate: '2020-05-18T14:52:22.213Z',
          endValue: 963695236,
          startValue: 889685269,
          gained: 74009967
        }
      }
    ],
    errorResponses: [
      {
        description: 'If no id is given.',
        body: {
          message: "Parameter 'id' is undefined."
        }
      },
      {
        description: 'If the given id does not exist.',
        body: {
          message: 'Group not found.'
        }
      }
    ]
  },
  {
    title: "Get a group's gained leaderboards",
    url: '/groups/:id/gained',
    method: 'GET',
    params: [
      {
        field: 'id',
        type: 'integer',
        description: "The group's id."
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
        description: '',
        body: [
          [
            {
              startDate: '2020-07-28T18:43:24.339Z',
              endDate: '2020-08-26T22:07:37.065Z',
              gained: 8370924,
              player: {
                id: 1163,
                username: 'knock',
                displayName: 'Knock',
                type: 'regular',
                build: 'main',
                flagged: false,
                lastImportedAt: '2020-08-24T16:29:13.227Z',
                lastChangedAt: '2020-11-26T06:30:14.825Z',
                registeredAt: '2020-04-28T18:46:19.553Z',
                updatedAt: '2020-08-26T22:07:37.104Z'
              }
            },
            {
              startDate: '2020-07-27T01:14:45.528Z',
              endDate: '2020-08-26T22:07:39.353Z',
              gained: 6036661,
              player: {
                id: 1201,
                username: 'ice juice',
                displayName: 'Ice Juice',
                type: 'ironman',
                build: 'main',
                flagged: false,
                lastImportedAt: '2020-08-22T20:20:32.956Z',
                lastChangedAt: '2020-11-26T06:30:14.825Z',
                registeredAt: '2020-04-28T19:25:58.626Z',
                updatedAt: '2020-08-26T22:07:39.384Z'
              }
            },
            {
              startDate: '2020-07-28T18:43:35.745Z',
              endDate: '2020-08-26T22:02:42.823Z',
              gained: 3201759,
              player: {
                id: 1155,
                username: 'paposeco',
                displayName: 'Paposeco',
                type: 'regular',
                build: 'main',
                flagged: false,
                lastImportedAt: '2020-08-22T23:41:14.792Z',
                lastChangedAt: '2020-11-26T06:30:14.825Z',
                registeredAt: '2020-04-27T20:46:08.951Z',
                updatedAt: '2020-08-26T22:02:42.961Z'
              }
            }
          ]
        ]
      }
    ],
    errorResponses: [
      {
        description: 'If no id is given.',
        body: {
          message: "Parameter 'id' is undefined."
        }
      },
      {
        description: 'If the given id does not exist.',
        body: {
          message: 'Group not found.'
        }
      },
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
        description: 'If the given id does not exist or has no members.',
        body: {
          message: 'That group has no members.'
        }
      }
    ]
  },
  {
    title: "Get a group's hiscores",
    url: '/groups/:id/hiscores',
    method: 'GET',
    params: [
      {
        field: 'id',
        type: 'integer',
        description: "The group's id."
      },
      {
        field: 'metric',
        type: 'string',
        description: "The delta's metric (See accepted values above)"
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
        description: '',
        body: [
          {
            id: 125,
            username: 'windows10',
            displayName: 'Windows10',
            type: 'regular',
            build: 'main',
            flagged: false,
            lastImportedAt: '2020-05-14T00:21:28.251Z',
            lastChangedAt: '2020-11-26T06:30:14.825Z',
            registeredAt: '2020-04-15T13:03:28.396Z',
            updatedAt: '2020-06-02T23:37:26.348Z',
            rank: 171,
            experience: 76257923,
            level: 99
          },
          {
            id: 1161,
            username: 'ze punheteir',
            displayName: 'Ze Punheteir',
            type: 'regular',
            build: 'main',
            flagged: false,
            lastImportedAt: '2020-05-13T23:14:52.828Z',
            lastChangedAt: '2020-11-26T06:30:14.825Z',
            registeredAt: '2020-04-28T17:56:45.960Z',
            updatedAt: '2020-06-02T23:41:18.937Z',
            rank: 888,
            experience: 39924786,
            level: 99
          },
          {
            id: 1286,
            username: 'melisma',
            displayName: 'Melisma',
            type: 'regular',
            build: 'main',
            flagged: false,
            lastImportedAt: null,
            lastChangedAt: '2020-11-26T06:30:14.825Z',
            registeredAt: '2020-04-28T22:00:09.281Z',
            updatedAt: '2020-06-03T00:58:50.838Z',
            rank: 1141,
            experience: 36893876,
            level: 99
          }
        ]
      }
    ],
    errorResponses: [
      {
        description: 'If no id is given.',
        body: {
          message: "Parameter 'id' is undefined."
        }
      },
      {
        description: 'If the given id does not exist.',
        body: {
          message: 'Group not found.'
        }
      },
      {
        description: 'If metric is given but it is not valid.',
        body: {
          message: 'Invalid metric: someInvalidMetric.'
        }
      },
      {
        description: 'If the given id does not exist or has no members.',
        body: {
          message: 'That group has no members.'
        }
      }
    ]
  },
  {
    title: "Get a group's record leaderboards",
    url: '/groups/:id/records',
    method: 'GET',
    params: [
      {
        field: 'id',
        type: 'integer',
        description: "The group's id."
      },
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
        description: '',
        body: [
          {
            playerId: 1188,
            username: 'unequalized',
            displayName: 'Unequalized',
            type: 'regular',
            build: 'main',
            flagged: false,
            value: 76566869,
            updatedAt: '2020-06-02T23:38:37.203Z'
          },
          {
            playerId: 1191,
            username: '8 feb 2020',
            displayName: '8 Feb 2020',
            type: 'regular',
            build: 'main',
            flagged: false,
            value: 57448742,
            updatedAt: '2020-04-29T10:20:34.052Z'
          },
          {
            playerId: 125,
            username: 'windows10',
            displayName: 'Windows10',
            type: 'regular',
            build: 'main',
            flagged: false,
            value: 54337702,
            updatedAt: '2020-05-13T23:08:14.112Z'
          }
        ]
      }
    ],
    errorResponses: [
      {
        description: 'If no id is given.',
        body: {
          message: "Parameter 'id' is undefined."
        }
      },
      {
        description: 'If the given id does not exist.',
        body: {
          message: 'Group not found.'
        }
      },
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
        description: 'If the given id does not exist or has no members.',
        body: {
          message: 'That group has no members.'
        }
      }
    ]
  },
  {
    title: "Get a group's recent achievements",
    url: '/groups/:id/achievements',
    method: 'GET',
    params: [
      {
        field: 'id',
        type: 'integer',
        description: "The group's id."
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
        description: '',
        body: [
          {
            threshold: 13034431,
            playerId: 1236,
            type: '99 Strength',
            metric: 'strength',
            createdAt: '2020-06-03T00:58:57.019Z',
            player: {
              id: 1236,
              username: 'j onys',
              displayName: 'J Onys',
              type: 'regular',
              flagged: false
            }
          },
          {
            threshold: 13034431,
            playerId: 1177,
            type: '99 Hitpoints',
            metric: 'hitpoints',
            createdAt: '2020-06-03T00:57:47.202Z',
            player: {
              id: 1177,
              username: 'o joao',
              displayName: 'O Joao',
              type: 'regular',
              flagged: false
            }
          },
          {
            threshold: 1000000000,
            playerId: 1188,
            type: '1b Overall Exp.',
            metric: 'overall',
            createdAt: '2020-06-02T23:38:27.305Z',
            player: {
              id: 1188,
              username: 'unequalized',
              displayName: 'Unequalized',
              type: 'regular',
              flagged: false
            }
          }
        ]
      }
    ],
    errorResponses: [
      {
        description: 'If no id is given.',
        body: {
          message: "Parameter 'id' is undefined."
        }
      },
      {
        description: 'If the given id does not exist.',
        body: {
          message: 'Group not found.'
        }
      },
      {
        description: 'If the given id does not exist or has no members.',
        body: {
          message: 'That group has no members.'
        }
      }
    ]
  },
  {
    title: "Get a group's statistics",
    url: '/groups/:id/statistics',
    method: 'GET',
    params: [
      {
        field: 'id',
        type: 'integer',
        description: "The group's id."
      }
    ],
    successResponses: [
      {
        description: '',
        body: {
          maxedCombatCount: 25,
          maxedTotalCount: 14,
          maxed200msCount: 12,
          averageStats: {
            overall: {
              rank: 279828,
              experience: 163384710
            },
            attack: {
              rank: 331434,
              experience: 10254244
            },
            defence: {
              rank: 310463,
              experience: 8164334
            },
            clue_scrolls_easy: {
              rank: 265551,
              score: 25
            },
            clue_scrolls_medium: {
              rank: 195706,
              score: 58
            },
            clue_scrolls_hard: {
              rank: 138079,
              score: 68
            },
            chambers_of_xeric_challenge_mode: {
              rank: 166,
              kills: 2
            },
            chaos_elemental: {
              rank: 897,
              kills: 23
            },
            chaos_fanatic: {
              rank: 2492,
              kills: 28
            }
          }
        }
      }
    ],
    errorResponses: [
      {
        description: 'If no id is given.',
        body: {
          message: "Parameter 'id' is undefined."
        }
      },
      {
        description: 'If the given id does not exist.',
        body: {
          message: 'Group not found.'
        }
      },
      {
        description: 'If the given id does not exist or has no members.',
        body: {
          message: "Couldn't find any stats for this group."
        }
      }
    ]
  },
  {
    title: 'Create group',
    url: '/groups',
    method: 'POST',
    comments: [
      {
        type: 'error',
        content:
          'The response will contain a "verificationCode", this code must be stored \
           as it is not possible to edit or delete the group at a later date without it.'
      }
    ],
    body: {
      name: 'Falador Knights',
      description: 'We are the knights.',
      clanChat: 'fallyK',
      homeworld: 492,
      members: [
        { username: 'Psikoi', role: 'leader' },
        { username: 'Zezima', role: 'leader' },
        { username: 'Zulu', role: 'member' },
        { username: 'Lynx Titan', role: 'member' }
      ]
    },
    successResponses: [
      {
        description: '',
        body: {
          id: 23,
          name: 'Falador Knights',
          score: 0,
          verified: false,
          clanChat: 'fallyK',
          description: 'We are the knights.',
          homeworld: 492,
          verificationCode: '107-719-861',
          updatedAt: '2020-04-23T01:53:26.079Z',
          createdAt: '2020-04-23T01:53:26.079Z',
          members: [
            {
              id: 61,
              username: 'psikoi',
              displayName: 'Psikoi',
              type: 'regular',
              build: 'main',
              flagged: false,
              lastImportedAt: '2020-04-19T17:21:12.258Z',
              lastChangedAt: '2020-11-26T06:30:14.825Z',
              registeredAt: '2020-04-10T18:11:02.544Z',
              updatedAt: '2020-04-20T23:55:14.540Z',
              role: 'leader'
            },
            {
              id: 62,
              username: 'zulu',
              displayName: 'Zulu',
              type: 'regular',
              build: 'main',
              flagged: false,
              lastImportedAt: '2020-04-18T02:23:59.945Z',
              lastChangedAt: '2020-11-26T06:30:14.825Z',
              registeredAt: '2020-04-10T18:11:52.333Z',
              updatedAt: '2020-04-20T23:55:19.286Z',
              role: 'member'
            },
            {
              id: 77,
              username: 'zezima',
              displayName: 'Zezima',
              type: 'regular',
              build: 'main',
              flagged: false,
              lastImportedAt: '2020-04-11T01:02:25.132Z',
              lastChangedAt: '2020-11-26T06:30:14.825Z',
              registeredAt: '2020-04-11T01:02:06.424Z',
              updatedAt: '2020-04-20T23:55:24.007Z',
              role: 'leader'
            },
            {
              id: 298,
              username: 'lynx titan',
              displayName: 'Lynx Titan',
              type: 'unknown',
              build: 'main',
              flagged: false,
              lastImportedAt: null,
              lastChangedAt: '2020-11-26T06:30:14.825Z',
              registeredAt: '2020-04-23T01:53:26.156Z',
              updatedAt: '2020-04-23T01:53:26.156Z',
              role: 'member'
            }
          ]
        }
      }
    ],
    errorResponses: [
      {
        description: 'If no name is given.',
        body: { message: "Parameter 'name' is undefined." }
      },
      {
        description: 'If homeworld is not a number',
        body: { message: "Parameter 'homeworld' is not a valid number." }
      },
      {
        description: 'If name is already taken.',
        body: { message: "Group name 'Hexis' is already taken." }
      },
      {
        description: "If one of the members' usernames is invalid",
        body: { message: 'Invalid player username: Crazy@@Name' }
      },
      {
        description: 'If members is given but does not respect the correct format.',
        body: { message: 'Invalid members list. Each array element must have a username key.' }
      }
    ]
  },
  {
    title: 'Edit group',
    url: '/groups/:id',
    method: 'PUT',
    comments: [
      {
        type: 'error',
        content: 'If a list of members is supplied, it will replace any existing members list.'
      }
    ],
    params: [
      {
        field: 'id',
        type: 'integer',
        description: "The group's id."
      }
    ],
    body: {
      name: 'Some new name',
      description: 'The big lebowski',
      clanChat: 'fallyK',
      homeworld: 490,
      verificationCode: '842-225-748',
      members: ['Psikoi', 'Zezima']
    },
    successResponses: [
      {
        description: '',
        body: {
          id: 2,
          name: 'Some new name',
          score: 0,
          verified: false,
          clanChat: 'fallyK',
          description: 'The big lebowski',
          homeworld: 490,
          createdAt: '2020-04-18T08:45:28.726Z',
          updatedAt: '2020-04-18T15:30:41.380Z',
          members: [
            {
              id: 61,
              username: 'psikoi',
              displayName: 'Psikoi',
              type: 'regular',
              build: 'main',
              flagged: false,
              lastImportedAt: '2020-04-18T02:22:49.364Z',
              lastChangedAt: '2020-11-26T06:30:14.825Z',
              registeredAt: '2020-04-10T18:11:02.544Z',
              updatedAt: '2020-04-18T04:02:42.235Z',
              role: 'member'
            },
            {
              id: 77,
              username: 'zezima',
              displayName: 'Zezima',
              type: 'regular',
              build: 'main',
              flagged: false,
              lastImportedAt: '2020-04-11T01:02:25.132Z',
              lastChangedAt: '2020-11-26T06:30:14.825Z',
              registeredAt: '2020-04-11T01:02:06.424Z',
              updatedAt: '2020-04-18T03:40:17.940Z',
              role: 'member'
            }
          ]
        }
      }
    ],
    errorResponses: [
      {
        description: 'If no id is given.',
        body: {
          message: "Parameter 'id' is undefined."
        }
      },
      {
        description: 'If the given id does not exist.',
        body: {
          message: 'Group not found.'
        }
      },
      {
        description: 'If name or members are given.',
        body: { message: 'You must either include a new name or a new member list.' }
      },
      {
        description: 'If name is given but is already taken.',
        body: { message: "Group name 'Some taken name' is already taken." }
      },
      {
        description: "If one of the members' usernames is invalid",
        body: { message: 'Invalid player username: Crazy@@Name' }
      },
      {
        description: 'If the verification code is not given.',
        body: { message: 'Invalid verification code.' }
      },
      {
        description: 'If the verification code is not correct.',
        body: { message: 'Incorrect verification code.' }
      },
      {
        description: 'If homeworld is not a number',
        body: { message: "Parameter 'homeworld' is not a valid number." }
      }
    ]
  },
  {
    title: 'Delete group',
    url: '/groups/:id',
    method: 'DELETE',
    comments: [
      {
        type: 'error',
        content: 'This action is permanent: If a group is deleted, there is no way to restore it.'
      }
    ],
    params: [
      {
        field: 'id',
        type: 'integer',
        description: "The group's id."
      }
    ],
    body: {
      verificationCode: '373-418-957'
    },
    successResponses: [
      {
        description: '',
        body: {
          message: "Successfully deleted group 'Hexis' (id: 56)"
        }
      }
    ],
    errorResponses: [
      {
        description: 'If no id is given.',
        body: {
          message: "Parameter 'id' is undefined."
        }
      },
      {
        description: 'If the given id does not exist.',
        body: {
          message: 'Group not found.'
        }
      },
      {
        description: 'If the verification code is not given.',
        body: { message: 'Invalid verification code.' }
      },
      {
        description: 'If the verification code is not correct.',
        body: { message: 'Incorrect verification code.' }
      }
    ]
  },
  {
    title: 'Add members',
    url: '/groups/:id/add-members',
    method: 'POST',
    params: [
      {
        field: 'id',
        type: 'integer',
        description: "The group's id."
      }
    ],
    body: {
      verificationCode: '373-418-957',
      members: [
        { username: 'Psikoi', role: 'leader' },
        { username: 'Zulu', role: 'member' }
      ]
    },
    successResponses: [
      {
        description: '',
        body: {
          members: [
            {
              id: 37,
              username: 'psikoi',
              displayName: 'Psikoi',
              type: 'regular',
              build: 'main',
              flagged: false,
              lastImportedAt: '2020-04-18T02:23:59.945Z',
              lastChangedAt: '2020-11-26T06:30:14.825Z',
              registeredAt: '2020-04-10T18:11:52.333Z',
              updatedAt: '2020-04-18T03:22:36.419Z',
              role: 'leader'
            },
            {
              id: 62,
              username: 'zulu',
              displayName: 'Zulu',
              type: 'regular',
              build: 'main',
              flagged: false,
              lastImportedAt: '2020-04-18T02:23:59.945Z',
              lastChangedAt: '2020-11-26T06:30:14.825Z',
              registeredAt: '2020-04-10T18:11:52.333Z',
              updatedAt: '2020-04-18T03:22:36.419Z',
              role: 'member'
            }
          ]
        }
      }
    ],
    errorResponses: [
      {
        description: 'If no id is given.',
        body: {
          message: "Parameter 'id' is undefined."
        }
      },
      {
        description: 'If the given id does not exist.',
        body: {
          message: 'Group not found.'
        }
      },
      {
        description: 'If members is invalid or empty.',
        body: { message: 'Invalid member list.' }
      },
      {
        description: 'If members does not respect the correct format.',
        body: { message: 'Invalid members list. Each array element must have a username key.' }
      },
      {
        description: 'If group of id could not be found.',
        body: { message: 'Group of id 56 was not found.' }
      },
      {
        description: 'If the verification code is not given.',
        body: { message: 'Invalid verification code.' }
      },
      {
        description: 'If the verification code is not correct.',
        body: { message: 'Incorrect verification code.' }
      },
      {
        description: 'If all the given players are already members.',
        body: { message: 'All players given are already members.' }
      }
    ]
  },
  {
    title: 'Remove members',
    url: '/groups/:id/remove-members',
    method: 'POST',
    params: [
      {
        field: 'id',
        type: 'integer',
        description: "The group's id."
      }
    ],
    body: {
      verificationCode: '373-418-957',
      members: ['Psikoi']
    },
    successResponses: [
      {
        description: '',
        body: {
          message: 'Successfully removed 1 members from group of id: 3.'
        }
      }
    ],
    errorResponses: [
      {
        description: 'If no id is given.',
        body: {
          message: "Parameter 'id' is undefined."
        }
      },
      {
        description: 'If the given id does not exist.',
        body: {
          message: 'Group not found.'
        }
      },
      {
        description: 'If members is invalid or empty.',
        body: { message: 'Invalid members list' }
      },
      {
        description: 'If the verification code is not given.',
        body: { message: 'Invalid verification code.' }
      },
      {
        description: 'If the verification code is not correct.',
        body: { message: 'Incorrect verification code.' }
      },
      {
        description: 'If none of the members given exist.',
        body: { message: 'No valid tracked players were given.' }
      },
      {
        description: 'If none of the players given were members.',
        body: { message: 'None of the players given were members of that group.' }
      }
    ]
  },
  {
    title: 'Change member role',
    url: '/groups/:id/change-role',
    method: 'PUT',
    params: [
      {
        field: 'id',
        type: 'integer',
        description: "The group's id."
      }
    ],
    body: {
      verificationCode: '291-226-419',
      username: 'Psikoi',
      role: 'leader'
    },
    successResponses: [
      {
        description: '',
        body: {
          player: {
            id: 61,
            username: 'psikoi',
            displayName: 'Psikoi',
            type: 'regular',
            build: 'main',
            flagged: false,
            lastImportedAt: '2020-04-18T02:22:49.364Z',
            lastChangedAt: '2020-11-26T06:30:14.825Z',
            registeredAt: '2020-04-10T18:11:02.544Z',
            updatedAt: '2020-04-18T04:02:42.235Z',
            role: 'leader'
          },
          newRole: 'leader',
          oldRole: 'member'
        }
      }
    ],
    errorResponses: [
      {
        description: 'If no id is given.',
        body: {
          message: "Parameter 'id' is undefined."
        }
      },
      {
        description: 'If the given id does not exist.',
        body: {
          message: 'Group not found.'
        }
      },
      {
        description: 'If username is not given.',
        body: { message: 'Invalid username.' }
      },
      {
        description: 'If role is not given.',
        body: { message: 'Invalid group role.' }
      },
      {
        description: 'If the verification code is not given.',
        body: { message: 'Invalid verification code.' }
      },
      {
        description: 'If the verification code is not correct.',
        body: { message: 'Incorrect verification code.' }
      },
      {
        description: 'If player is not a member of the group.',
        body: { message: "'Psikoi' is not a member of Hexis." }
      },
      {
        description: 'If player already has the given role.',
        body: { message: "'Psikoi' already has the role of leader." }
      }
    ]
  },
  {
    title: 'Update all members',
    url: '/groups/:id/update-all',
    method: 'POST',
    comments: [
      {
        type: 'warning',
        content: "This action will perform a soft-update, meaning it won't import the player from CML."
      },
      {
        type: 'warning',
        content:
          'This action will only submit an update job for the players which have not been updated in the last 60 minutes'
      },
      {
        type: 'warning',
        content:
          'If a player update fails, it will re-attempt in 65 seconds. \
          It will re-attempt up to 5 times per player.'
      }
    ],
    params: [
      {
        field: 'id',
        type: 'integer',
        description: "The group's id."
      }
    ],
    successResponses: [
      {
        description: '',
        body: {
          message: '19 players are being updated. This can take up to a few minutes.'
        }
      }
    ],
    errorResponses: [
      {
        description: 'If no id is given.',
        body: {
          message: "Parameter 'id' is undefined."
        }
      },
      {
        description: 'If the given id does not exist.',
        body: {
          message: 'Group not found.'
        }
      },
      {
        description:
          "If the group's member list is invalid, empty or every member has been updated in the last 60 minutes",
        body: { message: 'This group has no members that should be updated' }
      }
    ]
  }
];
