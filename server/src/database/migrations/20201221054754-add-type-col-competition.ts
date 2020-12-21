import { QueryInterface } from 'sequelize/types';
import { COMPETITION_TYPES } from '../../api/constants';

function up(queryInterface: QueryInterface, dataTypes: any): Promise<void> {
  return queryInterface.addColumn('competitions', 'type', {
    type: dataTypes.STRING(20),
    defaultValue: COMPETITION_TYPES[0] // classic
  });
}

function down(queryInterface: QueryInterface) {
  return queryInterface.removeColumn('competitions', 'type');
}

export { up, down };
