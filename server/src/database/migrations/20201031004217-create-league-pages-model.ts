import { QueryInterface } from 'sequelize/types';

function up(queryInterface: QueryInterface, dataTypes: any): Promise<void> {
  return queryInterface.createTable('leaguePages', {
    id: {
      type: dataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    pageIndex: {
      type: dataTypes.INTEGER,
      allowNull: false
    },
    createdAt: {
      type: dataTypes.DATE
    }
  });
}

function down(queryInterface: QueryInterface) {
  return queryInterface.dropTable('leaguePages');
}

export { up, down };
