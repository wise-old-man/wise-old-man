import { QueryInterface } from 'sequelize/types';
import { GROUP_ROLES } from 'api/constants';

function up(queryInterface: QueryInterface, dataTypes: any): Promise<void> {
  return queryInterface.createTable('memberships', {
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
    groupId: {
      type: dataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      onDelete: 'CASCADE',
      references: {
        model: 'groups',
        key: 'id'
      }
    },
    role: {
      type: dataTypes.ENUM(GROUP_ROLES),
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
  return queryInterface.dropTable('memberships');
}

export { up, down };
