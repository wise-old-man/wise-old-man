const PERIODS = require('../../constants/periods');
const { ALL_METRICS } = require('../../constants/metrics');

module.exports = (sequelize, DataTypes) => {
  // Define the record schema
  const recordSchema = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    playerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    period: {
      type: DataTypes.ENUM(PERIODS),
      allowNull: false,
      validate: {
        isIn: {
          args: [PERIODS],
          msg: 'Invalid period',
        },
      },
    },
    metric: {
      type: DataTypes.ENUM(ALL_METRICS),
      allowNull: false,
      validate: {
        isIn: {
          args: [ALL_METRICS],
          msg: 'Invalid metric',
        },
      },
    },
    value: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },
  };

  // Define other table options
  const options = {
    createdAt: false,
    indexes: [
      {
        unique: true,
        fields: ['id'],
      },
      {
        fields: ['playerId'],
      },
      {
        fields: ['period'],
      },
      {
        fields: ['metric'],
      },
    ],
  };

  // Create the model
  const Record = sequelize.define('records', recordSchema, options);

  // Define all model associations
  Record.associate = (models) => {
    Record.belongsTo(models.Player, {
      foreignKey: 'playerId',
      onDelete: 'CASCADE',
    });
  };

  return Record;
};
