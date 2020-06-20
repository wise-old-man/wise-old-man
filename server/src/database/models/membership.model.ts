import { Table, Column, DataType, PrimaryKey, Model, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { roles } from '../../api/constants/roles';
import { Player, Group } from '.';

// Define other table options
const options = {
  modelName: 'memberships',
  indexes: [
    {
      unique: true,
      fields: ['playerId', 'groupId']
    }
  ]
};

@Table(options)
export default class Membership extends Model<Membership> {
  @PrimaryKey
  @ForeignKey(() => Player)
  @Column({ type: DataType.INTEGER, onDelete: 'CASCADE' })
  playerId: number;

  @BelongsTo(() => Player)
  player: Player;

  @PrimaryKey
  @ForeignKey(() => Group)
  @Column({ type: DataType.INTEGER, onDelete: 'CASCADE' })
  groupId: number;

  @BelongsTo(() => Group)
  group: Group;

  @Column({
    type: DataType.ENUM(...roles),
    allowNull: false,
    defaultValue: roles[0],
    validate: {
      isIn: {
        args: [roles],
        msg: 'Invalid role'
      }
    }
  })
  role: string;
}

// export default (sequelize, DataTypes) => {
//   // Define the membership schema
//   const membershipSchema = {
//     playerId: {
//       type: DataTypes.INTEGER,
//       primaryKey: true
//     },
//     groupId: {
//       type: DataTypes.INTEGER,
//       primaryKey: true
//     },
//     role: {
//       type: DataTypes.ENUM(roles),
//       allowNull: false,
//       defaultValue: roles[0],
//       validate: {
//         isIn: {
//           args: [roles],
//           msg: 'Invalid role'
//         }
//       }
//     }
//   };

//   // Define other table options
//   const options = {
//     indexes: [
//       {
//         unique: true,
//         fields: ['playerId', 'groupId']
//       }
//     ]
//   };

//   // Create the model
//   const Membership = sequelize.define('memberships', membershipSchema, options);

//   Membership.associate = models => {
//     Membership.belongsTo(models.Player, {
//       foreignKey: 'playerId',
//       onDelete: 'CASCADE'
//     });
//     Membership.belongsTo(models.Group, {
//       foreignKey: 'groupId',
//       onDelete: 'CASCADE'
//     });
//   };

//   return Membership;
// };
