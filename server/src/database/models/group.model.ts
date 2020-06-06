import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { Length } from 'class-validator';

@Entity()
export class Group {

  @PrimaryGeneratedColumn()
  id: Number;

  @Column({
    type: String,
    length: 30,
    nullable: false,
    unique: true
  })
  @Length(1, 30)
  name: String;

  @Column({
    type: String,
    length: 20
  })
  clanChat: String;

  @Column({
    type: String,
    generatedType: 'VIRTUAL',
    nullable: false
  })
  verificationCode: String;

  @Column({
    type: String,
    nullable: false
  })
  verificationHash: String;
}

// export default (sequelize, DataTypes) => {
//   // Define the group schema
//   const groupSchema = {
//     id: {
//       type: DataTypes.INTEGER,
//       primaryKey: true,
//       autoIncrement: true
//     },
//     name: {
//       type: DataTypes.STRING(30),
//       allowNull: false,
//       unique: {
//         msg: 'This group name is already taken.',
//         fields: ['name']
//       },
//       validate: {
//         len: {
//           args: [1, 30],
//           msg: 'Group title must be between 1 and 30 characters long.'
//         }
//       }
//     },
//     clanChat: {
//       type: DataTypes.STRING(20)
//     },
//     verificationCode: {
//       type: DataTypes.VIRTUAL,
//       allowNull: false
//     },
//     verificationHash: {
//       type: DataTypes.STRING,
//       allowNull: false
//     }
//   };

//   // Define other table options
//   const options = {
//     indexes: [
//       {
//         unique: true,
//         fields: ['id']
//       },
//       {
//         unique: true,
//         fields: ['name']
//       }
//     ]
//   };

//   // Create the model
//   const Group = sequelize.define('groups', groupSchema, options);

//   Group.associate = models => {
//     Group.belongsToMany(models.Player, {
//       as: 'members',
//       through: 'memberships',
//       foreignKey: 'groupId'
//     });
//   };

//   return Group;
// };
