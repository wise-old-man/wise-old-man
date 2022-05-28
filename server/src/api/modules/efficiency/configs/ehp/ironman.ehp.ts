import { Skill } from '../../../../../utils';

export default [
  {
    skill: Skill.ATTACK,
    methods: [
      {
        startExp: 0,
        rate: 193_300,
        description: 'Chally greater nechs'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.DEFENCE,
    methods: [
      {
        startExp: 0,
        rate: 669_100,
        description: 'Def chin+bonus pray xp'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.STRENGTH,
    methods: [
      {
        startExp: 0,
        rate: 300_000,
        description: 'Chally greater nechs'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.HITPOINTS,
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
    skill: Skill.RANGED,
    methods: [
      {
        startExp: 0,
        rate: 15_000,
        description: 'Quest/pc'
      },
      {
        startExp: 203_354,
        rate: 609_900,
        description: 'Red chins+bonus pray'
      },
      {
        startExp: 449_428,
        rate: 752_400,
        description: 'Black chins+bonus pray'
      },
      {
        startExp: 737_627,
        rate: 839_800,
        description: 'Black chins+bonus pray'
      },
      {
        startExp: 1_986_068,
        rate: 962_600,
        description: 'Black chins+bonus pray'
      },
      {
        startExp: 5_346_332,
        rate: 1_110_500,
        description: 'Black chins+bonus pray'
      },
      {
        startExp: 13_034_431,
        rate: 1_276_600,
        description: 'Black chins+bonus pray'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.PRAYER,
    methods: [
      {
        startExp: 0,
        rate: 218_000,
        description: 'Lance green dragons'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.MAGIC,
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
    skill: Skill.COOKING,
    methods: [
      {
        startExp: 0,
        rate: 100_000,
        description: 'Buying + cooking karambwans with alt'
      },
      {
        startExp: 13_363,
        rate: 211_200,
        description: 'Buying + cooking karambwans with alt'
      },
      {
        startExp: 41_171,
        rate: 240_800,
        description: 'Buying + cooking karambwans with alt'
      },
      {
        startExp: 101_333,
        rate: 270_400,
        description: 'Buying + cooking karambwans with alt'
      },
      {
        startExp: 273_742,
        rate: 300_100,
        description: 'Buying + cooking karambwans with alt'
      },
      {
        startExp: 737_627,
        rate: 329_700,
        description: 'Buying + cooking karambwans with alt'
      },
      {
        startExp: 1_986_068,
        rate: 359_300,
        description: 'Buying + cooking karambwans with alt'
      },
      {
        startExp: 5_346_332,
        rate: 385_900,
        description: 'Buying + cooking karambwans with alt'
      },
      {
        startExp: 13_034_431,
        rate: 400_000,
        description: 'Buying + cooking karambwans with alt'
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
        startExp: 41_171,
        rate: 49_000,
        description: 'Teak trees'
      },
      {
        startExp: 302_288,
        rate: 146_900,
        description: '1.5t teaks'
      },
      {
        startExp: 737_627,
        rate: 159_500,
        description: '1.5t teaks'
      },
      {
        startExp: 1_986_068,
        rate: 173_400,
        description: '1.5t teaks'
      },
      {
        startExp: 5_902_831,
        rate: 188_800,
        description: '1.5t teaks'
      },
      {
        startExp: 13_034_431,
        rate: 200_000,
        description: '1.5t teaks'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.FLETCHING,
    methods: [
      {
        startExp: 0,
        rate: 200_000,
        description: 'Bows & arrows'
      },
      {
        startExp: 123_660,
        rate: 1_100_000,
        description: 'Broad arrows'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.FISHING,
    methods: [
      {
        startExp: 0,
        rate: 20_000,
        description: 'Quest'
      },
      {
        startExp: 9_612,
        rate: 30_000,
        description: 'Fly fishing'
      },
      {
        startExp: 13_363,
        rate: 40_000,
        description: 'Fly fishing'
      },
      {
        startExp: 83_014,
        rate: 43_711,
        description: 'Cut-eat barb'
      },
      {
        startExp: 224_466,
        rate: 72_629,
        description: 'Cut-eat barb'
      },
      {
        startExp: 737_627,
        rate: 95_282,
        description: 'Cut-eat barb'
      },
      {
        startExp: 2_421_087,
        rate: 101_997,
        description: 'Cut-eat barb'
      },
      {
        startExp: 5_902_831,
        rate: 106_519,
        description: 'Cut-eat barb'
      },
      {
        startExp: 10_692_629,
        rate: 108_879,
        description: 'Cut-eat barb'
      },
      {
        startExp: 13_034_431,
        rate: 141_070,
        description: 'Barblore'
      }
    ],
    bonuses: [
      {
        originSkill: Skill.FISHING,
        bonusSkill: Skill.STRENGTH,
        startExp: 83_014,
        endExp: 200_000_000,
        end: false,
        ratio: 0.0885
      },
      {
        originSkill: Skill.FISHING,
        bonusSkill: Skill.COOKING,
        startExp: 83_014,
        endExp: 200_000_000,
        end: true,
        ratio: 0.15
      },
      {
        originSkill: Skill.FISHING,
        bonusSkill: Skill.AGILITY,
        startExp: 83_014,
        endExp: 200_000_000,
        end: false,
        ratio: 0.0885
      }
    ]
  },
  {
    skill: Skill.FIREMAKING,
    methods: [
      {
        startExp: 0,
        rate: 45_000,
        description: 'Oaks'
      },
      {
        startExp: 101_333,
        rate: 238_800,
        description: 'Wintertodt + bxp/bankstanding'
      },
      {
        startExp: 273_742,
        rate: 281_000,
        description: 'Wintertodt + bxp/bankstanding'
      },
      {
        startExp: 737_627,
        rate: 324_900,
        description: 'Wintertodt + bxp/bankstanding'
      },
      {
        startExp: 1_986_068,
        rate: 368_800,
        description: 'Wintertodt + bxp/bankstanding'
      },
      {
        startExp: 5_346_332,
        rate: 412_600,
        description: 'Wintertodt + bxp/bankstanding'
      },
      {
        startExp: 13_034_431,
        rate: 433_500,
        description: 'Wintertodt + bxp/bankstanding'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.CRAFTING,
    methods: [
      {
        startExp: 0,
        rate: 50_000,
        description: 'Seaweed+sandstone'
      },
      {
        startExp: 302_288,
        rate: 89_700,
        description: 'Seaweed+sandstone w/ superglass'
      },
      {
        startExp: 3_972_294,
        rate: 111_500,
        description: 'Seaweed+sandstone w/ superglass'
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
        description: '-'
      },
      {
        startExp: 273_742,
        rate: 310_000,
        description: 'UIM gold'
      },
      {
        startExp: 13_034_431,
        rate: 320_000,
        description: 'UIM gold'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.MINING,
    methods: [
      {
        startExp: 0,
        rate: 8_000,
        description: 'Quests'
      },
      {
        startExp: 13_363,
        rate: 59_158,
        description: 'Iron'
      },
      {
        startExp: 61_512,
        rate: 85_500,
        description: '3t4g at quarry'
      },
      {
        startExp: 101_333,
        rate: 89_151,
        description: '3t4g at quarry'
      },
      {
        startExp: 302_288,
        rate: 97_697,
        description: '3t4g at quarry'
      },
      {
        startExp: 737_627,
        rate: 103_751,
        description: '3t4g at quarry'
      },
      {
        startExp: 986_068,
        rate: 109_143,
        description: '3t4g at quarry'
      },
      {
        startExp: 3_258_594,
        rate: 46_500,
        description: 'Motherlode Mine for Prospector Outfit'
      },
      {
        startExp: 3_548_694,
        rate: 113_287,
        description: '3t4g at quarry'
      },
      {
        startExp: 5_346_332,
        rate: 115_638,
        description: '3t4g at quarry'
      },
      {
        startExp: 13_034_431,
        rate: 125_000,
        description: '3t4g at quarry'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.HERBLORE,
    methods: [
      {
        startExp: 0,
        rate: 64_000,
        description: 'Contracts + kingdom'
      },
      {
        startExp: 13_034_431,
        rate: 70_130,
        description: 'Contracts + kingdom'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.AGILITY,
    methods: [
      {
        startExp: 0,
        rate: 0,
        description: 'Bonus xp from fishing'
      },
      {
        startExp: 273_742,
        rate: 54_000,
        description: 'Bonus xp from fishing'
      },
      {
        startExp: 1_986_068,
        rate: 62_743,
        description: 'Bonus xp from fishing'
      },
      {
        startExp: 2_421_087,
        rate: 73_929,
        description: 'Bonus xp from fishing'
      },
      {
        startExp: 6_517_253,
        rate: 95_000,
        description: 'Bonus xp from fishing'
      },
      {
        startExp: 17_675_774,
        rate: 93_000,
        description: 'Sepulchre + 20m ardy'
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
        description: 'Quests'
      },
      {
        startExp: 61_512,
        rate: 80_000,
        description: 'Blackjacking'
      },
      {
        startExp: 91_721,
        rate: 337_600,
        description: 'Artefact + glassblowing'
      },
      {
        startExp: 273_742,
        rate: 384_000,
        description: 'Artefact + glassblowing'
      },
      {
        startExp: 668_051,
        rate: 430_300,
        description: 'Artefact + glassblowing'
      },
      {
        startExp: 1_798_808,
        rate: 476_600,
        description: 'Artefact + glassblowing'
      },
      {
        startExp: 4_842_295,
        rate: 522_900,
        description: 'Artefact + glassblowing'
      },
      {
        startExp: 13_034_431,
        rate: 545_000,
        description: 'Artefact + glassblowing'
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
        rate: 45_000,
        description: 'Efficient slayer'
      },
      {
        startExp: 13_034_431,
        rate: 56_530,
        description: 'Chally + barrage'
      }
    ],
    bonuses: [
      {
        originSkill: Skill.SLAYER,
        bonusSkill: Skill.DEFENCE,
        startExp: 0,
        endExp: 200_000_000,
        end: false,
        ratio: 0.9991
      },
      {
        originSkill: Skill.SLAYER,
        bonusSkill: Skill.ATTACK,
        startExp: 0,
        endExp: 200_000_000,
        end: false,
        ratio: 0.9991
      },
      {
        originSkill: Skill.SLAYER,
        bonusSkill: Skill.STRENGTH,
        startExp: 0,
        endExp: 200_000_000,
        end: false,
        ratio: 0.9106
      },
      {
        originSkill: Skill.SLAYER,
        bonusSkill: Skill.RANGED,
        startExp: 13_034_431,
        endExp: 200_000_000,
        end: true,
        ratio: 0.0881
      }
    ]
  },
  {
    skill: Skill.FARMING,
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
        rate: 2_900_000,
        description: 'Magic+ tree runs'
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
    skill: Skill.HUNTER,
    methods: [
      {
        startExp: 0,
        rate: 92_600,
        description: 'Avg bh low lvs'
      },
      {
        startExp: 101_333,
        rate: 158_800,
        description: 'Mahog bh'
      },
      {
        startExp: 1_096_278,
        rate: 188_600,
        description: 'Magic bh'
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
    skill: Skill.CONSTRUCTION,
    methods: [
      {
        startExp: 0,
        rate: 20_000,
        description: 'Planks'
      },
      {
        startExp: 18_247,
        rate: 75_000,
        description: 'Oak larders'
      },
      {
        startExp: 75_127,
        rate: 259_600,
        description: '1.5t teak myth capes + kingdom mahogany'
      }
    ],
    bonuses: []
  }
];
