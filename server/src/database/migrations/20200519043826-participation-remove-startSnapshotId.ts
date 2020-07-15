import { QueryInterface } from 'sequelize/types';

function up(queryInterface: QueryInterface): Promise<void> {
  return queryInterface.removeColumn('participations', 'startSnapshotId');
}

function down(queryInterface: QueryInterface, dataTypes: any) {
  return queryInterface.addColumn('participations', 'startSnapshotId', {
    type: dataTypes.INTEGER
  });
}

export { up, down };
