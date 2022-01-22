import { QueryInterface } from 'sequelize/types';

function up(queryInterface: QueryInterface, dataTypes: any) {
  return queryInterface.createTable('nameChanges', {
    id: {
      type: dataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    playerId: {
      type: dataTypes.INTEGER,
      allowNull: false,
      onDelete: 'CASCADE',
      references: {
        model: 'players',
        key: 'id'
      }
    },
    oldName: {
      type: dataTypes.STRING(20),
      allowNull: false
    },
    newName: {
      type: dataTypes.STRING(20),
      allowNull: false
    },
    status: {
      type: dataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    resolvedAt: {
      type: dataTypes.DATE
    },
    updatedAt: {
      type: dataTypes.DATE
    },
    createdAt: {
      type: dataTypes.DATE
    }
  });
}

function down(queryInterface: QueryInterface) {
  return queryInterface.dropTable('nameChanges');
}

export { up, down };
