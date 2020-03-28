const { SKILLS } = require("../../constants/metrics");

function buildDynamicSchema(DataTypes) {
  const obj = {};

  SKILLS.forEach(s => {
    obj[`${s}Rank`] = DataTypes.INTEGER;
    obj[`${s}Experience`] = s === "overall" ? DataTypes.BIGINT : DataTypes.INTEGER;
  });

  return obj;
}

module.exports = (sequelize, DataTypes) => {
  // Define the snapshot schema
  const snapshotSchema = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    playerId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    importedAt: {
      type: DataTypes.DATE
    },
    ...buildDynamicSchema(DataTypes)
  };

  // Define other table options
  const options = {
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
        fields: ["createdAt"]
      }
    ]
  };

  // Create the model
  const Snapshot = sequelize.define("snapshots", snapshotSchema, options);

  // Define all model associations
  Snapshot.associate = models => {
    Snapshot.belongsTo(models.Player, {
      foreignKey: "playerId",
      onDelete: "CASCADE"
    });
  };

  return Snapshot;
};
