import { QueryInterface } from 'sequelize/types';

function up(queryInterface: QueryInterface, dataTypes: any) {
  return queryInterface.createTable('participations', {
    playerId: {
      type: dataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      onDelete: 'CASCADE',
      references: {
        model: 'players',
        key: 'id'
      }
    },
    competitionId: {
      type: dataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      onDelete: 'CASCADE',
      references: {
        model: 'competitions',
        key: 'id'
      }
    },
    startSnapshotId: {
      type: dataTypes.INTEGER,
      onDelete: 'SET NULL',
      references: {
        model: 'snapshots',
        key: 'id'
      }
    },
    endSnapshotId: {
      type: dataTypes.INTEGER,
      onDelete: 'SET NULL',
      references: {
        model: 'snapshots',
        key: 'id'
      }
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
  return queryInterface.dropTable('participations');
}

export { up, down };
