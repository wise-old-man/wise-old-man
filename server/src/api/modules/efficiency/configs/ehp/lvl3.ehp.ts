import { Skill } from '../../../../../utils';

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
        rate: 29_000,
        description: 'Quests and trees'
      },
      {
        startExp: 2_411,
        rate: 62_000,
        description: '2t oaks (average rate)'
      },
      {
        startExp: 22_406,
        rate: 101_272,
        description: '1.5t teaks'
      },
      {
        startExp: 41_171,
        rate: 125_015,
        description: '1.5t teaks'
      },
      {
        startExp: 111_945,
        rate: 137_760,
        description: '1.5t teaks'
      },
      {
        startExp: 302_288,
        rate: 171_408,
        description: '1.5t teaks'
      },
      {
        startExp: 737_627,
        rate: 183_346,
        description: '1.5t teaks'
      },
      {
        startExp: 1_986_068,
        rate: 198_235,
        description: '1.5t teaks'
      },
      {
        startExp: 5_346_332,
        rate: 211_761,
        description: '1.5t teaks'
      },
      {
        startExp: 13_034_431,
        rate: 225_000,
        description: '1.5t teaks'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.FISHING,
    methods: [
      {
        startExp: 0,
        rate: 29_200,
        description: 'Quests'
      },
      {
        startExp: 14_612,
        rate: 46_592,
        description: '3t fly fishing'
      },
      {
        startExp: 75_127,
        rate: 80_446,
        description: 'Drift net fishing (65.2k hunter & 55.9k fishing xp/h)'
      },
      {
        startExp: 106_046,
        rate: 92_041,
        description: 'Drift net fishing (81.6k hunter & 64.6k fishing xp/h)'
      },
      {
        startExp: 229_685,
        rate: 102_279,
        description: 'Drift net fishing (95.1k hunter & 72.2k fishing xp/h)'
      },
      {
        startExp: 302_288,
        rate: 123_438,
        description: 'Drift net fishing (108.7k hunter & 80.3k fishing xp/h)'
      },
      {
        startExp: 593_234,
        rate: 134_262,
        description: 'Drift net fishing (118.5k hunter & 87.2k fishing xp/h)'
      },
      {
        startExp: 737_627,
        rate: 120_000,
        description: 'Drift net fishing + 2t swordfish & tuna'
      }
    ],
    bonuses: [
      {
        originSkill: Skill.FISHING,
        bonusSkill: Skill.COOKING,
        startExp: 737_627,
        endExp: 200_000_000,
        end: true,
        ratio: 0.216
      }
    ]
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
        ratio: 0.2727
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
        rate: 30_080,
        description: 'Varrock museum and birdhouses'
      },
      {
        startExp: 2_107,
        rate: 82_849,
        description: 'Oak birdhouses'
      },
      {
        startExp: 7_028,
        rate: 110_466,
        description: 'Willow birdhouses'
      },
      {
        startExp: 20_224,
        rate: 138_082,
        description: 'Teak birdhouses'
      },
      {
        startExp: 55_649,
        rate: 214_059,
        description: 'Drift net fishing (65.2k hunter & 55.9k fishing xp/h)'
      },
      {
        startExp: 91_721,
        rate: 273_711,
        description: 'Drift net fishing (81.6k hunter & 64.6k fishing xp/h)'
      },
      {
        startExp: 247_886,
        rate: 323_167,
        description: 'Drift net fishing (95.1k hunter & 72.2k fishing xp/h)'
      },
      {
        startExp: 343_551,
        rate: 310_693,
        description: 'Drift net fishing (108.7k hunter & 80.3k fishing xp/h)'
      },
      {
        startExp: 737_627,
        rate: 337_937,
        description: 'Drift net fishing (118.5k hunter & 87.2k fishing xp/h)'
      },
      {
        startExp: 933_979,
        rate: 255_000,
        description: 'Drift net fishing (118.5k hunter & 89.9k fishing xp/h, scales to black chinchompas)'
      }
    ],
    bonuses: [
      {
        originSkill: Skill.HUNTER,
        bonusSkill: Skill.FISHING,
        startExp: 933_979,
        endExp: 200_000_000,
        end: true,
        ratio: 0.7586
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
