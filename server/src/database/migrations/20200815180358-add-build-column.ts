import { PlayerBuild } from '@wise-old-man/utils';
import { QueryInterface } from 'sequelize/types';

function up(queryInterface: QueryInterface, dataTypes: any) {
  return queryInterface.addColumn('players', 'build', {
    type: dataTypes.STRING,
    allowNull: false,
    defaultValue: PlayerBuild.MAIN
  });
}

function down(queryInterface: QueryInterface) {
  return queryInterface.removeColumn('players', 'build');
}

export { up, down };
