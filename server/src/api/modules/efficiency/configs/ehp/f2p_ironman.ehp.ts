import { Skill } from '../../../../../types';

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
        rate: 50_700,
        description: 'Hill Giants + 23m Ogresses'
      }
    ],
    bonuses: [
      {
        originSkill: Skill.ATTACK,
        bonusSkill: Skill.PRAYER,
        startExp: 4_825,
        endExp: 13_034_431,
        end: true,
        ratio: 0.129
      },
      {
        originSkill: Skill.ATTACK,
        bonusSkill: Skill.PRAYER,
        startExp: 13_034_431,
        endExp: 200_000_000,
        end: true,
        ratio: 0.1175
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
        ratio: 0.0081
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
        rate: 50_700,
        description: 'Hill Giants + 23m Ogresses'
      }
    ],
    bonuses: [
      {
        originSkill: Skill.DEFENCE,
        bonusSkill: Skill.PRAYER,
        startExp: 37_224,
        endExp: 200_000_000,
        end: true,
        ratio: 0.1176
      },
      {
        originSkill: Skill.DEFENCE,
        bonusSkill: Skill.CRAFTING,
        startExp: 37_224,
        endExp: 200_000_000,
        end: true,
        ratio: 0.0081
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
        rate: 32_100,
        description: 'Hill Giants'
      },
      {
        startExp: 737_627,
        rate: 36_700,
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
        rate: 46_700,
        description: 'Hill Giants'
      },
      {
        startExp: 8_771_558,
        rate: 49_600,
        description: 'Hill Giants'
      },
      {
        startExp: 13_034_431,
        rate: 51_100,
        description: 'Hill Giants + 23m Ogresses'
      }
    ],
    bonuses: [
      {
        originSkill: Skill.STRENGTH,
        bonusSkill: Skill.PRAYER,
        startExp: 18_650,
        endExp: 13_034_431,
        end: true,
        ratio: 0.129
      },
      {
        originSkill: Skill.STRENGTH,
        bonusSkill: Skill.PRAYER,
        startExp: 13_034_431,
        endExp: 200_000_000,
        end: true,
        ratio: 0.1173
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
        ratio: 0.0081
      }
    ]
  },
  {
    skill: Skill.RANGED,
    methods: [
      {
        startExp: 0,
        rate: 2_900,
        description: 'Chickens'
      },
      {
        startExp: 388,
        rate: 5_400,
        description: 'Cows'
      },
      {
        startExp: 4_470,
        rate: 11_000,
        description: 'Minotaurs'
      },
      {
        startExp: 13_363,
        rate: 13_900,
        description: 'Minotaurs'
      },
      {
        startExp: 37_224,
        rate: 21_500,
        description: 'Hill Giants'
      },
      {
        startExp: 101_333,
        rate: 27_300,
        description: 'Hill Giants'
      },
      {
        startExp: 166_636,
        rate: 30_100,
        description: 'Hill Giants'
      },
      {
        startExp: 302_288,
        rate: 27_000,
        description: 'Ogresses'
      },
      {
        startExp: 547_953,
        rate: 30_100,
        description: 'Ogresses'
      },
      {
        startExp: 992_895,
        rate: 33_200,
        description: 'Ogresses'
      },
      {
        startExp: 1_798_808,
        rate: 36_400,
        description: 'Ogresses'
      },
      {
        startExp: 3_258_594,
        rate: 39_500,
        description: 'Ogresses'
      },
      {
        startExp: 5_902_831,
        rate: 42_500,
        description: 'Ogresses'
      },
      {
        startExp: 9_684_577,
        rate: 45_400,
        description: 'Hill Giants'
      },
      {
        startExp: 13_034_431,
        rate: 44_400,
        description: 'Ogresses + 17.5m Obor'
      }
    ],
    bonuses: [
      {
        originSkill: Skill.RANGED,
        bonusSkill: Skill.PRAYER,
        startExp: 0,
        endExp: 302_288,
        end: true,
        ratio: 0.145
      },
      {
        originSkill: Skill.RANGED,
        bonusSkill: Skill.PRAYER,
        startExp: 302_288,
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
        ratio: 0.0534
      },
      {
        originSkill: Skill.RANGED,
        bonusSkill: Skill.CRAFTING,
        startExp: 37_224,
        endExp: 302_288,
        end: true,
        ratio: 0.0047
      },
      {
        originSkill: Skill.RANGED,
        bonusSkill: Skill.CRAFTING,
        startExp: 302_288,
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
        ratio: 0.0369
      }
    ]
  },
  {
    skill: Skill.PRAYER,
    methods: [
      {
        startExp: 0,
        rate: 17_000,
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
        description: 'Misc spells'
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
        description: '4t trees'
      },
      {
        startExp: 2_411,
        rate: 35_000,
        description: '2t oaks (steel axe)'
      },
      {
        startExp: 5_018,
        rate: 45_000,
        description: '2t oaks (mith axe)'
      },
      {
        startExp: 14_833,
        rate: 60_000,
        description: '2t oaks (addy axe)'
      },
      {
        startExp: 41_171,
        rate: 80_000,
        description: '2t oaks (rune axe)'
      },
      {
        startExp: 101_333,
        rate: 98_000,
        description: '2t oaks (rune axe)'
      },
      {
        startExp: 273_742,
        rate: 105_000,
        description: '2t oaks (100% success)'
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
        end: false,
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
      },
      {
        startExp: 237_742,
        rate: 70_000,
        description: '2t yews + fm'
      }
    ],
    bonuses: [
      {
        originSkill: Skill.FIREMAKING,
        bonusSkill: Skill.WOODCUTTING,
        startExp: 13_363,
        endExp: 273_742,
        end: true,
        ratio: 0.75
      },
      {
        originSkill: Skill.FIREMAKING,
        bonusSkill: Skill.WOODCUTTING,
        startExp: 273_742,
        endExp: 200_000_000,
        end: true,
        ratio: 0.8642
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
        rate: 19_500,
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
        rate: 16_500,
        description: 'Telegrab nats & Superheating iron (56% mining success)'
      },
      {
        startExp: 24_463,
        rate: 20_700,
        description: 'Telegrab nats & Superheating iron (70% mining success)'
      },
      {
        startExp: 50_000,
        rate: 23_300,
        description: 'Telegrab nats & Superheating iron (80% mining success)'
      },
      {
        startExp: 106_000,
        rate: 25_700,
        description: 'Telegrab nats & Superheating iron (90% mining success)'
      },
      {
        startExp: 334_700,
        rate: 27_200,
        description:
          'Telegrab nats & Superheating iron (100% mining success). 151m xp superheating at 32k/hr, 786k telegrabs at 950/hr'
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
        ratio: 1.6373
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
        rate: 5_900,
        description: 'Suicide bodies / minotaurs'
      }
    ],
    bonuses: [
      {
        originSkill: Skill.RUNECRAFTING,
        bonusSkill: Skill.MINING,
        startExp: 0,
        endExp: 200_000_000,
        end: true,
        ratio: 0.6233
      }
    ]
  }
];
