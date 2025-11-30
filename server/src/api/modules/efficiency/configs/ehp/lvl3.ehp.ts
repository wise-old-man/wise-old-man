import { Skill } from '../../../../../types';

export default [
  {
    skill: Skill.COOKING,
    methods: [
      {
        startExp: 0,
        rate: 171_000,
        description: '1t poison karambwan'
      },
      {
        startExp: 13_363,
        rate: 513_800,
        description: '1t karambwan'
      },
      {
        startExp: 37_224,
        rate: 585_600,
        description: '1t karambwan'
      },
      {
        startExp: 101_333,
        rate: 656_800,
        description: '1t karambwan'
      },
      {
        startExp: 273_742,
        rate: 728_200,
        description: '1t karambwan'
      },
      {
        startExp: 737_627,
        rate: 799_800,
        description: '1t karambwan'
      },
      {
        startExp: 1_986_068,
        rate: 871_400,
        description: '1t karambwan'
      },
      {
        startExp: 5_346_332,
        rate: 938_400,
        description: '1t karambwan'
      },
      {
        startExp: 13_034_431,
        rate: 970_000,
        description: '1t karambwan'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.WOODCUTTING,
    methods: [
      {
        startExp: 0,
        rate: 8_000,
        description:
          "Quests (Monks friend, Enlightened journey, Children of the Sun + The Ribbiting Tale of a Lily Pad Labour Dispute, and Gertrude's Cat + Icthlarin's Little Helper)"
      },
      {
        startExp: 9_500,
        rate: 56_000,
        description: '2t oaks + Mithril/Adamant felling axe'
      },
      {
        startExp: 22_406,
        rate: 93_170,
        description: '1.5t teaks + Adamant felling axe'
      },
      {
        startExp: 41_171,
        rate: 114_724,
        description: '1.5t teaks + Rune felling axe'
      },
      {
        startExp: 111_945,
        rate: 127_335,
        description: '1.5t teaks + Rune felling axe'
      },
      {
        startExp: 302_288,
        rate: 172_502,
        description: '1.5t teaks + Dragon felling axe'
      },
      {
        startExp: 814_445,
        rate: 186_565,
        description: '1.5t teaks + Dragon felling axe'
      },
      {
        startExp: 1_986_068,
        rate: 199_286,
        description: '1.5t teaks + Dragon felling axe'
      },
      {
        startExp: 5_346_332,
        rate: 212_789,
        description: '1.5t teaks + Dragon felling axe'
      },
      {
        startExp: 13_034_431,
        rate: 225_000,
        description: '1.5t teaks + Dragon felling axe'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.FISHING,
    methods: [
      {
        startExp: 0,
        rate: 29_200,
        description: 'Quests'
      },
      {
        startExp: 14_612,
        rate: 46_592,
        description: '3t fly fishing'
      },
      {
        startExp: 75_127,
        rate: 80_446,
        description: 'Drift net fishing (65.2k hunter & 55.9k fishing xp/h)'
      },
      {
        startExp: 106_046,
        rate: 92_041,
        description: 'Drift net fishing (81.6k hunter & 64.6k fishing xp/h)'
      },
      {
        startExp: 229_685,
        rate: 102_279,
        description: 'Drift net fishing (95.1k hunter & 72.2k fishing xp/h)'
      },
      {
        startExp: 302_288,
        rate: 123_438,
        description: 'Drift net fishing (108.7k hunter & 80.3k fishing xp/h)'
      },
      {
        startExp: 593_234,
        rate: 134_262,
        description: 'Drift net fishing (118.5k hunter & 87.2k fishing xp/h)'
      },
      {
        startExp: 737_627,
        rate: 120_000,
        description: 'Drift net fishing + 2t swordfish & tuna'
      }
    ],
    bonuses: [
      {
        originSkill: Skill.FISHING,
        bonusSkill: Skill.COOKING,
        startExp: 737_627,
        endExp: 200_000_000,
        end: true,
        ratio: 0.216
      }
    ]
  },
  {
    skill: Skill.FIREMAKING,
    methods: [
      {
        startExp: 0,
        rate: 58_960,
        description: 'Logs'
      },
      {
        startExp: 2_411,
        rate: 88_440,
        description: 'Oak logs'
      },
      {
        startExp: 13_363,
        rate: 132_660,
        description: 'Willow logs'
      },
      {
        startExp: 22_406,
        rate: 154_770,
        description: 'Teak logs'
      },
      {
        startExp: 61_512,
        rate: 198_990,
        description: 'Maple logs'
      },
      {
        startExp: 101_333,
        rate: 365_272,
        description: 'Firebwan (Mahogany logs) - 232k firemaking, 240k cooking'
      },
      {
        startExp: 273_742,
        rate: 469_636,
        description: 'Firebwan (Yew logs) - 298k firemaking, 265k cooking'
      },
      {
        startExp: 1_210_421,
        rate: 704_569,
        description: 'Firebwan (Magic logs) - 448k firemaking, 304k cooking'
      },
      {
        startExp: 5_346_332,
        rate: 794_566,
        realRate: 310_000,
        description: 'Firebwan (Redwood logs) - 505k firemaking, 353.5k cooking'
      }
    ],
    bonuses: [
      {
        originSkill: Skill.FIREMAKING,
        bonusSkill: Skill.THIEVING,
        startExp: 5_346_332,
        endExp: 200_000_000,
        end: true,
        ratio: 0.8387
      }
    ]
  },
  {
    skill: Skill.CRAFTING,
    methods: [
      {
        startExp: 0,
        rate: 36_600,
        description: 'Leather items'
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
      },
      {
        startExp: 368_599,
        rate: 324_420,
        description: "Green d'hide bodies"
      },
      {
        startExp: 814_445,
        rate: 366_280,
        description: "Blue d'hide bodies"
      },
      {
        startExp: 1_475_581,
        rate: 408_140,
        description: "Red d'hide bodies"
      },
      {
        startExp: 2_951_373,
        rate: 450_000,
        description: "Black d'hide bodies"
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.SMITHING,
    methods: [
      {
        startExp: 0,
        rate: 47_450,
        description: "Quests (The Knight's Sword, Sleeping Giants, and Elemental Workshop I)"
      },
      {
        startExp: 23_725,
        rate: 116_000,
        description: 'Iron Platebodies w/ alt'
      },
      {
        startExp: 83_014,
        rate: 174_000,
        description: 'Steel platebodies w/ alt'
      },
      {
        startExp: 605_032,
        rate: 232_000,
        description: 'Mithril platebodies w/ alt'
      },
      {
        startExp: 4_385_776,
        rate: 290_000,
        description: 'Adamant platebodies w/ alt'
      },
      {
        startExp: 13_034_431,
        rate: 410_000,
        description: 'Blast Furnace Gold'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.MINING,
    methods: [
      {
        startExp: 0,
        rate: 24_500,
        description:
          "Quests (Client of Kourend + X Marks the Spot + The Forsaken Tower, Doric's Quest, Plague City, The Dig Site + Rune Mysteries + Goblin Diplomacy + The Lost Tribe)"
      },
      {
        startExp: 22_525,
        rate: 53_780,
        description: '3t Iron'
      },
      {
        startExp: 61_512,
        rate: 77_708,
        description: '3t4g at Desert Quarry'
      },
      {
        startExp: 101_333,
        rate: 81_026,
        description: '3t4g at Desert Quarry'
      },
      {
        startExp: 302_288,
        rate: 88_329,
        description: '3t4g at Desert Quarry'
      },
      {
        startExp: 737_627,
        rate: 93_586,
        description: '3t4g at Desert Quarry'
      },
      {
        startExp: 1_986_068,
        rate: 98_450,
        description: '3t4g at Desert Quarry'
      },
      {
        startExp: 3_258_594,
        rate: 46_500,
        description: 'Motherlode Mine for Prospector kit'
      },
      {
        startExp: 3_693_744,
        rate: 103_620,
        description: '3t4g at Desert Quarry'
      },
      {
        startExp: 5_346_332,
        rate: 105_100,
        description: '3t4g at Desert Quarry'
      },
      {
        startExp: 13_034_431,
        rate: 114_100,
        description: '3t4g at Desert Quarry'
      }
    ],
    bonuses: [
      {
        originSkill: Skill.MINING,
        bonusSkill: Skill.SMITHING,
        startExp: 302_288,
        endExp: 200_000_000,
        end: true,
        ratio: 0.08
      }
    ]
  },
  {
    skill: Skill.HERBLORE,
    methods: [
      {
        startExp: 0,
        rate: 6_000,
        description: 'Quests (Druidic Ritual + Jungle Potion, The Dig Site)'
      },
      {
        startExp: 3_025,
        rate: 125_000,
        description: 'Strength potions'
      },
      {
        startExp: 30_408,
        rate: 218_750,
        description: 'Prayer potions'
      },
      {
        startExp: 61_512,
        rate: 250_000,
        description: 'Super attack potions'
      },
      {
        startExp: 123_660,
        rate: 293_750,
        description: 'Super energies'
      },
      {
        startExp: 166_636,
        rate: 312_500,
        description: 'Super strengths'
      },
      {
        startExp: 368_599,
        rate: 356_250,
        description: 'Super restores'
      },
      {
        startExp: 496_254,
        rate: 375_000,
        description: 'Super defences'
      },
      {
        startExp: 668_051,
        rate: 393_750,
        description: 'Antifire potions'
      },
      {
        startExp: 899_257,
        rate: 406_250,
        description: 'Ranging potions'
      },
      {
        startExp: 1_336_443,
        rate: 431_250,
        description: 'Magic potions'
      },
      {
        startExp: 1_475_581,
        rate: 535_500,
        description: '1t stamina potions'
      },
      {
        startExp: 3_258_594,
        rate: 810_000,
        description: 'Ancient brew artefacts - 195k thieving, 270k herblore'
      },
      {
        startExp: 5_902_831,
        rate: 660_000,
        description: 'Forgotten +Ancient brew artefacts - 205k thieving, 300k herblore'
      },
      {
        startExp: 13_034_431,
        rate: 644_841,
        description: 'Forgotten + Ancient brew artefacts - 220k thieving, 300k herblore'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.AGILITY,
    methods: [
      {
        startExp: 0,
        rate: 9_000,
        description: 'Draynor Village Course'
      },
      {
        startExp: 2_411,
        rate: 11_000,
        description: 'Al Kharid Agility Course'
      },
      {
        startExp: 7_842,
        rate: 14_000,
        description: 'Varrock Agility Course'
      },
      {
        startExp: 37_224,
        rate: 28_000,
        description: 'Shayzien Agility Course'
      },
      {
        startExp: 61_512,
        rate: 34_000,
        description: 'Falador Agility Course'
      },
      {
        startExp: 166_636,
        rate: 44_000,
        description: "Seers' Village Agility Course"
      },
      {
        startExp: 449_428,
        rate: 56_000,
        description: 'Pollnivneach Agility Course'
      },
      {
        startExp: 1_210_421,
        rate: 59_000,
        description: 'Pollnivneach Agility Course'
      },
      {
        startExp: 3_258_594,
        rate: 66_000,
        description: 'Ardougne Agility Course'
      },
      {
        startExp: 9_684_577,
        rate: 70_000,
        description: 'Ardougne Agility Course'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.THIEVING,
    methods: [
      {
        startExp: 0,
        rate: 15_505,
        description:
          "Quests (Gertrude’s Cat + Icthlarin's Little Helper + Ratcatchers Plague City + Biohazard, Tribal Totem, Hazeel Cult, The Feud, X Marks the Spot + Client of Kourend + The Queen of Thieves, Shield of Arrav + Children of the Sun + Ethically Acquired Antiquities + Death on the Isle)"
      },
      {
        startExp: 46_525,
        rate: 39_000,
        description: 'Fruit Stall'
      },
      {
        startExp: 61_512,
        rate: 55_000,
        description: 'Blackjacking'
      },
      {
        startExp: 91_721,
        rate: 210_000,
        description: 'Artefacts with firemaking (130k thieving & 140k firemaking)'
      },
      {
        startExp: 293_865,
        rate: 243_000,
        description: 'Artefacts with firemaking (150k thieving & 180k firemaking)'
      },
      {
        startExp: 1_309_988,
        rate: 291_000,
        description: 'Artefacts with firemaking (180k thieving & 270k firemaking)'
      },
      {
        startExp: 5_346_332,
        rate: 375_000,
        description: 'Artefacts with firemaking (205k thieving & 360k firemaking)'
      },
      {
        startExp: 13_034_431,
        rate: 411_393,
        description: 'Artefacts with firemaking (225k thieving & 360k firemaking)'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.FARMING,
    methods: [
      {
        startExp: 0,
        rate: 24_000,
        description: 'Quests, bagged plants, and low-level trees'
      },
      {
        startExp: 17_470,
        rate: 288_000,
        description: 'Tree runs'
      },
      {
        startExp: 61_512,
        rate: 498_000,
        description: 'Tree runs'
      },
      {
        startExp: 166_636,
        rate: 679_000,
        description: 'Tree runs'
      },
      {
        startExp: 273_742,
        rate: 1_045_000,
        description: 'Tree runs'
      },
      {
        startExp: 605_032,
        rate: 1_261_000,
        description: 'Tree runs'
      },
      {
        startExp: 1_210_421,
        rate: 1_875_000,
        description: 'Tree runs'
      },
      {
        startExp: 2_192_818,
        rate: 2_167_000,
        description: 'Tree runs'
      },
      {
        startExp: 3_258_594,
        rate: 2_265_000,
        description: 'Tree runs'
      },
      {
        startExp: 5_346_332,
        rate: 2_300_000,
        description: 'Tree runs'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.RUNECRAFTING,
    methods: [
      {
        startExp: 0,
        rate: 7_000,
        description:
          'Quests (X Marks the Spot + Client of Kourend + The Ascent of Arceuus, Rune Mysteries + Enter the Abyss + Temple of the Eye)'
      },
      {
        startExp: 6_500,
        rate: 270_000,
        description: '0+4 Lava runes'
      }
    ],
    bonuses: []
  },
  {
    skill: Skill.HUNTER,
    methods: [
      {
        startExp: 0,
        rate: 30_080,
        description: 'Varrock museum and birdhouses'
      },
      {
        startExp: 2_107,
        rate: 82_849,
        description: 'Oak birdhouses'
      },
      {
        startExp: 7_028,
        rate: 110_466,
        description: 'Willow birdhouses'
      },
      {
        startExp: 20_224,
        rate: 138_082,
        description: 'Teak birdhouses'
      },
      {
        startExp: 55_649,
        rate: 214_059,
        description: 'Drift net fishing (65.2k hunter & 55.9k fishing xp/h)'
      },
      {
        startExp: 91_721,
        rate: 273_711,
        description: 'Drift net fishing (81.6k hunter & 64.6k fishing xp/h)'
      },
      {
        startExp: 247_886,
        rate: 323_167,
        description: 'Drift net fishing (95.1k hunter & 72.2k fishing xp/h)'
      },
      {
        startExp: 343_551,
        rate: 310_693,
        description: 'Drift net fishing (108.7k hunter & 80.3k fishing xp/h)'
      },
      {
        startExp: 737_627,
        rate: 337_937,
        description: 'Drift net fishing (118.5k hunter & 87.2k fishing xp/h)'
      },
      {
        startExp: 933_979,
        rate: 255_000,
        realRate: 118_535,
        description: 'Drift net fishing (118.5k hunter & 89.9k fishing xp/h, scales to black chinchompas)'
      }
    ],
    bonuses: [
      {
        originSkill: Skill.HUNTER,
        bonusSkill: Skill.FISHING,
        startExp: 933_979,
        endExp: 200_000_000,
        maxBonus: 43_163_290,
        end: true,
        ratio: 0.75862069443
      }
    ]
  },
  {
    skill: Skill.CONSTRUCTION,
    methods: [
      {
        startExp: 0,
        rate: 54_700,
        description: 'Low-level furniture'
      },
      {
        startExp: 18_247,
        rate: 450_000,
        description: 'Oak larders'
      },
      {
        startExp: 123_660,
        rate: 950_000,
        description: 'Mahogany tables'
      },
      {
        startExp: 1_475_581,
        rate: 1_050_000,
        description: 'Mahogany benches'
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
      { startExp: 922_895, rate: 130_000, description: 'Barracuda shipwrecks' }
    ],
    bonuses: []
  }
];
