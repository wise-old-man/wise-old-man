const { ALL_METRICS } = require('../../constants/metrics');

module.exports = (sequelize, DataTypes) => {
  // Define the competition schema
  const competitionSchema = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING(30),
      allowNull: false,
      validate: {
        len: {
          args: [1, 30],
          msg: 'Competition title must be between 1 and 30 characters long.'
        }
      }
    },
    metric: {
      type: DataTypes.ENUM(ALL_METRICS),
      allowNull: false,
      validate: {
        isIn: {
          args: [ALL_METRICS],
          msg: 'Invalid metric'
        }
      }
    },
    verificationCode: {
      type: DataTypes.VIRTUAL,
      allowNull: false
    },
    verificationHash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    startsAt: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: {
          args: [true],
          msg: 'Start date must be a valid date'
        }
      }
    },
    endsAt: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: {
          args: [true],
          msg: 'End date must be a valid date'
        }
      }
    },
    groupId: {
      type: DataTypes.INTEGER
    }
  };

  // Define other table options
  const options = {
    validate: {
      endsAfterStart() {
        if (this.startsAt - this.endsAt > 0) {
          throw new Error('Start date must be before the end date.');
        }
      }
    },
    indexes: [
      {
        unique: true,
        fields: ['id']
      },
      {
        fields: ['title']
      },
      {
        fields: ['metric']
      },
      {
        fields: ['startsAt']
      },
      {
        fields: ['endsAt']
      }
    ]
  };

  // Create the model
  const Competition = sequelize.define('competitions', competitionSchema, options);

  Competition.associate = models => {
    Competition.belongsToMany(models.Player, {
      as: 'participants',
      through: 'participations',
      foreignKey: 'competitionId'
    });

    Competition.belongsTo(models.Group, {
      foreignKey: 'groupId',
      onDelete: 'SET NULL'
    });
  };

  return Competition;
};
