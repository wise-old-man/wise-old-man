const PERIODS = require("../../constants/periods");

module.exports = (sequelize, DataTypes) => {
  // Define the delta schema
  const deltaSchema = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    playerId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    period: {
      type: DataTypes.ENUM(PERIODS),
      allowNull: false,
      validate: {
        isIn: {
          args: [PERIODS],
          msg: "Invalid period"
        }
      }
    },
    startSnapshotId: {
      type: DataTypes.INTEGER
    },
    endSnapshotId: {
      type: DataTypes.INTEGER
    },
    updatedAt: {
      type: DataTypes.DATE
    }
  };

  // Define other table options
  const options = {
    createdAt: false,
    updatedAt: false,
    indexes: [
      {
        unique: true,
        fields: ["id"]
      },
      {
        fields: ["playerId"]
      },
      {
        fields: ["period"]
      },
      {
        fields: ["startSnapshotId"]
      },
      {
        fields: ["endSnapshotId"]
      }
    ]
  };

  // Create the model
  const Delta = sequelize.define("deltas", deltaSchema, options);

  // Define all model associations
  Delta.associate = models => {
    Delta.belongsTo(models.Player, {
      foreignKey: "playerId",
      onDelete: "CASCADE"
    });
    Delta.belongsTo(models.Snapshot, {
      as: "startSnapshot",
      foreignKey: "startSnapshotId"
    });
    Delta.belongsTo(models.Snapshot, {
      as: "endSnapshot",
      foreignKey: "endSnapshotId"
    });
  };

  return Delta;
};
