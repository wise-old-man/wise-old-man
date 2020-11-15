export default [
  {
    skill: 'attack',
    methods: [
      {
        startExp: 0,
        rate: 0,
        description: '-'
      }
    ],
    bonuses: []
  },
  {
    skill: 'defence',
    methods: [
      {
        startExp: 0,
        rate: 0,
        description: '-'
      }
    ],
    bonuses: []
  },
  {
    skill: 'strength',
    methods: [
      {
        startExp: 0,
        rate: 0,
        description: '-'
      }
    ],
    bonuses: []
  },
  {
    skill: 'hitpoints',
    methods: [
      {
        startExp: 0,
        rate: 0,
        description: '-'
      }
    ],
    bonuses: []
  },
  {
    skill: 'ranged',
    methods: [
      {
        startExp: 0,
        rate: 0,
        description: '-'
      }
    ],
    bonuses: []
  },
  {
    skill: 'prayer',
    methods: [
      {
        startExp: 0,
        rate: 0,
        description: '-'
      }
    ],
    bonuses: []
  },
  {
    skill: 'magic',
    methods: [
      {
        startExp: 0,
        rate: 0,
        description: '-'
      }
    ],
    bonuses: []
  },
  {
    skill: 'cooking',
    methods: [
      {
        startExp: 0,
        rate: 40000,
        description: '-'
      },
      {
        startExp: 7842,
        rate: 130000,
        description: '-'
      },
      {
        startExp: 37224,
        rate: 175000,
        description: '-'
      },
      {
        startExp: 737627,
        rate: 490000,
        description: '-'
      },
      {
        startExp: 1986068,
        rate: 950000,
        description: '-'
      }
    ],
    bonuses: []
  },
  {
    skill: 'woodcutting',
    methods: [
      {
        startExp: 0,
        rate: 7000,
        description: '-'
      },
      {
        startExp: 2411,
        rate: 16000,
        description: '-'
      },
      {
        startExp: 13363,
        rate: 35000,
        description: '-'
      },
      {
        startExp: 41171,
        rate: 47775,
        description: '-'
      },
      {
        startExp: 302288,
        rate: 143320,
        description: '-'
      },
      {
        startExp: 737627,
        rate: 155518,
        description: '-'
      },
      {
        startExp: 1986068,
        rate: 169132,
        description: '-'
      },
      {
        startExp: 5902831,
        rate: 184108,
        description: '-'
      },
      {
        startExp: 13034431,
        rate: 195000,
        description: '-'
      }
    ],
    bonuses: [
      {
        originSkill: 'woodcutting',
        bonusSkill: 'firemaking',
        startExp: 302_288,
        endExp: 200_000_000,
        end: true,
        ratio: 0.2
      }
    ]
  },
  {
    skill: 'fletching',
    methods: [
      {
        startExp: 0,
        rate: 0,
        description: '-'
      }
    ],
    bonuses: []
  },
  {
    skill: 'fishing',
    methods: [
      {
        startExp: 0,
        rate: 14000,
        description: '-'
      },
      {
        startExp: 4470,
        rate: 28000,
        description: '-'
      },
      {
        startExp: 13363,
        rate: 37000,
        description: '-'
      },
      {
        startExp: 273742,
        rate: 46000,
        description: '-'
      },
      {
        startExp: 737627,
        rate: 58000,
        description: '-'
      },
      {
        startExp: 1986068,
        rate: 74000,
        description: '-'
      },
      {
        startExp: 5346332,
        rate: 82000,
        description: '-'
      },
      {
        startExp: 13034431,
        rate: 120000,
        description: '-'
      }
    ],
    bonuses: []
  },
  {
    skill: 'firemaking',
    methods: [
      {
        startExp: 0,
        rate: 45000,
        description: '-'
      },
      {
        startExp: 13363,
        rate: 132660,
        description: '-'
      },
      {
        startExp: 61512,
        rate: 198990,
        description: '-'
      },
      {
        startExp: 273742,
        rate: 298485,
        description: '-'
      },
      {
        startExp: 1210421,
        rate: 447801,
        description: '-'
      },
      {
        startExp: 5346332,
        rate: 528797,
        description: '-'
      }
    ],
    bonuses: [
      {
        originSkill: 'firemaking',
        bonusSkill: 'cooking',
        startExp: 5_346_332,
        endExp: 200_000_000,
        end: true,
        ratio: 0.52
      }
    ]
  },
  {
    skill: 'crafting',
    methods: [
      {
        startExp: 0,
        rate: 57000,
        description: '-'
      },
      {
        startExp: 300000,
        rate: 170000,
        description: '-'
      },
      {
        startExp: 362000,
        rate: 285000,
        description: '-'
      },
      {
        startExp: 496254,
        rate: 336875,
        description: '-'
      },
      {
        startExp: 2951373,
        rate: 440000,
        description: '-'
      }
    ],
    bonuses: []
  },
  {
    skill: 'smithing',
    methods: [
      {
        startExp: 0,
        rate: 40000,
        description: '-'
      },
      {
        startExp: 18247,
        rate: 116000,
        description: '-'
      },
      {
        startExp: 605032,
        rate: 208000,
        description: '-'
      },
      {
        startExp: 4385776,
        rate: 260000,
        description: '-'
      },
      {
        startExp: 13034431,
        rate: 400000,
        description: '-'
      }
    ],
    bonuses: []
  },
  {
    skill: 'mining',
    methods: [
      {
        startExp: 0,
        rate: 8000,
        description: '-'
      },
      {
        startExp: 14833,
        rate: 20000,
        description: '-'
      },
      {
        startExp: 41171,
        rate: 44000,
        description: '-'
      },
      {
        startExp: 302288,
        rate: 70335,
        description: '-'
      },
      {
        startExp: 547953,
        rate: 79975,
        description: '-'
      },
      {
        startExp: 1986068,
        rate: 90747,
        description: '-'
      },
      {
        startExp: 5902831,
        rate: 99136,
        description: '-'
      },
      {
        startExp: 13034431,
        rate: 111800,
        description: '-'
      }
    ],
    bonuses: [
      {
        originSkill: 'mining',
        bonusSkill: 'smithing',
        startExp: 302_288, // 61 mining
        endExp: 200_000_000,
        end: true,
        ratio: 0.08
      }
    ]
  },
  {
    skill: 'herblore',
    methods: [
      {
        startExp: 0,
        rate: 60000,
        description: '-'
      },
      {
        startExp: 27473,
        rate: 200000,
        description: '-'
      },
      {
        startExp: 2192818,
        rate: 450000,
        description: '-'
      }
    ],
    bonuses: []
  },
  {
    skill: 'agility',
    methods: [
      {
        startExp: 0,
        rate: 6000,
        description: '-'
      },
      {
        startExp: 13363,
        rate: 15100,
        description: '-'
      },
      {
        startExp: 75127,
        rate: 42000,
        description: '-'
      },
      {
        startExp: 273742,
        rate: 45000,
        description: '-'
      },
      {
        startExp: 737627,
        rate: 49000,
        description: '-'
      },
      {
        startExp: 1986086,
        rate: 52000,
        description: '-'
      },
      {
        startExp: 3972294,
        rate: 59000,
        description: '-'
      },
      {
        startExp: 9684577,
        rate: 62000,
        description: '-'
      }
    ],
    bonuses: []
  },
  {
    skill: 'thieving',
    methods: [
      {
        startExp: 0,
        rate: 15000,
        description: '-'
      },
      {
        startExp: 61512,
        rate: 55000,
        description: '-'
      },
      {
        startExp: 166636,
        rate: 90000,
        description: '-'
      },
      {
        startExp: 449428,
        rate: 215000,
        description: '-'
      },
      {
        startExp: 5902831,
        rate: 250000,
        description: '-'
      },
      {
        startExp: 13034431,
        rate: 260000,
        description: '-'
      }
    ],
    bonuses: []
  },
  {
    skill: 'slayer',
    methods: [
      {
        startExp: 0,
        rate: 0,
        description: '-'
      }
    ],
    bonuses: []
  },
  {
    skill: 'farming',
    methods: [
      {
        startExp: 0,
        rate: 10000,
        description: '-'
      },
      {
        startExp: 2411,
        rate: 50000,
        description: '-'
      },
      {
        startExp: 13363,
        rate: 80000,
        description: '-'
      },
      {
        startExp: 61512,
        rate: 150000,
        description: '-'
      },
      {
        startExp: 273742,
        rate: 350000,
        description: '-'
      },
      {
        startExp: 1210421,
        rate: 1900000,
        description: '-'
      }
    ],
    bonuses: []
  },
  {
    skill: 'runecrafting',
    methods: [
      {
        startExp: 0,
        rate: 8000,
        description: '-'
      },
      {
        startExp: 6291,
        rate: 60000,
        description: '-'
      },
      {
        startExp: 13034431,
        rate: 85000,
        description: '-'
      }
    ],
    bonuses: []
  },
  {
    skill: 'hunter',
    methods: [
      {
        startExp: 0,
        rate: 55000,
        description: '-'
      },
      {
        startExp: 2107,
        rate: 82000,
        description: '-'
      },
      {
        startExp: 7028,
        rate: 110000,
        description: '-'
      },
      {
        startExp: 20224,
        rate: 138000,
        description: '-'
      },
      {
        startExp: 55649,
        rate: 161000,
        description: '-'
      },
      {
        startExp: 91721,
        rate: 189000,
        description: '-'
      },
      {
        startExp: 247886,
        rate: 201000,
        description: '-'
      },
      {
        startExp: 1096278,
        rate: 224000,
        description: '-'
      },
      {
        startExp: 4842295,
        rate: 236000,
        description: '-'
      },
      {
        startExp: 13034431,
        rate: 315000,
        description: '-'
      }
    ],
    bonuses: []
  },
  {
    skill: 'construction',
    methods: [
      {
        startExp: 0,
        rate: 20000,
        description: '-'
      },
      {
        startExp: 18247,
        rate: 100000,
        description: '-'
      },
      {
        startExp: 123660,
        rate: 900000,
        description: '-'
      }
    ],
    bonuses: []
  }
];
