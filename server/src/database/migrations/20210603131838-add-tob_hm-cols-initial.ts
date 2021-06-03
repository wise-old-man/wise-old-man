import { QueryInterface } from 'sequelize/types';

function up(queryInterface: QueryInterface, dataTypes: any): Promise<Array<any>> {
  const NEW_COLUMNS = [
    { name: 'theatre_of_blood_hard_modeKills', type: dataTypes.INTEGER },
    { name: 'theatre_of_blood_hard_modeRank', type: dataTypes.INTEGER }
  ];

  const actions = Promise.all(
    NEW_COLUMNS.map(({ name, type }) =>
      queryInterface.addColumn('initialValues', name, {
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
export { up, down };
