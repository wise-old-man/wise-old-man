export default [
  {
    title: 'Search competitions',
    url: '/competitions',
    method: 'GET',
    comments: [
      {
        type: 'warning',
        content:
          'If a "playerId" query param is given, this will only return competitions of which \
          that player is a participant and will ignore every other search parameter.'
      }
    ],
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
          id: 1,
          title: 'SOTW 52 - Firemaking',
          metric: 'firemaking',
          score: 120,
          startsAt: '2020-03-20T23:00:00.000Z',
          endsAt: '2020-04-16T23:00:00.000Z',
          groupId: null,
          createdAt: '2020-04-03T23:00:27.184Z',
          updatedAt: '2020-04-03T23:48:03.502Z',
          duration: '27 days',
          totalGained: 26881,
          participants: [
            {
              id: 37,
              username: 'psikoi',
              displayName: 'Psikoi',
              type: 'regular',
              build: 'main',
              flagged: false,
              updatedAt: '2020-04-04T22:35:31.530Z',
              progress: {
                start: 5481946,
                end: 5505921,
                gained: 23975
              },
              history: [
                {
                  date: '2020-03-22T19:56:09.000Z',
                  value: 5481946
                },
                {
                  date: '2020-04-03T23:58:28.554Z',
                  value: 5492446
                },
                {
                  date: '2020-04-04T00:35:51.715Z',
                  value: 5494371
                },
                {
                  date: '2020-04-04T16:04:46.000Z',
                  value: 5498396
                },
                {
                  date: '2020-04-04T22:35:31.463Z',
                  value: 5505921
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
          message: 'Invalid competition id.'
        }
      },
      {
        description: 'If the given id does not exist.',
        body: {
          message: 'Competition of id 4553 was not found.'
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
      startsAt: '2020-05-20T19:00:00.000Z',
      endsAt: '2020-05-27T19:00:00.000Z',
      participants: ['Zezima', 'Psikoi']
    },
    successResponses: [
      {
        description: '',
        body: {
          id: 56,
          title: 'SOTW 52 - Fishing',
          metric: 'fishing',
          verificationCode: '373-418-957',
          startsAt: '2020-05-20T19:00:00.000Z',
          endsAt: '2020-05-27T19:00:00.000Z',
          score: 0,
          updatedAt: '2020-03-27T23:00:44.588Z',
          createdAt: '2020-03-27T23:00:44.588Z',
          participants: [
            {
              id: 37,
              username: 'psikoi',
              displayName: 'Psikoi',
              type: 'regular',
              build: 'main',
              flagged: false,
              lastImportedAt: '2020-03-27T21:56:50.000Z',
              registeredAt: '2020-03-13T23:29:57.000Z',
              updatedAt: '2020-03-27T21:56:50.000Z'
            },
            {
              id: 45,
              username: 'zezima',
              displayName: 'Zezima',
              type: 'regular',
              build: 'main',
              flagged: false,
              lastImportedAt: '2020-03-15T02:21:49.000Z',
              registeredAt: '2020-03-15T02:21:46.000Z',
              updatedAt: '2020-03-15T02:21:49.000Z'
            }
          ]
        }
      }
    ],
    errorResponses: [
      {
        description: 'If no title is given,',
        body: { message: 'Invalid competition title.' }
      },
      {
        description: 'If no metric is given,',
        body: { message: 'Invalid competition metric.' }
      },
      {
        description: 'If startsAt is not a valid date.',
        body: { message: 'Invalid start date.' }
      },
      {
        description: 'If startsAt is not a valid date.',
        body: { message: 'Invalid start date.' }
      },
      {
        description: 'If endsAt is not a valid date.',
        body: { message: 'Invalid end date.' }
      },
      {
        description: 'If startsAt OR endsAt is a past date.',
        body: { message: 'Start date must be before the end date.' }
      },
      {
        description: "If one of the participant' usernames is invalid",
        body: { message: 'Invalid player username: Crazy@@Name' }
      },
      {
        description: 'If a groupId is supplied but does not exist',
        body: { message: 'Invalid group id.' }
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
          id: 56,
          title: 'New title',
          metric: 'fishing',
          score: 0,
          startsAt: '2020-05-20T19:00:00.000Z',
          endsAt: '2020-05-27T19:00:00.000Z',
          updatedAt: '2020-03-27T23:00:44.588Z',
          createdAt: '2020-03-27T23:00:44.588Z',
          participants: [
            {
              id: 37,
              username: 'psikoi',
              displayName: 'Psikoi',
              type: 'regular',
              build: 'main',
              flagged: false,
              lastImportedAt: '2020-04-04T22:33:53.450Z',
              registeredAt: '2020-04-03T21:43:17.574Z',
              updatedAt: '2020-04-04T22:35:31.530Z'
            },
            {
              id: 42,
              username: 'zulu',
              displayName: 'Zulu',
              type: 'unknown',
              build: 'main',
              flagged: false,
              lastImportedAt: null,
              registeredAt: '2020-04-03T23:48:03.561Z',
              updatedAt: '2020-04-04T16:43:30.787Z'
            },
            {
              id: 46,
              username: 'another',
              displayName: 'Another',
              type: 'unknown',
              build: 'main',
              flagged: false,
              lastImportedAt: null,
              registeredAt: '2020-04-04T23:44:53.755Z',
              updatedAt: '2020-04-04T23:44:53.755Z'
            }
          ]
        }
      }
    ],
    errorResponses: [
      {
        description: 'If id is not given.',
        body: { message: 'Invalid competition id.' }
      },
      {
        description: 'If endsAt is given but not valid.',
        body: { message: 'Invalid end date.' }
      },
      {
        description: 'If startsAt is given but not valid.',
        body: { message: 'Invalid start date.' }
      },
      {
        description: 'If the competition of an id cannot be found.',
        body: { message: 'Competition of id 5667 was not found.' }
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
        body: { message: 'Invalid verification code.' }
      },
      {
        description: 'If the verification code is not correct.',
        body: { message: 'Incorrect verification code.' }
      },
      {
        description: "If one of the participant' usernames is invalid",
        body: { message: 'Invalid player username: Crazy@@Name' }
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
        description: 'If id is not given.',
        body: { message: 'Invalid competition id.' }
      },
      {
        description: 'If the competition of an id cannot be found.',
        body: { message: 'Competition of id 5667 was not found.' }
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
      participants: ['Psikoi']
    },
    successResponses: [
      {
        description: '',
        body: {
          newParticipants: [
            {
              id: 37,
              username: 'psikoi',
              displayName: 'Psikoi',
              type: 'regular',
              build: 'main',
              flagged: false,
              updatedAt: '2020-04-04T23:59:58.661Z',
              registeredAt: '2020-04-04T23:59:58.661Z',
              lastImportedAt: null
            }
          ]
        }
      }
    ],
    errorResponses: [
      {
        description: 'If id is not given.',
        body: { message: 'Invalid competition id.' }
      },
      {
        description: 'If participants is invalid or empty.',
        body: { message: 'Invalid participants list' }
      },
      {
        description: 'If competition of id could not be found.',
        body: { message: 'Competition of id 7677 was not found.' }
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
        description: 'If all the participants are already participating.',
        body: { message: 'All players given are already competing.' }
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
        description: 'If id is not given.',
        body: { message: 'Invalid competition id.' }
      },
      {
        description: 'If participants is invalid or empty.',
        body: { message: 'Invalid participants list' }
      },
      {
        description: 'If competition of id could not be found.',
        body: { message: 'Competition of id 7677 was not found.' }
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
          message: '19 players are being updated. This can take up to a few minutes.'
        }
      }
    ],
    errorResponses: [
      {
        description: 'If id is not given.',
        body: { message: 'Invalid competition id.' }
      },
      {
        description:
          "If the competition's participants list is invalid, empty or every participant has been updated in the last 60 minutes",
        body: { message: 'This competition has no participants that should be updated' }
      }
    ]
  }
];
