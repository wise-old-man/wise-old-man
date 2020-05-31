export default [
  {
    title: 'Search players',
    url: '/players/search',
    method: 'GET',
    comments: [
      {
        type: 'info',
        content: 'This will only return the top 20 player results.'
      }
    ],
    query: [
      {
        field: 'username',
        type: 'string',
        description: 'A partial username match.'
      }
    ],
    successResponses: [
      {
        description: 'Username param set to "iron".',
        body: [
          {
            id: 44,
            username: 'Iron Mammal',
            type: 'ironman',
            lastImportedAt: null,
            registeredAt: '2020-04-04T21:48:19.197Z',
            updatedAt: '2020-04-04T21:48:29.235Z',
            combatLevel: 126
          },
          {
            id: 45,
            username: 'Iron Faux',
            type: 'regular',
            lastImportedAt: null,
            registeredAt: '2020-04-04T21:48:31.367Z',
            updatedAt: '2020-04-04T21:48:39.636Z',
            combatLevel: 124
          }
        ]
      }
    ],
    errorResponses: [
      {
        description: 'If no username is given.',
        body: {
          message: 'Invalid username.'
        }
      }
    ]
  },
  {
    title: 'View player',
    url: '/players',
    method: 'GET',
    comments: [
      {
        type: 'warning',
        content: 'If both "username" and "id" are given in the query params, "id" will be ignored.'
      }
    ],
    query: [
      {
        field: 'id',
        type: 'integer',
        description: "The player's id."
      },
      {
        field: 'username',
        type: 'string',
        description: "The player's username."
      }
    ],
    successResponses: [
      {
        description: 'Note: parts of the response were ommitted for demo purposes.',
        body: {
          id: 37,
          username: 'Psikoi',
          type: 'regular',
          lastImportedAt: '2020-04-03T21:43:21.899Z',
          registeredAt: '2020-04-03T21:43:17.574Z',
          updatedAt: '2020-04-04T16:43:36.230Z',
          combatLevel: 125,
          latestSnapshot: {
            createdAt: '2020-04-04T16:43:36.219Z',
            importedAt: null,
            overall: {
              rank: 30400,
              experience: 269828205
            },
            attack: {
              rank: 12158,
              experience: 27216011
            }
          }
        }
      }
    ],
    errorResponses: [
      {
        description: 'If no id or username are given.',
        body: {
          message: 'Invalid player id.'
        }
      },
      {
        description: 'If an id is given but does not exist.',
        body: {
          message: 'Player of id 5767 is not being tracked yet.'
        }
      },
      {
        description: 'If an username is given but does not exist.',
        body: {
          message: 'someUsername is not being tracked yet.'
        }
      }
    ]
  },
  {
    title: 'Track player',
    url: '/players/track',
    method: 'POST',
    comments: [
      {
        type: 'info',
        content:
          "If the player's type is unknown, this will trigger a \
          job to determine the player's type."
      },
      {
        type: 'info',
        content:
          "If the player hasn't been imported from CML within the \
          last 24 hours, this will trigger a job to import the player's history from CML."
      }
    ],
    body: {
      username: 'psikoi'
    },
    successResponses: [
      {
        description: 'Note: parts of the response were ommitted for demo purposes.',
        body: {
          id: 37,
          username: 'Psikoi',
          type: 'regular',
          lastImportedAt: '2020-04-03T21:43:21.899Z',
          registeredAt: '2020-04-03T21:43:17.574Z',
          updatedAt: '2020-04-04T22:33:51.594Z',
          combatLevel: 125,
          latestSnapshot: {
            createdAt: '2020-04-04T22:33:51.567Z',
            importedAt: null,
            overall: {
              rank: 30420,
              experience: 269900478
            },
            attack: {
              rank: 12159,
              experience: 27216011
            }
          }
        }
      }
    ],
    errorResponses: [
      {
        description: 'If no username is given.',
        body: {
          message: 'Invalid username.'
        }
      },
      {
        description: 'If the player was updated too recently (< 60 seconds)',
        body: {
          message: 'Failed to update: psikoi was updated 43 seconds ago.'
        }
      },
      {
        description:
          'If the username does not exist (in Runescape) OR failed to fetch from the hiscores.',
        body: {
          message: 'Failed to load hiscores: Invalid username'
        }
      }
    ]
  },
  {
    title: 'Assert player type (reassign)',
    url: '/players/assert-type',
    method: 'POST',
    body: {
      username: 'psikoi'
    },
    successResponses: [
      {
        description: '',
        body: {
          type: 'regular'
        }
      }
    ],
    errorResponses: [
      {
        description: 'If no username is given.',
        body: {
          message: 'Invalid username.'
        }
      },
      {
        description: 'If the username is not tracked.',
        body: {
          message: 'Invalid player: Psikoi is not being tracked yet.'
        }
      },
      {
        description: 'If the API fails to fetch initial (regular) hiscores data.',
        body: {
          message: "Couldn't find player Psikoi in the hiscores."
        }
      }
    ]
  },
  {
    title: 'Assert player display name (correct capitalization)',
    url: '/players/assert-name',
    method: 'POST',
    body: {
      username: 'thelotto'
    },
    successResponses: [
      {
        description: '',
        body: {
          displayName: 'TheLotto'
        }
      }
    ],
    errorResponses: [
      {
        description: 'If no username is given.',
        body: {
          message: 'Invalid username.'
        }
      },
      {
        description: 'If the username is not tracked.',
        body: {
          message: 'Invalid player: thelotto is not being tracked yet.'
        }
      },
      {
        description: 'If the API fails to fetch hiscores data.',
        body: {
          message: "Couldn't find a name match for thelotto."
        }
      }
    ]
  },
  {
    title: 'Import player',
    url: '/players/import',
    method: 'POST',
    comments: [
      {
        type: 'info',
        content:
          "If the player's has been imported before, this will only import the CML history \
          since the last import, otherwise it will import all the existing history."
      }
    ],
    body: {
      username: 'psikoi'
    },
    successResponses: [
      {
        description: '',
        body: {
          message: '157 snapshots imported from CML.'
        }
      }
    ],
    errorResponses: [
      {
        description: 'If no username is given.',
        body: {
          message: 'Invalid username.'
        }
      },
      {
        description: 'If the player was imported too recently (< 24 hours)',
        body: {
          message: 'Imported too soon, please wait another 1354 minutes.'
        }
      },
      {
        description: 'If the username does not exist (in CML) OR failed to fetch from CML.',
        body: {
          message: 'Failed to load history from CML.'
        }
      }
    ]
  }
];
