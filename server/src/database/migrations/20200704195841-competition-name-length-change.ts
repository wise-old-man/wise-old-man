import { QueryInterface } from 'sequelize/types';

function up(queryInterface: QueryInterface, dataTypes: any): Promise<void> {
  return queryInterface.changeColumn('competitions', 'title', {
    type: dataTypes.STRING(50),
    allowNull: false
  });
}

function down(queryInterface: QueryInterface, dataTypes: any) {
  return queryInterface.changeColumn('competitions', 'title', {
    type: dataTypes.STRING(30),
    allowNull: false
  });
}

export { up, down };
