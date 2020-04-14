module.exports = (sequelize, DataTypes) => {
  // Define the group schema
  const groupSchema = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: {
        msg: 'This group name is already taken.',
        fields: ['name'],
      },
      validate: {
        len: {
          args: [1, 30],
          msg: 'Group title must be between 1 and 30 characters long.',
        },
      },
    },
    verificationCode: {
      type: DataTypes.VIRTUAL,
      allowNull: false,
    },
    verificationHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  };

  // Define other table options
  const options = {
    indexes: [
      {
        unique: true,
        fields: ['id'],
      },
      {
        unique: true,
        fields: ['name'],
      },
    ],
  };

  // Create the model
  const Group = sequelize.define('groups', groupSchema, options);

  Group.associate = (models) => {
    Group.belongsToMany(models.Player, {
      as: 'members',
      through: 'memberships',
      foreignKey: 'groupId',
    });
  };

  return Group;
};
