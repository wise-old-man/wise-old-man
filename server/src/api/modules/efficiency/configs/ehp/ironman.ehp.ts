export default [
  {
    skill: 'attack',
    methods: [
      {
        startExp: 0,
        rate: 13034431,
        description: 'Bonus xp from slayer'
      },
      {
        startExp: 13034431,
        rate: 225000,
        description: 'Nechwark'
      }
    ],
    bonuses: []
  },
  {
    skill: 'defence',
    methods: [
      {
        startExp: 0,
        rate: 13034431,
        description: 'Bonus xp from slayer'
      },
      {
        startExp: 13034431,
        rate: 695000,
        description: 'Def chin+bonus pray xp'
      }
    ],
    bonuses: []
  },
  {
    skill: 'strength',
    methods: [
      {
        startExp: 0,
        rate: 13034431,
        description: 'Bonus xp from slayer'
      },
      {
        startExp: 13034431,
        rate: 340000,
        description: 'Chally greater nechs'
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
        description: 'Bonus xp from slayer'
      }
    ],
    bonuses: []
  },
  {
    skill: 'ranged',
    methods: [
      {
        startExp: 0,
        rate: 15000,
        description: 'Quest/PC'
      },
      {
        startExp: 203354,
        rate: 631488,
        description: 'Red chins+bonus pray'
      },
      {
        startExp: 449428,
        rate: 785569,
        description: 'Black chins+bonus pray'
      },
      {
        startExp: 737627,
        rate: 881310,
        description: 'Black chins+bonus pray'
      },
      {
        startExp: 1986068,
        rate: 1017527,
        description: 'Black chins+bonus pray'
      },
      {
        startExp: 5346332,
        rate: 1184258,
        description: 'Black chins+bonus pray'
      },
      {
        startExp: 13034431,
        rate: 1375062,
        description: 'Black chins+bonus pray'
      }
    ],
    bonuses: []
  },
  {
    skill: 'prayer',
    methods: [
      {
        startExp: 0,
        rate: 182000,
        description: 'Lance green dragons'
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
        description: 'Bonus xp from slayer'
      }
    ],
    bonuses: []
  },
  {
    skill: 'cooking',
    methods: [
      {
        startExp: 0,
        rate: 100_000,
        description: 'Buying karambwans'
      },
      {
        startExp: 13_363,
        rate: 144_313,
        description: 'Buying karambwans'
      },
      {
        startExp: 41_171,
        rate: 184_515,
        description: 'Buying karambwans'
      },
      {
        startExp: 101_333,
        rate: 224_644,
        description: 'Buying karambwans'
      },
      {
        startExp: 273_742,
        rate: 264_732,
        description: 'Buying karambwans'
      },
      {
        startExp: 737_627,
        rate: 304_797,
        description: 'Buying karambwans'
      },
      {
        startExp: 1_986_068,
        rate: 344_846,
        description: 'Buying karambwans'
      },
      {
        startExp: 5_346_332,
        rate: 380_882,
        description: 'Buying karambwans'
      },
      {
        startExp: 13_034_431,
        rate: 400_000,
        description: 'Buying karambwans'
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
        description: 'Trees'
      },
      {
        startExp: 2411,
        rate: 16000,
        description: 'Oak trees'
      },
      {
        startExp: 13363,
        rate: 35000,
        description: 'Willow trees'
      },
      {
        startExp: 41171,
        rate: 49000,
        description: 'Teak trees'
      },
      {
        startExp: 302288,
        rate: 146939,
        description: '1.5t teaks'
      },
      {
        startExp: 737627,
        rate: 159506,
        description: '1.5t teaks'
      },
      {
        startExp: 1986068,
        rate: 173469,
        description: '1.5t teaks'
      },
      {
        startExp: 5902831,
        rate: 188829,
        description: '1.5t teaks'
      },
      {
        startExp: 13034431,
        rate: 200000,
        description: '1.5t teaks'
      }
    ],
    bonuses: []
  },
  {
    skill: 'fletching',
    methods: [
      {
        startExp: 0,
        rate: 200000,
        description: 'Bows & arrows'
      },
      {
        startExp: 123660,
        rate: 1100000,
        description: 'Broad arrows'
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
        description: 'Quest'
      },
      {
        startExp: 3470,
        rate: 30000,
        description: 'Fly fishing (trout)'
      },
      {
        startExp: 13363,
        rate: 40000,
        description: 'Fly fishing (trout + salmon)'
      },
      {
        startExp: 273742,
        rate: 65000,
        description: 'Cut-eat barb'
      },
      {
        startExp: 737627,
        rate: 87000,
        description: 'Cut-eat barb'
      },
      {
        startExp: 2421087,
        rate: 96403,
        description: 'Cut-eat barb'
      },
      {
        startExp: 5902831,
        rate: 103100,
        description: 'Cut-eat barb'
      },
      {
        startExp: 10692629,
        rate: 106600,
        description: 'Cut-eat barb'
      },
      {
        startExp: 13034431,
        rate: 110000,
        description: 'Cut-eat barb'
      }
    ],
    bonuses: [
      {
        originSkill: 'fishing',
        bonusSkill: 'strength',
        startExp: 273_742,
        endExp: 200_000_000,
        end: false,
        ratio: 0.0885
      },
      {
        originSkill: 'fishing',
        bonusSkill: 'agility',
        startExp: 273_742,
        endExp: 200_000_000,
        end: false,
        ratio: 0.0885
      },
      {
        originSkill: 'fishing',
        bonusSkill: 'cooking',
        startExp: 273_742,
        endExp: 200_000_000,
        end: true,
        ratio: 0.15
      }
    ]
  },
  {
    skill: 'firemaking',
    methods: [
      {
        startExp: 0,
        rate: 45000,
        description: 'Oak logs'
      },
      {
        startExp: 101_333,
        rate: 241_258,
        description: 'Wintertodt'
      },
      {
        startExp: 273_742,
        rate: 289_939,
        description: 'Wintertodt'
      },
      {
        startExp: 737_627,
        rate: 328_257,
        description: 'Wintertodt'
      },
      {
        startExp: 1_986_068,
        rate: 372_556,
        description: 'Wintertodt'
      },
      {
        startExp: 5_346_332,
        rate: 416_842,
        description: 'Wintertodt'
      },
      {
        startExp: 13_034_431,
        rate: 437_992,
        description: 'Wintertodt'
      }
    ],
    bonuses: []
  },
  {
    skill: 'crafting',
    methods: [
      {
        startExp: 0,
        rate: 50_000,
        description: 'Seaweed + sandstone'
      },
      {
        startExp: 302_288,
        rate: 87_000,
        description: 'Seaweed + sandstone w/ superglass'
      },
      {
        startExp: 3_972_294,
        rate: 108_000,
        description: 'Seaweed + sandstone w/ superglass'
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
        description: 'Quests'
      },
      {
        startExp: 273_742,
        rate: 310_000,
        description: 'UIM gold'
      },
      {
        startExp: 13034431,
        rate: 320_000,
        description: 'UIM gold'
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
        description: 'Quests'
      },
      {
        startExp: 14833,
        rate: 20000,
        description: 'Iron'
      },
      {
        startExp: 41171,
        rate: 44000,
        description: '3t4g at quarry'
      },
      {
        startExp: 302288,
        rate: 78100,
        description: '3t4g at quarry'
      },
      {
        startExp: 547953,
        rate: 88800,
        description: '3t4g at quarry'
      },
      {
        startExp: 1986068,
        rate: 100800,
        description: '3t4g at quarry'
      },
      {
        startExp: 5902831,
        rate: 110100,
        description: '3t4g at quarry'
      },
      {
        startExp: 13034431,
        rate: 123000,
        description: '3t4g at quarry'
      }
    ],
    bonuses: []
  },
  {
    skill: 'herblore',
    methods: [
      {
        startExp: 0,
        rate: 64_000,
        description: 'Contracts + kingdom'
      },
      {
        startExp: 13_034_431,
        rate: 71_116,
        description: 'Contracts + kingdom'
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
        description: 'Bonus xp from fishing'
      },
      {
        startExp: 13363,
        rate: 15000,
        description: 'Bonus xp from fishing'
      },
      {
        startExp: 41171,
        rate: 44000,
        description: 'Bonus xp from fishing'
      },
      {
        startExp: 273_742,
        rate: 54_000,
        description: 'Bonus xp from fishing'
      },
      {
        startExp: 1_986_068,
        rate: 62_034,
        description: 'Bonus xp from fishing'
      },
      {
        startExp: 2_421_087,
        rate: 69_697,
        description: 'Bonus xp from fishing'
      },
      {
        startExp: 6_517_253,
        rate: 90_000,
        description: 'Bonus xp from fishing'
      },
      {
        startExp: 17_675_774,
        rate: 87_000,
        description: 'Sepulchre + 20m ardy'
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
        description: 'Quests'
      },
      {
        startExp: 61512,
        rate: 60000,
        description: 'Blackjacking'
      },
      {
        startExp: 91_721,
        rate: 309_866,
        description: 'Artefact + glassblowing'
      },
      {
        startExp: 273_742,
        rate: 352_404,
        description: 'Artefact + glassblowing'
      },
      {
        startExp: 668_051,
        rate: 394_929,
        description: 'Artefact + glassblowing'
      },
      {
        startExp: 1_798_808,
        rate: 437_445,
        description: 'Artefact + glassblowing'
      },
      {
        startExp: 4_842_295,
        rate: 479_954,
        description: 'Artefact + glassblowing'
      },
      {
        startExp: 13_034_431,
        rate: 500_202,
        description: 'Artefact + glassblowing'
      }
    ],
    bonuses: []
  },
  {
    skill: 'slayer',
    methods: [
      {
        startExp: 0,
        rate: 5_000,
        description: 'Efficient slayer'
      },
      {
        startExp: 37_224,
        rate: 12_000,
        description: 'Efficient slayer'
      },
      {
        startExp: 101_333,
        rate: 15_000,
        description: 'Efficient slayer'
      },
      {
        startExp: 449_428,
        rate: 18_000,
        description: 'Efficient slayer'
      },
      {
        startExp: 1_210_421,
        rate: 25_000,
        description: 'Efficient slayer'
      },
      {
        startExp: 1_986_068,
        rate: 35_000,
        description: 'Efficient slayer'
      },
      {
        startExp: 7_195_629,
        rate: 50_000,
        description: 'Efficient slayer'
      },
      {
        startExp: 13_034_431,
        rate: 69_054,
        description: 'Efficient slayer'
      }
    ],
    bonuses: [
      {
        originSkill: 'slayer',
        bonusSkill: 'ranged',
        startExp: 13_034_431,
        endExp: 200_000_000,
        end: true,
        ratio: 0.06615
      },
      {
        originSkill: 'slayer',
        bonusSkill: 'attack',
        startExp: 0,
        endExp: 200_000_000,
        end: false,
        ratio: 1
      },
      {
        originSkill: 'slayer',
        bonusSkill: 'strength',
        startExp: 0,
        endExp: 200_000_000,
        end: false,
        ratio: 0.9116
      },
      {
        originSkill: 'slayer',
        bonusSkill: 'defence',
        startExp: 0,
        endExp: 200_000_000,
        end: false,
        ratio: 0.871
      }
    ]
  },
  {
    skill: 'farming',
    methods: [
      {
        startExp: 0,
        rate: 500_000,
        description: 'Low lvl trees'
      },
      {
        startExp: 185_428,
        rate: 66_000,
        description: 'Tithe rewards'
      },
      {
        startExp: 496_254,
        rate: 2_000_000,
        description: 'Pre 99 trees'
      },
      {
        startExp: 13_034_431,
        rate: 3_150_000,
        description: 'Passive farming'
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
        description: 'Quests'
      },
      {
        startExp: 7_842,
        rate: 48_000,
        description: 'Lavas med pouch'
      },
      {
        startExp: 101_333,
        rate: 60_000,
        description: 'Lavas large pouch'
      },
      {
        startExp: 1_210_421,
        rate: 62_000,
        description: '1.5t daeylt'
      },
      {
        startExp: 13_034_431,
        rate: 63_000,
        description: '1.5t daeylt/library'
      }
    ],
    bonuses: []
  },
  {
    skill: 'hunter',
    methods: [
      {
        startExp: 0,
        rate: 92_600,
        description: 'Average low lvl Birdhouses'
      },
      {
        startExp: 101_333,
        rate: 158_800,
        description: 'Mahogany Birdhouses'
      },
      {
        startExp: 1096278,
        rate: 188_600,
        description: 'Magic Birdhouses'
      },
      {
        startExp: 1_986_068,
        rate: 140_500,
        description: 'Red chins'
      },
      {
        startExp: 2_228_278,
        rate: 194_500,
        description: 'Black chins'
      },
      {
        startExp: 5_902_831,
        rate: 225_300,
        description: 'Black chins'
      },
      {
        startExp: 13_034_431,
        rate: 240_000,
        description: 'Black chins'
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
        description: 'Planks'
      },
      {
        startExp: 18247,
        rate: 75000,
        description: 'Oak larders'
      },
      {
        startExp: 75127,
        rate: 226_800,
        description: '1.5t teak myth capes + kingdom mahogany'
      }
    ],
    bonuses: []
  }
];
