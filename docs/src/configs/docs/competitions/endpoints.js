export default [
  {
    title: 'Search competitions',
    url: '/competitions',
    method: 'GET',
    query: [
      {
        field: 'title',
        type: 'string',
        description: 'A partial title match. - Optional'
      },
      {
        field: 'metric',
        type: 'string',
        description: 'The metric to filter the list by. (See accepted values above) - Optional'
      },
      {
        field: 'status',
        type: 'string',
        description: 'The status to filter the list by. (See accepted values above) - Optional'
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
            title: 'SOTW 52 - Firemaking',
            metric: 'firemaking',
            score: 150,
            startsAt: '2020-03-20T23:00:00.000Z',
            endsAt: '2020-04-16T23:00:00.000Z',
            groupId: null,
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
        description: 'If status is given but is not valid.',
        body: {
          message: 'Invalid status.'
        }
      },
      {
        description: 'If metric is given but is not valid.',
        body: {
          message: 'Invalid metric.'
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
  },
  {
    title: 'View competition details',
    url: '/competitions/:id',
    method: 'GET',
    params: [
      {
        field: 'id',
        type: 'integer',
        description: "The competition's id."
      }
    ],
    successResponses: [
      {
        description: '',
        body: {
          id: 681,
          title: 'Road to 99 Agility',
          metric: 'agility',
          score: 210,
          startsAt: '2020-10-26T21:11:00.000Z',
          endsAt: '2020-12-28T21:11:00.000Z',
          groupId: null,
          createdAt: '2020-10-26T21:09:43.753Z',
          updatedAt: '2020-10-28T01:13:48.033Z',
          group: null,
          duration: '63 days',
          totalGained: 2872197,
          participants: [
            {
              exp: 62565175,
              id: 47596,
              username: 'dead redhead',
              displayName: 'Dead RedHead',
              type: 'ironman',
              build: 'main',
              flagged: false,
              ehp: 342.76763,
              ehb: 1.21905,
              ttm: 1463.00266,
              tt200m: 22415.99372,
              lastImportedAt: '2020-12-18T01:09:55.018Z',
              lastChangedAt: '2020-12-17T00:53:20.425Z',
              registeredAt: '2020-10-04T19:15:03.810Z',
              updatedAt: '2020-12-18T01:09:55.018Z',
              progress: {
                start: 5667440,
                end: 8539637,
                gained: 2872197
              },
              history: [
                {
                  date: '2020-10-26T21:59:14.660Z',
                  value: 5667440
                },
                {
                  date: '2020-12-18T01:09:51.522Z',
                  value: 8539637
                }
              ]
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
        description: 'If the given id is not valid.',
        body: {
          message: "Parameter 'id' is not a valid number."
        }
      },
      {
        description: 'If the given id does not exist.',
        body: {
          message: 'Competition not found.'
        }
      }
    ]
  },
  {
    title: 'Create competition',
    url: '/competitions',
    method: 'POST',
    comments: [
      {
        type: 'error',
        content:
          'The response will contain a "verificationCode", this code must be stored \
          as it is not possible to edit or delete the competition at a later date without it.'
      },
      {
        type: 'info',
        content:
          "Instead of an array of participants, you can also supply the values \
          'groupId' and 'groupVerificationCode' to create a group competition. \
          Providing these two values will require you to use your group verfication \
          code to make edits to the competition."
      }
    ],
    body: {
      title: 'SOTW 52 - Fishing',
      metric: 'fishing',
      startsAt: '2020-12-21T19:00:00.000Z',
      endsAt: '2020-12-27T19:00:00.000Z',
      participants: ['Rro', 'Rorro']
    },
    successResponses: [
      {
        description: '',
        body: {
          score: 0,
          id: 977,
          title: 'Something smells fishy',
          metric: 'fishing',
          verificationCode: '368-456-551',
          startsAt: '2020-12-21T19:00:00.000Z',
          endsAt: '2020-12-27T19:00:00.000Z',
          groupId: null,
          updatedAt: '2020-12-21T15:24:08.864Z',
          createdAt: '2020-12-21T15:24:08.864Z',
          participants: [
            {
              exp: 488913691,
              id: 4156,
              username: 'rro',
              displayName: 'Rro',
              type: 'regular',
              build: 'main',
              flagged: false,
              ehp: 1730.52779,
              ehb: 580.18854,
              ttm: 0,
              tt200m: 13231.92327,
              lastImportedAt: '2020-12-21T11:51:46.516Z',
              lastChangedAt: '2020-12-21T11:51:45.422Z',
              registeredAt: '2020-05-03T16:55:16.933Z',
              updatedAt: '2020-12-21T11:51:46.516Z'
            },
            {
              exp: 330476,
              id: 5177,
              username: 'rorro',
              displayName: 'rorro',
              type: 'hardcore',
              build: 'main',
              flagged: false,
              ehp: 6.30959,
              ehb: 0,
              ttm: 1797.87267,
              tt200m: 22752.45176,
              lastImportedAt: null,
              lastChangedAt: null,
              registeredAt: '2020-05-04T23:22:22.779Z',
              updatedAt: '2020-12-20T23:00:56.775Z'
            }
          ]
        }
      }
    ],
    errorResponses: [
      {
        description: 'If no title is given,',
        body: { message: "Parameter 'title' is undefined." }
      },
      {
        description: 'If no metric is given,',
        body: { message: "Parameter 'metric' is undefined." }
      },
      {
        description: 'If the given metric is invalid,',
        body: { message: "Invalid competition metric." }
      },
      {
        description: 'If startsAt is not a valid date.',
        body: { message: "Parameter 'startsAt' is not a valid date." }
      },
      {
        description: 'If endsAt is not a valid date.',
        body: { message: "Parameter 'endsAt' is not a valid date." }
      },
      {
        description: 'If no startsAt is given.',
        body: { message: "Parameter 'startsAt' is undefined." }
      },
      {
        description: 'If no endsAt is given.',
        body: { message: "Parameter 'endsAt' is undefined." }
      },
      {
        description: 'If startsAt OR endsAt is a past date.',
        body: { message: "Invalid dates: All start and end dates must be in the future." }
      },
      {
        description: 'If end date comes before start date.',
        body: { message: "Start date must be before the end date." }
      },
      {
        description: "If one or more of the participant' usernames is invalid",
        body: { message: "1 Invalid usernames: Names must be 1-12 characters long,\n         contain no special characters, and/or contain no space at the beginning or end of the name.",
          data: [
            "Zez%%ima"
          ] }
      },
      {
        description: 'If a groupId is supplied but does not exist',
        body: { message: "Group not found." }
      },
      {
        description: 'If a groupId is supplied but groupVerificationCode is not.',
        body: { message: 'Invalid verification code.' }
      },
      {
        description:
          "If a groupVerificationCode is supplied but does match the group's actual verification code.",
        body: { message: 'Incorrect group verification code.' }
      }
    ]
  },
  {
    title: 'Edit competition',
    url: '/competitions/:id',
    method: 'PUT',
    comments: [
      {
        type: 'error',
        content: 'If a list of participants is supplied, it will replace any existing participant list.'
      }
    ],
    params: [
      {
        field: 'id',
        type: 'integer',
        description: "The competition's id."
      }
    ],
    body: {
      title: 'New title',
      verificationCode: '373-418-957',
      participants: ['Psikoi', 'Zulu', 'Another']
    },
    successResponses: [
      {
        description: '',
        body: {
          id: 977,
          title: 'New title',
          metric: 'fishing',
          score: 0,
          startsAt: '2020-12-21T19:00:00.000Z',
          endsAt: '2020-12-27T19:00:00.000Z',
          groupId: null,
          createdAt: '2020-12-21T15:24:08.864Z',
          updatedAt: '2020-12-21T15:39:35.967Z',
          participants: [
            {
              exp: 290749002,
              id: 2,
              username: 'psikoi',
              displayName: 'Psikoi',
              type: 'regular',
              build: 'main',
              flagged: false,
              ehp: 962.17225,
              ehb: 292.20288,
              ttm: 460.82115,
              tt200m: 14000.2788,
              lastImportedAt: '2020-12-21T10:59:01.411Z',
              lastChangedAt: '2020-12-19T15:40:34.082Z',
              registeredAt: '2020-04-02T19:40:06.317Z',
              updatedAt: '2020-12-21T10:59:01.411Z'
            },
            {
              exp: 3332224567,
              id: 128,
              username: 'zulu',
              displayName: 'Zulu',
              type: 'regular',
              build: 'main',
              flagged: false,
              ehp: 7126.71899,
              ehb: 3536.61133,
              ttm: 0,
              tt200m: 7835.73206,
              lastImportedAt: '2020-12-03T03:36:28.742Z',
              lastChangedAt: '2020-12-03T03:36:27.713Z',
              registeredAt: '2020-04-15T13:03:41.763Z',
              updatedAt: '2020-12-03T03:36:28.742Z'
            },
            {
              exp: 0,
              id: 116908,
              username: 'another',
              displayName: 'Another',
              type: 'unknown',
              build: 'main',
              flagged: false,
              ehp: 0,
              ehb: 0,
              ttm: 0,
              tt200m: 0,
              lastImportedAt: null,
              lastChangedAt: null,
              registeredAt: '2020-12-21T15:38:31.410Z',
              updatedAt: '2020-12-21T15:38:31.410Z'
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
        description: 'If the given id is not valid.',
        body: {
          message: "Parameter 'id' is not a valid number."
        }
      },
      {
        description: 'If the given id does not exist.',
        body: {
          message: 'Competition not found.'
        }
      },
      {
        description: 'If endsAt is given but not valid.',
        body: { message: 'Validation error: End date must be a valid date.' }
      },
      {
        description: 'If startsAt is given but not valid.',
        body: { message: "Validation error: Start date must be a valid date." }
      },
      {
        description: 'If end date comes before start date.',
        body: { message: "Start date must be before the end date." }
      },
      {
        description: 'If the competition has already started and a metric was given.',
        body: { message: 'The competition has started, the metric cannot be changed.' }
      },
      {
        description: 'If the competition has already started and startsAt was given.',
        body: { message: 'The competition has started, the start date cannot be changed.' }
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
        description: "If one of the participant' usernames is invalid",
        body: { message: {
          "message": "1 Invalid usernames: Names must be 1-12 characters long,\n         contain no special characters, and/or contain no space at the beginning or end of the name.",
          "data": [
            "Zu@lu"
          ]
        }}
      }
    ]
  },
  {
    title: 'Delete competition',
    url: '/competitions/:id',
    method: 'DELETE',
    comments: [
      {
        type: 'error',
        content: 'This action is permanent: If a competition is deleted, there is no way to restore it.'
      }
    ],
    params: [
      {
        field: 'id',
        type: 'integer',
        description: "The competition's id."
      }
    ],
    body: {
      verificationCode: '373-418-957'
    },
    successResponses: [
      {
        description: '',
        body: {
          message: "Successfully deleted competition 'SOTW 52 - Fishing' (id: 56)"
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
        description: 'If the given id is not valid.',
        body: {
          message: "Parameter 'id' is not a valid number."
        }
      },
      {
        description: 'If the given id does not exist.',
        body: {
          message: 'Competition not found.'
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
    title: 'Add participants',
    url: '/competitions/:id/add-participants',
    method: 'POST',
    params: [
      {
        field: 'id',
        type: 'integer',
        description: "The competition's id."
      }
    ],
    body: {
      verificationCode: '373-418-957',
      participants: ['Rorro']
    },
    successResponses: [
      {
        description: '',
        body: {
          newParticipants: [
            {
              exp: 330476,
              id: 5177,
              username: 'rorro',
              displayName: 'rorro',
              type: 'hardcore',
              build: 'main',
              flagged: false,
              ehp: 6.30959,
              ehb: 0,
              ttm: 1797.87267,
              tt200m: 22752.45176,
              lastImportedAt: null,
              lastChangedAt: null,
              registeredAt: '2020-05-04T23:22:22.779Z',
              updatedAt: '2020-12-20T23:00:56.775Z'
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
        description: 'If the given id is not valid.',
        body: {
          message: "Parameter 'id' is not a valid number."
        }
      },
      {
        description: 'If the given id does not exist.',
        body: {
          message: 'Competition not found.'
        }
      },
      {
        description: 'If no participants list is invalid.',
        body: { message: "Parameter 'participants' is undefined." }
      },
      {
        description: 'If participants list is empty.',
        body: { message: 'Empty participants list.' }
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
        description: 'If all the participants are already participating.',
        body: { message: 'All players given are already competing.' }
      },
      {
        description: "If one or more of the participant' usernames is invalid",
        body: { message: "Validation error: Username cannot contain any special characters.,\nValidation error: Display name cannot contain any special characters." }
      }
    ]
  },
  {
    title: 'Remove participants',
    url: '/competitions/:id/remove-participants',
    method: 'POST',
    params: [
      {
        field: 'id',
        type: 'integer',
        description: "The competition's id."
      }
    ],
    body: {
      verificationCode: '373-418-957',
      participants: ['Psikoi']
    },
    successResponses: [
      {
        description: '',
        body: {
          message: 'Successfully removed 1 participants from competition of id: 3.'
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
        description: 'If the given id is not valid.',
        body: {
          message: "Parameter 'id' is not a valid number."
        }
      },
      {
        description: 'If the given id does not exist.',
        body: {
          message: 'Competition not found.'
        }
      },
      {
        description: 'If participants is invalid.',
        body: { message: "Parameter 'participants' is undefined." }
      },
      {
        description: 'If participants list is empty.',
        body: { message: 'Empty participants list.' }
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
        description: 'If none of the participants given exist.',
        body: { message: 'No valid tracked players were given.' }
      },
      {
        description: 'If none of the participants given were participating.',
        body: { message: 'None of the players given were competing.' }
      }
    ]
  },
  {
    title: 'Update all participants',
    url: '/competitions/:id/update-all',
    method: 'POST',
    comments: [
      {
        type: 'warning',
        content:
          "This action will perform a soft-update, meaning it won't \
          import the player from CML or determine it's type."
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
        description: "The competition's id."
      }
    ],
    successResponses: [
      {
        description: '',
        body: {
          message: "19 outdated (updated < 60 mins ago) players are being updated. This can take up to a few minutes."
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
        description: 'If the given id is not valid.',
        body: {
          message: "Parameter 'id' is not a valid number."
        }
      },
      {
        description: 'If the given id does not exist.',
        body: {
          message: 'Competition not found.'
        }
      },
      {
        description:
          "If the competition's participants list is invalid, empty or every participant has been updated in the last 60 minutes",
        body: { message: 'This competition has no outdated participants.' }
      }
    ]
  }
];
