import PLAYER_TYPES from '../../constants/playerTypes.json';

module.exports = (sequelize, DataTypes) => {
  // Define the player schema
  const playerSchema = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING(20),
      unique: true,
      allowNull: false,
      validate: {
        len: {
          args: [1, 12],
          msg: 'Username must be between 1 and 12 characters long.'
        },
        isValid(value) {
          if (value.startsWith(' ')) {
            throw new Error('Username cannot start with spaces');
          } else if (value.endsWith(' ')) {
            throw new Error('Username cannot end with spaces');
          } else if (!new RegExp(/^[a-zA-Z0-9 ]{1,12}$/).test(value)) {
            throw new Error('Username cannot contain any special characters');
          }
        }
      }
    },
    displayName: {
      type: DataTypes.STRING(20),
      validate: {
        len: {
          args: [1, 12],
          msg: 'Username must be between 1 and 12 characters long.'
        },
        isValid(value) {
          if (value.startsWith(' ')) {
            throw new Error('Username cannot start with spaces');
          } else if (value.endsWith(' ')) {
            throw new Error('Username cannot end with spaces');
          } else if (!new RegExp(/^[a-zA-Z0-9 ]{1,12}$/).test(value)) {
            throw new Error('Username cannot contain any special characters');
          }
        }
      }
    },
    type: {
      type: DataTypes.ENUM(PLAYER_TYPES),
      defaultValue: PLAYER_TYPES[0],
      allowNull: false,
      validate: {
        isIn: {
          args: [PLAYER_TYPES],
          msg: 'Invalid player type.'
        }
      }
    },
    lastImportedAt: {
      type: DataTypes.DATE
    }
  };

  // Define other table options
  const options = {
    createdAt: 'registeredAt',
    indexes: [
      {
        unique: true,
        fields: ['id']
      },
      {
        unique: true,
        fields: ['username']
      }
    ]
  };

  // Create the model
  const Player = sequelize.define('players', playerSchema, options);

  // Define all model associations
  Player.associate = models => {
    Player.belongsToMany(models.Competition, {
      as: 'participants',
      through: 'participations',
      foreignKey: 'playerId'
    });

    Player.belongsToMany(models.Group, {
      as: 'members',
      through: 'memberships',
      foreignKey: 'playerId'
    });

    Player.hasMany(models.Snapshot, {
      foreignKey: 'playerId'
    });
  };

  return Player;
};
