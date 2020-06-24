import { ROLES } from '../../api/constants/roles';
import { QueryInterface } from 'sequelize/types';

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
      type: dataTypes.ENUM(ROLES),
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
