import { Skill } from '../../../../../types';

export default [
  {
    skill: Skill.ATTACK,
    methods: [
      {
        startExp: 0,
        rate: 186_400,
        description:
          'Chally 2 alt tzhaar (rate based on strength and defence such that chally on shared is 1:1)'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.DEFENCE,
    methods: [
      {
        startExp: 0,
        rate: 768_000,
        description: 'Defensive chinning (378k rate)'
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
        rate: 565_900,
        description: 'Red chins (448k rate)'
      },
      {
        startExp: 449_428,
        rate: 842_800,
        description: 'Black chins (641k rate)'
      },
      {
        startExp: 737_627,
        rate: 1_123_600,
        description: 'Black chins (755k rate)'
      },
      {
        startExp: 1_986_068,
        rate: 1_310_100,
        description: 'Black chins (866k rate)'
      },
      {
        startExp: 5_346_332,
        rate: 1_489_400,
        description: 'Black chins (937k rate)'
      },
      {
        startExp: 13_034_431,
        rate: 1_560_900,
        description: 'Black chins (1008k rate)'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.PRAYER,
    methods: [
      {
        startExp: 0,
        rate: 175_900,
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
        rate: 202_400,
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
        rate: 1_524_300,
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
        rate: 115_500,
        description: 'Decant Barblore (93.0k rate)'
      },
      {
        startExp: 2_951_373,
        rate: 126_400,
        description: 'Decant Barblore (98.6k rate)'
      },
      {
        startExp: 5_902_831,
        rate: 133_800,
        description: 'Decant Barblore (102.2k rate)'
      },
      {
        startExp: 10_692_629,
        rate: 138_300,
        description: 'Decant Barblore (104.3k rate)'
      },
      {
        startExp: 13_034_431,
        rate: 141_800,
        description: 'Decant Barblore (107.0k rate)'
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
        endExp: 13_034_431,
        end: false,
        ratio: 0.0885
      },
      {
        originSkill: Skill.FISHING,
        bonusSkill: Skill.AGILITY,
        startExp: 13_034_431,
        endExp: 200_000_000,
        end: true,
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
        rate: 233_900,
        description: 'World hop wt (223.1k rate)'
      },
      {
        startExp: 273_742,
        rate: 274_800,
        description: 'World hop wt (273.9k rate)'
      },
      {
        startExp: 737_627,
        rate: 317_100,
        description: 'World hop wt (316.0k rate)'
      },
      {
        startExp: 1_986_068,
        rate: 359_300,
        description: 'World hop wt (358.0k rate)'
      },
      {
        startExp: 5_346_332,
        rate: 398_800,
        description: 'World hop wt (397.4k rate)'
      },
      {
        startExp: 13_034_431,
        rate: 462_400,
        description: 'World hop wt (420.0k rate)'
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
        rate: 347_700,
        description:
          'Superglassmake, gems from mining cut 0 time with gem bag, misc jewellry, bh xp, diamond amulet (u)'
      },
      {
        startExp: 3_539_592,
        rate: 260_100,
        description: 'Lantern lens at zmi'
      },
      {
        startExp: 3_972_294,
        rate: 331_100,
        description: 'Light orb at zmi'
      },
      {
        startExp: 13_034_431,
        rate: 207_200,
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
        rate: 350_000,
        description: '2 client gold'
      },
      {
        startExp: 13_034_431,
        rate: 375_000,
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
        startExp: 27_473,
        rate: 70_600,
        description: '3s1g (Keep 1kg)'
      },
      {
        startExp: 150_872,
        rate: 72_600,
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
        startExp: 11_441_686,
        rate: 90_200,
        description: 'Sandstone for 99 crafting'
      },
      {
        startExp: 13_034_431,
        rate: 125_000,
        description: '3t granite'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.HERBLORE,
    methods: [
      {
        startExp: 0,
        rate: 70_000,
        description: 'Contracts, spirit seeds, kingdom, herbtodt etc'
      },
      {
        startExp: 13_034_431,
        rate: 76_000,
        description: 'Contracts, spirit seeds, kingdom, herbtodt etc'
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
        rate: 56_300,
        description: 'BXP from fishing'
      },
      {
        startExp: 899_257,
        rate: 66_700,
        description: 'BXP from fishing'
      },
      {
        startExp: 1_152_279,
        rate: 69_700,
        description:
          'Sepulchre with looting + multiskill, thieving ehp, nail/plank time for bridges (64.0k real time rate)'
      },
      {
        startExp: 2_421_087,
        rate: 76_600,
        description:
          'Sepulchre with looting + multiskill, thieving ehp, nail/plank time for bridges (72.6k real time rate)'
      },
      {
        startExp: 6_517_253,
        rate: 93_300,
        description:
          'Sepulchre with looting + multiskill, thieving ehp, nail/plank time for bridges (89.0k real time rate)'
      },
      {
        startExp: 13_034_431,
        rate: 97_600,
        description:
          'Sepulchre with looting + multiskill, thieving ehp, nail/plank time for bridges (94.0k real time rate)'
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
        rate: 193_200,
        description: 'Artefact + glassblow (152k, 71k rate)'
      },
      {
        startExp: 247_886,
        rate: 219_700,
        description: 'Artefact + glassblow (172k, 71k rate)'
      },
      {
        startExp: 668_051,
        rate: 246_200,
        description: 'Artefact + glassblow (193k, 71k rate)'
      },
      {
        startExp: 1_798_808,
        rate: 272_700,
        description: 'Artefact + glassblow (214k, 71k rate)'
      },
      {
        startExp: 4_842_295,
        rate: 299_200,
        description: 'Artefact + glassblow (235k, 71k rate)'
      },
      {
        startExp: 13_034_431,
        rate: 381_200,
        description: 'Artefact + glassblow (245k, 71k rate) & banked redwood logs (250k, 305k rate)'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.SLAYER,
    methods: [
      {
        startExp: 0,
        rate: 5_156,
        description: 'Efficient Slayer + torso, defender, fire cape & turael boosting for early point unlocks'
      },
      {
        startExp: 101_333,
        rate: 16_000,
        description: 'Efficient Slayer (19.9k rate) + quest & misc time'
      },
      {
        startExp: 273_742,
        rate: 21_000,
        description: 'Efficient Slayer (27.4k rate) + quest & misc time'
      },
      {
        startExp: 449_428,
        rate: 23_500,
        description: 'Efficient Slayer (31.5k rate) + quest & misc time'
      },
      {
        startExp: 1_210_421,
        rate: 24_200,
        description: 'Efficient Slayer (32.4k rate) + quest & misc time'
      },
      {
        startExp: 1_986_068,
        rate: 27_000,
        description: 'Efficient Slayer (32.3k rate) + quest & misc time'
      },
      {
        startExp: 3_258_594,
        rate: 33_800,
        description: 'Efficient Slayer (42.2k rate) + quest & misc time'
      },
      {
        startExp: 7_195_629,
        rate: 34_500,
        description: 'Efficient Slayer (50.7k rate) + quest & misc time'
      },
      {
        startExp: 13_034_431,
        rate: 81_500,
        description:
          'Efficient slayer + pvm for upgrades, including stored ehp, konar every 50, 0 cox, 850 zulrah, 50 muspah (58.4k rate)'
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
        rate: 3_445_600,
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
        rate: 84_600,
        description: '1.5t Daeyalt Lavas'
      },
      {
        startExp: 101_333,
        rate: 99_600,
        description: '1.5t Daeyalt Lavas'
      },
      {
        startExp: 1_210_421,
        rate: 70_000,
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
        rate: 156_900,
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
        rate: 255_000,
        description: 'Average of black chins (260k rate), rumours (240k rate) and birdhouses'
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
        rate: 279_100,
        description:
          '1.5t teak myth capes (421k rate) + kingdom mahogany homes (285k rate), con from sep, & misc time'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.SAILING,
    methods: [
      { startExp: 0, rate: 5_000, description: 'Port tasks & Quests' },
      { startExp: 13_363, rate: 25_000, description: 'Barracuda trials (The Tempor Tantrum)' },
      { startExp: 101_333, rate: 35_000, description: 'Large shipwrecks with boost' },
      { startExp: 166_636, rate: 80_000, description: 'Barracuda Trials (The Jubbly Jive)' },
      {
        startExp: 899_257,
        rate: 195_000,
        description: 'Barracuda Trials (The Gwenith Glide) - Camphor hull'
      },
      {
        startExp: 5_346_332,
        rate: 225_000,
        description: 'Barracuda Trials (The Gwenith Glide) - Rosewood hull'
      }
    ],
    bonuses: []
  }
];
