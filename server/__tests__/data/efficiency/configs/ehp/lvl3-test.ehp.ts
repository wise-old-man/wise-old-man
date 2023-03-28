import { Skill } from '../../../../../src/utils';

export default [
  {
    skill: Skill.COOKING,
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
    skill: Skill.WOODCUTTING,
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
        rate: 87_750,
        description: '1.5t Teaks'
      },
      {
        startExp: 41_171,
        rate: 108_161,
        description: '1.5t Teaks'
      },
      {
        startExp: 111_945,
        rate: 119_224,
        description: '1.5t Teaks'
      },
      {
        startExp: 302_288,
        rate: 148_471,
        description: '1.5t Teaks'
      },
      {
        startExp: 737_627,
        rate: 158_861,
        description: '1.5t Teaks'
      },
      {
        startExp: 1_986_068,
        rate: 171_832,
        description: '1.5t Teaks'
      },
      {
        startExp: 5_346_332,
        rate: 183_623,
        description: '1.5t Teaks'
      },
      {
        startExp: 13_034_431,
        rate: 195_178,
        description: '1.5t Teaks'
      }
    ],
    bonuses: [
      {
        originSkill: Skill.WOODCUTTING,
        bonusSkill: Skill.FIREMAKING,
        startExp: 302_288,
        endExp: 200_000_000,
        end: true,
        ratio: 0.2
      }
    ]
  },
  {
    skill: Skill.FISHING,
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
        rate: 82_355,
        description: 'Fly fishing (Trout & Salmon)'
      },
      {
        startExp: 273_742,
        rate: 97_862,
        description: 'Fly fishing (Trout & Salmon)'
      },
      {
        startExp: 737_627,
        rate: 124_127,
        description: 'Fly fishing (Trout & Salmon)'
      },
      {
        startExp: 1_986_068,
        rate: 128_908,
        description: 'Fly fishing (Trout & Salmon)'
      },
      {
        startExp: 5_346_332,
        rate: 131_109,
        description: 'Fly fishing (Trout & Salmon)'
      },
      {
        startExp: 13_034_431,
        rate: 95_000,
        description: 'Fly fishing (Trout & Salmon)'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.FIREMAKING,
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
        description: 'Firebwan (Mahogany logs)'
      },
      {
        startExp: 273_742,
        rate: 298_485,
        description: 'Firebwan (Yew logs)'
      },
      {
        startExp: 1_210_421,
        rate: 447_801,
        description: 'Firebwan (Magic logs)'
      },
      {
        startExp: 5_346_332,
        rate: 505_000,
        description: 'Firebwan (Redwood logs)'
      }
    ],
    bonuses: [
      {
        originSkill: Skill.FIREMAKING,
        bonusSkill: Skill.COOKING,
        startExp: 101_333,
        endExp: 200_000_000,
        end: true,
        ratio: 0.7
      }
    ]
  },
  {
    skill: Skill.CRAFTING,
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
    skill: Skill.SMITHING,
    methods: [
      {
        startExp: 0,
        rate: 40_000,
        description: 'Questing XP'
      },
      {
        startExp: 14_833,
        rate: 104_000,
        description: 'Iron platebodies'
      },
      {
        startExp: 83_014,
        rate: 156_000,
        description: 'Steel platebodies'
      },
      {
        startExp: 605_032,
        rate: 208_000,
        description: 'Mithril platebodies'
      },
      {
        startExp: 4_385_776,
        rate: 260_000,
        description: 'Adamant platebodies'
      },
      {
        startExp: 13_034_431,
        rate: 410_000,
        description: 'Blast Furnace Gold'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.MINING,
    methods: [
      {
        startExp: 0,
        rate: 30_000,
        description: 'Questing XP'
      },
      {
        startExp: 13_363,
        rate: 53_780,
        description: '3t Iron'
      },
      {
        startExp: 61_512,
        rate: 77_727,
        description: '3t4g at Desert Quarry'
      },
      {
        startExp: 101_333,
        rate: 81_046,
        description: '3t4g at Desert Quarry'
      },
      {
        startExp: 302_288,
        rate: 88_350,
        description: '3t4g at Desert Quarry'
      },
      {
        startExp: 737_627,
        rate: 93_609,
        description: '3t4g at Desert Quarry'
      },
      {
        startExp: 1_986_068,
        rate: 98_474,
        description: '3t4g at Desert Quarry'
      },
      {
        startExp: 3_258_594,
        rate: 46_500,
        description: 'Motherlode Mine for Prospector kit'
      },
      {
        startExp: 3_693_744,
        rate: 103_620,
        description: '3t4g at Desert Quarry'
      },
      {
        startExp: 5_346_332,
        rate: 105_125,
        description: '3t4g at Desert Quarry'
      },
      {
        startExp: 13_034_431,
        rate: 114_130,
        description: '3t4g at Desert Quarry'
      }
    ],
    bonuses: [
      {
        originSkill: Skill.MINING,
        bonusSkill: Skill.SMITHING,
        startExp: 302_288,
        endExp: 200_000_000,
        end: true,
        ratio: 0.08
      }
    ]
  },
  {
    skill: Skill.HERBLORE,
    methods: [
      {
        startExp: 0,
        rate: 6_000,
        description: 'Questing XP'
      },
      {
        startExp: 3_000,
        rate: 125_000,
        description: 'Strength potions'
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
    skill: Skill.AGILITY,
    methods: [
      {
        startExp: 0,
        rate: 6_000,
        description: 'Gnome Stronghold Agility Course'
      },
      {
        startExp: 1_154,
        rate: 9_000,
        description: 'Draynor Agility Course'
      },
      {
        startExp: 13_363,
        rate: 13_000,
        description: 'Varrock Agility Course'
      },
      {
        startExp: 75_127,
        rate: 42_000,
        description: 'Wilderness Agility Course'
      },
      {
        startExp: 273_742,
        rate: 45_000,
        description: "Seers' Village Agility Course"
      },
      {
        startExp: 737_627,
        rate: 49_000,
        description: 'Pollnivneach Agility Course'
      },
      {
        startExp: 1_986_086,
        rate: 52_000,
        description: 'Rellekka Agility Course'
      },
      {
        startExp: 3_972_294,
        rate: 59_000,
        description: 'Ardougne Agility Course'
      },
      {
        startExp: 9_684_577,
        rate: 62_300,
        description: 'Swimming'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.THIEVING,
    methods: [
      {
        startExp: 0,
        rate: 15_000,
        description: 'Questing XP'
      },
      {
        startExp: 2_500,
        rate: 28_800,
        description: 'Bakery Stall'
      },
      {
        startExp: 7_842,
        rate: 39_000,
        description: 'Fruit Stall'
      },
      {
        startExp: 61_512,
        rate: 55_000,
        description: 'Blackjacking'
      },
      {
        startExp: 166_636,
        rate: 90_000,
        description: 'Blackjacking'
      },
      {
        startExp: 449_428,
        rate: 215_000,
        description: 'Blackjacking'
      },
      {
        startExp: 5_902_831,
        rate: 250_000,
        description: 'Pyramid Plunder'
      },
      {
        startExp: 13_034_431,
        rate: 260_000,
        realRate: 139_062,
        description: 'Swimming'
      }
    ],
    bonuses: [
      {
        originSkill: Skill.THIEVING,
        bonusSkill: Skill.AGILITY,
        startExp: 13_034_431,
        endExp: 200_000_000,
        end: true,
        ratio: 0.2727272727
      }
    ]
  },
  {
    skill: Skill.FARMING,
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
    skill: Skill.RUNECRAFTING,
    methods: [
      {
        startExp: 0,
        rate: 8_000,
        description: 'Questing XP & Earth runes'
      },
      {
        startExp: 6_291,
        rate: 230_000,
        description: '0+4 Lava runes'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.HUNTER,
    methods: [
      {
        startExp: 0,
        rate: 55_000,
        description: 'Varrock Museum'
      },
      {
        startExp: 2_107,
        rate: 82_000,
        description: 'Oak bird house runs'
      },
      {
        startExp: 7_028,
        rate: 110_000,
        description: 'Willow bird house runs'
      },
      {
        startExp: 20_224,
        rate: 138_000,
        description: 'Teak bird house runs'
      },
      {
        startExp: 55_649,
        rate: 161_000,
        description: 'Maple bird house runs'
      },
      {
        startExp: 101_333,
        rate: 361_981,
        description: 'Drift net'
      },
      {
        startExp: 273_742,
        rate: 427_613,
        description: 'Drift net'
      },
      {
        startExp: 737_627,
        rate: 430_165,
        description: 'Drift net'
      },
      {
        startExp: 1_986_068,
        rate: 391_950,
        description: 'Drift net'
      },
      {
        startExp: 5_346_332,
        rate: 377_338,
        description: 'Drift net'
      },
      {
        startExp: 13_034_431,
        rate: 310_000,
        realRate: 118_535,
        description: 'Drift net (Bird house runs)'
      }
    ],
    bonuses: [
      {
        originSkill: Skill.HUNTER,
        bonusSkill: Skill.FISHING,
        startExp: 13_034_431,
        endExp: 200_000_000,
        end: true,
        ratio: 0.7586029443
      }
    ]
  },
  {
    skill: Skill.CONSTRUCTION,
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
      },
      {
        startExp: 1_475_581,
        rate: 1_050_000,
        description: 'Mahogany benches'
      }
    ],
    bonuses: []
  }
];
