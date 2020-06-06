import { roles } from '../api/constants/roles';

import { Entity, PrimaryColumn, Column } from "typeorm";
import { Length } from 'class-validator';

@Entity()
export class Membership {

  @PrimaryColumn()
  playerId: Number;

  @PrimaryColumn()
  groupId: Number;

  @Column({
    type: 'enum',
    enum: roles,
    default: roles[0]
  })
  role: String;
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
