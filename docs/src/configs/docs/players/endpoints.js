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
            id: 28814,
            username: 'ironic dart',
            displayName: 'Ironic Dart',
            type: 'ironman',
            build: 'main',
            flagged: false,
            lastImportedAt: '2020-08-09T09:08:42.573Z',
            registeredAt: '2020-07-31T09:41:00.833Z',
            updatedAt: '2020-08-09T21:16:42.420Z'
          },
          {
            id: 28926,
            username: 'iron dazakio',
            displayName: 'Iron Dazakio',
            type: 'unknown',
            build: 'main',
            flagged: false,
            lastImportedAt: null,
            registeredAt: '2020-07-31T22:33:17.388Z',
            updatedAt: '2020-07-31T22:33:17.388Z'
          },
          {
            id: 29008,
            username: 'ironman gipi',
            displayName: 'Ironman Gipi',
            type: 'ironman',
            build: 'main',
            flagged: false,
            lastImportedAt: '2020-09-06T03:50:33.069Z',
            registeredAt: '2020-08-01T03:11:47.081Z',
            updatedAt: '2020-09-06T13:44:34.779Z'
          },
          {
            id: 29062,
            username: 'iron truno',
            displayName: 'Iron Truno',
            type: 'ironman',
            build: 'main',
            flagged: false,
            lastImportedAt: '2020-09-06T19:24:26.611Z',
            registeredAt: '2020-08-01T09:43:11.461Z',
            updatedAt: '2020-09-06T19:24:26.611Z'
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
          id: 38833,
          username: 'psikoi',
          displayName: 'Psikoi',
          type: 'regular',
          build: 'main',
          flagged: false,
          lastImportedAt: '2020-09-13T23:46:06.779Z',
          registeredAt: '2020-09-13T23:42:53.316Z',
          updatedAt: '2020-09-13T23:46:06.779Z',
          combatLevel: 125,
          stats: {
            createdAt: '2020-09-13T23:46:03.370Z',
            importedAt: null,
            overall: {
              rank: 36104,
              experience: 280543064
            },
            attack: {
              rank: 14367,
              experience: 27419373
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
          id: 38833,
          username: 'psikoi',
          displayName: 'Psikoi',
          type: 'regular',
          build: 'main',
          flagged: false,
          lastImportedAt: '2020-09-13T23:46:06.779Z',
          registeredAt: '2020-09-13T23:42:53.316Z',
          updatedAt: '2020-09-13T23:46:06.779Z',
          combatLevel: 125,
          stats: {
            createdAt: '2020-09-13T23:46:03.370Z',
            importedAt: null,
            overall: {
              rank: 36104,
              experience: 280543064
            },
            attack: {
              rank: 14367,
              experience: 27419373
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
    errorResponses: []
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
        ]
      }
    ],
    errorResponses: [
      {
        description: 'If period is given but is invalid.',
        body: {
          message: 'Invalid period: someInvalidPeriod'
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
          month: {
            period: 'month',
            startsAt: '2020-03-05T03:19:24.000Z',
            endsAt: '2020-04-04T16:43:36.219Z',
            data: {
              overall: {
                rank: {
                  start: 29626,
                  end: 30400,
                  gained: 774
                },
                experience: {
                  start: 268213747,
                  end: 269828205,
                  gained: 1614458
                }
              },
              attack: {
                rank: {
                  start: 12097,
                  end: 12158,
                  gained: 61
                },
                experience: {
                  start: 26994448,
                  end: 27216011,
                  gained: 221563
                }
              }
            }
          },
          year: {
            period: 'year',
            startsAt: '2019-04-04T23:42:16.000Z',
            endsAt: '2020-04-04T16:43:36.219Z',
            data: {
              overall: {
                rank: {
                  start: 25166,
                  end: 30400,
                  gained: 5234
                },
                experience: {
                  start: 236973133,
                  end: 269828205,
                  gained: 32855072
                }
              },
              attack: {
                rank: {
                  start: 10989,
                  end: 12158,
                  gained: 1169
                },
                experience: {
                  start: 25212878,
                  end: 27216011,
                  gained: 2003133
                }
              }
            }
          },
          day: {
            period: 'day',
            startsAt: '2020-04-03T21:43:19.856Z',
            endsAt: '2020-04-04T16:43:36.219Z',
            data: {
              overall: {
                rank: {
                  start: 30353,
                  end: 30400,
                  gained: 47
                },
                experience: {
                  start: 269705120,
                  end: 269828205,
                  gained: 123085
                }
              },
              attack: {
                rank: {
                  start: 12144,
                  end: 12158,
                  gained: 14
                },
                experience: {
                  start: 27216011,
                  end: 27216011,
                  gained: 0
                }
              }
            }
          },
          week: {
            period: 'week',
            startsAt: '2020-04-03T21:43:19.856Z',
            endsAt: '2020-04-04T16:43:36.219Z',
            data: {
              overall: {
                rank: {
                  start: 30353,
                  end: 30400,
                  gained: 47
                },
                experience: {
                  start: 269705120,
                  end: 269828205,
                  gained: 123085
                }
              },
              attack: {
                rank: {
                  start: 12144,
                  end: 12158,
                  gained: 14
                },
                experience: {
                  start: 27216011,
                  end: 27216011,
                  gained: 0
                }
              }
            }
          }
        }
      },
      {
        description: 'Filtered by the period field (month)',
        body: {
          period: 'month',
          startsAt: '2020-03-05T03:19:24.000Z',
          endsAt: '2020-04-04T16:43:36.219Z',
          data: {
            overall: {
              rank: {
                start: 29626,
                end: 30400,
                gained: 774
              },
              experience: {
                start: 268213747,
                end: 269828205,
                gained: 1614458
              }
            },
            attack: {
              rank: {
                start: 12097,
                end: 12158,
                gained: 61
              },
              experience: {
                start: 26994448,
                end: 27216011,
                gained: 221563
              }
            },
            defence: {
              rank: {
                start: 16398,
                end: 16794,
                gained: 396
              },
              experience: {
                start: 20370965,
                end: 20398429,
                gained: 27464
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
            period: 'day',
            metric: 'firemaking',
            value: 16450,
            updatedAt: '2020-04-04T16:21:50.974Z'
          },
          {
            period: 'month',
            metric: 'magic',
            value: 57662,
            updatedAt: '2020-04-03T23:58:29.522Z'
          },
          {
            period: 'day',
            metric: 'fletching',
            value: 4795,
            updatedAt: '2020-04-04T16:21:50.974Z'
          },
          {
            period: 'day',
            metric: 'overall',
            value: 123085,
            updatedAt: '2020-04-04T16:21:50.907Z'
          }
        ]
      },
      {
        description: 'Filtered by the metric field (Woodcutting)',
        body: [
          {
            period: 'week',
            metric: 'woodcutting',
            value: 101659,
            updatedAt: '2020-04-04T16:21:51.060Z'
          },
          {
            period: 'year',
            metric: 'woodcutting',
            value: 3225180,
            updatedAt: '2020-04-04T16:21:51.291Z'
          },
          {
            period: 'month',
            metric: 'woodcutting',
            value: 290949,
            updatedAt: '2020-04-04T16:21:51.185Z'
          },
          {
            period: 'day',
            metric: 'woodcutting',
            value: 101659,
            updatedAt: '2020-04-04T16:21:50.919Z'
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
      }
    ]
  }
];
