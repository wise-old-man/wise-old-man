import { Snapshot } from '../../../database/models';
import { getCombatLevel, getMinimumExp } from '../../util/experience';
import { AchievementTemplate } from '../../services/internal/achievement.service';

export const ACHIEVEMENT_TEMPLATES: AchievementTemplate[] = [
  // ------------------
  // CUSTOM ACHIEVEMENTS
  // ------------------
  {
    name: 'Base {level} Stats',
    metric: 'overall',
    measure: 'levels',
    thresholds: [737_627, 1_986_068, 5_346_332, 13_034_431],
    getCurrentValue: (snapshot: Snapshot) => {
      return getMinimumExp(snapshot);
    }
  },
  {
    name: '126 Combat',
    metric: 'combat',
    measure: 'levels',
    thresholds: [126],
    getCurrentValue: (snapshot: Snapshot) => {
      return getCombatLevel(snapshot);
    }
  },
  // ------------------
  // SKILL ACHIEVEMENTS
  // ------------------
  {
    name: '{threshold} Overall Exp.',
    metric: 'overall',
    measure: 'experience',
    thresholds: [100_000_000, 200_000_000, 500_000_000, 1_000_000_000, 2_000_000_000, 4_600_000_000]
  },
  {
    name: '{threshold} Attack',
    metric: 'attack',
    measure: 'experience',
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Defence',
    metric: 'defence',
    measure: 'experience',
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Strength',
    metric: 'strength',
    measure: 'experience',
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Hitpoints',
    metric: 'hitpoints',
    measure: 'experience',
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Ranged',
    metric: 'ranged',
    measure: 'experience',
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Prayer',
    metric: 'prayer',
    measure: 'experience',
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Magic',
    metric: 'magic',
    measure: 'experience',
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Cooking',
    metric: 'cooking',
    measure: 'experience',
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Woodcutting',
    metric: 'woodcutting',
    measure: 'experience',
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Fletching',
    metric: 'fletching',
    measure: 'experience',
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Fishing',
    metric: 'fishing',
    measure: 'experience',
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Firemaking',
    metric: 'firemaking',
    measure: 'experience',
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Crafting',
    metric: 'crafting',
    measure: 'experience',
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Smithing',
    metric: 'smithing',
    measure: 'experience',
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Mining',
    metric: 'mining',
    measure: 'experience',
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Herblore',
    metric: 'herblore',
    measure: 'experience',
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Agility',
    metric: 'agility',
    measure: 'experience',
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Thieving',
    metric: 'thieving',
    measure: 'experience',
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Slayer',
    metric: 'slayer',
    measure: 'experience',
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Farming',
    metric: 'farming',
    measure: 'experience',
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Runecrafting',
    metric: 'runecrafting',
    measure: 'experience',
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Hunter',
    metric: 'hunter',
    measure: 'experience',
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  {
    name: '{threshold} Construction',
    metric: 'construction',
    measure: 'experience',
    thresholds: [13_034_431, 50_000_000, 100_000_000, 200_000_000]
  },
  // -----------------
  // BOSS ACHIEVEMENTS
  // -----------------
  {
    name: '{threshold} Abyssal Sire kills',
    metric: 'abyssal_sire',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Alchemical Hydra kills',
    metric: 'alchemical_hydra',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Barrows Chests',
    metric: 'barrows_chests',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Bryophyta kills',
    metric: 'bryophyta',
    measure: 'kills',
    thresholds: [50, 100, 500, 1000]
  },
  {
    name: '{threshold} Callisto kills',
    metric: 'callisto',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Cerberus kills',
    metric: 'cerberus',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Chambers Of Xeric kills',
    metric: 'chambers_of_xeric',
    measure: 'kills',
    thresholds: [100, 500, 1000, 5000]
  },
  {
    name: '{threshold} Chambers Of Xeric (CM) kills',
    metric: 'chambers_of_xeric_challenge_mode',
    measure: 'kills',
    thresholds: [100, 500, 1000, 5000]
  },
  {
    name: '{threshold} Chaos Elemental kills',
    metric: 'chaos_elemental',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Chaos Fanatic kills',
    metric: 'chaos_fanatic',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Commander Zilyana kills',
    metric: 'commander_zilyana',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Corporeal Beast kills',
    metric: 'corporeal_beast',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Crazy Archaeologist kills',
    metric: 'crazy_archaeologist',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Dagannoth Prime kills',
    metric: 'dagannoth_prime',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Dagannoth Rex kills',
    metric: 'dagannoth_rex',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Dagannoth Supreme kills',
    metric: 'dagannoth_supreme',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Deranged Archaeologist kills',
    metric: 'deranged_archaeologist',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} General Graardor kills',
    metric: 'general_graardor',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Giant Mole kills',
    metric: 'giant_mole',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Grotesque Guardians kills',
    metric: 'grotesque_guardians',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Hespori kills',
    metric: 'hespori',
    measure: 'kills',
    thresholds: [50, 100, 500, 1000]
  },
  {
    name: '{threshold} Kalphite Queen kills',
    metric: 'kalphite_queen',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} King Black Dragon kills',
    metric: 'king_black_dragon',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Kraken kills',
    metric: 'kraken',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: "{threshold} Kree'Arra kills",
    metric: 'kreearra',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: "{threshold} K'ril Tsutsaroth kills",
    metric: 'kril_tsutsaroth',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Mimic kills',
    metric: 'mimic',
    measure: 'kills',
    thresholds: [10, 50, 100, 200]
  },
  {
    name: '{threshold} Nightmare kills',
    metric: 'nightmare',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Obor kills',
    metric: 'obor',
    measure: 'kills',
    thresholds: [50, 100, 500, 1000]
  },
  {
    name: '{threshold} Sarachnis kills',
    metric: 'sarachnis',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Scorpia kills',
    metric: 'scorpia',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Skotizo kills',
    metric: 'skotizo',
    measure: 'kills',
    thresholds: [50, 100, 500, 1000]
  },
  {
    name: '{threshold} The Gauntlet kills',
    metric: 'the_gauntlet',
    measure: 'kills',
    thresholds: [100, 200, 1000, 2000]
  },
  {
    name: '{threshold} The Corrupted Gauntlet kills',
    metric: 'the_corrupted_gauntlet',
    measure: 'kills',
    thresholds: [100, 200, 1000, 2000]
  },
  {
    name: '{threshold} Theatre Of Blood kills',
    metric: 'theatre_of_blood',
    measure: 'kills',
    thresholds: [100, 500, 1000, 5000]
  },
  {
    name: '{threshold} Thermonuclear Smoke Devil kills',
    metric: 'thermonuclear_smoke_devil',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} TzKal-Zuk kills',
    metric: 'tzkal_zuk',
    measure: 'kills',
    thresholds: [10, 50, 100, 200]
  },
  {
    name: '{threshold} TzTok-Jad kills',
    metric: 'tztok_jad',
    measure: 'kills',
    thresholds: [50, 100, 500, 1000]
  },
  {
    name: '{threshold} Venenatis kills',
    metric: 'venenatis',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: "{threshold} Vet'ion kills",
    metric: 'vetion',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Vorkath kills',
    metric: 'vorkath',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Wintertodt kills',
    metric: 'wintertodt',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Zalcano kills',
    metric: 'zalcano',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Zulrah kills',
    metric: 'zulrah',
    measure: 'kills',
    thresholds: [500, 1000, 5000, 10_000]
  },
  // ---------------------
  // ACTIVITY ACHIEVEMENTS
  // ---------------------
  {
    name: '{threshold} Bounty Hunter (Hunter) score',
    metric: 'bounty_hunter_hunter',
    measure: 'score',
    thresholds: [1000, 5000, 10_000]
  },
  {
    name: '{threshold} Bounty Hunter (Rogue) score',
    metric: 'bounty_hunter_rogue',
    measure: 'score',
    thresholds: [1000, 5000, 10_000]
  },
  {
    name: '{threshold} Clue Scrolls (All)',
    metric: 'clue_scrolls_all',
    measure: 'score',
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Clue Scrolls (Beginner)',
    metric: 'clue_scrolls_beginner',
    measure: 'score',
    thresholds: [200, 500, 1000, 5000]
  },
  {
    name: '{threshold} Clue Scrolls (Easy)',
    metric: 'clue_scrolls_easy',
    measure: 'score',
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Clue Scrolls (Medium)',
    metric: 'clue_scrolls_medium',
    measure: 'score',
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Clue Scrolls (Hard)',
    metric: 'clue_scrolls_hard',
    measure: 'score',
    thresholds: [500, 1000, 5000, 10_000]
  },
  {
    name: '{threshold} Clue Scrolls (Elite)',
    metric: 'clue_scrolls_elite',
    measure: 'score',
    thresholds: [100, 500, 1000, 5000]
  },
  {
    name: '{threshold} Clue Scrolls (Master)',
    metric: 'clue_scrolls_master',
    measure: 'score',
    thresholds: [100, 500, 1000, 5000]
  },
  {
    name: '{threshold} Last Man Standing score',
    metric: 'last_man_standing',
    measure: 'score',
    thresholds: [2000, 5000, 10_000, 15_000]
  },
  {
    name: '{threshold} Soul Wars Zeal',
    metric: 'soul_wars_zeal',
    measure: 'score',
    thresholds: [5000, 10_000, 20_000]
  }
];
