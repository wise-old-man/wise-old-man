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
            id: 201,
            name: 'RuthlessPvM 120+',
            clanChat: 'RuthlessPvM',
            description: 'PvM Clan (Cox / Nightmare / Tob)',
            homeworld: 467,
            score: 320,
            verified: true,
            createdAt: '2020-08-11T03:23:02.631Z',
            updatedAt: '2020-12-14T17:00:07.840Z',
            memberCount: 360
          },
          {
            id: 396,
            name: 'Nomads',
            clanChat: 'Nomads FC',
            description: 'Social/PVM/Slayer Clan, come & chill with fellow OSRS nerds :)',
            homeworld: 354,
            score: 310,
            verified: true,
            createdAt: '2020-11-05T17:30:46.459Z',
            updatedAt: '2020-12-13T06:00:08.865Z',
            memberCount: 37
          },
          {
            id: 51,
            name: 'Eternals',
            clanChat: 'Eternals CC',
            description: 'A fun clan, with fun people!',
            homeworld: null,
            score: 300,
            verified: true,
            createdAt: '2020-05-06T08:36:27.420Z',
            updatedAt: '2020-12-13T06:00:08.793Z',
            memberCount: 63
          }
        ]
      }
    ],
    errorResponses: [
      {
        description: 'If the given limit is lower than 1.',
        body: {
          message: 'Invalid limit: must be > 0'
        }
      },
      {
        description: 'If the given offset is negative.',
        body: {
          message: 'Invalid offset: must a positive number.'
        }
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
          message: 'Invalid group id.'
        }
      },
      {
        description: 'If the given id does not exist.',
        body: {
          message: 'Group not found.'
        }
      },
      {
        description: 'If the given id is invalid.',
        body: {
          message: "Parameter 'id' is not a valid number."
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
            country: null,
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
            country: null,
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
            country: null,
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
            country: null,
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
            country: null,
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
            country: null,
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
          message: 'Invalid group id.'
        }
      },
      {
        description: 'If the given id does not exist.',
        body: {
          message: 'Group not found.'
        }
      },
      {
        description: 'If the given id is invalid.',
        body: {
          message: "Parameter 'id' is not a valid number."
        }
      }
    ]
  },
  {
    title: "Get a group's competitions",
    url: '/groups/:id/competitions',
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
          message: 'Invalid group id.'
        }
      },
      {
        description: 'If the given id is invalid.',
        body: {
          message: "Parameter 'id' is not a valid number."
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
          startDate: '2020-11-15T12:07:55.584Z',
          endDate: '2020-12-15T14:07:19.395Z',
          gained: 7112940,
          player: {
            exp: 287727070,
            id: 2,
            username: 'psikoi',
            displayName: 'Psikoi',
            type: 'regular',
            build: 'main',
            country: null,
            flagged: false,
            ehp: 957.66169,
            ehb: 292.20288,
            ttm: 465.33077,
            tt200m: 14004.78936,
            lastImportedAt: '2020-12-15T14:07:20.609Z',
            lastChangedAt: '2020-12-15T14:07:19.338Z',
            registeredAt: '2020-04-02T19:40:06.317Z',
            updatedAt: '2020-12-15T14:07:20.609Z'
          }
        }
      }
    ],
    errorResponses: [
      {
        description: 'If no id is given.',
        body: {
          message: 'Invalid group id.'
        }
      },
      {
        description: 'If the given id is invalid.',
        body: {
          message: "Parameter 'id' is not a valid number."
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
        description:
          "The delta's period (See accepted values above) - Optional if startDate & endDate are valid"
      },
      {
        field: 'startDate',
        type: 'string',
        description: "The delta's custom time range start - Optional, can use 'period' instead"
      },
      {
        field: 'endDate',
        type: 'string',
        description: "The delta's custom time range end - Optional, can use 'period' instead"
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
            startDate: '2020-12-08T16:59:38.230Z',
            endDate: '2020-12-15T14:07:19.395Z',
            start: 14468951,
            end: 16124879,
            gained: 1655928,
            player: {
              exp: 287727070,
              id: 2,
              username: 'psikoi',
              displayName: 'Psikoi',
              type: 'regular',
              build: 'main',
              flagged: false,
              ehp: 957.66169,
              ehb: 292.20288,
              ttm: 465.33077,
              tt200m: 14004.78936,
              lastImportedAt: '2020-12-15T14:07:20.609Z',
              lastChangedAt: '2020-12-15T14:07:19.338Z',
              registeredAt: '2020-04-02T19:40:06.317Z',
              updatedAt: '2020-12-15T14:07:20.609Z'
            }
          },
          {
            startDate: '2020-12-06T13:09:32.613Z',
            endDate: '2020-12-13T10:16:36.930Z',
            start: 556678,
            end: 556678,
            gained: 0,
            player: {
              exp: 676544234,
              id: 1152,
              username: 'shrew 1549',
              displayName: 'Shrew 1549',
              type: 'regular',
              build: 'main',
              flagged: false,
              ehp: 2017.43678,
              ehb: 1786.82067,
              ttm: 0,
              tt200m: 12945.01427,
              lastImportedAt: null,
              lastChangedAt: '2020-12-13T00:28:52.155Z',
              registeredAt: '2020-04-27T17:06:38.966Z',
              updatedAt: '2020-12-13T10:16:36.950Z'
            }
          },
          {
            startDate: '2020-12-09T07:50:12.117Z',
            endDate: '2020-12-09T07:50:12.117Z',
            start: 8478679,
            end: 8478679,
            gained: 0,
            player: {
              exp: 261126311,
              id: 1122,
              username: 'alexsuperfly',
              displayName: 'Alexsuperfly',
              type: 'regular',
              build: 'main',
              flagged: false,
              ehp: 1157.99115,
              ehb: 78.87472,
              ttm: 142.04775,
              tt200m: 13804.4599,
              lastImportedAt: '2020-12-09T07:50:12.927Z',
              lastChangedAt: null,
              registeredAt: '2020-04-18T17:18:17.028Z',
              updatedAt: '2020-12-09T07:50:12.928Z'
            }
          }
        ]
      }
    ],
    errorResponses: [
      {
        description: 'If no id is given.',
        body: {
          message: 'Invalid group id.'
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
      },
      {
        description: 'If the given id does not exist or has no members.',
        body: {
          message: 'That group has no members.'
        }
      },
      {
        description: 'If the given id is invalid.',
        body: {
          message: "Parameter 'id' is not a valid number."
        }
      },
      {
        description: 'If the given limit is lower than 1.',
        body: {
          message: 'Invalid limit: must be > 0'
        }
      },
      {
        description: 'If the given offset is negative.',
        body: {
          message: 'Invalid offset: must a positive number.'
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
            player: {
              exp: 676544234,
              id: 1152,
              username: 'shrew 1549',
              displayName: 'Shrew 1549',
              type: 'regular',
              build: 'main',
              flagged: false,
              ehp: 2017.43678,
              ehb: 1786.82067,
              ttm: 0,
              tt200m: 12945.01427,
              lastImportedAt: null,
              lastChangedAt: '2020-12-13T00:28:52.155Z',
              registeredAt: '2020-04-27T17:06:38.966Z',
              updatedAt: '2020-12-13T10:16:36.950Z'
            },
            rank: 2172,
            experience: 676544234,
            level: 2277
          },
          {
            player: {
              exp: 287727070,
              id: 2,
              username: 'psikoi',
              displayName: 'Psikoi',
              type: 'regular',
              build: 'main',
              flagged: false,
              ehp: 957.66169,
              ehb: 292.20288,
              ttm: 465.33077,
              tt200m: 14004.78936,
              lastImportedAt: '2020-12-15T14:07:20.609Z',
              lastChangedAt: '2020-12-15T14:07:19.338Z',
              registeredAt: '2020-04-02T19:40:06.317Z',
              updatedAt: '2020-12-15T14:07:20.609Z'
            },
            rank: 38303,
            experience: 287727070,
            level: 2166
          },
          {
            player: {
              exp: 261126311,
              id: 1122,
              username: 'alexsuperfly',
              displayName: 'Alexsuperfly',
              type: 'regular',
              build: 'main',
              flagged: false,
              ehp: 1157.99115,
              ehb: 78.87472,
              ttm: 142.04775,
              tt200m: 13804.4599,
              lastImportedAt: '2020-12-09T07:50:12.927Z',
              lastChangedAt: null,
              registeredAt: '2020-04-18T17:18:17.028Z',
              updatedAt: '2020-12-09T07:50:12.928Z'
            },
            rank: 22429,
            experience: 261126311,
            level: 2229
          }
        ]
      }
    ],
    errorResponses: [
      {
        description: 'If no id is given.',
        body: {
          message: 'Invalid group id.'
        }
      },
      {
        description: 'If metric is given but it is not valid.',
        body: {
          message: 'Invalid metric: someInvalidMetric.'
        }
      },
      {
        description: 'If the given id is invalid.',
        body: {
          message: "Parameter 'id' is not a valid number."
        }
      },
      {
        description: 'If the given id does not exist.',
        body: {
          message: 'Group not found.'
        }
      },
      {
        description: 'If the given limit is lower than 1.',
        body: {
          message: 'Invalid limit: must be > 0'
        }
      },
      {
        description: 'If the given offset is negative.',
        body: {
          message: 'Invalid offset: must a positive number.'
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
            value: 6104396,
            id: 98107,
            playerId: 1152,
            period: 'week',
            metric: 'overall',
            updatedAt: '2020-05-18T23:48:05.144Z',
            player: {
              exp: 676595646,
              id: 1152,
              username: 'shrew 1549',
              displayName: 'Shrew 1549',
              type: 'regular',
              build: 'main',
              flagged: false,
              ehp: 2017.52327,
              ehb: 1787.15401,
              ttm: 0,
              tt200m: 12944.92778,
              lastImportedAt: null,
              lastChangedAt: '2020-12-15T16:51:19.310Z',
              registeredAt: '2020-04-27T17:06:38.966Z',
              updatedAt: '2020-12-15T16:51:19.415Z'
            }
          },
          {
            value: 5144963,
            id: 169,
            playerId: 2,
            period: 'week',
            metric: 'overall',
            updatedAt: '2020-04-18T09:30:11.710Z',
            player: {
              exp: 287727070,
              id: 2,
              username: 'psikoi',
              displayName: 'Psikoi',
              type: 'regular',
              build: 'main',
              flagged: false,
              ehp: 957.66169,
              ehb: 292.20288,
              ttm: 465.33077,
              tt200m: 14004.78936,
              lastImportedAt: '2020-12-15T14:07:20.609Z',
              lastChangedAt: '2020-12-15T14:07:19.338Z',
              registeredAt: '2020-04-02T19:40:06.317Z',
              updatedAt: '2020-12-15T14:07:20.609Z'
            }
          },
          {
            value: 3694645,
            id: 142819,
            playerId: 1709,
            period: 'week',
            metric: 'overall',
            updatedAt: '2020-08-03T00:29:14.989Z',
            player: {
              exp: 107530768,
              id: 1709,
              username: 'sethmare',
              displayName: 'Sethmare',
              type: 'regular',
              build: 'main',
              flagged: false,
              ehp: 488.45315,
              ehb: 104.738,
              ttm: 805.30886,
              tt200m: 14473.9979,
              lastImportedAt: '2020-12-15T07:50:30.930Z',
              lastChangedAt: '2020-12-15T07:50:29.280Z',
              registeredAt: '2020-05-01T23:51:10.042Z',
              updatedAt: '2020-12-15T07:50:30.930Z'
            }
          }
        ]
      }
    ],
    errorResponses: [
      {
        description: 'If no id is given.',
        body: {
          message: 'Invalid group id.'
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
        description: 'If the group with the given id has no members.',
        body: {
          message: 'That group has no members.'
        }
      },
      {
        description: 'If the given limit is lower than 1.',
        body: {
          message: 'Invalid limit: must be > 0'
        }
      },
      {
        description: 'If the given offset is negative.',
        body: {
          message: 'Invalid offset: must a positive number.'
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
            playerId: 1709,
            name: '99 Hitpoints',
            measure: 'experience',
            metric: 'hitpoints',
            createdAt: '2020-10-25T22:13:33.547Z',
            player: {
              exp: 107530768,
              id: 1709,
              username: 'sethmare',
              displayName: 'Sethmare',
              type: 'regular',
              build: 'main',
              flagged: false,
              ehp: 488.45315,
              ehb: 104.738,
              ttm: 805.30886,
              tt200m: 14473.9979,
              lastImportedAt: '2020-12-15T07:50:30.930Z',
              lastChangedAt: '2020-12-15T07:50:29.280Z',
              registeredAt: '2020-05-01T23:51:10.042Z',
              updatedAt: '2020-12-15T07:50:30.930Z'
            }
          },
          {
            threshold: 100,
            playerId: 1709,
            name: '100 Chambers Of Xeric kills',
            measure: 'kills',
            metric: 'chambers_of_xeric',
            createdAt: '2020-10-21T16:05:54.100Z',
            player: {
              exp: 107530768,
              id: 1709,
              username: 'sethmare',
              displayName: 'Sethmare',
              type: 'regular',
              build: 'main',
              flagged: false,
              ehp: 488.45315,
              ehb: 104.738,
              ttm: 805.30886,
              tt200m: 14473.9979,
              lastImportedAt: '2020-12-15T07:50:30.930Z',
              lastChangedAt: '2020-12-15T07:50:29.280Z',
              registeredAt: '2020-05-01T23:51:10.042Z',
              updatedAt: '2020-12-15T07:50:30.930Z'
            }
          },
          {
            threshold: 13034431,
            playerId: 1340,
            name: '99 Cooking',
            measure: 'experience',
            metric: 'cooking',
            createdAt: '2020-10-11T12:42:57.955Z',
            player: {
              exp: 112303464,
              id: 1340,
              username: 'usbc',
              displayName: 'USBC',
              type: 'ultimate',
              build: 'lvl3',
              flagged: false,
              ehp: 556.98921,
              ehb: 0,
              ttm: 1288.69431,
              tt200m: 22201.77214,
              lastImportedAt: '2020-12-09T07:50:13.173Z',
              lastChangedAt: '2020-12-09T07:50:12.053Z',
              registeredAt: '2020-04-28T23:24:02.299Z',
              updatedAt: '2020-12-09T07:50:13.174Z'
            }
          }
        ]
      }
    ],
    errorResponses: [
      {
        description: 'If no id is given.',
        body: {
          message: 'Invalid group id.'
        }
      },
      {
        description: 'If the given id does not exist.',
        body: {
          message: 'Group not found.'
        }
      },
      {
        description: 'If the group with the given id has no members.',
        body: {
          message: 'That group has no members.'
        }
      },
      {
        description: 'If the given limit is lower than 1.',
        body: {
          message: 'Invalid limit: must be > 0'
        }
      },
      {
        description: 'If the given offset is negative.',
        body: {
          message: 'Invalid offset: must a positive number.'
        }
      }
    ]
  },
  {
    title: "Get a group's recent name changes",
    url: '/groups/:id/name-changes',
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
            id: 1609,
            playerId: 15293,
            oldName: 'tugassassino',
            newName: 'lary9',
            status: 0,
            resolvedAt: null,
            createdAt: '2021-01-17T21:13:16.009Z',
            updatedAt: '2021-01-17T21:13:16.009Z',
            player: {
              exp: 81364290,
              id: 15293,
              username: 'tugassassino',
              displayName: 'tugassassino',
              type: 'regular',
              build: 'main',
              flagged: false,
              ehp: 328.09792,
              ehb: 56.85112,
              ttm: 965.68161,
              tt200m: 14634.35313,
              lastImportedAt: '2021-01-13T14:00:12.332Z',
              lastChangedAt: '2021-01-13T14:00:08.503Z',
              registeredAt: '2020-06-09T18:01:58.643Z',
              updatedAt: '2021-01-13T14:00:12.333Z'
            }
          },
          {
            id: 1608,
            playerId: 135826,
            oldName: 'tricky hypah',
            newName: '0 purp hypah',
            status: 0,
            resolvedAt: null,
            createdAt: '2021-01-17T21:13:16.007Z',
            updatedAt: '2021-01-17T21:13:16.007Z',
            player: {
              exp: 45916120,
              id: 135826,
              username: 'tricky hypah',
              displayName: 'tricky hypah',
              type: 'regular',
              build: 'main',
              flagged: false,
              ehp: 210.8715,
              ehb: 70.0381,
              ttm: 1082.88445,
              tt200m: 14751.57955,
              lastImportedAt: null,
              lastChangedAt: '2021-01-13T13:58:49.322Z',
              registeredAt: '2021-01-12T19:55:14.802Z',
              updatedAt: '2021-01-13T13:58:49.938Z'
            }
          },
          {
            id: 1607,
            playerId: 13678,
            oldName: 'also rng',
            newName: 'rajit0',
            status: 0,
            resolvedAt: null,
            createdAt: '2021-01-17T21:13:16.005Z',
            updatedAt: '2021-01-17T21:13:16.005Z',
            player: {
              exp: 70957320,
              id: 13678,
              username: 'also rng',
              displayName: 'Also RNG',
              type: 'regular',
              build: 'main',
              flagged: false,
              ehp: 312.08797,
              ehb: 20.84375,
              ttm: 981.66799,
              tt200m: 14650.36308,
              lastImportedAt: '2020-10-20T09:27:05.480Z',
              lastChangedAt: null,
              registeredAt: '2020-06-03T15:42:08.609Z',
              updatedAt: '2020-10-20T09:27:05.481Z'
            }
          }
        ]
      }
    ],
    errorResponses: [
      {
        description: 'If no id is given.',
        body: {
          message: 'Invalid group id.'
        }
      },
      {
        description: 'If the given id does not exist.',
        body: {
          message: 'Group not found.'
        }
      },
      {
        description: 'If the group with the given id has no members.',
        body: {
          message: 'That group has no members.'
        }
      },
      {
        description: 'If the given limit is lower than 1.',
        body: {
          message: 'Invalid limit: must be > 0'
        }
      },
      {
        description: 'If the given offset is negative.',
        body: {
          message: 'Invalid offset: must a positive number.'
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
        body: [
          {
            maxedCombatCount: 43,
            maxedTotalCount: 10,
            maxed200msCount: 2,
            averageStats: {
              createdAt: null,
              importedAt: null,
              overall: {
                rank: 226273,
                experience: 154787903,
                ehp: 571
              },
              attack: {
                rank: 258999,
                experience: 10985324
              },
              league_points: {
                rank: -1,
                score: -1
              },
              clue_scrolls_easy: {
                rank: 339337,
                score: 21
              },
              clue_scrolls_master: {
                rank: 46764,
                score: 9
              },
              chambers_of_xeric_challenge_mode: {
                rank: 439,
                kills: 1
              },
              zulrah: {
                rank: 51521,
                kills: 391
              },
              ehp: {
                rank: 22537,
                value: 571
              },
              ehb: {
                rank: 26967,
                value: 132
              }
            }
          }
        ]
      }
    ],
    errorResponses: [
      {
        description: 'If no id is given.',
        body: {
          message: 'Invalid group id.'
        }
      },
      {
        description: 'If the given id does not exist.',
        body: {
          message: 'Group not found.'
        }
      },
      {
        description: 'If the group with the given id has no members.',
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
      },
      {
        type: 'warning',
        content: "If no role has been specified for a member, it will default the role to 'member'."
      },
      {
        type: 'warning',
        content:
          "If no description, clanChat or homeworld has been specified, they will default to 'null'."
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
          score: 0,
          verified: false,
          id: 8,
          name: 'Fally Knights',
          description: 'We are the knights.',
          clanChat: 'fallyK',
          homeworld: 492,
          verificationCode: '857-291-364',
          updatedAt: '2020-12-15T17:35:57.425Z',
          createdAt: '2020-12-15T17:35:57.425Z',
          members: [
            {
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
              updatedAt: '2020-12-15T12:06:37.864Z',
              role: 'leader'
            },
            {
              exp: 0,
              id: 4,
              username: 'lynx titan',
              displayName: 'Lynx Titan',
              type: 'unknown',
              build: 'main',
              flagged: false,
              ehp: 0,
              ehb: 0,
              ttm: 0,
              tt200m: 0,
              lastImportedAt: null,
              lastChangedAt: null,
              registeredAt: '2020-12-15T12:40:28.496Z',
              updatedAt: '2020-12-15T12:40:29.779Z',
              role: 'member'
            },
            {
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
              updatedAt: '2020-12-15T15:40:06.388Z',
              role: 'leader'
            },
            {
              exp: 3332232052,
              id: 5,
              username: 'zulu',
              displayName: 'Zulu',
              type: 'regular',
              build: 'main',
              flagged: false,
              ehp: 7126.74163,
              ehb: 3536.61133,
              ttm: 0,
              tt200m: 7835.70942,
              lastImportedAt: '2020-12-15T15:41:09.270Z',
              lastChangedAt: '2020-12-15T15:32:21.940Z',
              registeredAt: '2020-12-15T12:40:28.486Z',
              updatedAt: '2020-12-15T15:41:09.270Z',
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
        description: "If one or more of the members' usernames are invalid",
        body: {
          message:
            '2 Invalid usernames: Names must be 1-12 characters long,\n         contain no special characters, and/or contain no space at the beginning or end of the name.',
          data: ['Ps@ikoi', 'Zez?ima']
        }
      },
      {
        description: 'If members is given but does not respect the correct format.',
        body: { message: 'Invalid members list. Each array element must have a username key.' }
      },
      {
        description: 'If an invalid role has been specified.',
        body: {
          message: 'Invalid member roles. Please check the roles of the given members.',
          data: [
            {
              username: 'Zezima',
              role: 'chickensauce'
            }
          ]
        }
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
      },
      {
        type: 'warning',
        content: "If no role has been specified for a member, it will default the role to 'member'."
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
      members: [
        { username: 'Psikoi', role: 'leader' },
        { username: 'Zezima', role: 'member' }
      ]
    },
    successResponses: [
      {
        description: '',
        body: {
          id: 9,
          name: 'Some new name',
          clanChat: 'fallyK',
          description: 'The big lebowski',
          homeworld: 490,
          score: 0,
          verified: false,
          createdAt: '2020-12-15T17:54:06.251Z',
          updatedAt: '2020-12-15T17:55:57.669Z',
          members: [
            {
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
              updatedAt: '2020-12-15T12:06:37.864Z',
              role: 'member'
            },
            {
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
              updatedAt: '2020-12-15T15:40:06.388Z',
              role: 'leader'
            }
          ]
        }
      }
    ],
    errorResponses: [
      {
        description: 'If no id is given.',
        body: {
          message: 'Invalid group id.'
        }
      },
      {
        description: 'If the given id does not exist.',
        body: {
          message: 'Group not found.'
        }
      },
      {
        description: 'If name is given but is already taken.',
        body: { message: "Group name 'Some taken name' is already taken." }
      },
      {
        description: "If one or more of the members' usernames are invalid.",
        body: {
          message:
            '2 Invalid usernames: Names must be 1-12 characters long,\n         contain no special characters, and/or contain no space at the beginning or end of the name.',
          data: ['Ps@ikoi', 'Ze?zima']
        }
      },
      {
        description: 'If the verification code is not given.',
        body: { message: "Parameter 'verificationCode' is undefined." }
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
          message: 'Invalid group id.'
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
        body: { message: "Parameter 'verificationCode' is undefined." }
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
    comments: [
      {
        type: 'warning',
        content: "If no role has been specified for a member, it will default the role to 'member'."
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
              exp: 3332232052,
              id: 5,
              username: 'zulu',
              displayName: 'Zulu',
              type: 'regular',
              build: 'main',
              flagged: false,
              ehp: 7126.74163,
              ehb: 3536.61133,
              ttm: 0,
              tt200m: 7835.70942,
              lastImportedAt: '2020-12-15T15:41:09.270Z',
              lastChangedAt: '2020-12-15T15:32:21.940Z',
              registeredAt: '2020-12-15T12:40:28.486Z',
              updatedAt: '2020-12-15T15:41:09.270Z',
              role: 'member'
            },
            {
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
              updatedAt: '2020-12-15T15:40:06.388Z',
              role: 'leader'
            }
          ]
        }
      }
    ],
    errorResponses: [
      {
        description: 'If no id is given.',
        body: {
          message: 'Invalid group id.'
        }
      },
      {
        description: 'If the given id does not exist.',
        body: {
          message: 'Group not found.'
        }
      },
      {
        description: 'If members is empty.',
        body: { message: 'Invalid or empty members list.' }
      },
      {
        description: 'If members does not respect the correct format.',
        body: { message: 'Invalid members list. Each array element must have a "username" key.' }
      },
      {
        description: 'If group of id could not be found.',
        body: { message: 'Group of id 56 was not found.' }
      },
      {
        description: 'If the verification code is not given.',
        body: { message: "Parameter 'verificationCode' is undefined." }
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
          message: 'Invalid group id.'
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
        body: { message: 'Invalid or empty members list.' }
      },
      {
        description: 'If the verification code is not given.',
        body: { message: "Parameter 'verificationCode' is undefined." }
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
      username: 'Zulu',
      role: 'leader'
    },
    successResponses: [
      {
        description: '',
        body: {
          exp: 3332232052,
          id: 5,
          username: 'zulu',
          displayName: 'Zulu',
          type: 'regular',
          build: 'main',
          flagged: false,
          ehp: 7126.74163,
          ehb: 3536.61133,
          ttm: 0,
          tt200m: 7835.70942,
          lastImportedAt: '2020-12-15T15:41:09.270Z',
          lastChangedAt: '2020-12-15T15:32:21.940Z',
          registeredAt: '2020-12-15T12:40:28.486Z',
          updatedAt: '2020-12-15T15:41:09.270Z',
          role: 'leader'
        }
      }
    ],
    errorResponses: [
      {
        description: 'If no id is given.',
        body: {
          message: 'Invalid group id.'
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
        body: { message: "Parameter 'username' is undefined." }
      },
      {
        description: 'If role is not given.',
        body: { message: "Parameter 'role' is undefined." }
      },
      {
        description: 'If the verification code is not given.',
        body: { message: "Parameter 'verificationCode' is undefined." }
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
        body: { message: 'Psikoi is already a leader.' }
      },
      {
        description: 'If the role is not valid',
        body: { message: 'Validation error: Invalid role "chickensauce".' }
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
    body: {
      verificationCode: '842-225-748'
    },
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
          message:
            '19 outdated (updated < 60 mins ago) players are being updated. This can take up to a few minutes.'
        }
      }
    ],
    errorResponses: [
      {
        description: 'If no id is given.',
        body: {
          message: 'Invalid group id.'
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
      },
      {
        description: 'If the verification code is not given.',
        body: { message: "Parameter 'verificationCode' is undefined." }
      },
      {
        description: 'If the verification code is not correct.',
        body: { message: 'Incorrect verification code.' }
      }
    ]
  }
];
