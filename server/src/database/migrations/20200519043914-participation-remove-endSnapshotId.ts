import { QueryInterface } from 'sequelize/types';

function up(queryInterface: QueryInterface): Promise<void> {
  return queryInterface.removeColumn('participations', 'endSnapshotId');
}

function down(queryInterface: QueryInterface, dataTypes: any) {
  return queryInterface.addColumn('participations', 'endSnapshotId', {
    type: dataTypes.INTEGER
  });
}

export { up, down };
