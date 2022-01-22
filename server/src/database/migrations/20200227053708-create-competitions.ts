import { QueryInterface } from 'sequelize/types';

function up(queryInterface: QueryInterface, dataTypes: any) {
  return queryInterface.createTable('competitions', {
    id: {
      type: dataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: dataTypes.STRING(30),
      allowNull: false
    },
    metric: {
      type: dataTypes.STRING(100),
      allowNull: false
    },
    verificationHash: {
      type: dataTypes.STRING,
      allowNull: false
    },
    startsAt: {
      type: dataTypes.DATE,
      allowNull: false
    },
    endsAt: {
      type: dataTypes.DATE,
      allowNull: false
    },
    createdAt: {
      type: dataTypes.DATE
    },
    updatedAt: {
      type: dataTypes.DATE
    }
  });
}

function down(queryInterface: QueryInterface) {
  return queryInterface.dropTable('competitions');
}

export { up, down };
