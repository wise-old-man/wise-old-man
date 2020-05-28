export default [
  {
    title: 'View player achievements',
    url: '/achievements',
    method: 'GET',
    comments: [
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
    query: [
      {
        field: 'playerId',
        type: 'integer',
        description: 'The player id.'
      },
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
            value: '500',
            createdAt: '1970-01-01T00:00:00.000Z'
          },
          {
            playerId: 2,
            type: '99 Strength',
            metric: 'strength',
            value: '13034431',
            createdAt: '2015-12-14T04:15:36.000Z'
          },
          {
            playerId: 2,
            type: '99 Hitpoints',
            metric: 'hitpoints',
            value: '13034431',
            createdAt: '2015-06-24T15:57:40.000Z'
          },
          {
            playerId: 2,
            type: '99 Ranged',
            metric: 'ranged',
            value: '13034431',
            createdAt: '2015-12-14T04:15:36.000Z'
          },
          {
            playerId: 2,
            type: '99 Attack',
            metric: 'attack',
            value: '13034431',
            createdAt: '2015-06-24T15:57:40.000Z'
          },
          {
            playerId: 2,
            type: '99 Defence',
            metric: 'defence',
            value: '13034431',
            createdAt: '2015-12-14T04:15:36.000Z'
          },
          {
            playerId: 2,
            type: '99 Magic',
            metric: 'magic',
            value: '13034431',
            createdAt: '2015-12-14T04:15:36.000Z'
          },
          {
            playerId: 2,
            type: '99 Woodcutting',
            metric: 'woodcutting',
            value: '13034431',
            createdAt: '2020-05-27T23:49:34.529Z'
          },
          {
            playerId: 2,
            type: '5k Zulrah kills',
            metric: 'zulrah',
            value: '5000',
            createdAt: '2020-05-27T23:49:34.532Z'
          },
          {
            playerId: 2,
            type: '99 Slayer',
            metric: 'slayer',
            value: '13034431',
            createdAt: '2018-01-21T18:02:52.000Z'
          },
          {
            playerId: 2,
            type: '99 Farming',
            metric: 'farming',
            value: '13034431',
            createdAt: '2019-10-15T23:37:08.000Z'
          },
          {
            playerId: 2,
            type: '500 Abyssal Sire kills',
            metric: 'abyssal_sire',
            value: '500',
            createdAt: '1970-01-01T00:00:00.000Z'
          },
          {
            playerId: 2,
            type: '500 Cerberus kills',
            metric: 'cerberus',
            value: '500',
            createdAt: '1970-01-01T00:00:00.000Z'
          },
          {
            playerId: 2,
            type: '500 Commander Zilyana kills',
            metric: 'commander_zilyana',
            value: '500',
            createdAt: '1970-01-01T00:00:00.000Z'
          },
          {
            playerId: 2,
            type: '500 General Graardor kills',
            metric: 'general_graardor',
            value: '500',
            createdAt: '1970-01-01T00:00:00.000Z'
          },
          {
            playerId: 2,
            type: '500 Zulrah kills',
            metric: 'zulrah',
            value: '500',
            createdAt: '1970-01-01T00:00:00.000Z'
          },
          {
            playerId: 2,
            type: '1k Abyssal Sire kills',
            metric: 'abyssal_sire',
            value: '1000',
            createdAt: '1970-01-01T00:00:00.000Z'
          },
          {
            playerId: 2,
            type: '1k Cerberus kills',
            metric: 'cerberus',
            value: '1000',
            createdAt: '1970-01-01T00:00:00.000Z'
          },
          {
            playerId: 2,
            type: '1k Commander Zilyana kills',
            metric: 'commander_zilyana',
            value: '1000',
            createdAt: '1970-01-01T00:00:00.000Z'
          },
          {
            playerId: 2,
            type: '1k Zulrah kills',
            metric: 'zulrah',
            value: '1000',
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
            value: '500',
            createdAt: '1970-01-01T00:00:00.000Z'
          },
          {
            playerId: 2,
            type: '99 Strength',
            metric: 'strength',
            value: '13034431',
            createdAt: '2015-12-14T04:15:36.000Z'
          },
          {
            playerId: 2,
            type: '99 Hitpoints',
            metric: 'hitpoints',
            value: '13034431',
            createdAt: '2015-06-24T15:57:40.000Z'
          },
          {
            playerId: 2,
            type: '99 Ranged',
            metric: 'ranged',
            value: '13034431',
            createdAt: '2015-12-14T04:15:36.000Z'
          },
          {
            playerId: 2,
            type: '99 Attack',
            metric: 'attack',
            value: '13034431',
            createdAt: '2015-06-24T15:57:40.000Z'
          },
          {
            playerId: 2,
            type: '99 Defence',
            metric: 'defence',
            value: '13034431',
            createdAt: '2015-12-14T04:15:36.000Z'
          },
          {
            playerId: 2,
            type: '99 Magic',
            metric: 'magic',
            value: '13034431',
            createdAt: '2015-12-14T04:15:36.000Z'
          },
          {
            playerId: 2,
            type: '99 Woodcutting',
            metric: 'woodcutting',
            value: '13034431',
            createdAt: '2020-05-27T23:49:34.529Z'
          },
          {
            playerId: 2,
            type: '5k Zulrah kills',
            metric: 'zulrah',
            value: '5000',
            createdAt: '2020-05-27T23:49:34.532Z'
          },
          {
            playerId: 2,
            type: '99 Slayer',
            metric: 'slayer',
            value: '13034431',
            createdAt: '2018-01-21T18:02:52.000Z'
          },
          {
            playerId: 2,
            type: '99 Farming',
            metric: 'farming',
            value: '13034431',
            createdAt: '2019-10-15T23:37:08.000Z'
          },
          {
            playerId: 2,
            type: '500 Abyssal Sire kills',
            metric: 'abyssal_sire',
            value: '500',
            createdAt: '1970-01-01T00:00:00.000Z'
          },
          {
            playerId: 2,
            type: '500 Cerberus kills',
            metric: 'cerberus',
            value: '500',
            createdAt: '1970-01-01T00:00:00.000Z'
          },
          {
            playerId: 2,
            type: '500 Commander Zilyana kills',
            metric: 'commander_zilyana',
            value: '500',
            createdAt: '1970-01-01T00:00:00.000Z'
          },
          {
            playerId: 2,
            type: '500 General Graardor kills',
            metric: 'general_graardor',
            value: '500',
            createdAt: '1970-01-01T00:00:00.000Z'
          },
          {
            playerId: 2,
            type: '500 Zulrah kills',
            metric: 'zulrah',
            value: '500',
            createdAt: '1970-01-01T00:00:00.000Z'
          },
          {
            playerId: 2,
            type: '1k Abyssal Sire kills',
            metric: 'abyssal_sire',
            value: '1000',
            createdAt: '1970-01-01T00:00:00.000Z'
          },
          {
            playerId: 2,
            type: '1k Cerberus kills',
            metric: 'cerberus',
            value: '1000',
            createdAt: '1970-01-01T00:00:00.000Z'
          },
          {
            playerId: 2,
            type: '1k Commander Zilyana kills',
            metric: 'commander_zilyana',
            value: '1000',
            createdAt: '1970-01-01T00:00:00.000Z'
          },
          {
            playerId: 2,
            type: '1k Zulrah kills',
            metric: 'zulrah',
            value: '1000',
            createdAt: '1970-01-01T00:00:00.000Z'
          },
          {
            playerId: 2,
            type: '50m Fletching',
            metric: 'fletching',
            value: 50000000,
            createdAt: null,
            missing: true,
            measure: 'experience'
          },
          {
            playerId: 2,
            type: '50m Fishing',
            metric: 'fishing',
            value: 50000000,
            createdAt: null,
            missing: true,
            measure: 'experience'
          },
          {
            playerId: 2,
            type: '50m Firemaking',
            metric: 'firemaking',
            value: 50000000,
            createdAt: null,
            missing: true,
            measure: 'experience'
          },
          {
            playerId: 2,
            type: '50m Crafting',
            metric: 'crafting',
            value: 50000000,
            createdAt: null,
            missing: true,
            measure: 'experience'
          },
          {
            playerId: 2,
            type: '50m Smithing',
            metric: 'smithing',
            value: 50000000,
            createdAt: null,
            missing: true,
            measure: 'experience'
          },
          {
            playerId: 2,
            type: '50m Mining',
            metric: 'mining',
            value: 50000000,
            createdAt: null,
            missing: true,
            measure: 'experience'
          },
          {
            playerId: 2,
            type: '50m Herblore',
            metric: 'herblore',
            value: 50000000,
            createdAt: null,
            missing: true,
            measure: 'experience'
          },
          {
            playerId: 2,
            type: '50m Agility',
            metric: 'agility',
            value: 50000000,
            createdAt: null,
            missing: true,
            measure: 'experience'
          },
          {
            playerId: 2,
            type: '50m Thieving',
            metric: 'thieving',
            value: 50000000,
            createdAt: null,
            missing: true,
            measure: 'experience'
          },
          {
            playerId: 2,
            type: '50m Slayer',
            metric: 'slayer',
            value: 50000000,
            createdAt: null,
            missing: true,
            measure: 'experience'
          }
        ]
      }
    ],
    errorResponses: [
      {
        description: 'If no playerId is given.',
        body: {
          message: 'Invalid player id.'
        }
      }
    ]
  }
];
