import { QueryInterface } from 'sequelize/types';
import { getMetricValueKey, getMetricRankKey } from '../../utils';

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

function up(queryInterface: QueryInterface, dataTypes: any): Promise<Array<any>> {
  const newColumns = [...getActivityColumns(dataTypes), ...getBossColumns(dataTypes)];

  const actions = Promise.all(
    newColumns.map(({ name, type }) =>
      queryInterface.addColumn('snapshots', name, {
        type,
        defaultValue: -1,
        allowNull: false
      })
    )
  );

  return actions;
}

function down() {
  // This migration fails to undo on SQLite (used for integration test)
  // So this migration should remain "everlasting" until I figure out a solution.
  // This issue has been submitted to Sequelize's repo at:
  // https://github.com/sequelize/sequelize/issues/12229
  return new Promise(success => success([]));
}

function getActivityColumns(Sequelize) {
  return ACTIVITIES.map((activity: any) => [
    { name: getMetricRankKey(activity), type: Sequelize.INTEGER },
    { name: getMetricValueKey(activity), type: Sequelize.INTEGER }
  ]).flat();
}

function getBossColumns(Sequelize) {
  return BOSSES.map((boss: any) => [
    { name: getMetricRankKey(boss), type: Sequelize.INTEGER },
    { name: getMetricValueKey(boss), type: Sequelize.INTEGER }
  ]).flat();
}

export { up, down };
