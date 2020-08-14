import { QueryInterface } from 'sequelize/types';

function up(queryInterface: QueryInterface, dataTypes: any): Promise<Array<any>> {
  const NEW_COLUMNS = [
    { name: 'ehpValue', type: dataTypes.FLOAT },
    { name: 'ehbValue', type: dataTypes.FLOAT },
    { name: 'ehpRank', type: dataTypes.INTEGER },
    { name: 'ehbRank', type: dataTypes.INTEGER }
  ];

  const actions = Promise.all(
    NEW_COLUMNS.map(({ name, type }) =>
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
export { up, down };
