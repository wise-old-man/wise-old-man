import { QueryInterface } from 'sequelize/types';
import { CompetitionType } from '../../utils';

function up(queryInterface: QueryInterface, dataTypes: any) {
  return queryInterface.addColumn('competitions', 'type', {
    type: dataTypes.STRING(20),
    defaultValue: CompetitionType.CLASSIC
  });
}

function down(queryInterface: QueryInterface) {
  return queryInterface.removeColumn('competitions', 'type');
}

export { up, down };
