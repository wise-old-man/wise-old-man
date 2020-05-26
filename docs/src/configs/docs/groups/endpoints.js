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
        field: 'playerId',
        type: 'number',
        description: "A player's unique id."
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
            clanChat: null,
            createdAt: '2020-04-18T08:37:24.190Z',
            updatedAt: '2020-04-18T08:37:24.190Z',
            memberCount: 3
          },
          {
            id: 2,
            name: 'RSPT',
            clanChat: 'rspt',
            createdAt: '2020-04-18T08:45:28.726Z',
            updatedAt: '2020-04-18T08:47:50.870Z',
            memberCount: 21
          },
          {
            id: 4,
            name: 'Varrock Titans',
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
          clanChat: 'rspt',
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
    title: "Get a group's leaderboard",
    url: '/groups/:id/leaderboard',
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
            startDate: '2020-05-18T05:37:09.757Z',
            endDate: '2020-05-24T20:55:53.915Z',
            endValue: 204319855,
            startValue: 195506941,
            gained: 8812914
          },
          {
            playerId: 1181,
            username: 'idle rng',
            displayName: 'Idle Rng',
            type: 'regular',
            startDate: '2020-05-18T12:10:46.190Z',
            endDate: '2020-05-25T00:10:16.358Z',
            endValue: 203099572,
            startValue: 196325461,
            gained: 6774111
          },
          {
            playerId: 1179,
            username: 'chouji456',
            displayName: 'Chouji456',
            type: 'regular',
            startDate: '2020-05-18T11:35:45.657Z',
            endDate: '2020-05-25T00:09:45.010Z',
            endValue: 254543855,
            startValue: 247770279,
            gained: 6773576
          },
          {
            playerId: 1151,
            username: 'art of kappa',
            displayName: 'Art Of Kappa',
            type: 'regular',
            startDate: '2020-05-18T17:48:33.348Z',
            endDate: '2020-05-24T16:58:55.504Z',
            endValue: 407871795,
            startValue: 401457198,
            gained: 6414597
          },
          {
            playerId: 1163,
            username: 'knock',
            displayName: 'Knock',
            type: 'regular',
            startDate: '2020-05-18T11:52:45.623Z',
            endDate: '2020-05-25T00:07:49.076Z',
            endValue: 402041703,
            startValue: 396088826,
            gained: 5952877
          },
          {
            playerId: 1201,
            username: 'ice juice',
            displayName: 'Ice Juice',
            type: 'hardcore',
            startDate: '2020-05-18T03:54:03.228Z',
            endDate: '2020-05-25T01:14:56.107Z',
            endValue: 46432379,
            startValue: 40563565,
            gained: 5868814
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
          clanChat: 'fallyK',
          createdAt: '2020-04-18T08:45:28.726Z',
          updatedAt: '2020-04-18T15:30:41.380Z',
          members: [
            {
              id: 61,
              username: 'psikoi',
              displayName: 'Psikoi',
              type: 'regular',
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
    url: '/groups/:id/add',
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
    url: '/groups/:id/remove',
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
    url: '/groups/:id/roles',
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
          'This action will only submit an update job for the players which have not been updated in the last 10 minutes'
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
          "If the group's member list is invalid, empty or every member has been updated in the last 10 minutes",
        body: { message: 'This group has no members that should be updated' }
      }
    ]
  }
];
