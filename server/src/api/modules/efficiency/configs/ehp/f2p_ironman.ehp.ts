import { Skill } from '../../../../../utils';

export default [
  {
    skill: Skill.ATTACK,
    methods: [
      {
        startExp: 0,
        rate: 12_000,
        description: 'Vampyre Slayer'
      },
      {
        startExp: 4_825,
        rate: 14_000,
        description: 'Minotaurs'
      },
      {
        startExp: 37_224,
        rate: 31_200,
        description: 'Hill Giants'
      },
      {
        startExp: 101_333,
        rate: 36_000,
        description: 'Hill Giants'
      },
      {
        startExp: 273_742,
        rate: 40_600,
        description: 'Hill Giants'
      },
      {
        startExp: 737_627,
        rate: 43_000,
        description: 'Hill Giants'
      },
      {
        startExp: 1_986_068,
        rate: 48_600,
        description: 'Hill Giants'
      },
      {
        startExp: 5_346_332,
        rate: 49_600,
        description: 'Hill Giants'
      },
      {
        startExp: 13_034_431,
        rate: 50_100,
        description: 'Ogresses & Hill Giants'
      }
    ],
    bonuses: [
      {
        originSkill: Skill.ATTACK,
        bonusSkill: Skill.PRAYER,
        startExp: 4_825,
        endExp: 37_224,
        end: true,
        ratio: 0.1125
      },
      {
        originSkill: Skill.ATTACK,
        bonusSkill: Skill.PRAYER,
        startExp: 37_224,
        endExp: 101_333,
        end: true,
        ratio: 0.1322
      },
      {
        originSkill: Skill.ATTACK,
        bonusSkill: Skill.PRAYER,
        startExp: 101_333,
        endExp: 273_742,
        end: true,
        ratio: 0.1289
      },
      {
        originSkill: Skill.ATTACK,
        bonusSkill: Skill.PRAYER,
        startExp: 273_742,
        endExp: 737_627,
        end: true,
        ratio: 0.1264
      },
      {
        originSkill: Skill.ATTACK,
        bonusSkill: Skill.PRAYER,
        startExp: 737_627,
        endExp: 1_986_068,
        end: true,
        ratio: 0.1254
      },
      {
        originSkill: Skill.ATTACK,
        bonusSkill: Skill.PRAYER,
        startExp: 1_986_068,
        endExp: 5_346_332,
        end: true,
        ratio: 0.1233
      },
      {
        originSkill: Skill.ATTACK,
        bonusSkill: Skill.PRAYER,
        startExp: 5_346_332,
        endExp: 13_034_431,
        end: true,
        ratio: 0.1229
      },
      {
        originSkill: Skill.ATTACK,
        bonusSkill: Skill.PRAYER,
        startExp: 13_034_431,
        endExp: 200_000_000,
        end: true,
        ratio: 0.1119
      },
      {
        originSkill: Skill.ATTACK,
        bonusSkill: Skill.CRAFTING,
        startExp: 37_224,
        endExp: 13_034_431,
        end: true,
        ratio: 0.0047
      },
      {
        originSkill: Skill.ATTACK,
        bonusSkill: Skill.CRAFTING,
        startExp: 13_034_431,
        endExp: 200_000_000,
        end: true,
        ratio: 0.0086
      }
    ]
  },
  {
    skill: Skill.DEFENCE,
    methods: [
      {
        startExp: 0,
        rate: 12_000,
        description: 'Dragon Slayer'
      },
      {
        startExp: 18_650,
        rate: 20_000,
        description: 'Longrange shortbow at ~70 ranged'
      },
      {
        startExp: 37_224,
        rate: 50_000,
        description: 'Ogresses & Hill Giants'
      }
    ],
    bonuses: [
      {
        originSkill: Skill.DEFENCE,
        bonusSkill: Skill.PRAYER,
        startExp: 18_650,
        endExp: 37_224,
        end: true,
        ratio: 0.0457
      },
      {
        originSkill: Skill.DEFENCE,
        bonusSkill: Skill.PRAYER,
        startExp: 37_224,
        endExp: 200_000_000,
        end: true,
        ratio: 0.1126
      },
      {
        originSkill: Skill.DEFENCE,
        bonusSkill: Skill.CRAFTING,
        startExp: 18_650,
        endExp: 37_224,
        end: true,
        ratio: 0.0326
      },
      {
        originSkill: Skill.DEFENCE,
        bonusSkill: Skill.CRAFTING,
        startExp: 37_224,
        endExp: 200_000_000,
        end: true,
        ratio: 0.0083
      }
    ]
  },
  {
    skill: Skill.STRENGTH,
    methods: [
      {
        startExp: 0,
        rate: 12_000,
        description: 'Dragon Slayer'
      },
      {
        startExp: 18_650,
        rate: 14_000,
        description: 'Cows/Minotaurs'
      },
      {
        startExp: 37_224,
        rate: 23_300,
        description: 'Hill Giants'
      },
      {
        startExp: 101_333,
        rate: 27_300,
        description: 'Hill Giants'
      },
      {
        startExp: 273_742,
        rate: 32_000,
        description: 'Hill Giants'
      },
      {
        startExp: 737_627,
        rate: 36_600,
        description: 'Hill Giants'
      },
      {
        startExp: 1_986_068,
        rate: 42_000,
        description: 'Hill Giants'
      },
      {
        startExp: 3_258_594,
        rate: 44_800,
        description: 'Hill Giants'
      },
      {
        startExp: 5_346_332,
        rate: 46_600,
        description: 'Hill Giants'
      },
      {
        startExp: 8_771_558,
        rate: 49_600,
        description: 'Hill Giants'
      },
      {
        startExp: 13_034_431,
        rate: 50_600,
        description: 'Ogresses & Hill Giants'
      }
    ],
    bonuses: [
      {
        originSkill: Skill.STRENGTH,
        bonusSkill: Skill.PRAYER,
        startExp: 18_650,
        endExp: 37_224,
        end: true,
        ratio: 0.1125
      },
      {
        originSkill: Skill.STRENGTH,
        bonusSkill: Skill.PRAYER,
        startExp: 37_224,
        endExp: 101_333,
        end: true,
        ratio: 0.1407
      },
      {
        originSkill: Skill.STRENGTH,
        bonusSkill: Skill.PRAYER,
        startExp: 101_333,
        endExp: 273_742,
        end: true,
        ratio: 0.1358
      },
      {
        originSkill: Skill.STRENGTH,
        bonusSkill: Skill.PRAYER,
        startExp: 273_742,
        endExp: 737_627,
        end: true,
        ratio: 0.1316
      },
      {
        originSkill: Skill.STRENGTH,
        bonusSkill: Skill.PRAYER,
        startExp: 737_627,
        endExp: 1_986_068,
        end: true,
        ratio: 0.1285
      },
      {
        originSkill: Skill.STRENGTH,
        bonusSkill: Skill.PRAYER,
        startExp: 1_986_068,
        endExp: 3_258_594,
        end: true,
        ratio: 0.1258
      },
      {
        originSkill: Skill.STRENGTH,
        bonusSkill: Skill.PRAYER,
        startExp: 3_258_594,
        endExp: 5_346_332,
        end: true,
        ratio: 0.1246
      },
      {
        originSkill: Skill.STRENGTH,
        bonusSkill: Skill.PRAYER,
        startExp: 5_346_332,
        endExp: 8_771_558,
        end: true,
        ratio: 0.1239
      },
      {
        originSkill: Skill.STRENGTH,
        bonusSkill: Skill.PRAYER,
        startExp: 8_771_558,
        endExp: 13_034_431,
        end: true,
        ratio: 0.1229
      },
      {
        originSkill: Skill.STRENGTH,
        bonusSkill: Skill.PRAYER,
        startExp: 13_034_431,
        endExp: 200_000_000,
        end: true,
        ratio: 0.1117
      },
      {
        originSkill: Skill.STRENGTH,
        bonusSkill: Skill.CRAFTING,
        startExp: 37_224,
        endExp: 13_034_431,
        end: true,
        ratio: 0.0047
      },
      {
        originSkill: Skill.STRENGTH,
        bonusSkill: Skill.CRAFTING,
        startExp: 13_034_431,
        endExp: 200_000_000,
        end: true,
        ratio: 0.0086
      }
    ]
  },
  {
    skill: Skill.RANGED,
    methods: [
      {
        startExp: 0,
        rate: 3_000,
        description: 'Chickens'
      },
      {
        startExp: 388,
        rate: 5_500,
        description: 'Cows'
      },
      {
        startExp: 4_470,
        rate: 11_200,
        description: 'Minotaurs'
      },
      {
        startExp: 13_363,
        rate: 14_200,
        description: 'Minotaurs'
      },
      {
        startExp: 37_224,
        rate: 21_900,
        description: 'Hill Giants'
      },
      {
        startExp: 101_333,
        rate: 27_900,
        description: 'Hill Giants'
      },
      {
        startExp: 166_636,
        rate: 30_800,
        description: 'Hill Giants'
      },
      {
        startExp: 302_288,
        rate: 33_800,
        description: 'Hill Giants'
      },
      {
        startExp: 547_953,
        rate: 31_200,
        description: 'Ogresses'
      },
      {
        startExp: 992_895,
        rate: 34_400,
        description: 'Ogresses'
      },
      {
        startExp: 1_798_808,
        rate: 37_600,
        description: 'Ogresses'
      },
      {
        startExp: 3_258_594,
        rate: 40_900,
        description: 'Ogresses'
      },
      {
        startExp: 5_902_831,
        rate: 44_000,
        description: 'Ogresses'
      },
      {
        startExp: 9_684_577,
        rate: 47_000,
        description: 'Ogresses'
      },
      {
        startExp: 13_034_431,
        rate: 45_700,
        description: 'Ogresses & Obor'
      }
    ],
    bonuses: [
      {
        originSkill: Skill.RANGED,
        bonusSkill: Skill.PRAYER,
        startExp: 0,
        endExp: 388,
        end: true,
        ratio: 0.375
      },
      {
        originSkill: Skill.RANGED,
        bonusSkill: Skill.PRAYER,
        startExp: 388,
        endExp: 4_470,
        end: true,
        ratio: 0.14
      },
      {
        originSkill: Skill.RANGED,
        bonusSkill: Skill.PRAYER,
        startExp: 4_470,
        endExp: 37_224,
        end: true,
        ratio: 0.1125
      },
      {
        originSkill: Skill.RANGED,
        bonusSkill: Skill.PRAYER,
        startExp: 37_224,
        endExp: 101_333,
        end: true,
        ratio: 0.1429
      },
      {
        originSkill: Skill.RANGED,
        bonusSkill: Skill.PRAYER,
        startExp: 101_333,
        endExp: 166_636,
        end: true,
        ratio: 0.1352
      },
      {
        originSkill: Skill.RANGED,
        bonusSkill: Skill.PRAYER,
        startExp: 166_636,
        endExp: 302_288,
        end: true,
        ratio: 0.1326
      },
      {
        originSkill: Skill.RANGED,
        bonusSkill: Skill.PRAYER,
        startExp: 302_288,
        endExp: 547_953,
        end: true,
        ratio: 0.1303
      },
      {
        originSkill: Skill.RANGED,
        bonusSkill: Skill.PRAYER,
        startExp: 547_953,
        endExp: 13_034_431,
        end: true,
        ratio: 0.0457
      },
      {
        originSkill: Skill.RANGED,
        bonusSkill: Skill.PRAYER,
        startExp: 13_034_431,
        endExp: 200_000_000,
        end: true,
        ratio: 0.0523
      },
      {
        originSkill: Skill.RANGED,
        bonusSkill: Skill.CRAFTING,
        startExp: 37_224,
        endExp: 547_953,
        end: true,
        ratio: 0.0047
      },
      {
        originSkill: Skill.RANGED,
        bonusSkill: Skill.CRAFTING,
        startExp: 547_953,
        endExp: 13_034_431,
        end: true,
        ratio: 0.0326
      },
      {
        originSkill: Skill.RANGED,
        bonusSkill: Skill.CRAFTING,
        startExp: 13_034_431,
        endExp: 200_000_000,
        end: true,
        ratio: 0.0366
      }
    ]
  },
  {
    skill: Skill.PRAYER,
    methods: [
      {
        startExp: 0,
        rate: 13_400,
        description: 'Boneyard'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.MAGIC,
    methods: [
      {
        startExp: 0,
        rate: 15_000,
        description: 'Misc. Spells'
      },
      {
        startExp: 3_973,
        rate: 33_000,
        description: 'Curse splash'
      },
      {
        startExp: 33_648,
        rate: 43_500,
        description: 'Fire bolt moss giants'
      }
    ],
    bonuses: [
      {
        originSkill: Skill.MAGIC,
        bonusSkill: Skill.PRAYER,
        startExp: 33_648,
        endExp: 200_000_000,
        end: true,
        ratio: 0.0516
      }
    ]
  },
  {
    skill: Skill.COOKING,
    methods: [
      {
        startExp: 0,
        rate: 115_000,
        description: '3t fish 0t cook'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.WOODCUTTING,
    methods: [
      {
        startExp: 0,
        rate: 8_365,
        description: '4t Trees'
      },
      {
        startExp: 2_411,
        rate: 35_000,
        description: '2t Oaks (steel axe)'
      },
      {
        startExp: 5_018,
        rate: 45_000,
        description: '2t Oaks (mith axe)'
      },
      {
        startExp: 14_833,
        rate: 60_000,
        description: '2t Oaks (addy axe)'
      },
      {
        startExp: 41_171,
        rate: 80_000,
        description: '2t Oaks (rune axe)'
      },
      {
        startExp: 101_333,
        rate: 98_000,
        description: '2t Oaks (rune axe)'
      },
      {
        startExp: 302_288,
        rate: 105_000,
        description: '2t Oaks (100% success)'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.FISHING,
    methods: [
      {
        startExp: 0,
        rate: 3_000,
        description: 'Shrimp'
      },
      {
        startExp: 388,
        rate: 5_000,
        description: 'Sardine'
      },
      {
        startExp: 1_154,
        rate: 12_000,
        description: 'Sardine & Herring'
      },
      {
        startExp: 4_470,
        rate: 21_000,
        description: 'Sardine & Herring'
      },
      {
        startExp: 13_363,
        rate: 41_000,
        description: '3t fish 0t cook trout+salmon'
      },
      {
        startExp: 37_224,
        rate: 50_000,
        description: '3t fish 0t cook trout+salmon'
      },
      {
        startExp: 101_333,
        rate: 58_000,
        description: '3t fish 0t cook trout+salmon'
      },
      {
        startExp: 273_742,
        rate: 65_000,
        description: '3t fish 0t cook trout+salmon'
      },
      {
        startExp: 737_627,
        rate: 71_000,
        description: '3t fish 0t cook trout+salmon'
      },
      {
        startExp: 1_986_068,
        rate: 78_000,
        description: '3t fish 0t cook trout+salmon'
      },
      {
        startExp: 5_902_831,
        rate: 84_000,
        description: '3t fish 0t cook trout+salmon'
      },
      {
        startExp: 13_034_431,
        rate: 90_000,
        description: '3t fish 0t cook trout+salmon'
      }
    ],
    bonuses: [
      {
        originSkill: Skill.FISHING,
        bonusSkill: Skill.COOKING,
        startExp: 0,
        endExp: 200_000_000,
        end: true,
        ratio: 1.15
      }
    ]
  },
  {
    skill: Skill.FIREMAKING,
    methods: [
      {
        startExp: 0,
        rate: 15_000,
        description: 'Regular logs'
      },
      {
        startExp: 2_411,
        rate: 45_000,
        description: 'Oak logs'
      },
      {
        startExp: 13_363,
        rate: 60_000,
        description: 'Willow logs from Woodcutting (77% fm success)'
      },
      {
        startExp: 50_339,
        rate: 65_000,
        description: 'Willow logs from Woodcutting (100% fm success)'
      }
    ],
    bonuses: [
      {
        originSkill: Skill.FIREMAKING,
        bonusSkill: Skill.WOODCUTTING,
        startExp: 13_363,
        endExp: 200_000_000,
        end: true,
        ratio: 0.75
      }
    ]
  },
  {
    skill: Skill.CRAFTING,
    methods: [
      {
        startExp: 0,
        rate: 15_000,
        description: 'Leather from cows'
      },
      {
        startExp: 2_746,
        rate: 19_000,
        description: 'Unstrung symbols at Varrock Southwest mine'
      },
      {
        startExp: 6_291,
        rate: 20_000,
        description: 'Silver tiaras at Varrock Southwest mine'
      }
    ],
    bonuses: [
      {
        originSkill: Skill.CRAFTING,
        bonusSkill: Skill.SMITHING,
        startExp: 2_746,
        endExp: 200_000_000,
        end: true,
        ratio: 0.261
      },
      {
        originSkill: Skill.CRAFTING,
        bonusSkill: Skill.MINING,
        startExp: 2_746,
        endExp: 200_000_000,
        end: true,
        ratio: 0.762
      },
      {
        originSkill: Skill.CRAFTING,
        bonusSkill: Skill.MAGIC,
        startExp: 2_746,
        endExp: 200_000_000,
        end: true,
        ratio: 0.044
      }
    ]
  },
  {
    skill: Skill.SMITHING,
    methods: [
      {
        startExp: 0,
        rate: 38_175,
        description: "Knight's sword (assumes 20 min completion)"
      },
      {
        startExp: 12_725,
        rate: 14_800,
        description: 'Telegrab nats & Superheating iron with snow (56% mining success)'
      },
      {
        startExp: 24_463,
        rate: 18_500,
        description: 'Telegrab nats & Superheating iron with snow (70% mining success)'
      },
      {
        startExp: 50_000,
        rate: 20_800,
        description: 'Telegrab nats & Superheating iron with snow (80% mining success)'
      },
      {
        startExp: 106_000,
        rate: 23_000,
        description: 'Telegrab nats & Superheating iron with snow (90% mining success)'
      },
      {
        startExp: 334_700,
        rate: 25_000,
        description: 'Telegrab nats & Superheating iron with snow (100% mining success)'
      }
    ],
    bonuses: [
      {
        originSkill: Skill.SMITHING,
        bonusSkill: Skill.MINING,
        startExp: 12_725,
        endExp: 200_000_000,
        end: true,
        ratio: 0.933
      },
      {
        originSkill: Skill.SMITHING,
        bonusSkill: Skill.MAGIC,
        startExp: 12_725,
        endExp: 200_000_000,
        end: true,
        ratio: 1.64
      }
    ]
  },
  {
    skill: Skill.MINING,
    methods: [
      {
        startExp: 0,
        rate: 4_000,
        description: 'Tin/copper'
      },
      {
        startExp: 2_411,
        rate: 40_500,
        description: '4t leather double roll at hobgoblin mine'
      },
      {
        startExp: 13_363,
        rate: 45_500,
        description: '4t leather double roll at hobgoblin mine'
      },
      {
        startExp: 37_224,
        rate: 48_000,
        description: '3.33t snow mining at al kharid'
      },
      {
        startExp: 101_333,
        rate: 54_000,
        description: '3.33t snow mining at al kharid'
      },
      {
        startExp: 302_288,
        rate: 60_000,
        description: '3.33t snow mining at al kharid'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.RUNECRAFTING,
    methods: [
      {
        startExp: 0,
        rate: 5_700,
        description: 'Suicide bodies/minotaurs'
      }
    ],
    bonuses: [
      {
        originSkill: Skill.RUNECRAFTING,
        bonusSkill: Skill.MINING,
        startExp: 0,
        endExp: 200_000_000,
        end: true,
        ratio: 0.667
      }
    ]
  }
];
