import { QueryInterface } from 'sequelize/types';
import { PERIODS } from '../../utils';

function up(queryInterface: QueryInterface) {
  return queryInterface.dropTable('deltas');
}

function down(queryInterface: QueryInterface, dataTypes: any) {
  return queryInterface.createTable('deltas', {
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
    period: {
      type: dataTypes.ENUM(PERIODS),
      allowNull: false
    },
    startSnapshotId: {
      type: dataTypes.INTEGER,
      references: {
        model: 'snapshots',
        key: 'id'
      }
    },
    endSnapshotId: {
      type: dataTypes.INTEGER,
      references: {
        model: 'snapshots',
        key: 'id'
      }
    },
    updatedAt: {
      type: dataTypes.DATE
    }
  });
}

export { up, down };
