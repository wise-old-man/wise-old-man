import { Skill } from '../../../../../utils';

export default [
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
        startExp: 273_742,
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
        rate: 6_300,
        description: 'Suicide air tiaras'
      }
    ],
    bonuses: [
      {
        originSkill: Skill.CRAFTING,
        bonusSkill: Skill.MINING,
        startExp: 0,
        endExp: 200_000_000,
        end: true,
        ratio: 0.762
      },
      {
        originSkill: Skill.CRAFTING,
        bonusSkill: Skill.RUNECRAFTING,
        startExp: 0,
        endExp: 200_000_000,
        end: true,
        ratio: 0.476
      },
      {
        originSkill: Skill.CRAFTING,
        bonusSkill: Skill.SMITHING,
        startExp: 0,
        endExp: 200_000_000,
        end: true,
        ratio: 0.261
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
        rate: 10_000,
        description: 'ROF iron'
      },
      {
        startExp: 37_224,
        rate: 10_000,
        description: 'Wildy triple hop gold'
      }
    ],
    bonuses: [
      {
        originSkill: Skill.SMITHING,
        bonusSkill: Skill.MINING,
        startExp: 12_725,
        endExp: 37_224,
        end: true,
        ratio: 0.933
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
        rate: 4_000,
        description: 'Earth runes'
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
      }
    ]
  }
];
