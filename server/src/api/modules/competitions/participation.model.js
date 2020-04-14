module.exports = (sequelize, DataTypes) => {
  // Define the participation schema
  const participationSchema = {
    playerId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    competitionId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    startSnapshotId: {
      type: DataTypes.INTEGER,
    },
    endSnapshotId: {
      type: DataTypes.INTEGER,
    },
  };

  // Define other table options
  const options = {
    indexes: [
      {
        unique: true,
        fields: ['playerId', 'competitionId'],
      },
      {
        fields: ['startSnapshotId'],
      },
      {
        fields: ['endSnapshotId'],
      },
    ],
  };

  // Create the model
  const Participation = sequelize.define('participations', participationSchema, options);

  Participation.associate = (models) => {
    Participation.belongsTo(models.Player, {
      foreignKey: 'playerId',
      onDelete: 'CASCADE',
    });
    Participation.belongsTo(models.Competition, {
      foreignKey: 'competitionId',
      onDelete: 'CASCADE',
    });
    Participation.belongsTo(models.Snapshot, {
      as: 'startSnapshot',
      foreignKey: 'startSnapshotId',
    });
    Participation.belongsTo(models.Snapshot, {
      as: 'endSnapshot',
      foreignKey: 'endSnapshotId',
    });
  };

  return Participation;
};
