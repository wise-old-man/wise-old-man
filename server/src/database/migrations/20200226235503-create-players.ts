/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { QueryInterface } from 'sequelize/types';
import { PlayerType, PLAYER_TYPES } from '@wise-old-man/utils';

function up(queryInterface: QueryInterface, dataTypes: any) {
  return queryInterface.createTable('players', {
    id: {
      type: dataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: dataTypes.STRING(20),
      unique: true,
      allowNull: false
    },
    type: {
      type: dataTypes.ENUM(PLAYER_TYPES),
      defaultValue: PlayerType.UNKNOWN
    },
    lastImportedAt: {
      type: dataTypes.DATE
    },
    registeredAt: {
      type: dataTypes.DATE
    },
    updatedAt: {
      type: dataTypes.DATE
    }
  });
}

function down(queryInterface: QueryInterface) {
  return queryInterface.dropTable('players');
}

export { up, down };
