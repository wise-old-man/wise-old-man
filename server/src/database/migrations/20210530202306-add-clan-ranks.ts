import { QueryInterface } from 'sequelize/types';

function up(queryInterface: QueryInterface, dataTypes: any): Promise<void> {
  return queryInterface.changeColumn('memberships', 'role', {
    type: dataTypes.STRING(40),
    allowNull: false
  });
}

function down(queryInterface: QueryInterface, dataTypes: any): Promise<void> {
  return queryInterface.changeColumn('memberships', 'role', {
    type: dataTypes.ENUM(['leader', 'member']),
    allowNull: false
  });
}

export { up, down };
