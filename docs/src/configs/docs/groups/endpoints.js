export default [
  {
    title: 'Search groups',
    url: '/groups',
    method: 'GET',
    comments: [
      {
        type: 'warning',
        content:
          'If a "playerId" query param is given, this will only return groups of which \
          that player is a member and will ignore every other search parameter.'
      }
    ],
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
          message: 'Group of id 4553 was not found.'
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
            id: 352,
            username: 'psikoi',
            displayName: 'Psikoi',
            type: 'regular',
            build: 'main',
            flagged: false,
            lastImportedAt: null,
            registeredAt: '2020-05-02T20:35:05.251Z',
            updatedAt: '2020-05-03T01:08:18.827Z',
            role: 'leader',
            overallExperience: 546067684
          },
          {
            id: 416,
            username: 'zulu',
            displayName: 'Zulu',
            build: 'main',
            flagged: false,
            type: 'regular',
            lastImportedAt: '2020-05-03T01:27:05.764Z',
            registeredAt: '2020-05-02T20:35:06.302Z',
            updatedAt: '2020-05-03T01:49:14.712Z',
            role: 'member',
            overallExperience: 365282547
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
          message: 'Group of id 4553 was not found.'
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
    errorResponses: []
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
          message: 'Invalid group id.'
        }
      },
      {
        description: 'If the given id does not exist.',
        body: {
          message: 'Group of id 4553 was not found.'
        }
      },
      {
        description: "If none of the group's members are being tracked.",
        body: {
          message: 'None of the group members are tracked.'
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
          {
            playerId: 1188,
            username: 'unequalized',
            displayName: 'Unequalized',
            build: 'main',
            flagged: false,
            type: 'regular',
            startDate: '2020-05-18T10:29:33.291Z',
            endDate: '2020-05-24T22:43:56.955Z',
            endValue: 977545937,
            startValue: 963372008,
            gained: 14173929
          },
          {
            playerId: 1191,
            username: '8 feb 2020',
            displayName: '8 Feb 2020',
            build: 'main',
            flagged: false,
            type: 'regular',
            startDate: '2020-05-18T23:53:21.708Z',
            endDate: '2020-05-24T02:38:49.950Z',
            endValue: 212662135,
            startValue: 200415405,
            gained: 12246730
          },
          {
            playerId: 1170,
            username: 'teethbreaker',
            displayName: 'Teethbreaker',
            build: 'main',
            flagged: false,
            type: 'regular',
            startDate: '2020-05-18T04:47:13.127Z',
            endDate: '2020-05-24T04:42:37.801Z',
            endValue: 158106176,
            startValue: 149273178,
            gained: 8832998
          },
          {
            playerId: 1153,
            username: 'mobilekingpt',
            displayName: 'Mobilekingpt',
            type: 'regular',
            build: 'main',
            flagged: false,
            startDate: '2020-05-18T05:37:09.757Z',
            endDate: '2020-05-24T20:55:53.915Z',
            endValue: 204319855,
            startValue: 195506941,
            gained: 8812914
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
          message: 'Invalid group id.'
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
          message: 'Invalid group id.'
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
          message: 'Invalid group id.'
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
      clanChat: 'fallyK',
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
        body: { message: 'Invalid group name.' }
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
      clanChat: 'fallyK',
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
        description: 'If id is not given.',
        body: { message: 'Invalid group id.' }
      },
      {
        description: 'If the group of a specific id cannot be found.',
        body: { message: 'Group of id 4 was not found.' }
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
        description: 'If id is not given.',
        body: { message: 'Invalid group id.' }
      },
      {
        description: 'If the group of a specific id cannot be found.',
        body: { message: 'Group of id 4 was not found.' }
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
        description: 'If id is not given.',
        body: { message: 'Invalid group id.' }
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
        description: 'If id is not given.',
        body: { message: 'Invalid group id.' }
      },
      {
        description: 'If members is invalid or empty.',
        body: { message: 'Invalid members list' }
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
        description: 'If id is not given.',
        body: { message: 'Invalid group id.' }
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
        description: 'If id is not given.',
        body: { message: 'Invalid group id.' }
      },
      {
        description:
          "If the group's member list is invalid, empty or every member has been updated in the last 60 minutes",
        body: { message: 'This group has no members that should be updated' }
      }
    ]
  }
];
