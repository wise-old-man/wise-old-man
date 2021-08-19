export default [
  {
    skill: 'attack',
    methods: [
      {
        startExp: 0,
        rate: 15_000,
        description: 'Bonus XP from Slayer'
      },
      {
        startExp: 37_224,
        rate: 38_000,
        description: 'Bonus XP from Slayer'
      },
      {
        startExp: 100_000,
        rate: 55_000,
        description: 'Bonus XP from Slayer'
      },
      {
        startExp: 1_000_000,
        rate: 65_000,
        description: 'Bonus XP from Slayer'
      },
      {
        startExp: 1_210_421,
        rate: 315_000,
        description: 'Bonus XP from Slayer (Nechwark)'
      },
      {
        startExp: 13_034_431,
        rate: 330_000,
        description: 'Bonus XP from Slayer (Nechwark)'
      }
    ],
    bonuses: []
  },
  {
    skill: 'defence',
    methods: [
      {
        startExp: 0,
        rate: 700_000,
        description: "Chinning in Kruk's Dungeon"
      }
    ],
    bonuses: []
  },
  {
    skill: 'strength',
    methods: [
      {
        startExp: 0,
        rate: 15_000,
        description: 'Questing XP'
      },
      {
        startExp: 37_224,
        rate: 38_000,
        description: 'Crystal Halberd Nechryael'
      },
      {
        startExp: 61_512,
        rate: 145_000,
        description: 'Crystal Halberd Nechryael'
      },
      {
        startExp: 449_428,
        rate: 245_000,
        description: 'Crystal Halberd Nechryael'
      },
      {
        startExp: 1_986_068,
        rate: 300_000,
        description: 'Crystal Halberd Nechryael'
      },
      {
        startExp: 6_517_253,
        rate: 335_000,
        description: 'Crystal Halberd Nechryael'
      },
      {
        startExp: 13_034_431,
        rate: 380_000,
        description: 'Crystal Halberd Nechryael'
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
        description: 'Bonus XP from Slayer'
      }
    ],
    bonuses: []
  },
  {
    skill: 'ranged',
    methods: [
      {
        startExp: 0,
        rate: 250_000,
        description: 'Bonus XP from Slayer'
      },
      {
        startExp: 6_517_253,
        rate: 330_000,
        description: 'Bonus XP from Slayer'
      },
      {
        startExp: 13_034_431,
        rate: 1_180_000,
        description: "Chinning in Kruk's Dungeon"
      }
    ],
    bonuses: []
  },
  {
    skill: 'prayer',
    methods: [
      {
        startExp: 0,
        rate: 860_000,
        description: 'Dragon bones at Chaos Altar'
      },
      {
        startExp: 737_627,
        rate: 1_800_000,
        description: 'Superior dragon bones at Chaos Altar'
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
        description: 'Bonus XP from Slayer & Magic Imbue'
      }
    ],
    bonuses: []
  },
  {
    skill: 'cooking',
    methods: [
      {
        startExp: 0,
        rate: 40_000,
        description: 'Shrimp & Trout'
      },
      {
        startExp: 13_363,
        rate: 463_867,
        description: '1t Karambwans'
      },
      {
        startExp: 37_224,
        rate: 534_375,
        description: '1t Karambwans'
      },
      {
        startExp: 101_333,
        rate: 604_883,
        description: '1t Karambwans'
      },
      {
        startExp: 273_742,
        rate: 671_680,
        description: '1t Karambwans'
      },
      {
        startExp: 737_627,
        rate: 742_188,
        description: '1t Karambwans'
      },
      {
        startExp: 1_986_068,
        rate: 812_695,
        description: '1t Karambwans'
      },
      {
        startExp: 5_346_332,
        rate: 883_203,
        description: '1t Karambwans'
      },
      {
        startExp: 13_034_431,
        rate: 950_000,
        description: '1t Karambwans'
      }
    ],
    bonuses: []
  },
  {
    skill: 'woodcutting',
    methods: [
      {
        startExp: 0,
        rate: 7_000,
        description: 'Trees'
      },
      {
        startExp: 2_411,
        rate: 16_000,
        description: 'Oak trees'
      },
      {
        startExp: 13_363,
        rate: 35_000,
        description: 'Willow trees'
      },
      {
        startExp: 22_406,
        rate: 89_733,
        description: '1.5t Teaks'
      },
      {
        startExp: 41_171,
        rate: 110_833,
        description: '1.5t Teaks'
      },
      {
        startExp: 111_945,
        rate: 122_170,
        description: '1.5t Teaks'
      },
      {
        startExp: 302_288,
        rate: 152_139,
        description: '1.5t Teaks'
      },
      {
        startExp: 737_627,
        rate: 162_786,
        description: '1.5t Teaks'
      },
      {
        startExp: 1_986_068,
        rate: 176_077,
        description: '1.5t Teaks'
      },
      {
        startExp: 5_346_332,
        rate: 188_160,
        description: '1.5t Teaks'
      },
      {
        startExp: 13_034_431,
        rate: 200_000,
        description: '1.5t Teaks'
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
        description: 'Multi-skilling darts'
      }
    ],
    bonuses: []
  },
  {
    skill: 'fishing',
    methods: [
      {
        startExp: 0,
        rate: 20_000,
        description: 'Questing XP'
      },
      {
        startExp: 18_247,
        rate: 40_000,
        description: 'Fly fishing (Trout & Salmon)'
      },
      {
        startExp: 101_333,
        rate: 94_364,
        description: 'Drift net (2t Fishing)'
      },
      {
        startExp: 273_742,
        rate: 113_709,
        description: 'Drift net (2t Fishing)'
      },
      {
        startExp: 737_627,
        rate: 132_000,
        description: 'Drift net (2t Fishing)'
      }
    ],
    bonuses: []
  },
  {
    skill: 'firemaking',
    methods: [
      {
        startExp: 0,
        rate: 58_960,
        description: 'Logs'
      },
      {
        startExp: 2_411,
        rate: 88_440,
        description: 'Oak logs'
      },
      {
        startExp: 13_363,
        rate: 132_660,
        description: 'Willow logs'
      },
      {
        startExp: 22_406,
        rate: 154_770,
        description: 'Teak logs'
      },
      {
        startExp: 61_512,
        rate: 198_990,
        description: 'Maple logs'
      },
      {
        startExp: 101_333,
        rate: 232_155,
        description: 'Mahogany logs'
      },
      {
        startExp: 273_742,
        rate: 298_485,
        description: 'Yew logs'
      },
      {
        startExp: 1_210_421,
        rate: 447_801,
        description: 'Magic logs'
      },
      {
        startExp: 5_346_332,
        rate: 505_000,
        description: 'Firebwan'
      }
    ],
    bonuses: [
      {
        originSkill: 'firemaking',
        bonusSkill: 'cooking',
        startExp: 101_333,
        endExp: 200_000_000,
        end: true,
        ratio: 0.7
      }
    ]
  },
  {
    skill: 'crafting',
    methods: [
      {
        startExp: 0,
        rate: 57_000,
        description: 'Leather & Gems'
      },
      {
        startExp: 368_599,
        rate: 320_000,
        description: "Green d'hide bodies"
      },
      {
        startExp: 814_445,
        rate: 360_000,
        description: "Blue d'hide bodies"
      },
      {
        startExp: 1_475_581,
        rate: 400_000,
        description: "Red d'hide bodies"
      },
      {
        startExp: 2_951_373,
        rate: 440_000,
        description: "Black d'hide bodies"
      }
    ],
    bonuses: []
  },
  {
    skill: 'smithing',
    methods: [
      {
        startExp: 0,
        rate: 40_000,
        description: 'Questing XP'
      },
      {
        startExp: 37_224,
        rate: 380_000,
        description: 'Blast Furnance Gold bars'
      },
      {
        startExp: 13_034_431,
        rate: 410_000,
        description: 'Blast Furnance Gold bars'
      }
    ],
    bonuses: []
  },
  {
    skill: 'mining',
    methods: [
      {
        startExp: 0,
        rate: 8_000,
        description: 'Questing XP'
      },
      {
        startExp: 13_363,
        rate: 59_158,
        description: '3t Iron'
      },
      {
        startExp: 61_512,
        rate: 85_500,
        description: '3t4g at Desert Quarry'
      },
      {
        startExp: 101_333,
        rate: 89_151,
        description: '3t4g at Desert Quarry'
      },
      {
        startExp: 302_288,
        rate: 97_923,
        description: '3t4g at Desert Quarry'
      },
      {
        startExp: 737_627,
        rate: 103_751,
        description: '3t4g at Desert Quarry'
      },
      {
        startExp: 1_986_068,
        rate: 109_143,
        description: '3t4g at Desert Quarry'
      },
      {
        startExp: 3_258_594,
        rate: 46_500,
        description: 'Motherlode Mine for Prospector kit'
      },
      {
        startExp: 3_548_694,
        rate: 113_287,
        description: '3t4g at Desert Quarry'
      },
      {
        startExp: 5_346_332,
        rate: 115_638,
        description: '3t4g at Desert Quarry'
      },
      {
        startExp: 13_034_431,
        rate: 125_000,
        description: '3t4g at Desert Quarry'
      }
    ],
    bonuses: [
      {
        originSkill: 'mining',
        bonusSkill: 'smithing',
        startExp: 302_288,
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
        rate: 60_000,
        description: 'Questing XP'
      },
      {
        startExp: 30_408,
        rate: 218_750,
        description: 'Prayer potions'
      },
      {
        startExp: 61_512,
        rate: 250_000,
        description: 'Super attack potions'
      },
      {
        startExp: 368_599,
        rate: 356_250,
        description: 'Super restore potions'
      },
      {
        startExp: 1_336_443,
        rate: 431_250,
        description: 'Magic potions'
      },
      {
        startExp: 2_192_818,
        rate: 450_000,
        description: 'Saradomin brews'
      }
    ],
    bonuses: []
  },
  {
    skill: 'agility',
    methods: [
      {
        startExp: 0,
        rate: 8_000,
        description: 'Gnome Stronghold Agility Course'
      },
      {
        startExp: 13_363,
        rate: 20_000,
        description: 'Penguin Agility Course'
      },
      {
        startExp: 83_014,
        rate: 44_000,
        description: 'Ape Atoll Agility Course'
      },
      {
        startExp: 123_660,
        rate: 45_000,
        description: 'Floor 1 of The Hallowed Sepulchre'
      },
      {
        startExp: 333_804,
        rate: 57_000,
        description: 'Floors 1-2 of The Hallowed Sepulchre'
      },
      {
        startExp: 899_257,
        rate: 67_750,
        description: 'Floors 1-3 of The Hallowed Sepulchre'
      },
      {
        startExp: 2_421_087,
        rate: 73_500,
        description: 'Floors 1-4 of The Hallowed Sepulchre'
      },
      {
        startExp: 6_517_253,
        rate: 95_000,
        description: 'Floors 1-5 of The Hallowed Sepulchre'
      }
    ],
    bonuses: [
      {
        originSkill: 'agility',
        bonusSkill: 'thieving',
        startExp: 6_517_253,
        endExp: 200_000_000,
        end: true,
        ratio: 0.017
      }
    ]
  },
  {
    skill: 'thieving',
    methods: [
      {
        startExp: 0,
        rate: 15_000,
        description: 'Questing XP'
      },
      {
        startExp: 61_512,
        rate: 60_000,
        description: 'Blackjacking'
      },
      {
        startExp: 166_636,
        rate: 100_000,
        description: 'Blackjacking'
      },
      {
        startExp: 449_428,
        rate: 220_000,
        description: 'Blackjacking'
      },
      {
        startExp: 5_902_831,
        rate: 255_000,
        description: 'Pyramid Plunder'
      },
      {
        startExp: 13_034_431,
        rate: 280_000,
        description: 'Pyramid Plunder'
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
        description: 'Efficient Slayer'
      },
      {
        startExp: 37_224,
        rate: 12_000,
        description: 'Efficient Slayer'
      },
      {
        startExp: 100_000,
        rate: 40_000,
        description: 'Efficient Slayer'
      },
      {
        startExp: 449_428,
        rate: 69_500,
        description: 'Efficient Slayer'
      },
      {
        startExp: 1_986_068,
        rate: 68_500,
        description: 'Efficient Slayer'
      },
      {
        startExp: 3_258_594,
        rate: 76_000,
        description: 'Efficient Slayer'
      },
      {
        startExp: 5_346_332,
        rate: 76_000,
        description: 'Efficient Slayer'
      },
      {
        startExp: 7_195_629,
        rate: 82_000,
        description: 'Efficient Slayer'
      },
      {
        startExp: 13_034_431,
        rate: 83_000,
        description: 'Efficient Slayer'
      }
    ],
    bonuses: [
      {
        originSkill: 'slayer',
        bonusSkill: 'strength',
        startExp: 0,
        endExp: 1_986_068,
        end: false,
        ratio: 0.23
      },
      {
        originSkill: 'slayer',
        bonusSkill: 'strength',
        startExp: 1_986_068,
        endExp: 3_258_594,
        end: false,
        ratio: 1.35
      },
      {
        originSkill: 'slayer',
        bonusSkill: 'strength',
        startExp: 3_258_594,
        endExp: 7_195_629,
        end: false,
        ratio: 0.81
      },
      {
        originSkill: 'slayer',
        bonusSkill: 'strength',
        startExp: 7_195_629,
        endExp: 200_000_000,
        end: false,
        ratio: 0.59
      },
      {
        originSkill: 'slayer',
        bonusSkill: 'defence',
        startExp: 0,
        endExp: 1_986_068,
        end: false,
        ratio: 0.47
      },
      {
        originSkill: 'slayer',
        bonusSkill: 'defence',
        startExp: 1_986_068,
        endExp: 3_258_594,
        end: false,
        ratio: 0.34
      },
      {
        originSkill: 'slayer',
        bonusSkill: 'defence',
        startExp: 3_258_594,
        endExp: 7_195_629,
        end: false,
        ratio: 0.47
      },
      {
        originSkill: 'slayer',
        bonusSkill: 'defence',
        startExp: 7_195_629,
        endExp: 13_034_431,
        end: false,
        ratio: 0.51
      },
      {
        originSkill: 'slayer',
        bonusSkill: 'defence',
        startExp: 13_034_431,
        endExp: 200_000_000,
        end: false,
        ratio: 0.52
      },
      {
        originSkill: 'slayer',
        bonusSkill: 'ranged',
        startExp: 0,
        endExp: 1_986_068,
        end: false,
        ratio: 0.62
      },
      {
        originSkill: 'slayer',
        bonusSkill: 'ranged',
        startExp: 1_986_068,
        endExp: 3_258_594,
        end: false,
        ratio: 0.47
      },
      {
        originSkill: 'slayer',
        bonusSkill: 'ranged',
        startExp: 3_258_594,
        endExp: 7_195_629,
        end: false,
        ratio: 0.37
      },
      {
        originSkill: 'slayer',
        bonusSkill: 'ranged',
        startExp: 7_195_629,
        endExp: 13_034_431,
        end: false,
        ratio: 0.31
      },
      {
        originSkill: 'slayer',
        bonusSkill: 'ranged',
        startExp: 13_034_431,
        endExp: 200_000_000,
        end: false,
        ratio: 0.3
      },
      {
        originSkill: 'slayer',
        bonusSkill: 'prayer',
        startExp: 0,
        endExp: 1_986_068,
        end: false,
        ratio: 0.019
      },
      {
        originSkill: 'slayer',
        bonusSkill: 'prayer',
        startExp: 1_986_068,
        endExp: 3_258_594,
        end: false,
        ratio: 0.058
      },
      {
        originSkill: 'slayer',
        bonusSkill: 'prayer',
        startExp: 3_258_594,
        endExp: 5_346_332,
        end: false,
        ratio: 0.112
      },
      {
        originSkill: 'slayer',
        bonusSkill: 'prayer',
        startExp: 5_346_332,
        endExp: 7_195_629,
        end: false,
        ratio: 0.213
      },
      {
        originSkill: 'slayer',
        bonusSkill: 'prayer',
        startExp: 7_195_629,
        endExp: 13_034_431,
        end: false,
        ratio: 0.194
      },
      {
        originSkill: 'slayer',
        bonusSkill: 'prayer',
        startExp: 13_034_431,
        endExp: 200_000_000,
        end: false,
        ratio: 0.197
      },
      {
        originSkill: 'slayer',
        bonusSkill: 'attack',
        startExp: 0,
        endExp: 200_000_000,
        end: false,
        ratio: 1
      }
    ]
  },
  {
    skill: 'farming',
    methods: [
      {
        startExp: 0,
        rate: 10_000,
        description: 'Bagged plants'
      },
      {
        startExp: 2_411,
        rate: 50_000,
        description: 'Tree runs'
      },
      {
        startExp: 13_363,
        rate: 80_000,
        description: 'Tree runs'
      },
      {
        startExp: 61_512,
        rate: 150_000,
        description: 'Tree runs'
      },
      {
        startExp: 273_742,
        rate: 350_000,
        description: 'Tree runs'
      },
      {
        startExp: 1_210_421,
        rate: 1_900_000,
        description: 'Tree runs'
      }
    ],
    bonuses: []
  },
  {
    skill: 'runecrafting',
    methods: [
      {
        startExp: 0,
        rate: 8_000,
        description: 'Questing XP'
      },
      {
        startExp: 2_106,
        rate: 20_000,
        description: 'Questing XP'
      },
      {
        startExp: 6_291,
        rate: 240_000,
        description: '0+4 Lava runes'
      }
    ],
    bonuses: []
  },
  {
    skill: 'hunter',
    methods: [
      {
        startExp: 0,
        rate: 55_000,
        description: 'Varrock Museum'
      },
      {
        startExp: 2_411,
        rate: 82_000,
        description: 'Oak bird house runs'
      },
      {
        startExp: 7_842,
        rate: 110_000,
        description: 'Willow bird house runs'
      },
      {
        startExp: 22_406,
        rate: 138_000,
        description: 'Teak bird house runs'
      },
      {
        startExp: 61_512,
        rate: 161_000,
        description: 'Maple bird house runs'
      },
      {
        startExp: 101_333,
        rate: 251_565,
        description: 'Drift Net (Chinchompas)'
      },
      {
        startExp: 273_742,
        rate: 291_175,
        description: 'Drift Net (Chinchompas)'
      },
      {
        startExp: 737_627,
        rate: 255_000,
        description: 'Drift Net (Chinchompas)'
      }
    ],
    bonuses: [
      {
        originSkill: 'hunter',
        bonusSkill: 'fishing',
        startExp: 737_627,
        endExp: 200_000_000,
        end: true,
        ratio: 0.7586,
        maxBonus: 24_985_376
      }
    ]
  },
  {
    skill: 'construction',
    methods: [
      {
        startExp: 0,
        rate: 100_000,
        description: 'Oak chairs'
      },
      {
        startExp: 18_247,
        rate: 480_000,
        description: 'Oak larders'
      },
      {
        startExp: 123_660,
        rate: 935_000,
        description: 'Mahogany tables'
      }
    ],
    bonuses: []
  }
];
