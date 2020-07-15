import { QueryInterface } from 'sequelize/types';
import { ACTIVITIES, BOSSES } from '../../api/constants';
import { getRankKey, getValueKey } from '../../api/util/metrics';

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
  /*
    const newColumns = [...getActivityColumns(Sequelize), ...getBossColumns(Sequelize)];

    const actions = Promise.all(
      newColumns.map(({ name }) => queryInterface.removeColumn('snapshots', name))
    );

    return actions;
    */

  // This migration fails to undo on SQLite (used for integration test)
  // So this migration should remain "everlasting" until I figure out a solution.
  // This issue has been submitted to Sequelize's repo at:
  // https://github.com/sequelize/sequelize/issues/12229
  return new Promise(success => success([]));
}

function getActivityColumns(Sequelize) {
  return ACTIVITIES.map(activity => [
    { name: getRankKey(activity), type: Sequelize.INTEGER },
    { name: getValueKey(activity), type: Sequelize.INTEGER }
  ]).flat();
}

function getBossColumns(Sequelize) {
  return BOSSES.map(boss => [
    { name: getRankKey(boss), type: Sequelize.INTEGER },
    { name: getValueKey(boss), type: Sequelize.INTEGER }
  ]).flat();
}

export { up, down };
