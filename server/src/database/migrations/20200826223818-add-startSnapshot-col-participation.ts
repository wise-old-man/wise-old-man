import { QueryInterface } from 'sequelize/types';

function up(queryInterface: QueryInterface, dataTypes: any): Promise<void> {
  return queryInterface.addColumn('participations', 'startSnapshotId', {
    type: dataTypes.INTEGER,
    onDelete: 'SET NULL',
    references: {
      model: 'snapshots',
      key: 'id'
    }
  });
}

function down(queryInterface: QueryInterface) {
  return queryInterface.removeColumn('participations', 'startSnapshotId');
}

export { up, down };
