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
        rate: 15_000,
        description: 'Minotaurs'
      },
      {
        startExp: 37_224,
        rate: 41_100,
        description: 'Hill Giants'
      },
      {
        startExp: 101_333,
        rate: 46_400,
        description: 'Hill Giants'
      },
      {
        startExp: 273_742,
        rate: 47_600,
        description: 'Hill Giants'
      },
      {
        startExp: 737_627,
        rate: 48_400,
        description: 'Hill Giants'
      },
      {
        startExp: 1_210_421,
        rate: 48_800,
        description: 'Hill Giants'
      },
      {
        startExp: 1_629_200,
        rate: 49_000,
        description: 'Hill Giants'
      },
      {
        startExp: 2_192_818,
        rate: 49_200,
        description: 'Hill Giants'
      },
      {
        startExp: 3_258_594,
        rate: 49_400,
        description: 'Hill Giants'
      },
      {
        startExp: 3_972_294,
        rate: 49_500,
        description: 'Hill Giants'
      },
      {
        startExp: 5_346_332,
        rate: 49_650,
        description: 'Hill Giants'
      },
      {
        startExp: 7_944_614,
        rate: 49_850,
        description: 'Hill Giants'
      },
      {
        startExp: 13_034_431,
        rate: 49_600,
        description: 'Ogresses & Hill Giants'
      }
    ],
    bonuses: [
      {
        originSkill: Skill.ATTACK,
        bonusSkill: Skill.PRAYER,
        startExp: 37_224,
        endExp: 101_333,
        end: true,
        ratio: 0.1267
      },
      {
        originSkill: Skill.ATTACK,
        bonusSkill: Skill.PRAYER,
        startExp: 101_333,
        endExp: 273_742,
        end: true,
        ratio: 0.1244
      },
      {
        originSkill: Skill.ATTACK,
        bonusSkill: Skill.PRAYER,
        startExp: 273_742,
        endExp: 737_627,
        end: true,
        ratio: 0.124
      },
      {
        originSkill: Skill.ATTACK,
        bonusSkill: Skill.PRAYER,
        startExp: 737_627,
        endExp: 1_210_421,
        end: true,
        ratio: 0.1237
      },
      {
        originSkill: Skill.ATTACK,
        bonusSkill: Skill.PRAYER,
        startExp: 1_210_421,
        endExp: 1_629_200,
        end: true,
        ratio: 0.1236
      },
      {
        originSkill: Skill.ATTACK,
        bonusSkill: Skill.PRAYER,
        startExp: 1_629_200,
        endExp: 2_192_818,
        end: true,
        ratio: 0.1235
      },
      {
        originSkill: Skill.ATTACK,
        bonusSkill: Skill.PRAYER,
        startExp: 2_192_818,
        endExp: 3_972_294,
        end: true,
        ratio: 0.1234
      },
      {
        originSkill: Skill.ATTACK,
        bonusSkill: Skill.PRAYER,
        startExp: 3_972_294,
        endExp: 7_944_614,
        end: true,
        ratio: 0.1233
      },
      {
        originSkill: Skill.ATTACK,
        bonusSkill: Skill.PRAYER,
        startExp: 7_944_614,
        endExp: 13_034_431,
        end: true,
        ratio: 0.1232
      },
      {
        originSkill: Skill.ATTACK,
        bonusSkill: Skill.PRAYER,
        startExp: 13_034_431,
        endExp: 200_000_000,
        end: true,
        ratio: 0.1151
      },
      {
        originSkill: Skill.ATTACK,
        bonusSkill: Skill.CRAFTING,
        startExp: 37_224,
        endExp: 13_034_431,
        end: true,
        ratio: 0.0071
      },
      {
        originSkill: Skill.ATTACK,
        bonusSkill: Skill.CRAFTING,
        startExp: 13_034_431,
        endExp: 200_000_000,
        end: true,
        ratio: 0.0107
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
        rate: 49_500,
        description: 'Ogresses & Hill Giants'
      }
    ],
    bonuses: [
      {
        originSkill: Skill.DEFENCE,
        bonusSkill: Skill.PRAYER,
        startExp: 37_224,
        endExp: 200_000_000,
        end: true,
        ratio: 0.1151
      },
      {
        originSkill: Skill.DEFENCE,
        bonusSkill: Skill.CRAFTING,
        startExp: 37_224,
        endExp: 200_000_000,
        end: true,
        ratio: 0.0107
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
        rate: 13_000,
        description: 'Cows/Minotaurs'
      },
      {
        startExp: 37_224,
        rate: 24_900,
        description: 'Hill Giants'
      },
      {
        startExp: 101_333,
        rate: 28_400,
        description: 'Hill Giants'
      },
      {
        startExp: 273_742,
        rate: 33_000,
        description: 'Hill Giants'
      },
      {
        startExp: 737_627,
        rate: 36_500,
        description: 'Hill Giants'
      },
      {
        startExp: 1_210_421,
        rate: 37_500,
        description: 'Hill Giants'
      },
      {
        startExp: 1_629_200,
        rate: 38_900,
        description: 'Hill Giants'
      },
      {
        startExp: 2_192_818,
        rate: 40_450,
        description: 'Hill Giants'
      },
      {
        startExp: 3_258_594,
        rate: 41_900,
        description: 'Hill Giants'
      },
      {
        startExp: 3_972_294,
        rate: 42_900,
        description: 'Hill Giants'
      },
      {
        startExp: 5_346_332,
        rate: 44_200,
        description: 'Hill Giants'
      },
      {
        startExp: 7_944_614,
        rate: 45_900,
        description: 'Hill Giants'
      },
      {
        startExp: 11_805_606,
        rate: 49_900,
        description: 'Hill Giants'
      },
      {
        startExp: 13_034_431,
        rate: 49_800,
        description: 'Ogresses & Hill Giants'
      }
    ],
    bonuses: [
      {
        originSkill: Skill.STRENGTH,
        bonusSkill: Skill.PRAYER,
        startExp: 37_224,
        endExp: 101_333,
        end: true,
        ratio: 0.1394
      },
      {
        originSkill: Skill.STRENGTH,
        bonusSkill: Skill.PRAYER,
        startExp: 101_333,
        endExp: 273_742,
        end: true,
        ratio: 0.1354
      },
      {
        originSkill: Skill.STRENGTH,
        bonusSkill: Skill.PRAYER,
        startExp: 273_742,
        endExp: 737_627,
        end: true,
        ratio: 0.1315
      },
      {
        originSkill: Skill.STRENGTH,
        bonusSkill: Skill.PRAYER,
        startExp: 737_627,
        endExp: 1_210_421,
        end: true,
        ratio: 0.1291
      },
      {
        originSkill: Skill.STRENGTH,
        bonusSkill: Skill.PRAYER,
        startExp: 1_210_421,
        endExp: 1_629_200,
        end: true,
        ratio: 0.1285
      },
      {
        originSkill: Skill.STRENGTH,
        bonusSkill: Skill.PRAYER,
        startExp: 1_629_200,
        endExp: 2_192_818,
        end: true,
        ratio: 0.1278
      },
      {
        originSkill: Skill.STRENGTH,
        bonusSkill: Skill.PRAYER,
        startExp: 2_192_818,
        endExp: 3_258_594,
        end: true,
        ratio: 0.127
      },
      {
        originSkill: Skill.STRENGTH,
        bonusSkill: Skill.PRAYER,
        startExp: 3_258_594,
        endExp: 3_972_294,
        end: true,
        ratio: 0.1263
      },
      {
        originSkill: Skill.STRENGTH,
        bonusSkill: Skill.PRAYER,
        startExp: 3_972_294,
        endExp: 5_346_332,
        end: true,
        ratio: 0.1259
      },
      {
        originSkill: Skill.STRENGTH,
        bonusSkill: Skill.PRAYER,
        startExp: 5_346_332,
        endExp: 7_944_614,
        end: true,
        ratio: 0.1252
      },
      {
        originSkill: Skill.STRENGTH,
        bonusSkill: Skill.PRAYER,
        startExp: 7_944_614,
        endExp: 11_805_606,
        end: true,
        ratio: 0.1246
      },
      {
        originSkill: Skill.STRENGTH,
        bonusSkill: Skill.PRAYER,
        startExp: 11_805_606,
        endExp: 13_034_431,
        end: true,
        ratio: 0.1232
      },
      {
        originSkill: Skill.STRENGTH,
        bonusSkill: Skill.PRAYER,
        startExp: 13_034_431,
        endExp: 200_000_000,
        end: true,
        ratio: 0.1151
      },
      {
        originSkill: Skill.STRENGTH,
        bonusSkill: Skill.CRAFTING,
        startExp: 37_224,
        endExp: 13_034_431,
        end: true,
        ratio: 0.0071
      },
      {
        originSkill: Skill.STRENGTH,
        bonusSkill: Skill.CRAFTING,
        startExp: 13_034_431,
        endExp: 200_000_000,
        end: true,
        ratio: 0.0107
      }
    ]
  },
  {
    skill: Skill.RANGED,
    methods: [
      {
        startExp: 0,
        rate: 2_500,
        description: 'Chickens'
      },
      {
        startExp: 388,
        rate: 6_000,
        description: 'Cows'
      },
      {
        startExp: 4_470,
        rate: 10_000,
        description: 'Minotaurs'
      },
      {
        startExp: 13_363,
        rate: 15_000,
        description: 'Minotaurs'
      },
      {
        startExp: 37_224,
        rate: 22_850,
        description: 'Hill Giants'
      },
      {
        startExp: 101_333,
        rate: 19_950,
        description: 'Ogresses'
      },
      {
        startExp: 184_040,
        rate: 23_450,
        description: 'Ogresses'
      },
      {
        startExp: 273_742,
        rate: 24_400,
        description: 'Ogresses'
      },
      {
        startExp: 368_599,
        rate: 27_050,
        description: 'Ogresses'
      },
      {
        startExp: 547_953,
        rate: 30_100,
        description: 'Ogresses'
      },
      {
        startExp: 737_627,
        rate: 30_550,
        description: 'Ogresses'
      },
      {
        startExp: 992_895,
        rate: 33_250,
        description: 'Ogresses'
      },
      {
        startExp: 1_475_581,
        rate: 34_000,
        description: 'Ogresses'
      },
      {
        startExp: 1_986_068,
        rate: 36_900,
        description: 'Ogresses'
      },
      {
        startExp: 2_673_114,
        rate: 37_300,
        description: 'Ogresses'
      },
      {
        startExp: 3_972_294,
        rate: 40_300,
        description: 'Ogresses'
      },
      {
        startExp: 5_346_332,
        rate: 40_650,
        description: 'Ogresses'
      },
      {
        startExp: 7_944_614,
        rate: 43_400,
        description: 'Ogresses'
      },
      {
        startExp: 10_692_629,
        rate: 46_350,
        description: 'Ogresses'
      },
      {
        startExp: 13_034_431,
        rate: 45_100,
        description: 'Ogresses & Obor'
      }
    ],
    bonuses: [
      {
        originSkill: Skill.RANGED,
        bonusSkill: Skill.PRAYER,
        startExp: 0,
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
        ratio: 0.1416
      },
      {
        originSkill: Skill.RANGED,
        bonusSkill: Skill.PRAYER,
        startExp: 101_333,
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
        ratio: 0.0418
      },
      {
        originSkill: Skill.RANGED,
        bonusSkill: Skill.CRAFTING,
        startExp: 37_224,
        endExp: 101_333,
        end: true,
        ratio: 0.0071
      },
      {
        originSkill: Skill.RANGED,
        bonusSkill: Skill.CRAFTING,
        startExp: 101_333,
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
        ratio: 0.0298
      }
    ]
  },
  {
    skill: Skill.PRAYER,
    methods: [
      {
        startExp: 0,
        rate: 14_000,
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
        rate: 42_000,
        description: 'Crumble ankous'
      }
    ],
    bonuses: []
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
        rate: 33_000,
        description: '2t Oaks (steel axe)'
      },
      {
        startExp: 5_018,
        rate: 45_000,
        description: '2t Oaks (mith axe)'
      },
      {
        startExp: 14_833,
        rate: 63_000,
        description: '2t Oaks (addy axe)'
      },
      {
        startExp: 41_171,
        rate: 82_000,
        description: '2t Oaks (rune axe)'
      },
      {
        startExp: 101_333,
        rate: 90_000,
        description: '2t Oaks (rune axe)'
      },
      {
        startExp: 302_288,
        rate: 100_000,
        description: '2t Oaks (100% success)'
      },
      {
        startExp: 13_034_431,
        rate: 110_000,
        description: '2t Oaks (forestry events give more xp at higher lvl)'
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
        description: "Knight's Sword (assumes 20 min completion)"
      },
      {
        startExp: 12_725,
        rate: 14_250,
        description: 'Telegrab nats & Superheating iron with snow (56% mining success)'
      },
      {
        startExp: 24_463,
        rate: 17_750,
        description: 'Telegrab nats & Superheating iron with snow (70% mining success)'
      },
      {
        startExp: 50_000,
        rate: 20_000,
        description: 'Telegrab nats & Superheating iron with snow (80% mining success)'
      },
      {
        startExp: 106_000,
        rate: 22_000,
        description: 'Telegrab nats & Superheating iron with snow (90% mining success)'
      },
      {
        startExp: 334_700,
        rate: 24_000,
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
        ratio: 1.66
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
        rate: 4_650,
        description: 'Varrock/Chronicle Earth Runes'
      }
    ],
    bonuses: [
      {
        originSkill: Skill.RUNECRAFTING,
        bonusSkill: Skill.MINING,
        startExp: 0,
        endExp: 200_000_000,
        end: true,
        ratio: 0.769
      },
      {
        originSkill: Skill.RUNECRAFTING,
        bonusSkill: Skill.WOODCUTTING,
        startExp: 0,
        endExp: 200_000_000,
        end: true,
        ratio: 0.3403
      }
    ]
  }
];
