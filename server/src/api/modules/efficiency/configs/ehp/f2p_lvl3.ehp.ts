import { Skill } from '../../../../../types';

export default [
  {
    skill: Skill.COOKING,
    methods: [
      {
        startExp: 0,
        rate: 130_000,
        description: '1t Beef'
      },
      {
        startExp: 22_406,
        rate: 450_000,
        description: 'Wines with Failing'
      },
      {
        startExp: 605_032,
        rate: 500_000,
        description: 'Wines 100% Success Rate'
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
        description: '2t Oaks (steel axe)'
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
        description: 'Sardine & Herring'
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
        startExp: 13_363,
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
        rate: 20_000,
        description: 'Logs @ GE'
      },
      {
        startExp: 2_411,
        rate: 40_000,
        description: 'Oak logs @ GE'
      },
      {
        startExp: 13_363,
        rate: 100_000,
        description: 'Willow logs @ GE'
      },
      {
        startExp: 61_512,
        rate: 197_000,
        description: 'Maple logs @ GE'
      },
      {
        startExp: 273_742,
        rate: 296_000,
        description: 'Yew logs @ GE'
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
        rate: 140_600,
        description: 'Sapphires'
      },
      {
        startExp: 9_730,
        rate: 189_800,
        description: 'Emeralds'
      },
      {
        startExp: 20_224,
        rate: 239_000,
        description: 'Rubies'
      },
      {
        startExp: 50_339,
        rate: 302_300,
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
        rate: 38_175,
        description: "Knight's Sword"
      },
      {
        startExp: 12_725,
        rate: 59_970,
        description: 'Bronze Platebodies w/ alt'
      },
      {
        startExp: 18_247,
        rate: 119_950,
        description: 'Iron Platebodies w/ alt'
      },
      {
        startExp: 83_014,
        rate: 179_900,
        description: 'Steel Platebodies w/ alt'
      },
      {
        startExp: 605_032,
        rate: 239_900,
        description: 'Mithril Platebodies w/ alt'
      },
      {
        startExp: 4_385_776,
        rate: 300_000,
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
        description: 'Tin/copper'
      },
      {
        startExp: 2_411,
        rate: 50_750,
        description: '3t Iron w/ Cake (All Rocks)'
      },
      {
        startExp: 5_018,
        rate: 53_600,
        description: '3t Iron w/ Cake (All Rocks)'
      },
      {
        startExp: 14_833,
        rate: 57_550,
        description: '3t Iron w/ Cake (All Rocks)'
      },
      {
        startExp: 41_171,
        rate: 60_900,
        description: '3t Iron w/ Cake (Adjacent Rocks)'
      },
      {
        startExp: 302_288,
        rate: 65_000,
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
        rate: 65_000,
        description: 'Dolo Pvp World Body Tiaras'
      }
    ],
    bonuses: []
  }
];
