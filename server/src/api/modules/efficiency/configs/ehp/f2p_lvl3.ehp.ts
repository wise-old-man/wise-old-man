import { Skill } from '../../../../../utils';

export default [
  {
    skill: Skill.COOKING,
    methods: [
      {
        startExp: 0,
        rate: 500_000,
        description: 'wines'
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
        rate: 139_000,
        description: 'Sapphires'
      },
      {
        startExp: 9_730,
        rate: 187_650,
        description: 'Emeralds'
      },
      {
        startExp: 20_224,
        rate: 236_300,
        description: 'Rubies'
      },
      {
        startExp: 50_339,
        rate: 298_850,
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
        description: "Knight's Sword (20 min completion)"
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
        rate: 60_000,
        description: '3t Iron w/ Cake (Adjacent Rocks)'
      },
      {
        startExp: 302_288,
        rate: 64_000,
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
        description: 'Various'
      }
    ],
    bonuses: []
  }
];
