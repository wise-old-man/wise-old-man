/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { playerTypes } from '../../api/constants/playerTypes';
import { QueryInterface } from 'sequelize/types';

function up(queryInterface: QueryInterface, dataTypes: any): Promise<void> {
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
      type: dataTypes.ENUM(playerTypes),
      defaultValue: playerTypes[0]
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

function down(queryInterface: QueryInterface): Promise<void> {
  return queryInterface.dropTable('players');
}

export { up, down };
