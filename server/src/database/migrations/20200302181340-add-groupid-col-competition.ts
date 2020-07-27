import { QueryInterface } from 'sequelize/types';

function up(queryInterface: QueryInterface, dataTypes: any): Promise<void> {
  return queryInterface.addColumn('competitions', 'groupId', {
    type: dataTypes.INTEGER,
    onDelete: 'SET NULL',
    references: {
      model: 'groups',
      key: 'id'
    }
  });
}

function down(queryInterface: QueryInterface) {
  return queryInterface.removeColumn('competitions', 'groupId');
}

export { up, down };
