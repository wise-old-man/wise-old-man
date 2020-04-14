module.exports = (sequelize, DataTypes) => {
  // Define the achievement schema
  const achievementSchema = {
    playerId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
  };

  // Define other table options
  const options = {
    updatedAt: false,
    indexes: [
      {
        unique: true,
        fields: ['playerId', 'type'],
      },
      {
        fields: ['playerId'],
      },
      {
        fields: ['type'],
      },
    ],
  };

  // Create the model
  const Achievement = sequelize.define('achievements', achievementSchema, options);

  // Define all model associations
  Achievement.associate = (models) => {
    Achievement.belongsTo(models.Player, {
      foreignKey: 'playerId',
      onDelete: 'CASCADE',
    });
  };

  return Achievement;
};
