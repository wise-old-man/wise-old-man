import { Skill } from '../../../../../utils';

export default [
  {
    skill: Skill.ATTACK,
    methods: [
      {
        startExp: 0,
        rate: 186_400,
        description: 'Chally 2 alt tzhaar (rate based on atk and def such that chally on shared is 1:1)'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.DEFENCE,
    methods: [
      {
        startExp: 0,
        rate: 767_500,
        description: 'Defensive chinning (377k rate)'
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
        description: 'Quests + void'
      },
      {
        startExp: 203_254,
        rate: 540_500,
        description: 'Red chins (454k rate)'
      },
      {
        startExp: 449_428,
        rate: 817_100,
        description: 'Black chins (634k rate)'
      },
      {
        startExp: 737_627,
        rate: 926_600,
        description: 'Black chins (698k rate)'
      },
      {
        startExp: 1_986_068,
        rate: 1_070_600,
        description: 'Black chins (777k rate)'
      },
      {
        startExp: 5_346_332,
        rate: 1_218_600,
        description: 'Black chins (852k rate)'
      },
      {
        startExp: 13_034_431,
        rate: 1_560_300,
        description: 'Black chins (938k rate)'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.PRAYER,
    methods: [
      {
        startExp: 0,
        rate: 175_600,
        description: 'Wildy green dragons (340/hr, melees scaled to 600k true rate)'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.COOKING,
    methods: [
      {
        startExp: 0,
        rate: 74_300,
        description: '2t cook fish from wt'
      },
      {
        startExp: 13_363,
        rate: 232_200,
        description: 'Multi Client Shop hop 1t karambwans with alt'
      },
      {
        startExp: 37_224,
        rate: 264_800,
        description: 'Multi Client Shop hop 1t karambwans with alt'
      },
      {
        startExp: 101_333,
        rate: 297_400,
        description: 'Multi Client Shop hop 1t karambwans with alt'
      },
      {
        startExp: 273_742,
        rate: 330_000,
        description: 'Multi Client Shop hop 1t karambwans with alt'
      },
      {
        startExp: 737_627,
        rate: 362_600,
        description: 'Multi Client Shop hop 1t karambwans with alt'
      },
      {
        startExp: 1_986_068,
        rate: 395_200,
        description: 'Multi Client Shop hop 1t karambwans with alt'
      },
      {
        startExp: 5_346_332,
        rate: 425_600,
        description: 'Multi Client Shop hop 1t karambwans with alt'
      },
      {
        startExp: 13_034_431,
        rate: 440_000,
        description: 'Multi Client Shop hop 1t karambwans with alt'
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
        startExp: 75_416,
        rate: 0,
        description: '0 time from wt'
      },
      {
        startExp: 368_599,
        rate: 158_600,
        description: '1.5t teaks'
      },
      {
        startExp: 737_627,
        rate: 169_900,
        description: '1.5t teaks'
      },
      {
        startExp: 1_986_068,
        rate: 182_200,
        description: '1.5t teaks'
      },
      {
        startExp: 5_346_332,
        rate: 194_000,
        description: '1.5t teaks'
      },
      {
        startExp: 13_034_431,
        rate: 204_000,
        description:
          '1.5t redwoods with crystal axe, banking ~80% of logs for artefacts (187.6k wc, 33.7k fm rate)'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.FLETCHING,
    methods: [
      {
        startExp: 0,
        rate: 1_531_100,
        description: 'Broads at sepulchre, hourlies, mahog homes and zmi'
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
        description: 'Quests + Fly fishing'
      },
      {
        startExp: 22_406,
        rate: 32_000,
        description: 'Tempoross for barrel'
      },
      {
        startExp: 302_288,
        rate: 67_200,
        description: 'Aerial for angler'
      },
      {
        startExp: 737_627,
        rate: 116_600,
        description: 'Decant Barblore (93k rate)'
      },
      {
        startExp: 2_951_373,
        rate: 127_200,
        description: 'Decant Barblore (98.6k rate)'
      },
      {
        startExp: 5_902_831,
        rate: 134_400,
        description: 'Decant Barblore (102.2k rate)'
      },
      {
        startExp: 10_692_629,
        rate: 138_700,
        description: 'Decant Barblore (104.3k rate)'
      },
      {
        startExp: 13_034_431,
        rate: 146_100,
        description: 'Decant Barblore (107k rate)'
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
        ratio: 0.1192
      },
      {
        originSkill: Skill.FISHING,
        bonusSkill: Skill.AGILITY,
        startExp: 737_627,
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
        description: 'Reg, oak, teak logs'
      },
      {
        startExp: 101_333,
        rate: 208_900,
        description: 'World hop wt (202.1k rate)'
      },
      {
        startExp: 273_742,
        rate: 245_500,
        description: 'World hop wt (237.4k rate)'
      },
      {
        startExp: 737_627,
        rate: 283_300,
        description: 'World hop wt (273.9k rate)'
      },
      {
        startExp: 1_986_068,
        rate: 321_000,
        description: 'World hop wt (310.4k rate)'
      },
      {
        startExp: 5_346_332,
        rate: 356_300,
        description: 'World hop wt (344.5k rate)'
      },
      {
        startExp: 13_034_431,
        rate: 419_900,
        description: 'World hop wt (381.8k rate)'
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
        description:
          'Quests + celastrus bark & daily bstaves for early gp (~1.5k staves) + no-superglassmake glassblow'
      },
      {
        startExp: 333_804,
        rate: 347_500,
        description:
          'Superglassmake, gems from mining cut 0 time with gem bag, misc jewellry, bh xp, diamond amulet (u)'
      },
      {
        startExp: 3_539_592,
        rate: 271_800,
        description: 'Lantern lens at zmi'
      },
      {
        startExp: 3_972_294,
        rate: 346_000,
        description: 'Light orb at zmi'
      },
      {
        startExp: 13_034_431,
        rate: 209_900,
        description: 'Light orb at zmi'
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
        rate: 315_000,
        description: '2 client gold'
      },
      {
        startExp: 13_034_431,
        rate: 330_000,
        description: '2 client gold'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.MINING,
    methods: [
      {
        startExp: 0,
        rate: 25_000,
        description: 'Quests + 1.5t stars for celestial ring + 3t sandstone (drop all)'
      },
      {
        startExp: 61_512,
        rate: 69_800,
        description: '3s1g (Keep 1kg)'
      },
      {
        startExp: 150_872,
        rate: 73_700,
        description: '3s1g (Drop 1kg)'
      },
      {
        startExp: 273_742,
        rate: 17_000,
        description: '1.5t Daeyalt for 99 rc (505k essence)'
      },
      {
        startExp: 1_283_073,
        rate: 99_600,
        description: '3t gem rocks'
      },
      {
        startExp: 3_258_594,
        rate: 45_200,
        description: 'MLM for outfit, gem bag, coal bag'
      },
      {
        startExp: 4_385_776,
        rate: 108_700,
        description: '3t gem rocks'
      },
      {
        startExp: 11_395_875,
        rate: 87_600,
        description: 'Sandstone for 99 crafting'
      },
      {
        startExp: 13_034_431,
        rate: 125_000,
        description: '3t granite (or 3t gems, cutting at sep with gem bag)'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.HERBLORE,
    methods: [
      {
        startExp: 0,
        rate: 70_200,
        description: 'Contracts, spirit seeds, kingdom etc'
      },
      {
        startExp: 13_034_431,
        rate: 72_200,
        description: 'Contracts, spirit seeds, kingdom etc'
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
        startExp: 61_512,
        rate: 45_000,
        description: 'BXP from fishing'
      },
      {
        startExp: 123_660,
        rate: 45_000,
        description: 'BXP from fishing'
      },
      {
        startExp: 333_804,
        rate: 56_200,
        description: 'BXP from fishing'
      },
      {
        startExp: 899_257,
        rate: 66_600,
        description: 'BXP from fishing'
      },
      {
        startExp: 1_152_279,
        rate: 69_400,
        description:
          'Sepulchre with looting + multiskill, thieving ehp, nail/plank time for bridges (64k real time rate)'
      },
      {
        startExp: 2_421_087,
        rate: 76_500,
        description:
          'Sepulchre with looting + multiskill, thieving ehp, nail/plank time for bridges (72.5k real time rate)'
      },
      {
        startExp: 6_517_253,
        rate: 92_400,
        description:
          'Sepulchre with looting + multiskill, thieving ehp, nail/plank time for bridges (88,2k real time rate)'
      },
      {
        startExp: 13_034_431,
        rate: 98_000,
        description:
          'Sepulchre with looting + multiskill, thieving ehp, nail/plank time for bridges (95.1k real time rate)'
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
        rate: 190_900,
        description: 'Artefact + glassblow (152k, 71k rate)'
      },
      {
        startExp: 247_886,
        rate: 217_100,
        description: 'Artefact + glassblow (172k, 71k rate)'
      },
      {
        startExp: 668_051,
        rate: 243_300,
        description: 'Artefact + glassblow (193k, 71k rate)'
      },
      {
        startExp: 1_798_808,
        rate: 269_500,
        description: 'Artefact + glassblow (214k, 71k rate)'
      },
      {
        startExp: 4_842_295,
        rate: 295_700,
        description: 'Artefact + glassblow (235k, 71k rate)'
      },
      {
        startExp: 13_034_431,
        rate: 376_600,
        description: 'Artefact + glassblow (245k, 71k rate) & banked redwood logs'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.SLAYER,
    methods: [
      {
        startExp: 0,
        rate: 5_329,
        description: 'Efficient Slayer + torso, defender, fire cape & turael boosting for early point unlocks'
      },
      {
        startExp: 101_333,
        rate: 21_000,
        description: 'Efficient Slayer (19.9k rate)'
      },
      {
        startExp: 273_742,
        rate: 31_100,
        description: 'Efficient Slayer (27.4k rate)'
      },
      {
        startExp: 449_428,
        rate: 35_900,
        description: 'Efficient Slayer (31.5k rate)'
      },
      {
        startExp: 1_210_421,
        rate: 36_400,
        description: 'Efficient Slayer (32.4k rate)'
      },
      {
        startExp: 1_986_068,
        rate: 42_700,
        description: 'Efficient Slayer (32.3k rate)'
      },
      {
        startExp: 3_258_594,
        rate: 63_900,
        description: 'Efficient Slayer (42.2k rate)'
      },
      {
        startExp: 7_195_629,
        rate: 66_700,
        description: 'Efficient Slayer (50.7k rate)'
      },
      {
        startExp: 13_034_431,
        rate: 80_000,
        description:
          'Efficient slayer + pvm for upgrades, including stored ehp, konar every 50, 0 cox, 1200 zulrah, 50 muspah (55.9k rate)'
      }
    ],
    bonuses: [
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
        ratio: 0.9115
      },
      {
        originSkill: Skill.SLAYER,
        bonusSkill: Skill.RANGED,
        startExp: 13_034_431,
        endExp: 200_000_000,
        end: true,
        ratio: 0.055
      }
    ]
  },
  {
    skill: Skill.FARMING,
    methods: [
      {
        startExp: 0,
        rate: 500_000,
        description: 'Low level trees + giant seaweed'
      },
      {
        startExp: 150_872,
        rate: 66_000,
        description: 'Tithe for seed box + autoweed'
      },
      {
        startExp: 407_015,
        rate: 2_000_000,
        description: 'Tree runs'
      },
      {
        startExp: 13_034_431,
        rate: 3_692_900,
        description:
          'Highest xp trees, farming from herblore, contracts etc, 4 years of hardwoods, volcanic ash, hespori'
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
        description: 'Quests + Arceuus Favour'
      },
      {
        startExp: 33_648,
        rate: 84_500,
        description: '1.5t Daeyalt Lavas'
      },
      {
        startExp: 101_333,
        rate: 99_600,
        description: '1.5t Daeyalt Lavas'
      },
      {
        startExp: 1_210_421,
        rate: 60_000,
        description: 'GOTR for outfit'
      },
      {
        startExp: 3_258_594,
        rate: 115_000,
        description: '1.5t Daeyalt ZMI'
      },
      {
        startExp: 5_346_332,
        rate: 119_100,
        description: '1.5t Daeyalt ZMI'
      },
      {
        startExp: 13_034_431,
        rate: 80_100,
        description: '1.5t Daeyalt ZMI (123k rate)'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.HUNTER,
    methods: [
      {
        startExp: 0,
        rate: 136_800,
        description: 'Low tier bh + History quiz'
      },
      {
        startExp: 91_721,
        rate: 192_000,
        description: 'Mahogany bh'
      },
      {
        startExp: 668_051,
        rate: 84_400,
        description: 'Aerial for angler'
      },
      {
        startExp: 1_210_421,
        rate: 192_000,
        description: 'Mahogany+ bh'
      },
      {
        startExp: 1_986_068,
        rate: 155_800,
        description: 'Red chins for ranged'
      },
      {
        startExp: 2_421_087,
        rate: 207_900,
        description: 'Black chins'
      },
      {
        startExp: 5_346_332,
        rate: 241_000,
        description: 'Black chins'
      },
      {
        startExp: 13_034_431,
        rate: 249_300,
        description: 'Average of black chins (260k rate) and bh'
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
        startExp: 37_224,
        rate: 0,
        description: 'Bonus xp from wt'
      },
      {
        startExp: 101_333,
        rate: 240_000,
        description: 'Myth cape racks + kingdom mahog homes & some benches/tables'
      },
      {
        startExp: 13_034_431,
        rate: 293_700,
        description:
          '1.5t teak myth capes (430k rate) + kingdom mahogany benches (1050k rate), con from sep, & misc time'
      }
    ],
    bonuses: []
  }
];
