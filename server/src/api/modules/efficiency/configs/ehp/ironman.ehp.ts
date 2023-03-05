import { Skill } from '../../../../../utils';

export default [
  {
    skill: Skill.ATTACK,
    methods: [
      {
        startExp: 0,
        rate: 192_400,
        description: 'Chally 2 alt tzhaar'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.DEFENCE,
    methods: [
      {
        startExp: 0,
        rate: 679_800,
        description: 'Def chin+bonus pray'
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
        description: 'Chally 2 alt tzhaar'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.RANGED,
    methods: [
      {
        startExp: 0,
        rate: 17_000,
        description: 'Quest + void'
      },
      {
        startExp: 224_466,
        rate: 527_700,
        description: 'Red chins + pray (456k rate)'
      },
      {
        startExp: 449_428,
        rate: 786_200,
        description: 'Black chins + pray (638k rate)'
      },
      {
        startExp: 737_627,
        rate: 886_400,
        description: 'Black chins + pray (702k rate)'
      },
      {
        startExp: 1_986_068,
        rate: 1_016_600,
        description: 'Black chins + pray (781k rate)'
      },
      {
        startExp: 5_346_332,
        rate: 1_148_400,
        description: 'Black chins + pray (857k rate)'
      },
      {
        startExp: 13_034_431,
        rate: 1_308_400,
        description: 'Black chins + pray (943k rate)'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.PRAYER,
    methods: [
      {
        startExp: 0,
        rate: 209_000,
        description: 'Green dragons (340/hr) including melee'
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
        description: 'Buying and cooking karams with alt'
      },
      {
        startExp: 13_363,
        rate: 211_200,
        description: 'Buying and cooking karams with alt'
      },
      {
        startExp: 41_171,
        rate: 240_800,
        description: 'Buying and cooking karams with alt'
      },
      {
        startExp: 101_333,
        rate: 270_400,
        description: 'Buying and cooking karams with alt'
      },
      {
        startExp: 273_742,
        rate: 300_100,
        description: 'Buying and cooking karams with alt'
      },
      {
        startExp: 737_627,
        rate: 329_700,
        description: 'Buying and cooking karams with alt'
      },
      {
        startExp: 1_986_068,
        rate: 359_300,
        description: 'Buying and cooking karams with alt'
      },
      {
        startExp: 5_346_332,
        rate: 385_900,
        description: 'Buying and cooking karams with alt'
      },
      {
        startExp: 13_034_431,
        rate: 400_000,
        description: 'Buying and cooking karams with alt'
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
        rate: 25_000,
        description: 'Oak trees'
      },
      {
        startExp: 22_406,
        rate: 45_000,
        description: 'Teak trees'
      },
      {
        startExp: 67_983,
        rate: 115_500,
        description: '1.5t teaks (for proper wt scaling)'
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
        rate: 228_000,
        description: '1.5t redwood (161k wc 145k fm rate) + tool seed time'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.FLETCHING,
    methods: [
      {
        startExp: 0,
        rate: 300_000,
        description: 'Headless arrows'
      },
      {
        startExp: 123_660,
        rate: 825_000,
        description: 'Broads at sep, bh & zmi - gp adjusted'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.FISHING,
    methods: [
      {
        startExp: 0,
        rate: 15_000,
        description: 'Quests'
      },
      {
        startExp: 15_612,
        rate: 30_000,
        description: 'Fly fishing'
      },
      {
        startExp: 22_406,
        rate: 32_000,
        description: 'Tempoross barrel'
      },
      {
        startExp: 302_288,
        rate: 67_260,
        description: 'Aerial for angler'
      },
      {
        startExp: 737_627,
        rate: 112_030,
        description: 'Barb + bank sturgeon (91.6k rate)'
      },
      {
        startExp: 2_951_373,
        rate: 150_540,
        description: 'Decant barblore (99.8k rate)'
      },
      {
        startExp: 5_902_831,
        rate: 160_220,
        description: 'Decant barblore (103.5k rate)'
      },
      {
        startExp: 10_692_629,
        rate: 166_140,
        description: 'Decant barblore (105.6k rate)'
      },
      {
        startExp: 13_034_431,
        rate: 175_490,
        description: 'Decant barblore (108.4k rate)'
      }
    ],
    bonuses: [
      {
        originSkill: Skill.FISHING,
        bonusSkill: Skill.STRENGTH,
        startExp: 737_627,
        endExp: 200_000_000,
        end: false,
        ratio: 0.0885
      },
      {
        originSkill: Skill.FISHING,
        bonusSkill: Skill.COOKING,
        startExp: 737_627,
        endExp: 200_000_000,
        end: true,
        ratio: 0.108
      },
      {
        originSkill: Skill.FISHING,
        bonusSkill: Skill.AGILITY,
        startExp: 737_627,
        endExp: 2_951_373,
        end: false,
        ratio: 0.08893
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
        rate: 240_800,
        description: 'Wintertodt hop + fletch, wc, con & loot ehp (207k rate)'
      },
      {
        startExp: 273_742,
        rate: 284_600,
        description: 'Wintertodt hop + fletch, wc, con & loot ehp (244k rate)'
      },
      {
        startExp: 737_627,
        rate: 328_300,
        description: 'Wintertodt hop + fletch, wc, con & loot ehp (282k rate)'
      },
      {
        startExp: 1_986_068,
        rate: 372_000,
        description: 'Wintertodt hop + fletch, wc, con & loot ehp (319k rate)'
      },
      {
        startExp: 5_346_332,
        rate: 412_900,
        description: 'Wintertodt hop + fletch, wc, con & loot ehp (355k rate)'
      },
      {
        startExp: 13_034_431,
        rate: 456_900,
        description: 'Wintertodt hop + fletch, wc, con & loot ehp (392k rate)'
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
        description: 'Glassblow no superglass'
      },
      {
        startExp: 302_288,
        rate: 165_200,
        description: 'Glassblow artefact + zmi (261k effective rate)'
      },
      {
        startExp: 3_972_294,
        rate: 205_300,
        description: 'Glassblow artefact + zmi (332k effective rate)'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.SMITHING,
    methods: [
      {
        startExp: 0,
        rate: 72_800,
        description: 'Quests, wt ore + gold'
      },
      {
        startExp: 273_742,
        rate: 245_700,
        description: 'Uim gold 2 client (315k rate) - gp adjusted'
      },
      {
        startExp: 13_034_431,
        rate: 301_900,
        description: 'Uim gold 2 client (330k rate) - gp adjusted'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.MINING,
    methods: [
      {
        startExp: 0,
        rate: 17_000,
        description: 'Quests'
      },
      {
        startExp: 25_525,
        rate: 70_000,
        description: '3t4s at quarry'
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
        rate: 97_923,
        description: '3t4g at quarry'
      },
      {
        startExp: 737_627,
        rate: 103_751,
        description: '3t4g at quarry'
      },
      {
        startExp: 1_986_068,
        rate: 109_143,
        description: '3t4g at quarry'
      },
      {
        startExp: 3_258_594,
        rate: 46_500,
        description: 'Mlm prospector'
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
        rate: 71_560,
        description: 'Contracts + kingdom'
      },
      {
        startExp: 13_034_431,
        rate: 73_560,
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
        rate: 10_000,
        description: 'Quests'
      },
      {
        startExp: 61_600,
        rate: 35_000,
        description: 'Bonus xp from fishing (wildy rate)'
      },
      {
        startExp: 123_660,
        rate: 45_847,
        description: 'Bonus xp from fishing (sepulchre rate)'
      },
      {
        startExp: 333_804,
        rate: 57_300,
        description: 'Sepulchre'
      },
      {
        startExp: 899_257,
        rate: 67_700,
        description: 'Sepulchre'
      },
      {
        startExp: 2_421_087,
        rate: 73_800,
        description: 'Sepulchre'
      },
      {
        startExp: 6_517_253,
        rate: 98_500,
        description: 'Sepulchre'
      },
      {
        startExp: 13_034_431,
        rate: 102_600,
        description:
          'Sepulchre (100.8k no loot rate) + con ehp. Real time agility rate when efficiently looting is 89.3k, time spent looting is added to gp adjusted skills.'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.THIEVING,
    methods: [
      {
        startExp: 0,
        rate: 26_000,
        description: 'Quests + fruit stall'
      },
      {
        startExp: 61_512,
        rate: 80_000,
        description: 'Blackjacking'
      },
      {
        startExp: 91_721,
        rate: 193_600,
        description: 'Artefact + glassblowing (152k, 71k rate)'
      },
      {
        startExp: 273_742,
        rate: 220_200,
        description: 'Artefact + glassblowing (172k, 71k rate)'
      },
      {
        startExp: 668_051,
        rate: 246_700,
        description: 'Artefact + glassblowing (193k, 71k rate)'
      },
      {
        startExp: 1_798_808,
        rate: 273_300,
        description: 'Artefact + glassblowing (214k, 71k rate)'
      },
      {
        startExp: 4_842_295,
        rate: 299_900,
        description: 'Artefact + glassblowing (235k, 71k rate)'
      },
      {
        startExp: 13_034_431,
        rate: 312_500,
        description: 'Artefact + glassblowing (245k, 71k rate)'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.SLAYER,
    methods: [
      {
        startExp: 0,
        rate: 4_600,
        description: 'Gear + turael & konar'
      },
      {
        startExp: 105_000,
        rate: 20_700,
        description: 'Nieve slayer'
      },
      {
        startExp: 273_742,
        rate: 30_200,
        description: 'Nieve slayer'
      },
      {
        startExp: 449_428,
        rate: 35_200,
        description: 'Nieve slayer'
      },
      {
        startExp: 1_986_068,
        rate: 40_800,
        description: 'Duradel slayer'
      },
      {
        startExp: 3_258_594,
        rate: 50_700,
        description: 'Duradel slayer'
      },
      {
        startExp: 7_195_629,
        rate: 56_300,
        description: 'Duradel slayer'
      },
      {
        startExp: 13_034_431,
        rate: 67_450,
        description: 'Duradel slayer + banked ehp (52.7k rate)'
      }
    ],
    bonuses: [
      {
        originSkill: Skill.SLAYER,
        bonusSkill: Skill.RANGED,
        startExp: 0,
        endExp: 200_000_000,
        end: true,
        ratio: 0.0268
      },
      {
        originSkill: Skill.SLAYER,
        bonusSkill: Skill.DEFENCE,
        startExp: 0,
        endExp: 200_000_000,
        end: false,
        ratio: 1
      },
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
        ratio: 0.9118
      }
    ]
  },
  {
    skill: Skill.FARMING,
    methods: [
      {
        startExp: 0,
        rate: 500_000,
        description: 'Low lv trees'
      },
      {
        startExp: 150_872,
        rate: 66_000,
        description: 'Seed box + autoweed'
      },
      {
        startExp: 415_000,
        rate: 2_000_000,
        description: 'Tree runs'
      },
      {
        startExp: 13_034_431,
        rate: 2_880_000,
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
        rate: 16_000,
        description: 'Quests'
      },
      {
        startExp: 36_000,
        rate: 54_700,
        description: '1.5t daeyalt lavas (85k rate)'
      },
      {
        startExp: 101_333,
        rate: 60_600,
        description: '1.5t daeyalt lavas (101k rate)'
      },
      {
        startExp: 737_627,
        rate: 56_000,
        description: '1.5t daeyalt zmi (77k rate)'
      },
      {
        startExp: 1_210_421,
        rate: 64_000,
        description: '1.5t daeyalt zmi (91k rate)'
      },
      {
        startExp: 1_986_068,
        rate: 60_000,
        description: 'Gotr outfit'
      },
      {
        startExp: 3_258_594,
        rate: 75_200,
        description: '1.5t daeyalt zmi (114k rate)'
      },
      {
        startExp: 5_346_332,
        rate: 77_900,
        description: '1.5t daeyalt zmi (118k rate)'
      },
      {
        startExp: 13_034_431,
        rate: 80_000,
        description: '1.5t daeyalt zmi (122k rate)'
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
        rate: 175_300,
        description: 'Mahogany bh'
      },
      {
        startExp: 668_051,
        rate: 84_490,
        description: 'Aerial for angler'
      },
      {
        startExp: 1_214_914,
        rate: 185_000,
        description: 'Mahogany+ bh'
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
        rate: 245_300,
        description: 'Avg rate of black chins & bh runs'
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
        rate: 202_091,
        description: '1.5t teak myth capes (430k rate) + kingdom mahogany benches (1050k rate) - gp adjusted'
      },
      {
        startExp: 13_034_431,
        rate: 233_800,
        description: '1.5t teak myth capes (430k rate) + kingdom mahogany benches (1050k rate) - gp adjusted'
      }
    ],
    bonuses: []
  }
];
