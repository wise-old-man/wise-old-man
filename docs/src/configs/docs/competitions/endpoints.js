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
        field: 'type',
        type: 'string',
        description: 'The type to filter the list by. (See accepted values above) - Optional'
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
            type: 'classic',
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
        description: 'If type is given but is not valid.',
        body: {
          message: 'Invalid type.'
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
        description: 'Classic competition',
        body: {
          id: 681,
          title: 'Road to 99 Agility',
          metric: 'agility',
          type: 'classic',
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
      },
      {
        description: 'Team competition (note the teamName property)',
        body: {
          id: 681,
          title: 'Road to 99 Agility',
          metric: 'agility',
          type: 'classic',
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
              teamName: 'Warriors',
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
          'For non-group competitions, the response will contain a "verificationCode". \
          This code must be stored as it is not possible to edit or delete the \
          competition at a later date without it.'
      },
      {
        type: 'info',
        content:
          "Instead of an array of participants or teams, you can instead supply the values \
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
    altBody: {
      title: 'SOTW 52 - Fishing',
      metric: 'fishing',
      startsAt: '2020-12-21T19:00:00.000Z',
      endsAt: '2020-12-27T19:00:00.000Z',
      teams: [
        {
          name: 'Warriors',
          participants: ['Psikoi', 'Zezima', 'Lynx Titan']
        },
        {
          name: 'Spartans',
          participants: ['Rorro', 'Sethmare', 'Iron Mammal']
        }
      ]
    },
    successResponses: [
      {
        description: 'Created a classic competition',
        body: {
          score: 0,
          id: 977,
          title: 'Something smells fishy',
          metric: 'fishing',
          type: 'classic',
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
      },
      {
        description: 'Created a tem competition (notice the "teamName" property for every player)',
        body: {
          score: 0,
          id: 977,
          title: 'Something smells fishy',
          metric: 'fishing',
          type: 'team',
          verificationCode: '368-456-551',
          startsAt: '2020-12-21T19:00:00.000Z',
          endsAt: '2020-12-27T19:00:00.000Z',
          groupId: null,
          updatedAt: '2020-12-21T15:24:08.864Z',
          createdAt: '2020-12-21T15:24:08.864Z',
          participants: [
            {
              exp: 330476,
              id: 5177,
              username: 'zezima',
              displayName: 'Zezima',
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
              updatedAt: '2020-12-20T23:00:56.775Z',
              teamName: 'Warriors'
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
              updatedAt: '2020-12-20T23:00:56.775Z',
              teamName: 'Spartans'
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
        body: { message: 'Invalid competition metric.' }
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
        body: { message: 'Invalid dates: All start and end dates must be in the future.' }
      },
      {
        description: 'If end date comes before start date.',
        body: { message: 'Start date must be before the end date.' }
      },
      {
        description: "If one or more of the participant' usernames is invalid",
        body: {
          message:
            '1 Invalid usernames: Names must be 1-12 characters long,\n         contain no special characters, and/or contain no space at the beginning or end of the name.',
          data: ['Zez%%ima']
        }
      },
      {
        description: 'If a groupId is supplied but does not exist',
        body: { message: 'Group not found.' }
      },
      {
        description: 'If a groupId is supplied but groupVerificationCode is not.',
        body: { message: 'Invalid verification code.' }
      },
      {
        description:
          "If a groupVerificationCode is supplied but does match the group's actual verification code.",
        body: { message: 'Incorrect group verification code.' }
      },
      {
        description: 'If an empty teams list is supplied.',
        body: { message: 'Invalid or empty teams list.' }
      },
      {
        description: 'If one of the supplied teams is missing a "name" property.',
        body: { message: 'All teams must have a name property.' }
      },
      {
        description: 'If one of the supplied team names are repeated.',
        body: { message: 'Found repeated team names: [hello, goodbye]' }
      },
      {
        description: 'If one of the supplied teams is missing a "participants" array.',
        body: { message: 'All teams must have a valid (non-empty) array of participants.' }
      },
      {
        description: 'If one of the supplied teams participants has an invalid username (non-string).',
        body: { message: 'All participant names must be valid strings.' }
      },
      {
        description: 'If one of the supplied teams participants have repeated usernames.',
        body: { message: 'Found repeated usernames: [zezima, cometz]' }
      },
      {
        description: 'If both the "groupId" and "participants" properties are in the request body.',
        body: {
          message:
            'Cannot include both "participants" and "groupId", they are mutually exclusive.  All group members will be registered as participants instead.'
        }
      },
      {
        description: 'If both the "teams" and "participants" properties are in the request body.',
        body: { message: 'Cannot include both "participants" and "teams", they are mutually exclusive.' }
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
      },
      {
        type: 'error',
        content: 'If a list of teams is supplied, it will replace any existing teams list.'
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
    altBody: {
      title: 'New title',
      verificationCode: '373-418-957',
      teams: [
        {
          name: 'Warriors',
          participants: ['Psikoi', 'Zezima', 'Lynx Titan']
        },
        {
          name: 'Spartans',
          participants: ['Rorro', 'Sethmare', 'Iron Mammal']
        }
      ]
    },
    successResponses: [
      {
        description: 'Created a classic competition',
        body: {
          score: 0,
          id: 977,
          title: 'Something smells fishy',
          metric: 'fishing',
          type: 'classic',
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
      },
      {
        description: 'Created a tem competition (notice the "teamName" property for every player)',
        body: {
          score: 0,
          id: 977,
          title: 'Something smells fishy',
          metric: 'fishing',
          type: 'team',
          verificationCode: '368-456-551',
          startsAt: '2020-12-21T19:00:00.000Z',
          endsAt: '2020-12-27T19:00:00.000Z',
          groupId: null,
          updatedAt: '2020-12-21T15:24:08.864Z',
          createdAt: '2020-12-21T15:24:08.864Z',
          participants: [
            {
              exp: 330476,
              id: 5177,
              username: 'zezima',
              displayName: 'Zezima',
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
              updatedAt: '2020-12-20T23:00:56.775Z',
              teamName: 'Warriors'
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
              updatedAt: '2020-12-20T23:00:56.775Z',
              teamName: 'Spartans'
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
        body: { message: 'Validation error: Start date must be a valid date.' }
      },
      {
        description: 'If end date comes before start date.',
        body: { message: 'Start date must be before the end date.' }
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
        body: {
          message: {
            message:
              '1 Invalid usernames: Names must be 1-12 characters long,\n         contain no special characters, and/or contain no space at the beginning or end of the name.',
            data: ['Zu@lu']
          }
        }
      },
      {
        description: 'If an empty teams list is supplied.',
        body: { message: 'Invalid or empty teams list.' }
      },
      {
        description: 'If one of the supplied teams is missing a "name" property.',
        body: { message: 'All teams must have a name property.' }
      },
      {
        description: 'If one of the supplied team names are repeated.',
        body: { message: 'Found repeated team names: [hello, goodbye]' }
      },
      {
        description: 'If one of the supplied teams is missing a "participants" array.',
        body: { message: 'All teams must have a valid (non-empty) array of participants.' }
      },
      {
        description: 'If one of the supplied teams participants has an invalid username (non-string).',
        body: { message: 'All participant names must be valid strings.' }
      },
      {
        description: 'If one of the supplied teams participants have repeated usernames.',
        body: { message: 'Found repeated usernames: [zezima, cometz]' }
      },
      {
        description: 'If trying to add teams to a classic competition.',
        body: { message: "The competition type cannot be changed to 'team'." }
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
        body: {
          message:
            'Validation error: Username cannot contain any special characters.,\nValidation error: Display name cannot contain any special characters.'
        }
      },
      {
        description: 'If the competition is of type "team".',
        body: { message: 'Cannot add participants to a team competition.' }
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
          message: 'Successfully removed 1 participants from "SOTW 53 Hunter".'
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
      },
      {
        description: 'If the competition is of type "team".',
        body: { message: 'Cannot remove participants from a team competition.' }
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
          message:
            '19 outdated (updated < 60 mins ago) players are being updated. This can take up to a few minutes.'
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
  },
  {
    title: 'Add teams',
    url: '/competitions/:id/add-teams',
    method: 'POST',
    params: [
      {
        field: 'id',
        type: 'integer',
        description: "The competition's id."
      }
    ],
    body: {
      verificationCode: '213-562-275',
      teams: [
        {
          name: 'Warriors',
          participants: ['Psikoi', 'Zezima', 'Lynx Titan']
        },
        {
          name: 'Spartans',
          participants: ['Zulu', 'Iron Mammal']
        }
      ]
    },
    successResponses: [
      {
        description: '',
        body: {
          newTeams: [
            {
              teamName: 'Warriors',
              participants: [
                {
                  exp: 291331014,
                  id: 3,
                  username: 'psikoi',
                  displayName: 'Psikoi',
                  type: 'regular',
                  build: 'main',
                  flagged: false,
                  ehp: 964.21929,
                  ehb: 292.20288,
                  ttm: 458.77411,
                  tt200m: 13998.23176,
                  lastImportedAt: null,
                  lastChangedAt: '2021-01-14T21:15:21.254Z',
                  registeredAt: '2021-01-12T23:49:23.645Z',
                  updatedAt: '2021-01-14T21:15:21.298Z'
                },
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
                  lastImportedAt: null,
                  lastChangedAt: '2021-01-14T21:15:21.068Z',
                  registeredAt: '2021-01-12T23:49:23.654Z',
                  updatedAt: '2021-01-14T21:15:21.120Z'
                },
                {
                  exp: 4600000000,
                  id: 8,
                  username: 'lynx titan',
                  displayName: 'Lynx Titan',
                  type: 'regular',
                  build: 'main',
                  flagged: false,
                  ehp: 14962.45105,
                  ehb: 0,
                  ttm: 0,
                  tt200m: 0,
                  lastImportedAt: null,
                  lastChangedAt: '2021-01-14T21:15:33.898Z',
                  registeredAt: '2021-01-12T23:49:23.657Z',
                  updatedAt: '2021-01-14T21:15:33.963Z'
                }
              ]
            },
            {
              teamName: 'Spartans',
              participants: [
                {
                  exp: 3333444130,
                  id: 7,
                  username: 'zulu',
                  displayName: 'Zulu',
                  type: 'regular',
                  build: 'main',
                  flagged: false,
                  ehp: 7131.68217,
                  ehb: 3545.28276,
                  ttm: 0,
                  tt200m: 7830.76888,
                  lastImportedAt: null,
                  lastChangedAt: '2021-01-14T21:15:39.114Z',
                  registeredAt: '2021-01-12T23:49:23.657Z',
                  updatedAt: '2021-01-14T21:15:39.163Z'
                },
                {
                  exp: 0,
                  id: 303,
                  username: 'iron mammal',
                  displayName: 'Iron Mammal',
                  type: 'unknown',
                  build: 'main',
                  flagged: false,
                  ehp: 0,
                  ehb: 0,
                  ttm: 0,
                  tt200m: 0,
                  lastImportedAt: null,
                  lastChangedAt: null,
                  registeredAt: '2021-01-15T23:11:52.024Z',
                  updatedAt: '2021-01-15T23:12:23.497Z'
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
        description: 'If the teams list is empty or undefined.',
        body: { message: 'Empty teams list.' }
      },
      {
        description: 'If the competition is of type "classic".',
        body: { message: "Teams can't be added to a classic competition." }
      },
      {
        description: 'If one of the supplied teams is missing a "name" property.',
        body: { message: 'All teams must have a name property.' }
      },
      {
        description: 'If one of the supplied team names are repeated.',
        body: { message: 'Found repeated team names: [hello, goodbye]' }
      },
      {
        description: 'If one of the supplied teams is missing a "participants" array.',
        body: { message: 'All teams must have a valid (non-empty) array of participants.' }
      },
      {
        description: 'If one of the supplied teams participants has an invalid username (non-string).',
        body: { message: 'All participant names must be valid strings.' }
      },
      {
        description: 'If one of the supplied teams participants have repeated usernames.',
        body: { message: 'Found repeated usernames: [zezima, cometz]' }
      }
    ]
  },
  {
    title: 'Remove teams',
    url: '/competitions/:id/remove-teams',
    method: 'POST',
    params: [
      {
        field: 'id',
        type: 'integer',
        description: "The competition's id."
      }
    ],
    body: {
      verificationCode: '262-315-143',
      teamNames: ['Warriors']
    },
    successResponses: [
      {
        description: '',
        body: {
          message: 'Successfully removed 3 participants from "RSPT Hunter SOTW".'
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
      },
      {
        description: 'If the team names list is empty or undefined.',
        body: { message: 'Empty team names list.' }
      },
      {
        description: 'If the competition is of type "classic".',
        body: { message: 'Cannot remove teams from a classic competition.' }
      },
      {
        description: 'If one of the supplied team names is not a valid string.',
        body: { message: 'All team names must be non-empty strings.' }
      },
      {
        description: 'If no players were found removed from the competition.',
        body: { message: 'No players were removed from the competition.' }
      }
    ]
  }
];
