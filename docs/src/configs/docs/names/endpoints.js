export default [
  {
    title: 'View name changes list',
    url: '/names',
    method: 'GET',
    query: [
      {
        field: 'username',
        type: 'string',
        description: 'A partial username search, for either the old or new username - Optional'
      },
      {
        field: 'status',
        type: 'integer',
        description: 'The name change status - Optional (0 = pending, 1 = denied, 2 = approved)'
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
            id: 2,
            playerId: 17436,
            oldName: 'chaany',
            newName: 'carrete',
            status: 0,
            resolvedAt: null,
            createdAt: '2020-08-04T04:38:35.942Z',
            updatedAt: '2020-08-04T04:38:35.942Z'
          },
          {
            id: 1,
            playerId: 17996,
            oldName: 'the daylight',
            newName: 'new game',
            status: 0,
            resolvedAt: null,
            createdAt: '2020-08-04T02:22:52.685Z',
            updatedAt: '2020-08-04T02:22:52.685Z'
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
    title: 'Submit name change request',
    url: '/names',
    method: 'POST',
    comments: [
      {
        type: 'warning',
        content: 'These requests still have to be approved or denied.'
      }
    ],
    body: {
      oldName: 'Zezima',
      newName: 'Lynx Titan'
    },
    successResponses: [
      {
        description: '',
        body: {
          id: 12,
          playerId: 13432,
          status: 0,
          oldName: 'zezima',
          newName: 'lynx titan',
          updatedAt: '2020-08-05T23:58:04.194Z',
          createdAt: '2020-08-05T23:58:04.194Z',
          resolvedAt: null
        }
      }
    ],
    errorResponses: [
      {
        description: 'If the old name is empty or undefined.',
        body: { message: "Parameter 'oldName' is undefined." }
      },
      {
        description: 'If the old name is not a valid RSN.',
        body: { message: 'Invalid old name.' }
      },
      {
        description: 'If the new name is empty or undefined.',
        body: { message: "Parameter 'newName' is undefined." }
      },
      {
        description: 'If the new name is not a valid RSN.',
        body: { message: 'Invalid new name.' }
      },
      {
        description: 'If both names are the same.',
        body: { message: 'Old and new names must be different.' }
      },
      {
        description: 'If the old name is not a registered player.',
        body: { message: "Player 'zezima' is not tracked yet." }
      },
      {
        description: 'If there already is a similar pending name change request (same names).',
        body: { message: "There's already a similar pending name change. (Id: 1456)" }
      },
      {
        description: "If this exact name change has been approved. (newName's last name was oldName)",
        body: { message: 'Cannot submit a duplicate (approved) name change. (Id: 1456)' }
      }
    ]
  },
  {
    title: 'Submit multiple name change requests (bulk)',
    url: '/names/bulk',
    method: 'POST',
    comments: [
      {
        type: 'warning',
        content: 'These requests still have to be approved or denied.'
      }
    ],
    body: [
      {
        oldName: 'cometz',
        newName: 'zezima'
      },
      {
        oldName: 'Psikoi',
        newName: 'Psikoi V2'
      },
      {
        oldName: 'lynx titan',
        newName: 'Zulu'
      }
    ],
    successResponses: [
      {
        description: '',
        body: {
          message: 'Successfully submitted 2/3 name changes.'
        }
      }
    ],
    errorResponses: [
      {
        description: 'If the list provided is undefined or not an array.',
        body: { message: 'Invalid name change list format.' }
      },
      {
        description: 'If the list provided is empty.',
        body: { message: 'Empty name change list.' }
      },
      {
        description: 'If one of the name change objects does not have the correct format.',
        body: { message: 'All name change objects must have "oldName" and "newName" properties.' }
      },
      {
        description: 'If none of the name changes were successfully submitted.',
        body: { message: 'Could not find any valid name changes to submit.' }
      }
    ]
  },
  {
    title: 'See the name history for multiple players',
    url: '/names/history/bulk',
    method: 'POST',
    body: ['Psikoi', 'USBC', 'Zezima', 'NoChange'],
    successResponses: [
      {
        body: [
          {
            username: 'psikoi',
            history: [
              {
                oldName: 'man',
                newName: 'psikoi',
                resolvedAt: '2020-08-06T23:45:39.233Z'
              },
              {
                oldName: 'old',
                newName: 'man',
                resolvedAt: '2020-06-06T23:45:39.233Z'
              },
              {
                oldName: 'wise',
                newName: 'old',
                resolvedAt: '2020-05-06T23:45:39.233Z'
              }
            ]
          },
          {
            username: 'zezima',
            history: [
              {
                oldName: 'notzezima',
                newName: 'zezima',
                resolvedAt: '2020-01-06T23:45:39.233Z'
              }
            ]
          },
          {
            username: 'usbc',
            history: [
              {
                oldName: 'usba',
                newName: 'usbc',
                resolvedAt: '2020-04-06T23:45:39.233Z'
              }
            ]
          }
        ]
      }
    ],
    errorResponses: [
      {
        description: 'If the list provided is undefined or not an array.',
        body: { message: 'Invalid format, needs to be an array of usernames.' }
      },
      {
        description: 'If the list provided is empty.',
        body: { message: 'Empty username list.' }
      }
    ]
  },
  {
    title: 'View name change details',
    url: '/names/:id',
    method: 'GET',
    comments: [
      {
        type: 'warning',
        content: 'This endpoint is dependant on the OSRS hiscores and might fail with a status code 500.'
      }
    ],
    params: [
      {
        field: 'id',
        type: 'integer',
        description: "The name change's id."
      }
    ],
    successResponses: [
      {
        description: 'Both old and new stats have been shortened for demo purposes.',
        body: {
          nameChange: {
            id: 20,
            playerId: 1135,
            oldName: 'zezima',
            newName: 'lynx titan',
            status: 0,
            resolvedAt: null,
            createdAt: '2020-08-06T23:45:39.233Z',
            updatedAt: '2020-08-06T23:45:39.233Z'
          },
          data: {
            isNewOnHiscores: true,
            isOldOnHiscores: true,
            isNewTracked: true,
            hasNegativeGains: true,
            timeDiff: 887945262,
            hoursDiff: 246.65146166666668,
            ehpDiff: 326.3400955991692,
            ehbDiff: 38.76305502330092,
            oldStats: {
              createdAt: '2020-07-27T17:06:41.216Z',
              importedAt: null,
              overall: {
                rank: 643297,
                experience: 27957906,
                ehp: 170.56992
              },
              attack: {
                rank: 663558,
                experience: 1343681
              },
              zalcano: {
                rank: -1,
                kills: -1
              },
              zulrah: {
                rank: -1,
                kills: -1
              }
            },
            newStats: {
              overall: {
                rank: 145933,
                experience: 126187091,
                ehp: 14962.45
              },
              attack: {
                rank: 177802,
                experience: 13034719
              },
              defence: {
                rank: 182600,
                experience: 9488036
              },
              vorkath: {
                rank: -1,
                kills: -1
              },
              wintertodt: {
                rank: 419344,
                kills: 50
              },
              zalcano: {
                rank: -1,
                kills: -1
              },
              zulrah: {
                rank: 74736,
                kills: 747
              }
            }
          }
        }
      }
    ],
    errorResponses: [
      {
        description: 'If the id param is not a number.',
        body: { message: "Parameter 'id' is not a valid number." }
      },
      {
        description: 'If the name change could not be found (by id)',
        body: { message: 'Name change id was not found.' }
      },
      {
        description: 'If the OSRS hiscores fail to load.',
        body: { message: 'Failed to load hiscores: Service is unavailable' }
      }
    ]
  }
];
