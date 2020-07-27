import { QueryInterface } from 'sequelize/types';

function up(queryInterface: QueryInterface, dataTypes: any): Promise<void> {
  return queryInterface.addColumn('achievements', 'metric', {
    type: dataTypes.STRING
  });
}

function down(queryInterface: QueryInterface) {
  return queryInterface.removeColumn('achievements', 'metric');
}

export { up, down };
