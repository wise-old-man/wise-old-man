import { QueryInterface } from 'sequelize/types';

function up(queryInterface: QueryInterface, dataTypes: any) {
  return queryInterface.addColumn('deltas', 'initialValuesId', {
    type: dataTypes.INTEGER,
    onDelete: 'SET NULL',
    references: {
      model: 'initialValues',
      key: 'id'
    }
  });
}

function down(queryInterface: QueryInterface) {
  return queryInterface.removeColumn('deltas', 'initialValuesId');
}

export { up, down };
