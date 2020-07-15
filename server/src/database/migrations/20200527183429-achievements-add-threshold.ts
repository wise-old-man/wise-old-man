import { QueryInterface } from 'sequelize/types';

function up(queryInterface: QueryInterface, dataTypes: any): Promise<void> {
  return queryInterface.addColumn('achievements', 'threshold', {
    type: dataTypes.BIGINT
  });
}

function down(queryInterface: QueryInterface) {
  return queryInterface.removeColumn('achievements', 'threshold');
}

export { up, down };
