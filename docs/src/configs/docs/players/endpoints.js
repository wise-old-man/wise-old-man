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
        description: 'Username param set to "iron". (Only showing 3 for demonstration purposes)',
        body: [
          {
            exp: 0,
            id: 28814,
            username: 'ironic dart',
            displayName: 'Ironic Dart',
            type: 'ironman',
            build: 'main',
            flagged: false,
            ehp: 0,
            ehb: 0,
            ttm: 0,
            tt200m: 0,
            lastImportedAt: '2020-08-09T09:08:42.573Z',
            lastChangedAt: null,
            registeredAt: '2020-07-31T09:41:00.833Z',
            updatedAt: '2020-08-09T21:16:42.420Z'
          },
          {
            exp: 0,
            id: 28926,
            username: 'iron dazakio',
            displayName: 'Iron Dazakio',
            type: 'unknown',
            build: 'main',
            flagged: false,
            ehp: 0,
            ehb: 0,
            ttm: 0,
            tt200m: 0,
            lastImportedAt: null,
            lastChangedAt: null,
            registeredAt: '2020-07-31T22:33:17.388Z',
            updatedAt: '2020-07-31T22:33:17.388Z'
          },
          {
            exp: 2330854,
            id: 55289,
            username: 'iron lopez',
            displayName: 'iron lopez',
            type: 'hardcore',
            build: 'main',
            flagged: false,
            ehp: 26.42324,
            ehb: 0,
            ttm: 1777.75902,
            tt200m: 22732.33811,
            lastImportedAt: null,
            lastChangedAt: null,
            registeredAt: '2020-10-22T22:35:02.074Z',
            updatedAt: '2020-10-22T22:35:30.217Z'
          }
        ]
      }
    ],
    errorResponses: [
      {
        description: 'If no username is given.',
        body: {
          message: "Parameter 'username' is undefined."
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
          exp: 291212780,
          id: 3,
          username: 'psikoi',
          displayName: 'Psikoi',
          type: 'regular',
          build: 'main',
          flagged: false,
          ehp: 963.93983,
          ehb: 292.20288,
          ttm: 459.05356,
          tt200m: 13998.51122,
          lastImportedAt: '2020-12-30T11:48:58.265Z',
          lastChangedAt: '2020-12-30T11:48:56.787Z',
          registeredAt: '2020-12-15T12:04:12.669Z',
          updatedAt: '2020-12-30T11:53:24.316Z',
          combatLevel: 125,
          latestSnapshot: {
            createdAt: '2020-12-30T11:53:24.277Z',
            importedAt: null,
            overall: {
              rank: 37130,
              experience: 291212780,
              ehp: 963.93983
            },
            attack: {
              rank: 15800,
              experience: 27505365,
              ehp: 84.63189
            },
            ehp: {
              rank: 4,
              value: 963.93983
            },
            ehb: {
              rank: 3,
              value: 292.20288
            }
          }
        }
      }
    ],
    errorResponses: [
      {
        description: 'If no username is given.',
        body: {
          message: "Parameter 'username' is undefined."
        }
      },
      {
        description: 'If the player was updated too recently (< 60 seconds)',
        body: {
          message: 'Error: Zezima has been updated recently.'
        }
      },
      {
        description: 'If the username could not be found in the hiscores.',
        body: {
          message: 'Failed to load hiscores for urrgbgy.'
        }
      },
      {
        description: 'If the jagex servers failed to respond.',
        body: {
          message: 'Failed to load hiscores: Service is unavailable'
        }
      },
      {
        description: 'If the given name is not the correct length.',
        body: {
          message: "Validation error: Username must be between 1 and 12 characters long.,\nValidation error: Display name must be between 1 and 12 characters long."
        }
      },
      {
        description: 'If the given name is flagged for an unregistered name change.',
        body: {
          message: "Failed to update: Unregistered name change."
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
          message: "Parameter 'username' is undefined."
        }
      },
      {
        description: 'If the username is not tracked.',
        body: {
          message: 'Player not found.'
        }
      },
      {
        description: 'If the username could not be found in the hiscores.',
        body: {
          message: "Failed to load hiscores for Psikoi."
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
          message: "Parameter 'username' is undefined."
        }
      },
      {
        description: 'If the username is not tracked.',
        body: {
          message: 'Player not found.'
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
          message: "Parameter 'username' is undefined."
        }
      },
      {
        description: 'If the username is not tracked.',
        body: {
          message: 'Player not found.'
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
  },
  {
    title: 'View player details',
    urls: ['/players/:id', '/players/username/:username'],
    method: 'GET',
    comments: [
      {
        type: 'info',
        content: 'This endpoint has two valid URLs, by player id or username.'
      }
    ],
    params: [
      {
        field: 'id',
        type: 'integer',
        description: "The player's id. (Not required if username is supplied)"
      },
      {
        field: 'username',
        type: 'string',
        description: "The player's username. (Not required if id is supplied)"
      }
    ],
    successResponses: [
      {
        description: 'Note: parts of the response were ommitted for demo purposes.',
        body: {
          exp: 291212780,
          id: 3,
          username: 'psikoi',
          displayName: 'Psikoi',
          type: 'regular',
          build: 'main',
          flagged: false,
          ehp: 963.93983,
          ehb: 292.20288,
          ttm: 459.05356,
          tt200m: 13998.51122,
          lastImportedAt: '2020-12-30T12:22:28.196Z',
          lastChangedAt: '2020-12-30T11:48:56.787Z',
          registeredAt: '2020-12-15T12:04:12.669Z',
          updatedAt: '2020-12-30T12:22:28.196Z',
          combatLevel: 125,
          latestSnapshot: {
            createdAt: '2020-12-30T11:56:27.615Z',
            importedAt: null,
            overall: {
              rank: 37130,
              experience: 291212780,
              ehp: 963.93983
            },
            attack: {
              rank: 15800,
              experience: 27505365,
              ehp: 84.63189
            },
            ehp: {
              rank: 4,
              value: 963.93983
            },
            ehb: {
              rank: 3,
              value: 292.20288
            }
          }
        }
      }
    ],
    errorResponses: [
      {
        description: 'If an id or username is given but does not exist.',
        body: {
          message: 'Player not found.'
        }
      },
      {
        description: 'If an id is given but is not valid.',
        body: {
          message: "Parameter 'id' is not a valid number."
        }
      }
    ]
  },
  {
    title: 'View player competitions',
    urls: ['/players/:id/competitions', '/players/username/:username/competitions'],
    method: 'GET',
    comments: [
      {
        type: 'info',
        content: 'This endpoint has two valid URLs, by player id or username.'
      }
    ],
    params: [
      {
        field: 'id',
        type: 'integer',
        description: "The player's id. (Not required if username is supplied)"
      },
      {
        field: 'username',
        type: 'string',
        description: "The player's username. (Not required if id is supplied)"
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
        description: 'If a username is given but does not exist.',
        body: {
          message: 'Player not found.'
        }
      },
      {
        description: 'If an id is given but is not valid.',
        body: {
          message: "Parameter 'id' is not a valid number."
        }
      }
    ]
  },
  {
    title: 'View player achievements',
    urls: ['/players/:id/achievements', '/players/username/:username/achievements'],
    method: 'GET',
    comments: [
      {
        type: 'info',
        content: 'This endpoint has two valid URLs, by player id or username.'
      },
      {
        type: 'warning',
        content: 'If the achievement date is unknown, this will return it as "1970-01-01T00:00:00.000Z".'
      },
      {
        type: 'warning',
        content:
          'If includeMissing is true, any unachieved achievements will have "createdAt: null" and "missing: true"'
      }
    ],
    params: [
      {
        field: 'id',
        type: 'integer',
        description: "The player's id. (Not required if username is supplied)"
      },
      {
        field: 'username',
        type: 'string',
        description: "The player's username. (Not required if id is supplied)"
      }
    ],
    query: [
      {
        field: 'includeMissing',
        type: 'boolean',
        description: 'If true, it will return every achievement, even the unachieved - Optional'
      }
    ],
    successResponses: [
      {
        description: 'With includeMissing param set to false (Not showing the whole response)',
        body: [
          {
            playerId: 2,
            type: "500 K'ril Tsutsaroth kills",
            metric: 'kril_tsutsaroth',
            threshold: 500,
            createdAt: '1970-01-01T00:00:00.000Z'
          },
          {
            playerId: 2,
            type: '99 Strength',
            metric: 'strength',
            threshold: 13034431,
            createdAt: '2015-12-14T04:15:36.000Z'
          },
          {
            playerId: 2,
            type: '99 Hitpoints',
            metric: 'hitpoints',
            threshold: 13034431,
            createdAt: '2015-06-24T15:57:40.000Z'
          },
          {
            playerId: 2,
            type: '99 Ranged',
            metric: 'ranged',
            threshold: 13034431,
            createdAt: '2015-12-14T04:15:36.000Z'
          },
          {
            playerId: 2,
            type: '99 Attack',
            metric: 'attack',
            threshold: 13034431,
            createdAt: '2015-06-24T15:57:40.000Z'
          },
          {
            playerId: 2,
            type: '99 Defence',
            metric: 'defence',
            threshold: 13034431,
            createdAt: '2015-12-14T04:15:36.000Z'
          },
          {
            playerId: 2,
            type: '99 Magic',
            metric: 'magic',
            threshold: 13034431,
            createdAt: '2015-12-14T04:15:36.000Z'
          },
          {
            playerId: 2,
            type: '99 Woodcutting',
            metric: 'woodcutting',
            threshold: 13034431,
            createdAt: '2020-05-27T23:49:34.529Z'
          },
          {
            playerId: 2,
            type: '5k Zulrah kills',
            metric: 'zulrah',
            threshold: 5000,
            createdAt: '2020-05-27T23:49:34.532Z'
          },
          {
            playerId: 2,
            type: '99 Slayer',
            metric: 'slayer',
            threshold: 13034431,
            createdAt: '2018-01-21T18:02:52.000Z'
          },
          {
            playerId: 2,
            type: '99 Farming',
            metric: 'farming',
            threshold: 13034431,
            createdAt: '2019-10-15T23:37:08.000Z'
          },
          {
            playerId: 2,
            type: '500 Abyssal Sire kills',
            metric: 'abyssal_sire',
            threshold: 500,
            createdAt: '1970-01-01T00:00:00.000Z'
          },
          {
            playerId: 2,
            type: '500 Cerberus kills',
            metric: 'cerberus',
            threshold: 500,
            createdAt: '1970-01-01T00:00:00.000Z'
          },
          {
            playerId: 2,
            type: '500 Commander Zilyana kills',
            metric: 'commander_zilyana',
            threshold: 500,
            createdAt: '1970-01-01T00:00:00.000Z'
          },
          {
            playerId: 2,
            type: '500 General Graardor kills',
            metric: 'general_graardor',
            threshold: 500,
            createdAt: '1970-01-01T00:00:00.000Z'
          },
          {
            playerId: 2,
            type: '500 Zulrah kills',
            metric: 'zulrah',
            threshold: 500,
            createdAt: '1970-01-01T00:00:00.000Z'
          },
          {
            playerId: 2,
            type: '1k Abyssal Sire kills',
            metric: 'abyssal_sire',
            threshold: 1000,
            createdAt: '1970-01-01T00:00:00.000Z'
          },
          {
            playerId: 2,
            type: '1k Cerberus kills',
            metric: 'cerberus',
            threshold: 1000,
            createdAt: '1970-01-01T00:00:00.000Z'
          },
          {
            playerId: 2,
            type: '1k Commander Zilyana kills',
            metric: 'commander_zilyana',
            threshold: 1000,
            createdAt: '1970-01-01T00:00:00.000Z'
          },
          {
            playerId: 2,
            type: '1k Zulrah kills',
            metric: 'zulrah',
            threshold: 1000,
            createdAt: '1970-01-01T00:00:00.000Z'
          }
        ]
      },
      {
        description: 'With includeMissing param set to true (Not showing the whole response)',
        body: [
          {
            playerId: 2,
            type: "500 K'ril Tsutsaroth kills",
            metric: 'kril_tsutsaroth',
            threshold: 500,
            createdAt: '1970-01-01T00:00:00.000Z'
          },
          {
            playerId: 2,
            type: '99 Strength',
            metric: 'strength',
            threshold: 13034431,
            createdAt: '2015-12-14T04:15:36.000Z'
          },
          {
            playerId: 2,
            type: '99 Hitpoints',
            metric: 'hitpoints',
            threshold: 13034431,
            createdAt: '2015-06-24T15:57:40.000Z'
          },
          {
            playerId: 2,
            type: '99 Ranged',
            metric: 'ranged',
            threshold: 13034431,
            createdAt: '2015-12-14T04:15:36.000Z'
          },
          {
            playerId: 2,
            type: '99 Attack',
            metric: 'attack',
            threshold: 13034431,
            createdAt: '2015-06-24T15:57:40.000Z'
          },
          {
            playerId: 2,
            type: '99 Defence',
            metric: 'defence',
            threshold: 13034431,
            createdAt: '2015-12-14T04:15:36.000Z'
          },
          {
            playerId: 2,
            type: '99 Magic',
            metric: 'magic',
            threshold: 13034431,
            createdAt: '2015-12-14T04:15:36.000Z'
          },
          {
            playerId: 2,
            type: '99 Woodcutting',
            metric: 'woodcutting',
            threshold: 13034431,
            createdAt: '2020-05-27T23:49:34.529Z'
          },
          {
            playerId: 2,
            type: '5k Zulrah kills',
            metric: 'zulrah',
            threshold: 5000,
            createdAt: '2020-05-27T23:49:34.532Z'
          },
          {
            playerId: 2,
            type: '99 Slayer',
            metric: 'slayer',
            threshold: 13034431,
            createdAt: '2018-01-21T18:02:52.000Z'
          },
          {
            playerId: 2,
            type: '99 Farming',
            metric: 'farming',
            threshold: 13034431,
            createdAt: '2019-10-15T23:37:08.000Z'
          },
          {
            playerId: 2,
            type: '500 Abyssal Sire kills',
            metric: 'abyssal_sire',
            threshold: 500,
            createdAt: '1970-01-01T00:00:00.000Z'
          },
          {
            playerId: 2,
            type: '500 Cerberus kills',
            metric: 'cerberus',
            threshold: 500,
            createdAt: '1970-01-01T00:00:00.000Z'
          },
          {
            playerId: 2,
            type: '500 Commander Zilyana kills',
            metric: 'commander_zilyana',
            threshold: 500,
            createdAt: '1970-01-01T00:00:00.000Z'
          },
          {
            playerId: 2,
            type: '500 General Graardor kills',
            metric: 'general_graardor',
            threshold: 500,
            createdAt: '1970-01-01T00:00:00.000Z'
          },
          {
            playerId: 2,
            type: '500 Zulrah kills',
            metric: 'zulrah',
            threshold: 500,
            createdAt: '1970-01-01T00:00:00.000Z'
          },
          {
            playerId: 2,
            type: '1k Abyssal Sire kills',
            metric: 'abyssal_sire',
            threshold: 1000,
            createdAt: '1970-01-01T00:00:00.000Z'
          },
          {
            playerId: 2,
            type: '1k Cerberus kills',
            metric: 'cerberus',
            threshold: 1000,
            createdAt: '1970-01-01T00:00:00.000Z'
          },
          {
            playerId: 2,
            type: '1k Commander Zilyana kills',
            metric: 'commander_zilyana',
            threshold: 1000,
            createdAt: '1970-01-01T00:00:00.000Z'
          },
          {
            playerId: 2,
            type: '1k Zulrah kills',
            metric: 'zulrah',
            threshold: 1000,
            createdAt: '1970-01-01T00:00:00.000Z'
          },
          {
            playerId: 2,
            type: '50m Fletching',
            metric: 'fletching',
            threshold: 50000000,
            createdAt: null,
            missing: true,
            measure: 'experience'
          },
          {
            playerId: 2,
            type: '50m Fishing',
            metric: 'fishing',
            threshold: 50000000,
            createdAt: null,
            missing: true,
            measure: 'experience'
          },
          {
            playerId: 2,
            type: '50m Firemaking',
            metric: 'firemaking',
            threshold: 50000000,
            createdAt: null,
            missing: true,
            measure: 'experience'
          },
          {
            playerId: 2,
            type: '50m Crafting',
            metric: 'crafting',
            threshold: 50000000,
            createdAt: null,
            missing: true,
            measure: 'experience'
          },
          {
            playerId: 2,
            type: '50m Smithing',
            metric: 'smithing',
            threshold: 50000000,
            createdAt: null,
            missing: true,
            measure: 'experience'
          },
          {
            playerId: 2,
            type: '50m Mining',
            metric: 'mining',
            threshold: 50000000,
            createdAt: null,
            missing: true,
            measure: 'experience'
          },
          {
            playerId: 2,
            type: '50m Herblore',
            metric: 'herblore',
            threshold: 50000000,
            createdAt: null,
            missing: true,
            measure: 'experience'
          },
          {
            playerId: 2,
            type: '50m Agility',
            metric: 'agility',
            threshold: 50000000,
            createdAt: null,
            missing: true,
            measure: 'experience'
          },
          {
            playerId: 2,
            type: '50m Thieving',
            metric: 'thieving',
            threshold: 50000000,
            createdAt: null,
            missing: true,
            measure: 'experience'
          },
          {
            playerId: 2,
            type: '50m Slayer',
            metric: 'slayer',
            threshold: 50000000,
            createdAt: null,
            missing: true,
            measure: 'experience'
          }
        ]
      }
    ],
    errorResponses: []
  },
  {
    title: 'View player snapshots',
    urls: ['/players/:id/snapshots', '/players/username/:username/snapshots'],
    method: 'GET',
    comments: [
      {
        type: 'info',
        content: 'This endpoint has two valid URLs, by player id or username.'
      }
    ],
    params: [
      {
        field: 'id',
        type: 'integer',
        description: "The player's id. (Not required if username is supplied)"
      },
      {
        field: 'username',
        type: 'string',
        description: "The player's username. (Not required if id is supplied)"
      }
    ],
    query: [
      {
        field: 'period',
        type: 'string',
        description: 'The time period to filter the snapshots by (See accepted values above)'
      }
    ],
    successResponses: [
      {
        description: 'Not showing the whole response for demo purposes.',
        body: [
          {
            createdAt: '2020-12-30T11:56:27.615Z',
            importedAt: null,
            overall: {
              rank: 37130,
              experience: 291212780,
              ehp: 963.93983
            },
            attack: {
              rank: 15800,
              experience: 27505365
            },
            ehp: {
              rank: 3,
              value: 963.93983
            },
            ehb: {
              rank: 3,
              value: 292.20288
            }
          }
        ]
      }
    ],
    errorResponses: [
      {
        description: 'If period is given but is not valid.',
        body: {
          message: 'Invalid period: someInvalidPeriod'
        }
      },
      {
        description: 'If a username is given but does not exist.',
        body: {
          message: 'Player not found.'
        }
      },
      {
        description: 'If an id is given but is not valid.',
        body: {
          message: "Parameter 'id' is not a valid number."
        }
      }
    ]
  },
  {
    title: 'View player deltas (gained)',
    urls: ['/players/:id/gained', '/players/username/:username/gained'],
    method: 'GET',
    comments: [
      {
        type: 'info',
        content: 'This endpoint has two valid URLs, by player id or username.'
      },
      {
        type: 'warning',
        content: 'The response will be formatted into a json-friendlier format. See example below.'
      },
      {
        type: 'warning',
        content: 'If the "period" param is not supplied, it will return the deltas for all periods.'
      }
    ],
    params: [
      {
        field: 'id',
        type: 'integer',
        description: "The player's id. (Not required if username is supplied)"
      },
      {
        field: 'username',
        type: 'string',
        description: "The player's username. (Not required if id is supplied)"
      }
    ],
    query: [
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
          "6h": {
            "period": "6h",
            "startsAt": "2020-12-30T11:48:56.803Z",
            "endsAt": "2020-12-30T11:56:27.615Z",
            "data": {
              "overall": {
                "rank": {
                  "start": 37130,
                  "end": 37130,
                  "gained": 0
                },
                "experience": {
                  "start": 291212780,
                  "end": 291212780,
                  "gained": 0
                },
                "ehp": {
                  "start": 963.93983,
                  "end": 963.93983,
                  "gained": 0
                }
              },
              "attack": {
                "rank": {
                  "start": 15800,
                  "end": 15800,
                  "gained": 0
                },
                "experience": {
                  "start": 27505365,
                  "end": 27505365,
                  "gained": 0
                },
                "ehp": {
                  "start": 84.63189,
                  "end": 84.63189,
                  "gained": 0
                }
              }
            }
          },
          "day": {
            "period": "day",
            "startsAt": "2020-12-30T11:48:56.803Z",
            "endsAt": "2020-12-30T11:56:27.615Z",
            "data": {
              "overall": {
                "rank": {
                  "start": 37130,
                  "end": 37130,
                  "gained": 0
                },
                "experience": {
                  "start": 291212780,
                  "end": 291212780,
                  "gained": 0
                },
                "ehp": {
                  "start": 963.93983,
                  "end": 963.93983,
                  "gained": 0
                }
              },
              "attack": {
                "rank": {
                  "start": 15800,
                  "end": 15800,
                  "gained": 0
                },
                "experience": {
                  "start": 27505365,
                  "end": 27505365,
                  "gained": 0
                },
                "ehp": {
                  "start": 84.63189,
                  "end": 84.63189,
                  "gained": 0
                }
              }
            }
          },
          "week": {
            "period": "week",
            "startsAt": "2020-12-30T11:48:56.803Z",
            "endsAt": "2020-12-30T11:56:27.615Z",
            "data": {
              "overall": {
                "rank": {
                  "start": 37130,
                  "end": 37130,
                  "gained": 0
                },
                "experience": {
                  "start": 291212780,
                  "end": 291212780,
                  "gained": 0
                },
                "ehp": {
                  "start": 963.93983,
                  "end": 963.93983,
                  "gained": 0
                }
              },
              "attack": {
                "rank": {
                  "start": 15800,
                  "end": 15800,
                  "gained": 0
                },
                "experience": {
                  "start": 27505365,
                  "end": 27505365,
                  "gained": 0
                },
                "ehp": {
                  "start": 84.63189,
                  "end": 84.63189,
                  "gained": 0
                }
              }
            }
          },
          "month": {
            "period": "month",
            "startsAt": "2020-12-15T12:06:13.902Z",
            "endsAt": "2020-12-30T11:56:27.615Z",
            "data": {
              "overall": {
                "rank": {
                  "start": 38299,
                  "end": 37130,
                  "gained": -1169
                },
                "experience": {
                  "start": 287405870,
                  "end": 291212780,
                  "gained": 3806910
                },
                "ehp": {
                  "start": 957.32359,
                  "end": 963.93983,
                  "gained": 6.61624
                }
              },
              "attack": {
                "rank": {
                  "start": 15583,
                  "end": 15800,
                  "gained": 217
                },
                "experience": {
                  "start": 27505365,
                  "end": 27505365,
                  "gained": 0
                },
                "ehp": {
                  "start": 84.63189,
                  "end": 84.63189,
                  "gained": 0
                }
              }
            }
          },
          "year": {
            "period": "year",
            "startsAt": "2019-12-31T16:13:56.000Z",
            "endsAt": "2020-12-30T11:56:27.615Z",
            "data": {
              "overall": {
                "rank": {
                  "start": 27517,
                  "end": 37130,
                  "gained": 9613
                },
                "experience": {
                  "start": 263192784,
                  "end": 291212780,
                  "gained": 28019996
                },
                "ehp": {
                  "start": 888.52999,
                  "end": 963.93983,
                  "gained": 75.40984
                }
              },
              "attack": {
                "rank": {
                  "start": 11813,
                  "end": 15800,
                  "gained": 3987
                },
                "experience": {
                  "start": 26654876,
                  "end": 27505365,
                  "gained": 850489
                },
                "ehp": {
                  "start": 82.015,
                  "end": 84.63189,
                  "gained": 2.61689
                }
              }
            }
          }
        }
      },
      {
        description: 'Filtered by the period field (month) (Not showing the whole response)',
        body: {
          "period": "month",
          "startsAt": "2020-12-15T12:06:13.902Z",
          "endsAt": "2020-12-30T11:56:27.615Z",
          "data": {
            "overall": {
              "rank": {
                "start": 38299,
                "end": 37130,
                "gained": -1169
              },
              "experience": {
                "start": 287405870,
                "end": 291212780,
                "gained": 3806910
              },
              "ehp": {
                "start": 957.32359,
                "end": 963.93983,
                "gained": 6.61624
              }
            },
            "attack": {
              "rank": {
                "start": 15583,
                "end": 15800,
                "gained": 217
              },
              "experience": {
                "start": 27505365,
                "end": 27505365,
                "gained": 0
              },
              "ehp": {
                "start": 84.63189,
                "end": 84.63189,
                "gained": 0
              }
            }
          }
        }
      }
    ],
    errorResponses: [
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
      },
      {
        description: 'If an id is given but is not valid.',
        body: {
          message: "Parameter 'id' is not a valid number."
        }
      },
      {
        description: 'If a username is given but does not exist.',
        body: {
          message: 'Player not found.'
        }
      }
    ]
  },
  {
    title: 'View player records',
    urls: ['/players/:id/records', '/players/username/:username/records'],
    method: 'GET',
    comments: [
      {
        type: 'info',
        content: 'This endpoint has two valid URLs, by player id or username.'
      }
    ],
    params: [
      {
        field: 'id',
        type: 'integer',
        description: "The player's id. (Not required if username is supplied)"
      },
      {
        field: 'username',
        type: 'string',
        description: "The player's username. (Not required if id is supplied)"
      }
    ],
    query: [
      {
        field: 'period',
        type: 'string',
        description: "The record's period (See accepted values above) - Optional"
      },
      {
        field: 'metric',
        type: 'string',
        description: "The record's metric (See accepted values above) - Optional"
      }
    ],
    successResponses: [
      {
        description: 'Without any period or metric filtering (Not showing the whole response)',
        body: [
          {
            "value": 718830,
            "id": 128,
            "playerId": 3,
            "period": "month",
            "metric": "cooking",
            "updatedAt": "2020-12-30T11:48:57.889Z"
          },
          {
            "value": 862247,
            "id": 81,
            "playerId": 3,
            "period": "year",
            "metric": "attack",
            "updatedAt": "2020-12-15T12:06:15.751Z"
          },
          {
            "value": 336416,
            "id": 82,
            "playerId": 3,
            "period": "year",
            "metric": "defence",
            "updatedAt": "2020-12-15T12:06:15.751Z"
          },
          {
            "value": 1174525,
            "id": 83,
            "playerId": 3,
            "period": "year",
            "metric": "strength",
            "updatedAt": "2020-12-15T12:06:15.751Z"
          }
        ]
      },
      {
        description: 'Filtered by the metric field (Woodcutting) (Not showing the whole response)',
        body: [
          {
            "value": 6784830,
            "id": 89,
            "playerId": 3,
            "period": "year",
            "metric": "woodcutting",
            "updatedAt": "2020-12-30T11:48:57.938Z"
          },
          {
            "value": 141691,
            "id": 156,
            "playerId": 3,
            "period": "month",
            "metric": "woodcutting",
            "updatedAt": "2020-12-30T11:48:57.975Z"
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
        description: 'If an id is given but is not valid.',
        body: {
          message: "Parameter 'id' is not a valid number."
        }
      },
      {
        description: 'If a username is given but does not exist.',
        body: {
          message: 'Player not found.'
        }
      }
    ]
  },
  {
    title: 'View player name change history',
    urls: ['/players/:id/names', '/players/username/:username/names'],
    method: 'GET',
    comments: [
      {
        type: 'info',
        content: 'This endpoint has two valid URLs, by player id or username.'
      }
    ],
    params: [
      {
        field: 'id',
        type: 'integer',
        description: "The player's id. (Not required if username is supplied)"
      },
      {
        field: 'username',
        type: 'string',
        description: "The player's username. (Not required if id is supplied)"
      }
    ],
    successResponses: [
      {
        description: '',
        body: [
          {
            id: 3,
            playerId: 5,
            oldName: 'Lynx Titan',
            newName: 'Iron Mammal',
            status: 2,
            resolvedAt: '2020-11-23T23:16:49.049Z',
            createdAt: '2020-11-23T23:16:30.049Z',
            updatedAt: '2020-11-23T23:16:49.050Z'
          },
          {
            id: 2,
            playerId: 5,
            oldName: 'Zezima',
            newName: 'Lynx Titan',
            status: 2,
            resolvedAt: '2020-11-23T23:16:12.463Z',
            createdAt: '2020-11-23T23:15:55.458Z',
            updatedAt: '2020-11-23T23:16:12.463Z'
          },
          {
            id: 1,
            playerId: 5,
            oldName: 'Psikoi',
            newName: 'Zezima',
            status: 2,
            resolvedAt: '2020-11-23T23:15:44.207Z',
            createdAt: '2020-11-23T23:15:33.402Z',
            updatedAt: '2020-11-23T23:15:44.208Z'
          }
        ]
      }
    ],
    errorResponses: [
      {
        description: 'If an id is given but is not valid.',
        body: {
          message: "Parameter 'id' is not a valid number."
        }
      },
      {
        description: 'If a username is given but does not exist.',
        body: {
          message: 'Player not found.'
        }
      }
    ]
  }
];
