import { QueryInterface } from 'sequelize/types';

const BOSSES = [
  'abyssal_sire',
  'alchemical_hydra',
  'barrows_chests',
  'bryophyta',
  'callisto',
  'cerberus',
  'chambers_of_xeric',
  'chambers_of_xeric_challenge_mode',
  'chaos_elemental',
  'chaos_fanatic',
  'commander_zilyana',
  'corporeal_beast',
  'crazy_archaeologist',
  'dagannoth_prime',
  'dagannoth_rex',
  'dagannoth_supreme',
  'deranged_archaeologist',
  'general_graardor',
  'giant_mole',
  'grotesque_guardians',
  'hespori',
  'kalphite_queen',
  'king_black_dragon',
  'kraken',
  'kreearra',
  'kril_tsutsaroth',
  'mimic',
  'nightmare',
  'obor',
  'sarachnis',
  'scorpia',
  'skotizo',
  'the_gauntlet',
  'the_corrupted_gauntlet',
  'theatre_of_blood',
  'thermonuclear_smoke_devil',
  'tzkal_zuk',
  'tztok_jad',
  'venenatis',
  'vetion',
  'vorkath',
  'wintertodt',
  'zalcano',
  'zulrah'
];

const ACTIVITIES = [
  'league_points',
  'bounty_hunter_hunter',
  'bounty_hunter_rogue',
  'clue_scrolls_all',
  'clue_scrolls_beginner',
  'clue_scrolls_easy',
  'clue_scrolls_medium',
  'clue_scrolls_hard',
  'clue_scrolls_elite',
  'clue_scrolls_master',
  'last_man_standing'
];

const SKILLS = [
  'overall',
  'attack',
  'defence',
  'strength',
  'hitpoints',
  'ranged',
  'prayer',
  'magic',
  'cooking',
  'woodcutting',
  'fletching',
  'fishing',
  'firemaking',
  'crafting',
  'smithing',
  'mining',
  'herblore',
  'agility',
  'thieving',
  'slayer',
  'farming',
  'runecrafting',
  'hunter',
  'construction'
];

function buildDynamicSchema(dataTypes: any) {
  const obj = {};

  [...SKILLS, ...BOSSES, ...ACTIVITIES].forEach(s => {
    obj[s] = s === 'overall' ? dataTypes.BIGINT : dataTypes.INTEGER;
  });

  return obj;
}

function up(queryInterface: QueryInterface, dataTypes: any): Promise<void> {
  return queryInterface.createTable('deltas', {
    id: {
      type: dataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    playerId: {
      type: dataTypes.INTEGER,
      allowNull: false,
      onDelete: 'CASCADE',
      references: {
        model: 'players',
        key: 'id'
      }
    },
    period: {
      type: dataTypes.STRING(20),
      allowNull: false
    },
    indicator: {
      type: dataTypes.STRING(20),
      allowNull: false
    },
    startedAt: {
      type: dataTypes.DATE,
      allowNull: false
    },
    endedAt: {
      type: dataTypes.DATE,
      allowNull: false
    },
    ...buildDynamicSchema(dataTypes),
    updatedAt: {
      type: dataTypes.DATE
    }
  });
}

function down(queryInterface: QueryInterface) {
  return queryInterface.dropTable('deltas');
}

export { up, down };
