import { Skill } from '../../../../../types';

export default [
  {
    skill: Skill.ATTACK,
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
        description: 'Bonus XP from Slayer'
      },
      {
        startExp: 13_034_431,
        rate: 505_000,
        description: 'Bonus XP from Slayer'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.DEFENCE,
    methods: [
      {
        startExp: 0,
        rate: 420_000,
        description: "Chinning in Kruk's Dungeon"
      }
    ],
    bonuses: [
      {
        originSkill: Skill.DEFENCE,
        bonusSkill: Skill.RANGED,
        startExp: 0,
        endExp: 200_000_000,
        end: false,
        ratio: 1.25
      },
      {
        originSkill: Skill.DEFENCE,
        bonusSkill: Skill.PRAYER,
        startExp: 0,
        endExp: 200_000_000,
        end: false,
        ratio: 0.154
      }
    ]
  },
  {
    skill: Skill.STRENGTH,
    methods: [
      {
        startExp: 0,
        rate: 15_000,
        description: 'Quests'
      },
      {
        startExp: 37_224,
        rate: 38_000,
        description: 'Bonus XP from Slayer'
      },
      {
        startExp: 61_512,
        rate: 145_000,
        description: 'Bonus XP from Slayer'
      },
      {
        startExp: 449_428,
        rate: 245_000,
        description: 'Bonus XP from Slayer'
      },
      {
        startExp: 1_986_068,
        rate: 300_000,
        description: 'Bonus XP from Slayer'
      },
      {
        startExp: 6_517_253,
        rate: 335_000,
        description: 'Bonus XP from Slayer'
      },
      {
        startExp: 13_034_431,
        rate: 415_000,
        description: 'Bonus XP from Slayer'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.RANGED,
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
        rate: 1_190_000,
        description: 'Chinning maniacal monkeys'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.PRAYER,
    methods: [
      {
        startExp: 0,
        rate: 1_670_000,
        description: 'Dagannoth bones at the chaos altar'
      },
      {
        startExp: 737_627,
        rate: 2_000_000,
        description: 'Superior dragon bones at the chaos altar'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.COOKING,
    methods: [
      {
        startExp: 0,
        rate: 172_800,
        description: '1t poison karambwan'
      },
      {
        startExp: 13_363,
        rate: 519_100,
        description: '1t karambwan'
      },
      {
        startExp: 37_224,
        rate: 591_600,
        description: '1t karambwan'
      },
      {
        startExp: 101_333,
        rate: 663_600,
        description: '1t karambwan'
      },
      {
        startExp: 273_742,
        rate: 735_700,
        description: '1t karambwan'
      },
      {
        startExp: 737_627,
        rate: 808_000,
        description: '1t karambwan'
      },
      {
        startExp: 1_986_068,
        rate: 880_400,
        description: '1t karambwan'
      },
      {
        startExp: 5_346_332,
        rate: 948_100,
        description: '1t karambwan'
      },
      {
        startExp: 13_034_431,
        rate: 980_000,
        description: '1t karambwan'
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
        rate: 56_000,
        description: '2t oaks (average rate)'
      },
      {
        startExp: 22_406,
        rate: 93_174,
        description: '1.5t teaks'
      },
      {
        startExp: 41_171,
        rate: 114_728,
        description: '1.5t teaks'
      },
      {
        startExp: 111_945,
        rate: 127_339,
        description: '1.5t teaks'
      },
      {
        startExp: 302_288,
        rate: 172_507,
        description: '1.5t teaks'
      },
      {
        startExp: 814_445,
        rate: 194_022,
        description: '1.5t teaks'
      },
      {
        startExp: 1_986_068,
        rate: 207_636,
        description: '1.5t teaks'
      },
      {
        startExp: 5_346_332,
        rate: 221_977,
        description: '1.5t teaks'
      },
      {
        startExp: 13_034_431,
        rate: 235_000,
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
        rate: 84_686,
        description: 'Drift net fishing (67.7k hunter & 58k fishing xp/h)'
      },
      {
        startExp: 106_046,
        rate: 97_867,
        description: 'Drift net fishing (84.7k hunter & 67k fishing xp/h)'
      },
      {
        startExp: 229_685,
        rate: 112_877,
        description: 'Drift net fishing (98.7k hunter & 74.9k fishing xp/h)'
      },
      {
        startExp: 302_288,
        rate: 128_082,
        description: 'Drift net fishing (112.8k hunter & 83.3k fishing xp/h)'
      },
      {
        startExp: 593_234,
        rate: 139_313,
        description: 'Drift net fishing (123k hunter & 90.5k fishing xp/h)'
      },
      {
        startExp: 737_627,
        rate: 132_800,
        description: 'Drift net fishing (123k hunter & 93.3k fishing xp/h) + 2t swordfish & tuna'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.FIREMAKING,
    methods: [
      {
        startExp: 0,
        rate: 73_700,
        description: 'Colored logs'
      },
      {
        startExp: 22_406,
        rate: 138_900,
        description: 'Teak logs'
      },
      {
        startExp: 45_529,
        rate: 184_250,
        description: 'Arctic pine logs'
      },
      {
        startExp: 61_512,
        rate: 198_990,
        description: 'Maple logs'
      },
      {
        startExp: 101_333,
        rate: 403_745,
        description: 'Artefacts with firemaking (160.5k thieving & 135.9k firemaking xp/h)'
      },
      {
        startExp: 273_742,
        rate: 551_169,
        description: 'Artefacts with firemaking (191k thieving & 174.7k firemaking xp/h)'
      },
      {
        startExp: 1_210_421,
        rate: 775_388,
        description: 'Artefacts with firemaking (220.6k thieving & 262.1k firemaking xp/h)'
      },
      {
        startExp: 5_346_332,
        rate: 872_198,
        description: 'Artefacts with firemaking (242.2k thieving & 302k firemaking xp/h)'
      },
      {
        startExp: 13_034_431,
        rate: 789_944,
        realRate: 302_000,
        description: 'Artefacts with firemaking (255k thieving & 302k firemaking xp/h)'
      }
    ],
    bonuses: [
      {
        originSkill: Skill.FIREMAKING,
        bonusSkill: Skill.THIEVING,
        startExp: 13_034_431,
        endExp: 200_000_000,
        end: true,
        ratio: 0.8443
      }
    ]
  },
  {
    skill: Skill.CRAFTING,
    methods: [
      {
        startExp: 0,
        rate: 37_000,
        description: 'Leather items'
      },
      {
        startExp: 4_470,
        rate: 139_000,
        description: 'Sapphires'
      },
      {
        startExp: 9_730,
        rate: 187_650,
        description: 'Emeralds'
      },
      {
        startExp: 20_224,
        rate: 236_300,
        description: 'Rubies'
      },
      {
        startExp: 50_339,
        rate: 298_850,
        description: 'Diamonds'
      },
      {
        startExp: 368_599,
        rate: 335_230,
        description: "Green d'hide bodies"
      },
      {
        startExp: 814_445,
        rate: 378_490,
        description: "Blue d'hide bodies"
      },
      {
        startExp: 1_475_581,
        rate: 421_740,
        description: "Red d'hide bodies"
      },
      {
        startExp: 2_951_373,
        rate: 465_000,
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
        rate: 46_500,
        description: 'Quests'
      },
      {
        startExp: 37_224,
        rate: 475_000,
        description: 'Dolo Blast Furnace gold'
      },
      {
        startExp: 13_034_431,
        rate: 505_000,
        description: 'Dolo Blast Furnace gold'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.MINING,
    methods: [
      {
        startExp: 0,
        rate: 20_000,
        description: 'Quests'
      },
      {
        startExp: 35_025,
        rate: 50_600,
        description: 'Motherlode Mine for the prospector kit and Shooting Stars for the celestial ring'
      },
      {
        startExp: 393_485,
        rate: 106_540,
        description: '3t granite'
      },
      {
        startExp: 1_210_421,
        rate: 112_166,
        description: '3t granite'
      },
      {
        startExp: 3_258_594,
        rate: 116_760,
        description: '3t granite'
      },
      {
        startExp: 8_771_558,
        rate: 119_438,
        description: '3t granite'
      },
      {
        startExp: 13_034_431,
        rate: 126_000,
        description: '3t granite'
      }
    ],
    bonuses: [
      {
        originSkill: Skill.MINING,
        bonusSkill: Skill.SMITHING,
        startExp: 1_210_421,
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
        rate: 11_100,
        description: 'Quests'
      },
      {
        startExp: 8_025,
        rate: 218_750,
        description: "Serum 207's"
      },
      {
        startExp: 123_660,
        rate: 293_750,
        description: 'Super energies'
      },
      {
        startExp: 166_636,
        rate: 312_500,
        description: 'Super strengths'
      },
      {
        startExp: 368_599,
        rate: 356_250,
        description: 'Super restores'
      },
      {
        startExp: 496_254,
        rate: 375_000,
        description: 'Super defences'
      },
      {
        startExp: 668_051,
        rate: 393_750,
        description: 'Antifire potions'
      },
      {
        startExp: 899_257,
        rate: 406_250,
        description: 'Ranging potions'
      },
      {
        startExp: 1_336_443,
        rate: 431_250,
        description: 'Magic potions'
      },
      {
        startExp: 1_475_581,
        rate: 535_500,
        description: '1t stamina potions'
      },
      {
        startExp: 2_951_373,
        rate: 577_500,
        description: '1t extended antifires'
      },
      {
        startExp: 3_972_294,
        rate: 630_000,
        description: '1t anti-venoms'
      },
      {
        startExp: 11_805_606,
        rate: 840_000,
        description: '1t extended super antifires'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.AGILITY,
    methods: [
      {
        startExp: 0,
        rate: 15_100,
        description: 'Quests'
      },
      {
        startExp: 75_127,
        rate: 35_000,
        description: 'Wilderness Agility Course'
      },
      {
        startExp: 123_660,
        rate: 45_000,
        description: 'Hallowed Sepulchre'
      },
      {
        startExp: 333_804,
        rate: 56_300,
        description: 'Hallowed Sepulchre'
      },
      {
        startExp: 899_257,
        rate: 68_900,
        description: 'Hallowed Sepulchre'
      },
      {
        startExp: 2_421_087,
        rate: 79_700,
        description: 'Hallowed Sepulchre'
      },
      {
        startExp: 6_517_253,
        rate: 102_000,
        description: 'Hallowed Sepulchre with ancient & forgotten brews'
      }
    ],
    bonuses: [
      {
        originSkill: Skill.AGILITY,
        bonusSkill: Skill.HERBLORE,
        startExp: 6_517_253,
        endExp: 200_000_000,
        end: true,
        ratio: 0.6485
      }
    ]
  },
  {
    skill: Skill.THIEVING,
    methods: [
      {
        startExp: 0,
        rate: 15_000,
        description: 'Quests, fruit stalls'
      },
      {
        startExp: 61_512,
        rate: 80_000,
        description: 'Blackjacking'
      },
      {
        startExp: 91_721,
        rate: 241_906,
        description: 'Artefacts with firemaking (160.5k thieving & 135.9k firemaking xp/h)'
      },
      {
        startExp: 295_315,
        rate: 279_597,
        description: 'Artefacts with firemaking (191k thieving & 174.7k firemaking xp/h)'
      },
      {
        startExp: 1_319_012,
        rate: 333_283,
        description: 'Artefacts with firemaking (220.6k thieving & 262.1k firemaking xp/h)'
      },
      {
        startExp: 4_799_743,
        rate: 370_532,
        description: 'Artefacts with firemaking (242.2k thieving & 302k firemaking xp/h)'
      },
      {
        startExp: 10_966_391,
        rate: 363_882,
        description: 'Artefacts with ancient brews (255.6k thieving & 250k herblore xp/h)'
      },
      {
        startExp: 13_034_431,
        rate: 370_169,
        description: 'Artefacts with ancient brews after 200m firemaking (260k thieving & 250k herblore xp/h)'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.SLAYER,
    methods: [
      {
        startExp: 0,
        rate: 5_000,
        description: 'Efficient slayer'
      },
      {
        startExp: 37_224,
        rate: 12_000,
        description: 'Efficient Slayer'
      },
      {
        startExp: 101_333,
        rate: 40_000,
        description: 'Efficient Slayer'
      },
      {
        startExp: 449_428,
        rate: 74_250,
        description: 'Efficient Slayer'
      },
      {
        startExp: 1_986_068,
        rate: 79_000,
        description: 'Efficient Slayer'
      },
      {
        startExp: 3_258_594,
        rate: 86_500,
        description: 'Efficient Slayer'
      },
      {
        startExp: 5_346_332,
        rate: 87_000,
        description: 'Efficient Slayer'
      },
      {
        startExp: 7_195_629,
        rate: 93_000,
        description: 'Efficient Slayer'
      },
      {
        startExp: 13_034_431,
        rate: 105_800,
        description: 'Efficient Slayer'
      }
    ],
    bonuses: [
      {
        originSkill: Skill.SLAYER,
        bonusSkill: Skill.ATTACK,
        startExp: 0,
        endExp: 200_000_000,
        end: false,
        ratio: 1
      },
      {
        originSkill: Skill.SLAYER,
        bonusSkill: Skill.STRENGTH,
        startExp: 0,
        endExp: 200_000_000,
        end: false,
        ratio: 1
      },
      {
        originSkill: Skill.SLAYER,
        bonusSkill: Skill.DEFENCE,
        startExp: 0,
        endExp: 200_000_000,
        end: false,
        ratio: 0.493
      },
      {
        originSkill: Skill.SLAYER,
        bonusSkill: Skill.RANGED,
        startExp: 0,
        endExp: 1_986_068,
        end: false,
        ratio: 0.3299
      },
      {
        originSkill: Skill.SLAYER,
        bonusSkill: Skill.RANGED,
        startExp: 1_986_068,
        endExp: 3_258_594,
        end: false,
        ratio: 0.2494
      },
      {
        originSkill: Skill.SLAYER,
        bonusSkill: Skill.RANGED,
        startExp: 3_258_594,
        endExp: 5_346_332,
        end: false,
        ratio: 0.1896
      },
      {
        originSkill: Skill.SLAYER,
        bonusSkill: Skill.RANGED,
        startExp: 5_346_332,
        endExp: 7_195_629,
        end: false,
        ratio: 0.174
      },
      {
        originSkill: Skill.SLAYER,
        bonusSkill: Skill.RANGED,
        startExp: 7_195_629,
        endExp: 13_034_431,
        end: false,
        ratio: 0.1521
      },
      {
        originSkill: Skill.SLAYER,
        bonusSkill: Skill.RANGED,
        startExp: 13_034_431,
        endExp: 200_000_000,
        end: false,
        ratio: 0.11
      },
      {
        originSkill: Skill.SLAYER,
        bonusSkill: Skill.PRAYER,
        startExp: 0,
        endExp: 1_986_068,
        end: false,
        ratio: 0.0673
      },
      {
        originSkill: Skill.SLAYER,
        bonusSkill: Skill.PRAYER,
        startExp: 1_986_068,
        endExp: 3_258_594,
        end: false,
        ratio: 0.0824
      },
      {
        originSkill: Skill.SLAYER,
        bonusSkill: Skill.PRAYER,
        startExp: 3_258_594,
        endExp: 5_346_332,
        end: false,
        ratio: 0.11917
      },
      {
        originSkill: Skill.SLAYER,
        bonusSkill: Skill.PRAYER,
        startExp: 5_346_332,
        endExp: 7_195_629,
        end: false,
        ratio: 0.21689
      },
      {
        originSkill: Skill.SLAYER,
        bonusSkill: Skill.PRAYER,
        startExp: 7_195_629,
        endExp: 13_034_431,
        end: false,
        ratio: 0.18914
      },
      {
        originSkill: Skill.SLAYER,
        bonusSkill: Skill.PRAYER,
        startExp: 13_034_431,
        endExp: 200_000_000,
        end: false,
        ratio: 0.21605
      }
    ]
  },
  {
    skill: Skill.FARMING,
    methods: [
      {
        startExp: 0,
        rate: 16_000,
        description: 'Quests'
      },
      {
        startExp: 32_500,
        rate: 304_000,
        description: 'Tree runs'
      },
      {
        startExp: 61_512,
        rate: 506_000,
        description: 'Tree runs'
      },
      {
        startExp: 166_636,
        rate: 719_000,
        description: 'Tree runs'
      },
      {
        startExp: 273_742,
        rate: 1_083_000,
        description: 'Tree runs'
      },
      {
        startExp: 605_032,
        rate: 1_362_000,
        description: 'Tree runs'
      },
      {
        startExp: 1_210_421,
        rate: 1_896_000,
        description: 'Tree runs'
      },
      {
        startExp: 2_192_818,
        rate: 2_314_000,
        description: 'Tree runs'
      },
      {
        startExp: 3_258_594,
        rate: 2_475_000,
        description: 'Tree runs'
      },
      {
        startExp: 5_346_332,
        rate: 2_500_000,
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
        rate: 13_600,
        description: 'Quests'
      },
      {
        startExp: 33_210,
        rate: 45_000,
        description: 'GotR rewards'
      },
      {
        startExp: 1_210_421,
        rate: 75_400,
        description: 'Solo mud runes'
      },
      {
        startExp: 3_258_594,
        rate: 106_100,
        description: 'Solo mud runes'
      },
      {
        startExp: 13_034_431,
        rate: 162_000,
        description: 'Duo lava runes'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.HUNTER,
    methods: [
      {
        startExp: 0,
        rate: 30_000,
        description: 'Varrock museum and birdhouses'
      },
      {
        startExp: 2_107,
        rate: 83_000,
        description: 'Oak birdhouses'
      },
      {
        startExp: 7_028,
        rate: 110_000,
        description: 'Willow birdhouses'
      },
      {
        startExp: 20_224,
        rate: 138_000,
        description: 'Teak birdhouses'
      },
      {
        startExp: 55_649,
        rate: 215_112,
        description: 'Drift net fishing (67.7k hunter & 58.0k fishing xp/h)'
      },
      {
        startExp: 91_721,
        rate: 268_770,
        description: 'Drift net fishing (84.7k hunter & 67.0k fishing xp/h)'
      },
      {
        startExp: 24_886,
        rate: 293_310,
        description: 'Drift net fishing (98.7k hunter & 74.9k fishing xp/h)'
      },
      {
        startExp: 343_551,
        rate: 322_424,
        description: 'Drift net fishing (112.8k hunter & 83.3k fishing xp/h)'
      },
      {
        startExp: 737_627,
        rate: 350_697,
        description: 'Drift net fishing (123.0k hunter & 90.5k fishing xp/h)'
      },
      {
        startExp: 933_979,
        rate: 265_000,
        realRate: 123_000,
        description: 'Drift net fishing (123k hunter & 93.3k fishing xp/h), scales to black chinchompas'
      }
    ],
    bonuses: [
      {
        originSkill: Skill.HUNTER,
        bonusSkill: Skill.FISHING,
        startExp: 933_979,
        endExp: 200_000_000,
        maxBonus: 32_414_530,
        end: true,
        ratio: 0.75862069443
      }
    ]
  },
  {
    skill: Skill.CONSTRUCTION,
    methods: [
      {
        startExp: 0,
        rate: 54_700,
        description: 'Low-level furniture'
      },
      {
        startExp: 18_247,
        rate: 450_000,
        description: 'Oak larders'
      },
      {
        startExp: 123_660,
        rate: 950_000,
        description: 'Mahogany tables'
      },
      {
        startExp: 1_475_581,
        rate: 1_070_000,
        description: 'Mahogany benches'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.SAILING,
    methods: [
      { startExp: 0, rate: 10_000, description: 'Port tasks, Charting & Quests' },
      { startExp: 13_363, rate: 25_000, description: 'Barracuda trials (The Tempor Tantrum)' },
      { startExp: 101_333, rate: 35_000, description: 'Large shipwrecks with boost' },
      { startExp: 166_636, rate: 85_000, description: 'Barracuda Trials (The Jubbly Jive)' },
      {
        startExp: 899_257,
        rate: 205_000,
        description: 'Barracuda Trials (The Gwenith Glide) - Camphor hull'
      },
      {
        startExp: 5_346_332,
        rate: 240_000,
        description: 'Barracuda Trials (The Gwenith Glide) - Rosewood hull'
      }
    ],
    bonuses: []
  }
];
