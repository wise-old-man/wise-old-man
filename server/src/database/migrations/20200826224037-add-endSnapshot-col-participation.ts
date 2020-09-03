import { QueryInterface } from 'sequelize/types';

function up(queryInterface: QueryInterface, dataTypes: any): Promise<void> {
  return queryInterface.addColumn('participations', 'endSnapshotId', {
    type: dataTypes.INTEGER,
    references: {
      model: 'snapshots',
      key: 'id'
    }
  });
}

function down(queryInterface: QueryInterface) {
  return queryInterface.removeColumn('participations', 'endSnapshotId');
}

export { up, down };
