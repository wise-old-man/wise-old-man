import { Skill } from '../../../../../utils';

export default [
  {
    skill: Skill.COOKING,
    methods: [
      {
        startExp: 0,
        rate: 100_000,
        description: '1t beef'
      },
      {
        startExp: 22_406,
        rate: 450_000,
        description: 'Wines (avg rate with failures)'
      },
      {
        startExp: 605_032,
        rate: 500_000,
        description: 'Wines'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.WOODCUTTING,
    methods: [
      {
        startExp: 0,
        rate: 29_500,
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
        rate: 100_000,
        description: '2t oaks (rune axe)'
      },
      {
        startExp: 302_288,
        rate: 110_000,
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
        rate: 45_000,
        description: 'Best Logs @ GE'
      },
      {
        startExp: 13_363,
        rate: 130_500,
        description: 'Best Logs @ GE'
      },
      {
        startExp: 61_512,
        rate: 195_750,
        description: 'Best Logs @ GE'
      },
      {
        startExp: 273_742,
        rate: 298_000,
        description: 'Best Logs @ GE'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.CRAFTING,
    methods: [
      {
        startExp: 0,
        rate: 37_000,
        description: 'Leather'
      },
      {
        startExp: 4_470,
        rate: 137_200,
        description: 'Sapphires'
      },
      {
        startExp: 9_730,
        rate: 185_220,
        description: 'Emeralds'
      },
      {
        startExp: 20_224,
        rate: 233_240,
        description: 'Rubies'
      },
      {
        startExp: 50_339,
        rate: 295_000,
        description: 'Diamonds'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.SMITHING,
    methods: [
      {
        startExp: 0,
        rate: 12_725,
        description: "Knight's Sword"
      },
      {
        startExp: 12_725,
        rate: 58_000,
        description: 'Bronze Platebodies w/ alt'
      },
      {
        startExp: 18_247,
        rate: 116_000,
        description: 'Iron Platebodies w/ alt'
      },
      {
        startExp: 83_014,
        rate: 174_000,
        description: 'Steel Platebodies w/ alt'
      },
      {
        startExp: 605_032,
        rate: 232_000,
        description: 'Mithril Platebodies w/ alt'
      },
      {
        startExp: 4_385_776,
        rate: 290_000,
        description: 'Adamant Platebodies w/ alt'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.MINING,
    methods: [
      {
        startExp: 0,
        rate: 4_000,
        description: 'Tin & Copper'
      },
      {
        startExp: 2_411,
        rate: 50_000,
        description: '3t Iron w/ Cake (All Rocks)'
      },
      {
        startExp: 5_018,
        rate: 52_800,
        description: '3t Iron w/ Cake (All Rocks)'
      },
      {
        startExp: 14_833,
        rate: 56_700,
        description: '3t Iron w/ Cake (All Rocks)'
      },
      {
        startExp: 41_171,
        rate: 59_400,
        description: '3t Iron w/ Cake (Adjacent Rocks)'
      },
      {
        startExp: 302_288,
        rate: 61_500,
        description: '3t Iron w/ Cake (Adjacent Rocks)'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.RUNECRAFTING,
    methods: [
      {
        startExp: 0,
        rate: 75_000,
        description: 'Various'
      }
    ],
    bonuses: []
  }
];
