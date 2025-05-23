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
        rate: 51_200,
        description: 'Hill Giants'
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
        ratio: 0.1275
      },
      {
        originSkill: Skill.ATTACK,
        bonusSkill: Skill.CRAFTING,
        startExp: 37_224,
        endExp: 200_000_000,
        end: true,
        ratio: 0.0047
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
        rate: 51_000,
        description: 'Hill Giants'
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
        ratio: 0.1276
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
        ratio: 0.0047
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
        rate: 51_800,
        description: 'Hill Giants'
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
        endExp: 13_034_431,
        end: true,
        ratio: 0.131
      },
      {
        originSkill: Skill.STRENGTH,
        bonusSkill: Skill.PRAYER,
        startExp: 13_034_431,
        endExp: 200_000_000,
        end: true,
        ratio: 0.1273
      },
      {
        originSkill: Skill.STRENGTH,
        bonusSkill: Skill.CRAFTING,
        startExp: 37_224,
        endExp: 200_000_000,
        end: true,
        ratio: 0.0047
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
        rate: 37_000,
        description: 'Hill Giants'
      },
      {
        startExp: 992_895,
        rate: 40_300,
        description: 'Hill Giants'
      },
      {
        startExp: 1_798_808,
        rate: 43_000,
        description: 'Hill Giants'
      },
      {
        startExp: 3_258_594,
        rate: 45_700,
        description: 'Hill Giants'
      },
      {
        startExp: 5_902_831,
        rate: 48_200,
        description: 'Hill Giants'
      },
      {
        startExp: 9_684_577,
        rate: 51_000,
        description: 'Hill Giants'
      },
      {
        startExp: 13_034_431,
        rate: 45_000,
        description: 'Hill Giants, Ogresses & Obor'
      }
    ],
    bonuses: [
      {
        originSkill: Skill.RANGED,
        bonusSkill: Skill.PRAYER,
        startExp: 37_224,
        endExp: 13_034_431,
        end: true,
        ratio: 0.131
      },
      {
        originSkill: Skill.RANGED,
        bonusSkill: Skill.PRAYER,
        startExp: 13_034_431,
        endExp: 200_000_000,
        end: true,
        ratio: 0.0753
      },
      {
        originSkill: Skill.RANGED,
        bonusSkill: Skill.CRAFTING,
        startExp: 37_224,
        endExp: 13_034_431,
        end: true,
        ratio: 0.0047
      },
      {
        originSkill: Skill.RANGED,
        bonusSkill: Skill.CRAFTING,
        startExp: 13_034_431,
        endExp: 200_000_000,
        end: true,
        ratio: 0.0306
      }
    ]
  },
  {
    skill: Skill.PRAYER,
    methods: [
      {
        startExp: 0,
        rate: 15_000,
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
        rate: 36_000,
        description: '2t oaks (steel axe)'
      },
      {
        startExp: 5_018,
        rate: 46_300,
        description: '2t oaks (mith axe)'
      },
      {
        startExp: 14_833,
        rate: 61_700,
        description: '2t oaks (addy axe)'
      },
      {
        startExp: 41_171,
        rate: 82_300,
        description: '2t oaks (rune axe)'
      },
      {
        startExp: 101_333,
        rate: 100_800,
        description: '2t oaks (rune axe)'
      },
      {
        startExp: 273_742,
        rate: 108_000,
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
        rate: 15_200,
        description: 'Telegrab nats & Superheating iron with snow (56% mining success)'
      },
      {
        startExp: 24_463,
        rate: 19_000,
        description: 'Telegrab nats & Superheating iron with snow (70% mining success)'
      },
      {
        startExp: 50_000,
        rate: 21_400,
        description: 'Telegrab nats & Superheating iron with snow (80% mining success)'
      },
      {
        startExp: 106_000,
        rate: 23_600,
        description: 'Telegrab nats & Superheating iron with snow (90% mining success)'
      },
      {
        startExp: 334_700,
        rate: 22_450,
        description:
          'Telegrab + superheat and ROF smith (assumes 597k telegrabs at 825/hr, 117.4m xp superheating at 30.7k/h, and 32.6m xp using ROFs at 15.1k/h)'
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
        endExp: 334_700,
        end: true,
        ratio: 1.64
      },
      {
        originSkill: Skill.SMITHING,
        bonusSkill: Skill.MAGIC,
        startExp: 334_700,
        endExp: 200_000_000,
        end: true,
        ratio: 1.277
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
